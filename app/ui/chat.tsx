'use client';

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useChat } from '@ai-sdk/react';

export default function ChatBot() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [input, setInput] = useState('');
    const { messages, sendMessage } = useChat();

    const renderMessages = () => {
        return messages.map(message => (
          <div key={message.id} className={message.role === 'assistant' 
                                          ? "relative whitespace-pre-wrap bg-textboxcolor p-5 flex gap-2 rounded-2xl max-w-50 lg:max-w-100 w-fit self-start z-4" 
                                          : "whitespace-pre-wrap bg-textboxcolor p-2.5 pl-4 pr-5 flex gap-2 rounded-2xl max-w-50 lg:max-w-100 w-fit self-end z-4"}>
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
              }
              return null;
            })}
          </div>
        ));
    }

    const scrollToNewMessages = () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    useEffect(() => {   
        scrollToNewMessages();
    }, [messages]);

    return (
      <>
        <div className="font-normal flex flex-col justify-center items-center gap-5 w-85 lg:w-180">
          <div className="pt-10 flex flex-col gap-13 self-end w-full scrollbar-hide pb-30">
            {renderMessages()}
          </div>
          <div
            className={
              messages.length > 0
                ? `hidden`
                : `w-80 lg:w-full 2xl:mt-70 mt-20 flex flex-col justify-center text-center gap-5`
            }
          >
            <h1 className="text-3xl font-normal">{"Hi, I'm Proverbs Chat"}</h1>
            <p className="font-extralight text-md mb-10">
              Ask me any questions about christianity, faith, etc.
            </p>
          </div>
        </div>
        <div className={`${messages.length > 0 ? "fixed bottom-7" : ""} 
          w-85 lg:w-175 max-w-screen-md bg-textcolor p-4 rounded-3xl cursor-text border border-bordercolor z-50`}
          onClick={() => inputRef.current?.focus()}>
          <form
            className="flex justify-between items-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (input) {
                sendMessage({ text: input });
                setInput("");
              } else {
                return;
              }
            }}
          >
            <input
              ref={inputRef}
              className="pl-2 text-white w-65 lg:w-155 outline-0 bg-transparent"
              type="text"
              placeholder="Ask a question"
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
            />
            <button
              type="submit"
              className={
                !input
                  ? "group w-8 h-8 lg:w-8 rounded-3xl cursor-not-allowed bg-gray-600 p-2 scale-120 transition duration-300 ease-in-out"
                  : "group w-8 h-8 lg:w-8 rounded-3xl bg-amber-50 cursor-pointer p-2 scale-120 hover:bg-gray-500 hover:scale-140 transition duration-300 ease-in-out"
              }
            >
              <Image
                className={
                  input
                    ? "block group-hover:hidden transition duration-300"
                    : "block opacity-60"
                }
                src="/up-arrow-svgrepo-com.svg"
                width={50}
                height={60}
                alt="Submit button"
              />
              {input && (
                <Image
                  className="hidden group-hover:block transition duration-300"
                  src="/up-white-arrow-svgrepo-com.svg"
                  width={50}
                  height={60}
                  alt="Submit button hover"
                />
              )}
            </button>
          </form>
        </div>
        <div className="w-182 h-12 bottom-0 left-0 lg:left-97 2xl:left-200 bg-background fixed z-6"></div>
      </>
    );
}
