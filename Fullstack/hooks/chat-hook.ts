// Single comprehensive hook for managing all chat-related state
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
    role: "user" | "assistant"
    content: string;
}

export type Chat = {
    model: string;
    messages: Message[];
    title: string | null;
}

export type ChatState = {
    chats: Chat[];
    currentChatIndex: number;
    addChat: (chat: Chat) => void;
    updateChat: (index: number, chat: Partial<Chat>) => void;
    removeChat: (index: number) => void;
    clearChats: () => void;
    setCurrentChat: (index: number) => void;
    addMessageToCurrentChat: (message: Message) => void;
    clearCurrentChat: () => void;
}

export const useChatStore = create(persist<ChatState>(
    (set, get) => ({
        chats: [],
        currentChatIndex: 0,
        addChat: (chat) =>
            set((state) => ({
                chats: [...state.chats, chat],
                currentChatIndex: state.chats.length // Switch to new chat
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
                const newChats = state.chats.filter((_, i) => i !== index);
                let newIndex = state.currentChatIndex;
                if (index === state.currentChatIndex) {
                    newIndex = Math.max(0, index - 1);
                } else if (index < state.currentChatIndex) {
                    newIndex = state.currentChatIndex - 1;
                }
                return {
                    chats: newChats,
                    currentChatIndex: newIndex
                };
            }),
        clearChats: () => set({ chats: [], currentChatIndex: 0 }),
        setCurrentChat: (index) =>
            set((state) => {
                if (index >= 0 && index < state.chats.length) {
                    return { currentChatIndex: index };
                }
                return state;
            }),
        addMessageToCurrentChat: (message) =>
            set((state) => {
                const currentIndex = state.currentChatIndex;
                if (currentIndex >= 0 && currentIndex < state.chats.length) {
                    const newChats = [...state.chats];
                    newChats[currentIndex] = {
                        ...newChats[currentIndex],
                        messages: [...newChats[currentIndex].messages, message]
                    };
                    return { chats: newChats };
                }
                return state;
            }),
        clearCurrentChat: () =>
            set((state) => {
                const currentIndex = state.currentChatIndex;
                if (currentIndex >= 0 && currentIndex < state.chats.length) {
                    const newChats = [...state.chats];
                    newChats[currentIndex] = {
                        ...newChats[currentIndex],
                        messages: []
                    };
                    return { chats: newChats };
                }
                return state;
            }),
    }),
    {
        name: "chat-store",
        version: 1,
        migrate: (persistedState, version) => {
            return persistedState as ChatState;
        },
    }
));