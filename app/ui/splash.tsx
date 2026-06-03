'use client';

import { useEffect, useState } from "react";
import Loader from "./loader";

// Shows a brief loading animation on initial page load / refresh, then fades out.
// Rendered on the server too, so the overlay is present in the very first paint.
export default function Splash() {
    const [fading, setFading] = useState(false);
    const [removed, setRemoved] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFading(true), 650);
        return () => clearTimeout(fadeTimer);
    }, []);

    useEffect(() => {
        if (!fading) return;
        const removeTimer = setTimeout(() => setRemoved(true), 450);
        return () => clearTimeout(removeTimer);
    }, [fading]);

    if (removed) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-[450ms] ease-out ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
            <Loader />
        </div>
    );
}
