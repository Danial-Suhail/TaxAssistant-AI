"use server";

import { streamText } from "ai";
import { gemini } from "@/lib/gemini";
import { openai } from "@/lib/openai";
import { createStreamableValue } from "ai/rsc";
import { Message } from "@/components/chat-box";

export const chat = async (history: Message[]) => {
    const stream = createStreamableValue();

    (async () => {
        const { textStream } = streamText({
            model: openai("gpt-3.5-turbo"),
            messages: history,
        });

        for await (const text of textStream) {
            stream.update(text);
        }

        stream.done();
    })();

    return {
        messages: history,
        newMessage: stream.value,
    };
};
