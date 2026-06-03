"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

function LogOutIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0"
        >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}

export default function LogoutButton({ showLabel = false }: { showLabel?: boolean }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const onProtectedHome = pathname === "/";

    useEffect(() => {
        const checkSession = async () => {
            const res = await fetch("/api/session");
            const data = await res.json();
            setIsLoggedIn(data.isLoggedIn);
        };

        checkSession();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/logout", { method: "POST" });
            if (res.ok) {
                setIsLoggedIn(false);
                router.push("/login");
            } else {
                console.error("Logout failed");
            }
        } catch (err) {
            console.error("Error logging out:", err);
        }
    };

    if (!onProtectedHome && !isLoggedIn) return null;

    return (
        <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
            className={`flex h-8 w-full cursor-pointer items-center overflow-hidden rounded-lg border border-bordercolor bg-surface-raised text-ink transition-colors hover:border-white/25 hover:bg-surface ${
                showLabel ? "justify-start gap-2 px-2.5" : "justify-center"
            }`}
        >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                <LogOutIcon />
            </span>
            <span
                className={`overflow-hidden whitespace-nowrap text-sm font-light transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    showLabel ? "max-w-[4.5rem] opacity-100" : "max-w-0 opacity-0"
                }`}
            >
                Log out
            </span>
        </button>
    );
}
