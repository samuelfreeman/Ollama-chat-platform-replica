import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message } from "@/hooks/persist-chat-hook";
import type { TitleState } from "@/hooks/use-chat-title";
export type Chat = {
    model: string;
    messages: Message[];
    title: string | null;
}

export type ChatState = {
    chats: Chat[];
    addChat: (chat: Chat) => void;
    updateChat: (index: number, chat: Partial<Chat>) => void;
    removeChat: (index: number) => void;
    clearChats: () => void;
}

export const useChatHistoryStore = create(persist<ChatState>(
    (set) => ({
        chats: [],
        addChat: (chat) =>
            set((state) => ({
                chats: [...state.chats, chat],
            })),
        updateChat: (index, updatedChat) =>
            set((state) => {
                if (index < 0 || index >= state.chats.length) {
                    console.warn(`updateChat: index ${index} is out of bounds`);
                    return state;
                }
                const newChats = [...state.chats];
                newChats[index] = { ...newChats[index], ...updatedChat };
                return { chats: newChats };
            }),
        removeChat: (index) =>
            set((state) => {
                if (index < 0 || index >= state.chats.length) {
                    console.warn(`removeChat: index ${index} is out of bounds`);
                    return state;
                }
                return {
                    chats: state.chats.filter((_, i) => i !== index),
                };
            }),
        clearChats: () => set({ chats: [] }),
    }),
    {
        name: "chat-history-store",
        version: 1,
        migrate: (persistedState, version) => {
            // For now, just return the state as-is. Update logic here when upgrading versions.
            return persistedState as ChatState;
        },
    }
));     


