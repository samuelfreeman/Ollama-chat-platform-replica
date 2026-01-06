import { create } from 'zustand';
import { persist } from 'zustand/middleware'

export type Message = {
    role: "user" | "assistant"
    content: string;
}
export type ChatState = {
    messages: Message[]
    addMessage: (msg: Message) => void;
    clearMessages: () => void;
}


export const useChatStore = create(persist<ChatState>(
    (set) => ({
        messages: [],
        addMessage: (msg) =>
            set((state) => ({
                messages: [...state.messages, msg],
            })),
        clearMessages: () => set({ messages: [] }),
        // doesnt remove from storage it just set the messages to empty array
    
    }),
    {
        name: "chat-history",
    }
)
);