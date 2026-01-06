import { sendMessage } from '../app/api/actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send, Image, PlusCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useEffect, useRef, useState } from 'react';
import { useActionState } from 'react';
import { messageCountStore } from '@/hooks/use-checkcount'
import { useChatStore } from '@/hooks/chat-hook'
import type { Message } from '@/hooks/chat-hook'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
const initialState = {
    message: "",
    response: "",
}

const Form = ({
    selectedModel,
    currentChatIndex,
    messages
}: {
    selectedModel: string;
    currentChatIndex: number;
    messages: Message[];
}) => {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [state, formAction, pending] = useActionState(sendMessage, initialState)
    const [fileName, setFileName] = useState("")
    const increaseMessageCount = messageCountStore((state: any) => state.increment);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { addMessageToCurrentChat } = useChatStore();

    useEffect(() => {
        if (!state) return;

        if (state.message) {
            addMessageToCurrentChat({ role: "user", content: state.message });
        }
        if (state.response) {
            addMessageToCurrentChat({ role: "assistant", content: state.response });
        }
        bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, [state, addMessageToCurrentChat]);
    return (
        <div className=' w-175 h-[70vh]  '>
            <div className="flex-1 overflow-y-auto  h-full space-y-4 p-4  rounded-lg  scroll-auto  items-end">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex  ${msg.role === "user" ? "justify-end " : "justify-start  "
                            }`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-xl text-sm shadow
                                ${msg.role === "user"
                                    ? "bg-gray-200 text-gray-900 border rounded-bl-none"
                                    : "bg-white text-black rounded-br-none"
                                }
                                `}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
            <form action={formAction} className="flex">
                <Input type='hidden' name='model' value={selectedModel} />
                <Input type='hidden' name='messages' value={JSON.stringify(messages)} />
                <Tooltip>
                    <TooltipTrigger asChild>

                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <PlusCircle size={18} className="mr-1" />
                            {fileName || "Upload"}
                        </Button>

                    </TooltipTrigger>
                    <TooltipContent>Upload an image</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>

                        <Input type="text" placeholder="Enter your prompt" name="message" />
                    </TooltipTrigger>
                    <TooltipContent>Enter your prompt</TooltipContent>
                </Tooltip>

                <input
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                />

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" onClick={increaseMessageCount} variant="outline">
                            <Send />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send prompt</TooltipContent>
                </Tooltip>
            </form>
        </div>
    )
}

export default Form
