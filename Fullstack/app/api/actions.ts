"use server"
import  { Ollama } from 'ollama'
import path from "path";
import { writeFile } from "fs/promises";
import type { Message } from '@/hooks/chat-hook'
import dotenv from "dotenv"

dotenv.config()

const ollama = new Ollama({
        host: "https://ollama.com",
        headers: {
                Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
        },
})

export async function sendMessage(initialState: any, formData: FormData) {
        const message = formData.get("message")?.toString();
        const model = formData.get("model")?.toString();
        const messagesJson = formData.get("messages")?.toString();
        const existingMessages: Message[] = messagesJson ? JSON.parse(messagesJson) : [];
        const file = formData.get("file") as File | null;
        console.log("File received:", file);
        let imagePath: string | null = null;

        if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                imagePath = path.join("/tmp", file.name); // safe upload location
                await writeFile(imagePath, buffer);

                console.log("Saved image to:", imagePath);
        }
        // Prepare messages for Ollama - include conversation history
        const ollamaMessages = [
                ...existingMessages.map(msg => ({
                        role: msg.role,
                        content: `limit the response to just 3 sentences ${msg.content}`,
                        images: [] as string[] // Only the current message can have images
                })),
                {
                        role: "user" as const,
                        content: message || "",

                        images: imagePath ? [imagePath] : []
                },

        ];

        const response = await ollama.chat({
                model: model || "gpt-oss:120b-cloud",
                messages: ollamaMessages

        })
        console.log("Message received:", message);
        return { message, response: response.message.content }
}
export async function fetchModels() {
        const models = await ollama.list()
        console.log("Models fetched:", models);
        return models;
}

//Todo : save chat history , create a title from chat history 
export async function createTitle(messages: Message[], model: string) {
        const conversation = messages
                .map(m => `${m.role}: ${m.content}`)
                .join("\n");

        const data = await ollama.chat({
                model: model || "gpt-oss:120b-cloud",
                messages: [
                        {
                                role: "system",
                                content: "You generate concise chat titles."
                        },
                        {
                                role: "user",
                                content: `
Create a very short title (max 5 words) that summarizes the conversation below.

Rules:
- No quotes
- No punctuation
- No markdown
- No explanations
- Return ONLY the title

Conversation:
${conversation}
        `.trim()
                        }
                ],
        });

        return { response: data.message.content.trim() };
}



export async function save_chat_history() {
        // TODO : implement a function to save chat history
}

export async function retrieve_chat_history() {
        // TODO : implement a function to retrieve chat history        
}



