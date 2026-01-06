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
import { useChatStore } from "@/hooks/persist-chat-hook";
import { Trash, MessageSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTitleStore } from "@/hooks/use-chat-title";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Home() {
  const [models, setModel] = useState<string[]>([]);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const addTitle = useTitleStore((state) => state.addTitle)
  const removeTitle = useTitleStore((state) => state.removeTitle)
  const title = useTitleStore((store) => store.title)
  const count = messageCountStore((state: any) => state.count);
  const messages = useChatStore((state) => state.messages)
  const clearMessages = useChatStore((state) => state.clearMessages)
  useEffect(() => {
    async function loadModels() {
      const data = await fetchModels();
      setModel(data.models.map(m => m.name));

    }
    loadModels();
    console.log(messages);
    if (messages.length == 4) {
      async function generateTitle() {
        const data = await createTitle(messages, selectedModel)
        addTitle(data.response)
      }
      generateTitle();
    }
  }, [messages, selectedModel])

  const handleTrashClick = () => {
    clearMessages()
    removeTitle()
  }


  return (
    <div className="flex-1 flex bg-zinc-50 font-mono ">

      <div className="bg-zinc-50 w-1/3 mr-5 h-screen pt-5 border-gray-400 border-r flex justify-center">
        <div className="w-full flex flex-col items-center  ">
          <div className="p-5">

            <Button> <MessageSquareIcon />Create a chat </Button>
          </div>
          <p className="p-2 m-4 border-b font-mono text-md">CHAT HISTORY</p>
          < div className="flex text-center text-sm w-full  justify-evenly p-2 bg-gray-200 text-gray-900 border rounded-bl-none">


            <p className="pt-3">{title}</p>
            {title && <Tooltip> <TooltipTrigger asChild><Button onClick={handleTrashClick} className="w-8 h-8 m-2"><Trash /></Button></TooltipTrigger> <TooltipContent>Delete chat</TooltipContent></Tooltip>
            }
          </div>


        </div>
      </div>
      <div className="flex flex-col h-full w-full items-center  justify-center  font-mono dark:bg-black">
        <div className="p-5 w-full flex justify-end ">
          <Tooltip>
            <TooltipTrigger asChild>

              <NativeSelect onChange={(e) => setSelectedModel(e.target.value)}>
                <NativeSelectOption value="">Select Model</NativeSelectOption>
                {models?.map((model: any) => (
                  <NativeSelectOption key={model} value={model}>
                    {model}
                  </NativeSelectOption>
                ))}

              </NativeSelect>
            </TooltipTrigger>
            <TooltipContent>Select a model</TooltipContent>
          </Tooltip>
        </div>
        <Form selectedModel={selectedModel} />
      </div>
      {/* <div className="bg-zinc-50 w-full h-screen border-gray-400 border-l"></div> */}

    </div>
  );
}
