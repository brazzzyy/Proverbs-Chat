import Image from "next/image";

export default function Loader() {
    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <div className="relative flex items-center justify-center w-16 h-16">
                <span className="absolute inset-0 rounded-2xl border border-bordercolor animate-ring-pulse" />
                <span className="absolute inset-0 rounded-2xl border border-bordercolor animate-ring-pulse" style={{ animationDelay: '0.95s' }} />
                <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-bordercolor animate-breathe">
                    <Image src="/images/logo.webp" width={34} height={34} alt="" className="opacity-90" priority />
                </span>
            </div>

            <div className="flex items-center gap-1.5">
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '0ms' }} />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '160ms' }} />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '320ms' }} />
            </div>
        </div>
    );
}
