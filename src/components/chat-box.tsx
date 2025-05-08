"use client";

import React, { useEffect, useRef, useState, DragEvent } from 'react';
import { BarChart3Icon, FileTextIcon, LineChartIcon, CalculatorIcon, Send, Loader2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";
import FileUpload from './chat/file-upload';
import { useChat } from 'ai/react';
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type HandleSubmitOptions = {
  data?: string;
  experimental_attachments?: FileList;
};

function TextFilePreview({ file }: { file: File }) {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      setContent(typeof text === "string" ? text.slice(0, 100) : "");
    };
    reader.readAsText(file);
  }, [file]);

  return (
    <div>
      {content}
      {content.length >= 100 && "..."}
    </div>
  );
}

// First, create an array of prompt sets
const promptSets = [
    [
        {
            icon: <CalculatorIcon strokeWidth={1.8} className="size-5" />,
            text: "How do tax brackets work for 2024?",
        },
        {
            icon: <LineChartIcon strokeWidth={1.8} className="size-5" />,
            text: "What tax deductions am I eligible for?",
        },
        {
            icon: <FileTextIcon strokeWidth={1.8} className="size-5" />,
            text: "Explain the difference between W-2 and 1099",
        },
        {
            icon: <BarChart3Icon strokeWidth={1.8} className="size-5" />,
            text: "What's the standard deduction for 2024?",
        },
    ],
    [
        {
            icon: <CalculatorIcon strokeWidth={1.8} className="size-5" />,
            text: "How does the Child Tax Credit work?",
        },
        {
            icon: <LineChartIcon strokeWidth={1.8} className="size-5" />,
            text: "What are the capital gains tax rates?",
        },
        {
            icon: <FileTextIcon strokeWidth={1.8} className="size-5" />,
            text: "How do I claim home office deductions?",
        },
        {
            icon: <BarChart3Icon strokeWidth={1.8} className="size-5" />,
            text: "Explain tax-advantaged retirement accounts",
        },
    ],
    [
        {
            icon: <CalculatorIcon strokeWidth={1.8} className="size-5" />,
            text: "What are estimated tax payments?",
        },
        {
            icon: <LineChartIcon strokeWidth={1.8} className="size-5" />,
            text: "How to reduce my taxable income?",
        },
        {
            icon: <FileTextIcon strokeWidth={1.8} className="size-5" />,
            text: "Explain itemized deductions",
        },
        {
            icon: <BarChart3Icon strokeWidth={1.8} className="size-5" />,
            text: "What tax credits are available?",
        },
    ],
];

export type Message = {
    id: string;
    role: "user" | "assistant" | "system" | "data";
    content: string;
    experimental_attachments?: { name: string; url: string; contentType: string }[];
}

// Add after your existing type definitions
type ChatHistory = {
  id: string;
  title: string;
  messages: Message[];
  timestamp: string;
};

const TaxTable = ({ data }: { data: { label: string; amount: number }[] }) => (
  <div className="overflow-x-auto my-4">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {data.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 text-sm text-gray-900">{item.label}</td>
            <td className="px-6 py-4 text-sm text-gray-900 text-right">
              ${item.amount.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TaxBarChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <div className="h-64 w-full my-4">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
        <Bar dataKey="value" fill="#14b8a6" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const extractJSON = (content: string, startMarker: string, endMarker: string) => {
  try {
    const start = content.indexOf(startMarker);
    if (start === -1) return null;
    
    const end = content.indexOf(endMarker, start);
    if (end === -1) return null;
    
    const jsonString = content.substring(start + startMarker.length, end).trim();
    // Remove any comments and clean the JSON string
    const cleanJsonString = jsonString
      .replace(/\/\/.*$/gm, '') // Remove single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
      .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
      .trim();
    
    try {
      return JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Problematic JSON string:', cleanJsonString);
      return null;
    }
  } catch (error) {
    console.error('Error extracting JSON:', error);
    return null;
  }
};

const Chatbot = () => {
    const { messages, input, handleInputChange, handleSubmit: handleMessageSubmit, isLoading, reload, setMessages } = useChat({
        api: '/api/chat',
        onError: () => {
            toast.error("Failed to send message");
        }
    });

    const messageEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [hasStartedChat, setHasStartedChat] = useState<boolean>(false);
    const [files, setFiles] = useState<FileList | null>(null);
    const [clearPreview, setClearPreview] = useState(false);
    const [currentPromptSetIndex, setCurrentPromptSetIndex] = useState(0);
    const currentPrompts = promptSets[currentPromptSetIndex % promptSets.length];
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [previewPdf, setPreviewPdf] = useState<string | null>(null);
    const historyDropdownRef = useRef<HTMLDivElement>(null);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    };
    
    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    };
    
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFiles = event.dataTransfer.files;
      const droppedFilesArray = Array.from(droppedFiles);
      if (droppedFilesArray.length > 0) {
        const validFiles = droppedFilesArray.filter(
          (file) => file.type.startsWith("image/") || file.type.startsWith("text/")
        );
    
        if (validFiles.length === droppedFilesArray.length) {
          const dataTransfer = new DataTransfer();
          validFiles.forEach((file) => dataTransfer.items.add(file));
          setFiles(dataTransfer.files);
        } else {
          toast.error("Only image and text files are allowed!");
        }
      }
    };
    


    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [input]);

    const handlePromptClick = (text: string) => {
        if (inputRef.current) {
            inputRef.current.textContent = text;
        }
        handleInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    const handleFileSelect = (file: File) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      setFiles(dataTransfer.files);
    };

    const handleSubmit = async (e: React.FormEvent, options?: HandleSubmitOptions) => {
      e.preventDefault();
      const fileOptions = options || (files ? { experimental_attachments: files } : {});
      await handleMessageSubmit(e, fileOptions);
      setFiles(null);
      setClearPreview(true); // Set to true after submission
      // Reset after a short delay
      setTimeout(() => setClearPreview(false), 100);
      // Add this line to rotate prompts
      setCurrentPromptSetIndex((prev) => (prev + 1) % promptSets.length);
    };

    const handleNewChat = () => {
        // Save current chat to history if there are messages and it's unique
        if (messages.length > 0) {
            const newChatMessages = messages.map(msg => ({
                id: msg.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
                role: msg.role,
                content: msg.content
            }));
            const isDuplicate = chatHistory.some(chat =>
                chat.messages.length === newChatMessages.length &&
                chat.messages.every((msg, idx) =>
                    msg.role === newChatMessages[idx].role &&
                    msg.content === newChatMessages[idx].content
                )
            );
            if (!isDuplicate) {
                const newChat: ChatHistory = {
                    id: Date.now().toString(),
                    title: messages[0].content.slice(0, 30) + "...",
                    messages: newChatMessages,
                    timestamp: new Date().toLocaleString()
                };
                setChatHistory(prev => [newChat, ...prev].slice(0, 5));
            }
        }

        // Reset chat state
        setHasStartedChat(false);
        setFiles(null);
        setClearPreview(true);
        setMessages([]);
        reload();
        setTimeout(() => setClearPreview(false), 100);
    };

    const handleHistoryClick = (chat: ChatHistory) => {
        const formattedMessages = chat.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content
        }));
        setMessages(formattedMessages);
        setHasStartedChat(true);
        setIsHistoryOpen(false);
    };

    const handleContentEditableInput = (e: React.FormEvent<HTMLDivElement>) => {
        const value = (e.currentTarget as HTMLDivElement).textContent || '';
        handleInputChange({ target: { value } } as React.ChangeEvent<HTMLTextAreaElement>);
    };

    // Close history dropdown when clicking outside
    useEffect(() => {
        if (!isHistoryOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (
                historyDropdownRef.current &&
                !historyDropdownRef.current.contains(event.target as Node)
            ) {
                setIsHistoryOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHistoryOpen]);

    return (
        <div className="relative h-full flex flex-col items-center mb-5">
            {/* Main chat UI (everything except modals) */}
            {/* New Chat Button - Update positioning */}
            <div className="fixed top-4 left-4 z-50">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewChat}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 bg-white/80 backdrop-blur-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Chat</span>
                </Button>
            </div>
            {/* History Button - Update positioning */}
            <div className="fixed top-4 right-4 z-50">
                <div className="relative">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className="flex items-center gap-2 bg-white/80 backdrop-blur-sm"
                    >
                        History
                        <svg
                            className={`w-4 h-4 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </Button>
                    {isHistoryOpen && (
                        <div
                            ref={historyDropdownRef}
                            className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg border"
                        >
                            {chatHistory.length > 0 ? (
                                <div className="py-1">
                                    {chatHistory.map((chat) => (
                                        <button
                                            key={chat.id}
                                            onClick={() => handleHistoryClick(chat)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex flex-col"
                                        >
                                            <span className="text-sm font-medium truncate">{chat.title}</span>
                                            <span className="text-xs text-gray-500">{chat.timestamp}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-500">No chat history</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
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
                                {currentPrompts.map((prompt, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.25 }}
                                        onClick={() => handlePromptClick(prompt.text)}
                                        className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-muted transition-all text-sm select-none"
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
                        className="pt-20 pb-32 space-y-4 overflow-auto"
                    >
                        {messages.map((message, index) => (
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
                                        <div>
                                            <MarkdownRenderer content={message.content} />
                                            {/* Table rendering */}
                                            {message.content.includes('|||TABLE_DATA|||') && (
                                                <TaxTable
                                                    data={extractJSON(
                                                        message.content,
                                                        '|||TABLE_DATA|||',
                                                        '|||END_TABLE|||'
                                                    )?.tableData || []}
                                                />
                                            )}
                                            {/* Chart rendering */}
                                            {message.content.includes('|||CHART_DATA|||') && (
                                                <TaxBarChart
                                                    data={extractJSON(
                                                        message.content,
                                                        '|||CHART_DATA|||',
                                                        '|||END_CHART|||'
                                                    )?.chartData || []}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            {message.experimental_attachments?.map((attachment) =>
                                                attachment.contentType?.startsWith("image") ? (
                                                    <img
                                                        key={attachment.name}
                                                        src={attachment.url}
                                                        alt={attachment.name}
                                                        className="mt-2 rounded-md max-w-[200px] cursor-pointer"
                                                        onClick={() => setPreviewImage(attachment.url)}
                                                    />
                                                ) : attachment.contentType === "application/pdf" ? (
                                                    <div
                                                        key={attachment.name}
                                                        className="mt-2 flex flex-col items-center cursor-pointer"
                                                        onClick={() => setPreviewPdf(attachment.url)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 48 48"
                                                            className="w-12 h-12 mb-1"
                                                        >
                                                            <rect width="48" height="48" rx="8" fill="#F87171" />
                                                            <text x="50%" y="60%" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" fontFamily="Arial" dy=".3em">PDF</text>
                                                        </svg>
                                                        <span className="text-xs text-teal-700 max-w-[180px] truncate text-center">{attachment.name}</span>
                                                        <span className="text-[10px] text-gray-400">Click to view</span>
                                                    </div>
                                                ) : null
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div ref={messageEndRef} />
                        <div className="h-32" />
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
                    {/* Add the prompts here, above the input */}
                    {hasStartedChat && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4 mb-4">
                            {currentPrompts.map((prompt, index) => (
                                <motion.button
                                    key={`${currentPromptSetIndex}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    onClick={() => handlePromptClick(prompt.text)}
                                    className="flex items-center gap-3 p-3 text-left border rounded-xl hover:bg-muted transition-all text-sm select-none"
                                >
                                    {prompt.icon}
                                    <span>{prompt.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Your existing input div */}
                    <motion.div
                        animate={{ height: "auto" }}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        className="relative border rounded-2xl lg:rounded-e-3xl p-2.5 flex items-end gap-2 bg-background"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <AnimatePresence>
                            {files && files.length > 0 && (
                                <div className="flex flex-row gap-2 absolute -top-16 left-0 px-4 w-full">
                                    {Array.from(files).map((file) =>
                                        file.type.startsWith("image") ? (
                                            <div key={file.name}>
                                                <motion.img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="rounded-md w-16 h-16 object-cover cursor-pointer"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{
                                                        y: -10,
                                                        scale: 1.1,
                                                        opacity: 0,
                                                        transition: { duration: 0.2 },
                                                    }}
                                                    onClick={() => setPreviewImage(URL.createObjectURL(file))}
                                                />
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                        <FileUpload onFileSelect={handleFileSelect} clearPreview={clearPreview} /> {/* Moved to the start */}
                        <AnimatePresence>
                            {files && files.length > 0 && (
                                <div className="flex flex-row gap-2 absolute bottom-12 px-4 w-full md:w-[500px] md:px-0">
                                    {Array.from(files).map((file) =>
                                        file.type.startsWith("image") ? (
                                            <div key={file.name}>
                                                <motion.img
                                                    src={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    className="rounded-md w-16"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{
                                                        y: -10,
                                                        scale: 1.1,
                                                        opacity: 0,
                                                        transition: { duration: 0.2 },
                                                    }}
                                                />
                                            </div>
                                        ) : file.type.startsWith("text") ? (
                                            <motion.div
                                                key={file.name}
                                                className="text-[8px] leading-1 w-28 h-16 overflow-hidden text-zinc-500 border p-2 rounded-lg bg-white dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{
                                                    y: -10,
                                                    scale: 1.1,
                                                    opacity: 0,
                                                    transition: { duration: 0.2 },
                                                }}
                                            >
                                                <TextFilePreview file={file} />
                                            </motion.div>
                                        ) : null
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                        <div
                            contentEditable
                            role="textbox"
                            onInput={handleContentEditableInput}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                    setHasStartedChat(true);
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
                                const options = files ? { experimental_attachments: files } : {};
                                handleSubmit(e, options);
                                setFiles(null); // Clear files after submission
                                setHasStartedChat(true);
                            }}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
            {/* Modal overlays for image and PDF previews (always render last for highest z-index) */}
            {previewImage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setPreviewImage(null)} />
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                        <button
                            className="absolute top-6 right-8 bg-white/80 rounded-full p-2 shadow hover:bg-white z-20"
                            onClick={() => setPreviewImage(null)}
                            aria-label="Close preview"
                        >
                            <X className="w-7 h-7 text-gray-700" />
                        </button>
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="rounded-lg max-h-[90vh] max-w-[90vw] mx-auto shadow-lg border bg-white"
                        />
                    </div>
                </div>
            )}
            {previewPdf && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="absolute inset-0" onClick={() => setPreviewPdf(null)} />
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                        <button
                            className="absolute top-6 right-8 bg-white/80 rounded-full p-2 shadow hover:bg-white z-20"
                            onClick={() => setPreviewPdf(null)}
                            aria-label="Close PDF preview"
                        >
                            <X className="w-7 h-7 text-gray-700" />
                        </button>
                        <iframe
                            src={previewPdf}
                            title="PDF Preview"
                            className="rounded-lg w-full max-w-5xl h-[90vh] mx-auto shadow-lg border bg-white"
                            style={{ minHeight: '60vh' }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
};

export default Chatbot
