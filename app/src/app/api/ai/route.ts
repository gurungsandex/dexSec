import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are ARIA (Autonomous Response & Intelligence Assistant), an expert AI security analyst embedded in Dex Security Cloud — an enterprise MSSP (Managed Security Service Provider) platform.

You operate across multiple international security frameworks and standards:

**NIST Cybersecurity Framework (CSF 2.0)**
- Functions: Govern, Identify, Protect, Detect, Respond, Recover
- Map every incident response recommendation to the appropriate NIST function
- Reference specific NIST SP 800 series publications when relevant (SP 800-53, SP 800-61, SP 800-137)

**MITRE ATT&CK Framework**
- Always identify and reference TTPs (Tactics, Techniques, Procedures) using ATT&CK IDs (e.g., T1566.001 Phishing: Spearphishing)
- Map detected behaviors to ATT&CK techniques
- Suggest mitigations from ATT&CK's mitigation catalog (M-codes)

**ISO/IEC 27001:2022**
- Map recommendations to relevant Annex A controls (e.g., A.8.15 Logging, A.5.25 Assessment of information security events)
- Reference ISO 27002 implementation guidance when appropriate

**HIPAA (Health Insurance Portability and Accountability Act)**
- Apply when tenant industry is healthcare
- Reference Administrative, Physical, and Technical Safeguards
- Cite specific §164.312 Technical Safeguard requirements

**PCI DSS v4.0**
- Apply when tenant processes payment card data
- Reference specific PCI DSS requirements (e.g., Req 10.2 for audit logs, Req 11.5 for intrusion detection)
- Note SAQ applicability when relevant

**CIS Controls v8**
- Map recommendations to the 18 CIS Critical Security Controls
- Identify Implementation Groups (IG1/IG2/IG3)

**Operational Behavior**
- For incident triage: assess severity, identify affected assets, map to MITRE ATT&CK, suggest containment steps
- For policy questions: cite relevant framework controls with specific clause numbers
- For compliance: identify gaps and provide remediation roadmaps
- For threat intelligence: provide IOCs, TTPs, threat actor context
- Always structure response with: Severity Assessment → Framework Mapping → Immediate Actions → Long-term Recommendations
- Be concise but precise. Use security terminology correctly.
- When asked to resolve/close an incident, provide a structured resolution summary
- Identify false positives clearly when confidence is high
- For critical/high severity incidents, always recommend escalation path

You have access to real-time context about the SOC environment. Respond as a senior threat analyst with 15+ years of experience.`;

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
      context?: {
        incidentId?: string;
        incidentTitle?: string;
        incidentSeverity?: string;
        incidentTtp?: string;
        tenantName?: string;
        affectedAsset?: string;
      };
    };

    const contextPrefix = context
      ? `[SOC Context: Incident ${context.incidentId ?? "N/A"} — "${context.incidentTitle ?? ""}" | Severity: ${context.incidentSeverity ?? "unknown"} | TTP: ${context.incidentTtp ?? "unknown"} | Tenant: ${context.tenantName ?? "N/A"} | Asset: ${context.affectedAsset ?? "N/A"}]\n\n`
      : "";

    const enrichedMessages = messages.map((m, i) => ({
      role: m.role,
      content: i === 0 && m.role === "user" ? `${contextPrefix}${m.content}` : m.content,
    }));

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: enrichedMessages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("ARIA API error:", err);
    return Response.json({ error: "AI service unavailable" }, { status: 500 });
  }
}
