'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {

    const [passwordError, setPasswordError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMsg("");

        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!password || password.length < 8) {
            setPasswordError(true);
            return;
        }
        setPasswordError(false);
        setLoading(true);

        // Sending form data in the POST request to server side
        try {
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setErrorMsg(data.error || "Sign up failed. Please try again.");
                setLoading(false);
                return;
            }
            router.push("/");
        } catch (err) {
            console.error(err);
            setErrorMsg("Something went wrong. Please try again.");
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="px-8 py-9 flex flex-col w-[25rem] max-w-[calc(100vw-2rem)] bg-surface border border-bordercolor rounded-2xl"
        >
            <div className="flex flex-col items-center text-center gap-3 mb-7">
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-surface-raised border border-bordercolor">
                    <Image src="/images/logo.webp" width={22} height={22} alt="" className="opacity-80" />
                </span>
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-medium tracking-tight text-ink">Create account</h1>
                    <p className="text-ink-muted font-light text-sm">Begin your journey with Proverbs Chat</p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-ink-muted text-xs font-medium uppercase tracking-wide">Email</label>
                    <input id="email" className="bg-signupboxcolor px-3.5 py-2.5 rounded-lg outline-0 font-light border border-transparent focus:border-white/20 transition-colors duration-200 placeholder:text-ink-muted" type="email" name="email" placeholder="you@example.com" required />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-ink-muted text-xs font-medium uppercase tracking-wide">Password</label>
                    <input id="password" className="bg-signupboxcolor px-3.5 py-2.5 rounded-lg outline-0 font-light border border-transparent focus:border-white/20 transition-colors duration-200 placeholder:text-ink-muted" type="password" name="password" placeholder="At least 8 characters" required />
                    {passwordError && (<p className="text-xs font-light text-red-400">Password must be at least 8 characters long</p>)}
                </div>
            </div>

            {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}

            <button
                type="submit"
                disabled={loading}
                className="mt-5 w-full h-11 rounded-lg font-medium text-background bg-ink hover:bg-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
                {loading ? "Creating account..." : "Create account"}
            </button>

            <div className="w-full h-px bg-bordercolor my-6" />

            <p className="font-light text-sm text-ink-muted flex justify-center gap-1.5">
                Already have an account?
                <Link href="/login" className="text-ink font-normal hover:underline underline-offset-4 transition-colors">
                    Sign in
                </Link>
            </p>
        </form>
    );
}
