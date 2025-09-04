'use client';

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
        <form onSubmit={handleSubmit} className="mt-40 p-6 flex flex-col justify-center items-center w-105 border-bordercolor border-1 gap-6 rounded-lg bg-textboxcolor">
            <h1 className="text-4xl mb-3 text-gray-300 font-light">Create Account</h1>
            <div className="flex flex-col w-80 gap-1">
                <label htmlFor="email" className="text-gray-300">Email</label>
                <input className="bg-signupboxcolor p-2.5 rounded-md outline-0 font-light" type="email" name="email" placeholder="johndoe123@gmail.com" required />
            </div>
            <div className="flex flex-col w-80 gap-1">
                <label htmlFor="password" className="text-gray-300">Password</label>
                <input className="bg-signupboxcolor p-2.5 rounded-md outline-0 font-light" type="password" name="password" placeholder="Password" required />
                    {error == "Error" && (<p className="text-xs font-light text-red-400">Password must be at least 8 characters long</p>)}
            </div>
            <button type="submit" className="mt-3 w-23 h-10 bg-gray-500 rounded-sm cursor-pointer">Sign Up</button>
        </form>
    );
}