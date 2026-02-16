import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeftIcon, MicIcon, MicOffIcon } from "lucide-react";
import { useVapi } from "../../hooks/use-vapi";
import { WidgetHeader } from "../components/widget-header";
import { screenAtom } from "../../atoms/widget-atoms";
import { useSetAtom } from "jotai";
import { WidgetFooter } from "../components/widget-footer";
import { cn } from "@workspace/ui/lib/utils";

export const WidgetVoiceScreen = () => {
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    transcript,
    startCall,
    endCall,
  } = useVapi();
  const setScreen = useSetAtom(screenAtom);

  return (
    <>
      <WidgetHeader>
        <div className="flex items-center gap-x-2">
          <Button
            variant={"transparent"}
            size={"icon"}
            onClick={() => setScreen("selection")}
          >
            <ArrowLeftIcon />
          </Button>
          <p>Voice Chat</p>
        </div>
      </WidgetHeader>
      {transcript.length > 0 ? (
        <AIConversation className="h-full flex-1">
          <AIConversationContent>
            {transcript.map((message, index) => (
              <AIMessage
                from={message.role}
                key={`${message.role}-${index}-${message.text}`}
              >
                <AIMessageContent>{message.text}</AIMessageContent>
                <AIConversationScrollButton />
              </AIMessage>
            ))}
          </AIConversationContent>
        </AIConversation>
      ) : (
        <div className="flex-1 flex h-full flex-col items-center justify-center gap-y-2">
          <div className="flex items-center justify-center rounded-full border bg-white p-3">
            <MicIcon className="size-6 text-muted-foreground" />
          </div>
          <p>Transcript will appear here</p>
        </div>
      )}
      <div className="border-t bg-background p-4">
        <div className="flex flex-col items-center gap-y-4">
          {isConnected && (
            <div className="flex items-center gap-x-2">
              <div
                className={cn(
                  "size-4 rounded-full animate-pulse",
                  isSpeaking ? "bg-red-500" : "bg-green-500",
                )}
              />
              <span className="text-muted-foreground">
                {isSpeaking ? "Assistant Speaking" : "Listening"}
              </span>
            </div>
          )}
          <div className="flex w-full justify-center">
            {isConnected ? (
              <Button
                className="w-full "
                size={"lg"}
                variant={"destructive"}
                onClick={() => endCall()}
              >
                <MicOffIcon className="size-5" />
                End Call
              </Button>
            ) : (
              <Button
                className="w-full"
                disabled={isConnecting}
                size={"lg"}
                onClick={() => startCall()}
              >
                <MicIcon className="size-5" />
                Start Call
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
