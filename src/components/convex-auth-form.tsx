"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

type Mode = "signIn" | "signUp";

export function ConvexAuthForm() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn("password", { flow: mode, email, password });
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(String(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid" style={{ gap: "0.8rem" }}>
      <div className="field">
        <label htmlFor="authEmail">Email</label>
        <input
          id="authEmail"
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="authPassword">Password</label>
        <input
          id="authPassword"
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />
      </div>
      {error && <div className="error">{error}</div>}
      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Processing..." : mode === "signIn" ? "Sign In" : "Create Account"}
      </button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => setMode((prev) => (prev === "signIn" ? "signUp" : "signIn"))}
      >
        {mode === "signIn" ? "Need an account? Sign Up" : "Have an account? Sign In"}
      </button>
    </form>
  );
}
