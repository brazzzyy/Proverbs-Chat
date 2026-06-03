'use client';

import Image from "next/image";
import Logout from "../ui/logout";

type NavHeaderProps = {
    expanded: boolean;
    onToggle: () => void;
    isMobile: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
};

const SIDEBAR_TRANSITION = "duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]";

function CloseIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
        >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="6" y1="18" x2="18" y2="6" />
        </svg>
    );
}

export default function NavHeader({
    expanded,
    onToggle,
    isMobile,
    mobileOpen,
    onMobileClose,
}: NavHeaderProps) {
    const showLabels = isMobile ? mobileOpen : expanded;

    return (
        <aside
            className={`fixed left-0 top-0 z-50 flex h-screen w-48 flex-col overflow-hidden border-r border-bordercolor bg-navgray backdrop-blur-md transition-[width,transform] ${SIDEBAR_TRANSITION} -translate-x-full md:translate-x-0 ${
                mobileOpen ? "translate-x-0" : ""
            } ${expanded ? "md:w-48" : "md:w-12"}`}
        >
            <div className="flex h-14 shrink-0 items-center gap-2 overflow-hidden border-b border-bordercolor px-2 pt-1">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                    aria-expanded={showLabels}
                    className="hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-bordercolor bg-surface-raised transition-colors hover:border-white/20 md:flex"
                >
                    <Image
                        src="/images/logo.webp"
                        width={18}
                        height={18}
                        alt=""
                        className="opacity-90"
                    />
                </button>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bordercolor bg-surface-raised md:hidden">
                    <Image
                        src="/images/logo.webp"
                        width={18}
                        height={18}
                        alt=""
                        className="opacity-90"
                    />
                </div>
                <span
                    className={`min-w-0 flex-1 overflow-hidden whitespace-nowrap text-sm font-medium tracking-tight text-ink transition-[max-width,opacity] ${SIDEBAR_TRANSITION} ${
                        showLabels ? "max-w-none opacity-100" : "max-w-0 opacity-0 md:max-w-0"
                    }`}
                >
                    Proverbs Chat
                </span>
                {mobileOpen && (
                    <button
                        type="button"
                        onClick={onMobileClose}
                        aria-label="Close menu"
                        className="ml-auto flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-raised md:hidden"
                    >
                        <CloseIcon />
                    </button>
                )}
            </div>

            <div className="mt-auto overflow-hidden border-t border-bordercolor p-2">
                <Logout showLabel={showLabels} />
            </div>
        </aside>
    );
}
