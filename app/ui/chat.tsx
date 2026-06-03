'use client';

import Image from "next/image";
import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { useChat } from '@ai-sdk/react';

const SUGGESTIONS = [
    "What does Proverbs say about wisdom?",
    "How do I find peace in hard times?",
    "Explain the meaning of grace",
    "A verse for when I feel anxious",
];


function StreamedText({ text }: { text: string }) {
    const tokens = useMemo(() => text.split(/(\s+)/), [text]);
    return (
        <>
            {tokens.map((token, i) =>
                token.trim() === ''
                    ? <span key={i}>{token}</span>
                    : <span key={i} className="token-in">{token}</span>
            )}
        </>
    );
}

const COMPOSER_MAX_HEIGHT = 200;
const SCROLL_FADE_RAMP_PX = 140;

export default function ChatBot() {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [fadeOpacity, setFadeOpacity] = useState(0);
    const [input, setInput] = useState('');
    const { messages, sendMessage, status } = useChat();

    const resizeComposer = () => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    };

    const hasMessages = messages.length > 0;

    const lastMessage = messages[messages.length - 1];
    const assistantHasText =
        lastMessage?.role === 'assistant' &&
        lastMessage.parts.some(part => part.type === 'text' && part.text.length > 0);
    const isThinking = (status === 'submitted' || status === 'streaming') && !assistantHasText;

    const submit = (text: string) => {
        const value = text.trim();
        if (!value) return;
        sendMessage({ text: value });
        setInput("");
    };

    useEffect(() => {
        resizeComposer();
    }, [input]);

    const renderMessages = () => {
        return messages.map((message, index) => {
            const isAssistant = message.role === 'assistant';
            const roleChanged =
                index > 0 && messages[index - 1].role !== message.role;
            const spacing =
                index === 0 ? "" : roleChanged ? "mt-9" : "mt-2";

            return (
                <div
                    key={message.id}
                    className={
                        `${spacing} ` +
                        (isAssistant
                            ? "animate-rise whitespace-pre-wrap text-ink leading-relaxed font-light max-w-[85%] lg:max-w-[78%] w-fit self-start py-1"
                            : "animate-rise whitespace-pre-wrap text-[15px] text-ink/95 leading-relaxed font-normal px-4 py-2.5 rounded-2xl bg-[#2a2a30] max-w-[85%] lg:max-w-[78%] w-fit self-end")
                    }
                >
                    {message.parts.map((part, i) => {
                        if (part.type === 'text') {
                            return (
                                <div key={`${message.id}-${i}`}>
                                    {isAssistant
                                        ? <StreamedText text={part.text} />
                                        : part.text}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
            );
        });
    }

    const updateScrollFade = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;

        const hasOverflow = el.scrollHeight > el.clientHeight + 8;
        if (!hasOverflow) {
            setFadeOpacity(0);
            return;
        }

        const distanceFromBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight;

        if (distanceFromBottom <= 4) {
            setFadeOpacity(0);
            return;
        }

        // Ramp 0→1 over SCROLL_FADE_RAMP_PX so fade tracks scroll smoothly (no on/off jump)
        const opacity = Math.min(1, distanceFromBottom / SCROLL_FADE_RAMP_PX);
        setFadeOpacity(opacity);
    }, []);

    const scrollToNewMessages = () => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {
        if (!hasMessages) return;

        const el = scrollRef.current;
        if (!el) return;

        updateScrollFade();
        el.addEventListener("scroll", updateScrollFade, { passive: true });

        const content = el.firstElementChild;
        const resizeObserver = new ResizeObserver(updateScrollFade);
        if (content) resizeObserver.observe(content);

        window.addEventListener("resize", updateScrollFade);

        return () => {
            el.removeEventListener("scroll", updateScrollFade);
            resizeObserver?.disconnect();
            window.removeEventListener("resize", updateScrollFade);
        };
    }, [hasMessages, updateScrollFade]);

    useEffect(() => {
        if (!hasMessages) return;
        scrollToNewMessages();
        // After scrolling to latest messages, hide the fade
        const t = setTimeout(updateScrollFade, 100);
        return () => clearTimeout(t);
    }, [messages, isThinking, hasMessages, updateScrollFade]);

    const composer = (
        <div
            className="w-full bg-surface px-4 py-2 rounded-2xl cursor-text border border-bordercolor transition-colors duration-200 focus-within:border-white/20"
            onClick={() => inputRef.current?.focus()}
        >
            <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                    e.preventDefault();
                    submit(input);
                }}
            >
                <textarea
                    ref={inputRef}
                    rows={1}
                    className="scrollbar-hide text-ink placeholder:text-ink-muted w-full min-h-[24px] max-h-[200px] resize-none overflow-y-auto bg-transparent py-1 font-light leading-relaxed outline-0"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            submit(input);
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className={
                        !input.trim()
                            ? "mb-0.5 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl cursor-not-allowed bg-surface-raised transition-colors duration-200"
                            : "mb-0.5 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer bg-ink hover:bg-white transition-colors duration-200"
                    }
                >
                    <Image
                        src={input.trim() ? "/images/arrow-up.webp" : "/images/arrow-up-light.webp"}
                        className={input.trim() ? "opacity-100" : "opacity-30"}
                        width={16}
                        height={16}
                        alt="Submit"
                    />
                </button>
            </form>
        </div>
    );

    if (!hasMessages) {
        return (
            <div className="flex min-h-screen w-85 flex-col items-center justify-center gap-8 px-2 pb-16 lg:w-180">
                <div className="flex flex-col items-center text-center gap-3">
                    <h1 className="text-3xl font-medium tracking-tight text-ink">{"Hi, I'm Proverbs Chat"}</h1>
                    <p className="font-light text-sm text-ink-muted max-w-sm leading-relaxed">
                        Ask me anything about Christianity, faith, and scripture.
                    </p>
                </div>

                <div className="w-full max-w-xl">
                    {composer}
                </div>

                <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                    {SUGGESTIONS.map(s => (
                        <button
                            key={s}
                            onClick={() => submit(s)}
                            className="text-sm font-light text-ink-muted bg-surface border border-bordercolor rounded-full px-3.5 py-1.5 hover:text-ink hover:border-white/20 transition-colors duration-200 cursor-pointer"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-dvh w-85 flex-col font-normal lg:w-180">
            <div className="relative min-h-0 flex-1">
                <div
                    ref={scrollRef}
                    className="h-full overflow-x-hidden overflow-y-auto overscroll-contain scrollbar-hide"
                >
                    <div className="flex flex-col pt-10 pb-6">
                        {renderMessages()}
                        {isThinking && (
                            <div className={`animate-rise flex items-center gap-2 py-1 w-fit self-start ${lastMessage?.role === 'user' ? 'mt-9' : 'mt-2'}`}>
                                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '0ms' }} />
                                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '160ms' }} />
                                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-ink-muted" style={{ animationDelay: '320ms' }} />
                            </div>
                        )}
                    </div>
                </div>
                <div
                    aria-hidden
                    className="scroll-bottom-fade pointer-events-none absolute inset-x-0 bottom-0"
                    style={{
                        opacity: fadeOpacity,
                        visibility: fadeOpacity < 0.02 ? "hidden" : "visible",
                    }}
                />
            </div>
            <div className="shrink-0 px-2 pb-6 pt-2">
                {composer}
            </div>
        </div>
    );
}
