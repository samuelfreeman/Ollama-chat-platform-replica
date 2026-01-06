import { create } from 'zustand'
import { persist } from 'zustand/middleware'


export type TitleState = {
    title: String
    addTitle: (title: string) => void
    removeTitle: () => void
}


export const useTitleStore = create((persist<TitleState>((set) => ({
    title: "",
    addTitle: (title) => set({ title }),
    removeTitle: () => set((state) => ({ title: "" }))

}), { name: "chat-title" })))

