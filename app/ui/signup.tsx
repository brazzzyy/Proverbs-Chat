'use client';

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {

    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const pass = formData.get("password") as string;

        // Password edge cases
        if (!pass || pass.length < 8){
            setError("Error");
            return;
        } else {
            setError("");
        }

        // Sending form data in the POST request to server side
        try {
            const formDataObj = Object.fromEntries(new FormData(event.currentTarget).entries());
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formDataObj),
            });

            if (!res.ok) {
                throw new Error("Signup Failed");
            } else {
                router.push("/");
            }
        } catch(err) {
            console.log(`Error: ${err}`);
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
                    {error == "Error" && (<p className="text-xs font-light text-red-400">Password must be at least 8 characters long</p>)}
                </div>
            </div>

            <button
                type="submit"
                className="mt-5 w-full h-11 rounded-lg font-medium text-background bg-ink hover:bg-white cursor-pointer transition-colors duration-200"
            >
                Create account
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
