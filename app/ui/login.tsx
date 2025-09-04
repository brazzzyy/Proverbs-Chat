"use client";

import Link from "next/link";
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
    <form onSubmit={handleSubmit} className="mt-35 w-100 h-105 border-bordercolor border-2 rounded-md flex flex-col justify-center items-center gap-5 bg-textboxcolor">
      <h1 className="font-medium text-2xl mt-[-50]">Login to Proverbs Chat</h1>
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="bg-signupboxcolor mt-2 w-85 p-2 font-extralight rounded-lg outline-0"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        className="bg-signupboxcolor w-85 p-2 font-extralight rounded-lg outline-0"
      />
      {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-[-10] w-85 h-8 border-white border-1 rounded-lg cursor-pointer">
        {loading ? "Logging in..." : "Login"}
      </button>
      <hr className="border-gray-500 font-bold w-80 mt-2" />
      <p className="font-light flex justify-center gap-2">
        {`Don't have an account?`}
        <Link href="/signup" className="underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
}