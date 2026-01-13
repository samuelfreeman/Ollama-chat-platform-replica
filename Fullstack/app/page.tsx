"use client"
import Form from "../components/Form";
import { useEffect, useState } from "react";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { createTitle, fetchModels } from "./api/actions";
import { messageCountStore } from "@/hooks/use-checkcount";
import { createTailwindMerge } from "tailwind-merge";
import { useChatStore } from "@/hooks/chat-hook";
import { Trash, MessageSquareIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [models, setModel] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const sortedModels = [...models].sort((a, b) => {
    const aVision = VISION_MODELS.includes(a)
    const bVision = VISION_MODELS.includes(b)
    if (aVision && !bVision) return -1
    if (!aVision && bVision) return 1
    return 0
  })
  // Use the new single chat store
  const {
    chats,
    currentChatIndex,
    addChat,
    updateChat,
    removeChat,
    setCurrentChat,
    addMessageToCurrentChat,
    clearCurrentChat
  } = useChatStore();

  const currentChat = chats[currentChatIndex];
  // Auto-generate title when chat reaches 4 messages
  useEffect(() => {
    async function loadModels() {
      const data = await fetchModels();
      setModel(data.models.map(m => m.name));

    }
    loadModels();
    if (currentChat && currentChat.messages.length === 4 && !currentChat.title) {
      async function generateTitle() {
        const data = await createTitle(currentChat.messages, currentChat.model);
        updateChat(currentChatIndex, { title: data.response });
      }
      generateTitle();
    }
  }, [currentChat?.messages.length, currentChat?.model, currentChatIndex, updateChat]);

  const handleCreateChat = () => {
    const newChat = {
      model: selectedModel || "gpt-oss:120b-cloud",
      messages: [],
      title: null
    };
    addChat(newChat);
  };

  const handleSelectChat = (index: number) => {
    setCurrentChat(index);
  };

  const handleDeleteChat = (index: number) => {
    removeChat(index);
  };


  return (
    <div className="flex-1 flex bg-zinc-50 font-mono">
      <div className="bg-zinc-50 w-1/3 mr-5 h-screen pt-5 border-gray-400 border-r flex justify-center">
        <div className="w-full flex flex-col items-center">
          <div className="p-5">
            <Button onClick={handleCreateChat}>
              <MessageSquareIcon className="mr-2" />
              Create a chat
            </Button>
          </div>
          <p className="p-2 m-4 border-b font-mono text-md">CHAT HISTORY</p>
          <div className="w-full px-4 space-y-2">
            {chats.map((chat, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded cursor-pointer ${index === currentChatIndex
                  ? "bg-blue-100 border border-blue-300"
                  : "bg-gray-100 hover:bg-gray-200"
                  }`}
                onClick={() => handleSelectChat(index)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <MessageSquare className="mr-2 flex-shrink-0" size={16} />
                  <span className="truncate text-sm">
                    {chat.title || `Chat ${index + 1}`}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(index);
                      }}
                      className="w-6 h-6 p-0 ml-2 flex-shrink-0"
                      variant="ghost"
                    >
                      <Trash size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete chat</TooltipContent>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full w-full items-center justify-center font-mono dark:bg-black">
        <div className="p-5 w-full flex justify-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <NativeSelect onChange={(e) => setSelectedModel(e.target.value)}>
                <NativeSelectOption value="">Select Model</NativeSelectOption>
                {sortedModels.map((model) => (
                  <NativeSelectOption key={model} value={model}>
                    {model} {VISION_MODELS.includes(model) ? "(Vision)" : ""}
                  </NativeSelectOption>
                ))}
              </NativeSelect>

            </TooltipTrigger>
            <TooltipContent>Select a model</TooltipContent>
          </Tooltip>
        </div>
        {currentChat ? (
          <Form
            selectedModel={selectedModel}
            currentChatIndex={currentChatIndex}
            messages={currentChat.messages}
          />
        ) : (
          <div className="text-center text-gray-500">
            <MessageSquareIcon size={48} className="mx-auto mb-4" />
            <p>Select or create a chat to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}