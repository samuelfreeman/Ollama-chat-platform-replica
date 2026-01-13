"use client"

import Form from "../components/Form"
import { useEffect, useRef, useState } from "react"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { createTitle, fetchModels } from "./api/actions"
import { useChatStore } from "@/hooks/chat-hook"
import { Trash, MessageSquareIcon, MessageSquare, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const VISION_MODELS = [
  "qwen3-vl:235b-instruct",
  "qwen3-vl:235b",
  "deepseek-v3.2",
  "deepseek-v3.1:671b",
]

export default function Home() {
  const [models, setModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const touchStartX = useRef<number | null>(null)

  const {
    chats,
    currentChatIndex,
    addChat,
    updateChat,
    removeChat,
    setCurrentChat,
  } = useChatStore()

  const currentChat = chats[currentChatIndex]

  const visionModels = models.filter(m => VISION_MODELS.includes(m))
  const textModels = models.filter(m => !VISION_MODELS.includes(m))

  useEffect(() => {
    fetchModels().then(data =>
      setModels(data.models.map((m: any) => m.name))
    )
  }, [])

  useEffect(() => {
    if (
      currentChat &&
      currentChat.messages.length === 4 &&
      !currentChat.title
    ) {
      createTitle(currentChat.messages, currentChat.model).then(data => {
        updateChat(currentChatIndex, { title: data.response })
      })
    }
  }, [currentChat?.messages.length])

  /* ------------------ Swipe Handlers ------------------ */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current

    if (deltaX > 80) setSidebarOpen(true)     // swipe right
    if (deltaX < -80) setSidebarOpen(false)   // swipe left

    touchStartX.current = null
  }

  /* ------------------ Sidebar ------------------ */
  const Sidebar = (
    <div className="h-full flex flex-col items-center">
      <div className="p-4">
        <Button onClick={() => {
          addChat({
            model: selectedModel || "gpt-oss:120b-cloud",
            messages: [],
            title: null,
          })
          setSidebarOpen(false)
        }}>
          <MessageSquareIcon className="mr-2" />
          New Chat
        </Button>
      </div>

      <p className="px-4 py-2 border-b text-sm">CHAT HISTORY</p>

      <div className="flex-1 overflow-y-auto px-3 space-y-2">
        {chats.map((chat, index) => (
          <div
            key={index}
            onClick={() => {
              setCurrentChat(index)
              setSidebarOpen(false)
            }}
            className={`flex items-center justify-between p-2 rounded cursor-pointer ${
              index === currentChatIndex
                ? "bg-blue-100 border border-blue-300"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            <span className="truncate text-sm flex-1">
              {chat.title || `Chat ${index + 1}`}
            </span>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                removeChat(index)
              }}
            >
              <Trash size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div
      className="flex min-h-dvh bg-zinc-50 font-mono"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ---------- Mobile Backdrop ---------- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---------- Sidebar ---------- */}
      <aside
        className={`
          fixed z-40 inset-y-0 left-0 w-72 bg-zinc-50 border-r
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:flex md:w-1/4
        `}
      >
        <div className="md:hidden flex justify-end p-2">
          <Button variant="ghost" onClick={() => setSidebarOpen(false)}>
            <X />
          </Button>
        </div>
        {Sidebar}
      </aside>

      {/* ---------- Main ---------- */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-3 bg-zinc-50 border-b">
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </Button>

          <NativeSelect
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <NativeSelectOption value="">Select Model</NativeSelectOption>

            {visionModels.length > 0 && (
              <NativeSelectOptGroup label="Vision Models">
                {visionModels.map(model => (
                  <NativeSelectOption key={model} value={model}>
                    {model}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            )}

            {textModels.length > 0 && (
              <NativeSelectOptGroup label="Text Models">
                {textModels.map(model => (
                  <NativeSelectOption key={model} value={model}>
                    {model}
                  </NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            )}
          </NativeSelect>
        </header>

        {/* Chat */}
        <div className="flex-1 flex justify-center px-2">
          {currentChat ? (
            <Form
              selectedModel={selectedModel}
              currentChatIndex={currentChatIndex}
              messages={currentChat.messages}
            />
          ) : (
            <div className="text-center text-gray-500 m-auto">
              <MessageSquareIcon size={48} className="mx-auto mb-4" />
              <p>Select or create a chat</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
