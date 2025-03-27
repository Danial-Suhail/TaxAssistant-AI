"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, BarChart3Icon, FileTextIcon, LineChartIcon, CalculatorIcon, Send, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { chat } from "@/actions/chat";
import { readStreamableValue } from "ai/rsc";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";
import FileUpload from './chat/file-upload';

const prompts = [
    {
        icon: <CalculatorIcon strokeWidth={1.8} className="size-5" />,
        text: "Generate the monthly income statement",
    },
    {
        icon: <LineChartIcon strokeWidth={1.8} className="size-5" />,
        text: "Provide a 12-month cash flow forecast",
    },
    {
        icon: <FileTextIcon strokeWidth={1.8} className="size-5" />,
        text: "Book a journal entry",
    },
    {
        icon: <BarChart3Icon strokeWidth={1.8} className="size-5" />,
        text: "Create a real-time financial dashboard",
    },
];

export type Message = {
    role: "user" | "assistant";
    content: string;
}

const Chatbot = () => {

    const messageEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [input]);

    const handlePromptClick = (text: string) => {
        setInput(text);
        if (inputRef.current) {
            inputRef.current.textContent = text;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMesage: Message = {
            role: "user",
            content: input.trim(),
        };

        setInput("");
        setIsLoading(true);
        setConversation(prev => [...prev, userMesage]);
        setHasStartedChat(true);

        try {
            const { newMessage } = await chat([
                ...conversation,
                userMesage,
            ]);

            let textContent = "";

            const assistantMessage: Message = {
                role: "assistant",
                content: "",
            };

            setConversation(prev => [...prev, assistantMessage]);

            for await (const delta of readStreamableValue(newMessage)) {
                textContent += delta;
                setConversation(prev => {
                    const newConv = [...prev];
                    newConv[newConv.length - 1] = {
                        role: "assistant",
                        content: textContent,
                    };
                    return newConv;
                });
            }

        } catch (error) {
            console.error("Error: ", error);
            setConversation(prev => [...prev, {
                role: "assistant",
                content: "Sorry, there was an error. Please try again",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative h-full flex flex-col items-center mb-5">
            {/* Message Container */}
            <div className="flex-1 w-full max-w-3xl px-4">
                {!hasStartedChat ? (
                    <div className="flex flex-col justify-end h-full">
                        <div className="text-center space-y-4">
                        <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-teal-100 p-6 rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-teal-600"
                  >
                    <path d="M21 12c0 1.2-.504 2.1-1.5 2.7s-1.5 1.2-1.5 2.3c0 .6-.4 1-1 1h-10c-.6 0-1-.4-1-1 0-1.1-.5-1.7-1.5-2.3S3 13.2 3 12s.504-2.1 1.5-2.7S6 8.1 6 7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1 0 1.1.5 1.7 1.5 2.3S21 10.8 21 12z"></path>
                    <path d="M12 2v2"></path>
                    <path d="M12 20v2"></path>
                    <path d="m4.93 4.93 1.41 1.41"></path>
                    <path d="m17.66 17.66 1.41 1.41"></path>
                    <path d="M2 12h2"></path>
                    <path d="M20 12h2"></path>
                    <path d="m6.34 17.66-1.41 1.41"></path>
                    <path d="m19.07 4.93-1.41 1.41"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-teal-700 mb-2">👋 How can I help with your taxes today?</h3>
                <p className="text-gray-500 max-w-sm mb-12">
                  Ask me about tax deductions, filing status, or upload your tax documents for analysis.
                </p>
              </div>


                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
                            <AnimatePresence>
                                {prompts.map((prompt, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.25 }}
                                        onClick={() => handlePromptClick(prompt.text)}
                                        className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-muted transition-all text-sm"
                                    >
                                        {prompt.icon}
                                        <span>
                                            {prompt.text}
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        animate={{
                            paddingBottom: input ? (input.split("\n").length > 3 ? "206px" : "110px") : "80px"
                        }}
                        transition={{ duration: 0.2 }}
                        className="pt-8 space-y-4"
                    >
                        {conversation.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex",
                                    {
                                        "justify-end": message.role === "user",
                                        "justify-start": message.role === "assistant"
                                    }
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-xl px-4 py-2",
                                    {
                                        "bg-foreground text-background": message.role === "user",
                                        "bg-muted": message.role === "assistant",
                                    }
                                )}>
                                    {message.role === "assistant" ? (
                                        <MarkdownRenderer content={message.content} />
                                    ) : (
                                        <p className="whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messageEndRef} />
                    </motion.div>
                )}
            </div>

            {/* Input Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, position: hasStartedChat ? "fixed" : "relative" }}
                className="w-full bg-gradient-to-t from-white via-white to-transparent pb-4 pt-6 bottom-0 mt-auto "
            >
                <div className="max-w-3xl mx-auto px-4">
                    <motion.div
                        animate={{ height: "auto" }}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="relative border rounded-2xl lg:rounded-e-3xl p-2.5 flex items-end gap-2 bg-background"
                    >
                        <FileUpload /> {/* Moved to the start */}
                        <div
                            contentEditable
                            role="textbox"
                            onInput={(e) => {
                                setInput(e.currentTarget.textContent || "");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            data-placeholder="Ask about your taxes..."
                            className="flex-1 min-h-[36px] overflow-y-auto px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-background rounded-md empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] whitespace-pre-wrap break-words"
                            ref={(element) => {
                                inputRef.current = element;
                                if (element && !input) {
                                    element.textContent = "";
                                }
                            }}
                        />
                        <Button 
                            type="submit" 
                            disabled={isLoading || !input.trim()} 
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
};

export default Chatbot
