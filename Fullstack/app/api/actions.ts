"use server"
import ollama from 'ollama'
import path from "path";
import { writeFile } from "fs/promises";
import type {Message} from '@/hooks/persist-chat-hook'
export async function sendMessage(initialState: any, formData: FormData) {
        const message = formData.get("message")?.toString();
        const model = formData.get("model")?.toString();
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
        const response = await ollama.chat({
                model: model || "gpt-oss:120b-cloud",
                messages: [
                        {
                                role: "user",
                                content: `keep all responses for this user message which says " ${message} " `,


                                images: imagePath ? [imagePath] : []
                        },
                ],

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

export async function retrieve_chat_history(){
// TODO : implement a function to retrieve chat history        
}



