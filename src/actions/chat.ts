"use server";

import { streamText } from "ai";
import { openai } from "@/lib/openai";
import { createStreamableValue } from "ai/rsc";
import { Message } from "@/components/chat-box";

// Set maximum response duration
const maxDuration = 30;

export const chat = async (history: Message[]) => {
    const stream = createStreamableValue();

    const systemMessage: { role: 'system' | 'user' | 'assistant'; content: string } = {
        role: "system",
        content: `You are TaxAssist AI, a helpful tax assistant specializing in US tax law and Form 1040.
        - Provide clear, concise information about tax topics
        - When appropriate, mention relevant IRS forms and publications
        - If you're unsure about specific tax details, acknowledge limitations and suggest consulting a tax professional
        - Focus on being helpful and educational about tax concepts
        - If the user mentions they've uploaded a document, acknowledge it and offer to analyze it (simulate analysis)
        - Keep responses friendly but professional`,
      }

      const augmentedMessages = [systemMessage, ...history]

    try {
        (async () => {
            const { textStream } = streamText({
                model: openai("gpt-4o"),
                messages: augmentedMessages,
                temperature: 0.7,
                maxTokens: 1000,
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
