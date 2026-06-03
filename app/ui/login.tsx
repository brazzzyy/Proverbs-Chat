"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Success: redirect
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[25rem] max-w-[calc(100vw-2rem)] bg-surface border border-bordercolor rounded-2xl flex flex-col px-8 py-9"
    >
      <div className="flex flex-col items-center text-center gap-3 mb-7">
        <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-surface-raised border border-bordercolor">
          <Image src="/images/logo.webp" width={22} height={22} alt="" className="opacity-80" />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-xl tracking-tight text-ink">Welcome back</h1>
          <p className="text-ink-muted font-light text-sm">Sign in to continue to Proverbs Chat</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-ink-muted text-xs font-medium uppercase tracking-wide">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
            className="bg-signupboxcolor w-full px-3.5 py-2.5 font-light rounded-lg outline-0 border border-transparent focus:border-white/20 transition-colors duration-200 placeholder:text-ink-muted"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-ink-muted text-xs font-medium uppercase tracking-wide">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            required
            className="bg-signupboxcolor w-full px-3.5 py-2.5 font-light rounded-lg outline-0 border border-transparent focus:border-white/20 transition-colors duration-200 placeholder:text-ink-muted"
          />
        </div>
      </div>

      {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 mt-5 rounded-lg font-medium text-background bg-ink hover:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

      <div className="w-full h-px bg-bordercolor my-6" />

      <p className="font-light text-sm text-ink-muted flex justify-center gap-1.5">
        {`Don't have an account?`}
        <Link href="/signup" className="text-ink font-normal hover:underline underline-offset-4 transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  );
}
