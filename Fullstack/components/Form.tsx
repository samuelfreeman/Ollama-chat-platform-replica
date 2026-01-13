import { sendMessage } from "../app/api/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, PlusCircle, Loader2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useActionState } from "react"
import { messageCountStore } from "@/hooks/use-checkcount"
import { useChatStore } from "@/hooks/chat-hook"
import type { Message } from "@/hooks/chat-hook"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

const initialState = {
  message: "",
  response: "",
}

const Form = ({
  selectedModel,
  currentChatIndex,
  messages,
}: {
  selectedModel: string
  currentChatIndex: number
  messages: Message[]
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [state, formAction, pending] = useActionState(sendMessage, initialState)
  const [fileName, setFileName] = useState("")
  const increaseMessageCount = messageCountStore((s: any) => s.increment)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { addMessageToCurrentChat } = useChatStore()

  useEffect(() => {
    if (!state) return

    if (state.message) {
      addMessageToCurrentChat({ role: "user", content: state.message })
    }
    if (state.response) {
      addMessageToCurrentChat({ role: "assistant", content: state.response })
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [state, addMessageToCurrentChat])

  return (
    <div className="flex flex-col w-full h-[calc(100vh-4rem)] md:h-[90vh] max-w-5xl">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 md:p-5">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl text-sm shadow
                ${msg.role === "user"
                  ? "bg-gray-200 text-gray-900 rounded-bl-none"
                  : "bg-white text-black rounded-br-none"
                }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <form
        action={formAction}
        className="sticky bottom-0 bg-zinc-50 border-t p-2 md:p-3 flex flex-col gap-2 md:flex-row md:items-center"
      >
        <Input type="hidden" name="model" value={selectedModel} />
        <Input type="hidden" name="messages" value={JSON.stringify(messages)} />

        {/* Upload */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusCircle size={18} className="mr-2" />
              <span className="truncate">
                {fileName || "Upload"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Upload an image (Vision models only)
          </TooltipContent>
        </Tooltip>

        {/* Message Input */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="text"
              name="message"
              placeholder="Enter your prompt"
              className="flex-1"
              required
            />
          </TooltipTrigger>
          <TooltipContent>Enter your prompt</TooltipContent>
        </Tooltip>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
        />

        {/* Send Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="submit"
              variant="outline"
              onClick={increaseMessageCount}
              disabled={pending}
              className="w-full md:w-auto"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Send prompt</TooltipContent>
        </Tooltip>
      </form>
    </div>
  )
}

export default Form
