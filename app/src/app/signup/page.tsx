"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoMark, Wordmark } from "@/components/shell/logo";
import { Shield } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <LogoMark />
          <Wordmark />
        </div>

        <div className="rounded-[13px] p-8" style={{ background: "var(--surface)", boxShadow: "var(--shadow-md)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-6">
            <Shield size={18} color="var(--primary)" />
            <h1 className="text-[17px] font-semibold" style={{ color: "var(--ink)" }}>Create your account</h1>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Alex Johnson"
                className="px-3 py-2 rounded-[8px] text-[13.5px] outline-none"
                style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@company.com"
                className="px-3 py-2 rounded-[8px] text-[13.5px] outline-none"
                style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)" }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-medium" style={{ color: "var(--ink-2)" }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                className="px-3 py-2 rounded-[8px] text-[13.5px] outline-none"
                style={{ border: "1px solid var(--border-strong)", background: "var(--surface)", color: "var(--ink)" }}
              />
            </div>

            {error && (
              <div className="px-3 py-2 rounded-[8px] text-[12.5px]" style={{ background: "var(--crit-tint)", color: "var(--crit)", border: "1px solid var(--crit)" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="py-2.5 rounded-[8px] text-[13.5px] font-semibold text-white transition-colors"
              style={{ background: "var(--primary)", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-5 text-center text-[12.5px]" style={{ color: "var(--ink-3)" }}>
            Already have an account?{" "}
            <a href="/login" className="font-medium" style={{ color: "var(--primary)" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
