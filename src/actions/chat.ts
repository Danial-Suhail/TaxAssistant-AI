"use server";

import { streamText } from "ai";
import { openai } from "@/lib/openai";
import { createStreamableValue } from "ai/rsc";
import { Message } from "@/components/chat-box";

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export const chat = async (history: Message[], fileContent?: string) => {
    const stream = createStreamableValue();

    // If there's file content, add it to the system message
    const fileContext = fileContent ? `
        \n\nAnalyzing uploaded document content:
        ${fileContent}
        
        Please provide analysis and answer questions about this document.
    ` : '';

    const systemMessage: ChatMessage = {
        role: "system",
        content: `You are TaxAssist AI, a helpful tax assistant specializing in US tax law and Form 1040.
        ${fileContext}
        - Provide clear, concise information about tax topics
        - When appropriate, mention relevant IRS forms and publications
        - If you're unsure about specific tax details, acknowledge limitations and suggest consulting a tax professional
        - Focus on being helpful and educational about tax concepts
        - If there's an uploaded document, analyze its contents and provide insights
        - Keep responses friendly but professional`,
    };

    const augmentedMessages: ChatMessage[] = [
        systemMessage,
        ...history.map(msg => ({
            role: msg.role,
            content: msg.content
        }))
    ];

    try {
        (async () => {
            const { textStream } = streamText({
                model: openai("gpt-4o"), 
                messages: augmentedMessages,
                temperature: 0.7,
                maxTokens: 1500, // Increased for file analysis
            });

            for await (const text of textStream) {
                stream.update(text);
            }

            stream.done();
        })();
    } catch (error) {
        console.error("OpenAI API Error:", error);
        stream.error(error as Error);
    }

    return {
        messages: history,
        newMessage: stream.value,
    };
};
