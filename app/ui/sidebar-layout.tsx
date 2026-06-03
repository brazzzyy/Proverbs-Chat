'use client';

import { useEffect, useState } from "react";
import NavHeader from "./nav";

function getSidebarWidth(expanded: boolean, isMobile: boolean) {
    if (isMobile) return "0px";
    return expanded ? "12rem" : "3rem";
}

function MenuIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
        >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
    );
}

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const [expanded, setExpanded] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)");

        const apply = () => {
            const mobile = media.matches;
            setIsMobile(mobile);
            if (mobile) {
                setExpanded(false);
                setMobileOpen(false);
            }
            document.documentElement.style.setProperty(
                "--sidebar-width",
                getSidebarWidth(expanded, mobile)
            );
        };

        apply();
        media.addEventListener("change", apply);
        return () => media.removeEventListener("change", apply);
    }, [expanded]);

    return (
        <>
            {!mobileOpen && (
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                    aria-expanded={false}
                    className="fixed left-3 top-3 z-[60] flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg md:hidden"
                >
                    <MenuIcon />
                </button>
            )}

            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close menu"
                    className="fixed inset-0 z-40 bg-black/55 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <NavHeader
                expanded={expanded}
                onToggle={() => setExpanded((prev) => !prev)}
                isMobile={isMobile}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className="flex min-h-screen flex-col pt-12 pl-0 md:pt-0 md:pl-[var(--sidebar-width)]">
                {children}
            </div>
        </>
    );
}
