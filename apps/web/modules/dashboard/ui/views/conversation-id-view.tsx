import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";
import { Button } from "@workspace/ui/components/button";
import { useAction, useMutation, useQuery } from "convex/react";
import { MoreHorizontalIcon, Wand2Icon } from "lucide-react";
import React from "react";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@workspace/ui/components/ai/conversation";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from "@workspace/ui/components/ai/input";
import {
  AIMessage,
  AIMessageContent,
} from "@workspace/ui/components/ai/message";
import { AIResponse } from "@workspace/ui/components/ai/response";
import { Form, FormField } from "@workspace/ui/components/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toUIMessages, useThreadMessages } from "@convex-dev/agent/react";
import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
import { toast } from "sonner";
import { ConversationStatusButton } from "../components/conversation-status-button";
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
import { cn } from "@workspace/ui/lib/utils";
import { Skeleton } from "@workspace/ui/components/skeleton";

const formSchema = z.object({
  message: z.string().min(1, "Message is Required"),
});

const ConversationIdView = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => {
  const conversation = useQuery(api.private.conversations.getOne, {
    conversationId,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  const messages = useThreadMessages(
    api.private.messages.getMany,
    conversation?.threadId ? { threadId: conversation.threadId } : "skip",
    { initialNumItems: 10 }
  );

  const {
    topElementRef,
    handleLoadMore,
    canLoadMore,
    isLoadingMore,
    isLoadingFirstPage,
  } = useInfiniteScroll({
    status: messages.status,
    loadMore: messages.loadMore,
    loadSize: 10,
  });

  const createMessage = useMutation(api.private.messages.create);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMessage({
        conversationId,
        prompt: values.message,
      });
      form.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);
  const updateConversationStatus = useMutation(
    api.private.conversations.updateStatus
  );
  const handleToggleStatus = async () => {
    if (!conversation) return;

    setIsUpdatingStatus(true);

    let newStatus: typeof conversation.status;
    if (conversation.status === "resolved") {
      newStatus = "unresolved";
    } else if (conversation.status === "unresolved") {
      newStatus = "escalated";
    } else {
      newStatus = "resolved";
    }

    try {
      await updateConversationStatus({
        conversationId,
        status: newStatus,
      });
    } catch (error) {
      toast.error("Failed to update conversation status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const [isEnhancing, setIsEnhancing] = React.useState(false);
  const enhanceResponse = useAction(api.private.messages.enhanceResponse);

  const handleEnhanceResponse = async () => {
    const message = form.getValues("message");
    try {
      setIsEnhancing(true);
      const response = await enhanceResponse({
        prompt: message,
      });
      form.setValue("message", response);
    } catch (error) {
      toast.error("Failed to enhance response. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  if (conversation === undefined || isLoadingFirstPage) {
    return <ConversationIdViewLoader />;
  }

  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size={"sm"} variant={"ghost"}>
          <MoreHorizontalIcon />
        </Button>
        {!!conversation && (
          <ConversationStatusButton
            disabled={isUpdatingStatus}
            status={conversation?.status}
            onClick={handleToggleStatus}
          />
        )}
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          <InfiniteScrollTrigger
            canLoadMore={canLoadMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMore}
            ref={topElementRef}
          />
          {toUIMessages(messages.results ?? []).map((message) => {
            return (
              <AIMessage
                key={message.id}
                from={message.role === "user" ? "assistant" : "user"}
              >
                <AIMessageContent>
                  <AIResponse>{message.text}</AIResponse>
                </AIMessageContent>
                {message.role === "user" && (
                  <DicebearAvatar
                    imageUrl="/logo.svg"
                    seed={conversation?.contactSessionId ?? "user"}
                    size={32}
                  />
                )}
              </AIMessage>
            );
          })}
        </AIConversationContent>
        <AIConversationScrollButton />
      </AIConversation>
      <div className="p-2">
        <Form {...form}>
          <AIInput onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              disabled={
                conversation?.status === "resolved" ||
                form.formState.isSubmitting ||
                isEnhancing
              }
              name="message"
              render={({ field }) => (
                <AIInputTextarea
                  disabled={conversation?.status === "resolved"}
                  onChange={field.onChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                  placeholder={
                    conversation?.status === "resolved"
                      ? "This conversation has been resolved"
                      : "Type your response as an operator..."
                  }
                  value={field.value}
                />
              )}
            />
            <AIInputToolbar>
              <AIInputTools>
                <AIInputButton
                  onClick={handleEnhanceResponse}
                  disabled={
                    conversation?.status === "resolved" ||
                    isEnhancing ||
                    !form.formState.isValid
                  }
                  type="button"
                >
                  <Wand2Icon className="size-5" />
                  Enhance
                </AIInputButton>
              </AIInputTools>
              <AIInputSubmit
                disabled={
                  conversation?.status === "resolved" ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting ||
                  isEnhancing
                }
                type="submit"
                status="ready"
              />
            </AIInputToolbar>
          </AIInput>
        </Form>
      </div>
    </div>
  );
};

export default ConversationIdView;

export const ConversationIdViewLoader = () => {
  return (
    <div className="flex h-full flex-col bg-muted">
      <header className="flex items-center justify-between border-b bg-background p-2.5">
        <Button size={"sm"} variant={"ghost"}>
          <MoreHorizontalIcon />
        </Button>
      </header>
      <AIConversation className="max-h-[calc(100vh-180px)]">
        <AIConversationContent>
          {Array.from({ length: 8 }).map((_, index) => {
            const isUser = index % 2 === 0;
            const widths = ["w-48", "w-60", "w-72", "w-80"];
            const width = widths[index % widths.length];

            return (
              <div
                className={cn(
                  "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
                  isUser ? "is-user" : "is-assistant flex-row-reverse"
                )}
                key={index}
              >
                <Skeleton
                  className={`h-9 ${width} rounded-lg bg-neutral-200`}
                />
                <Skeleton className={`size-8 rounded-full bg-neutral-200`} />
              </div>
            );
          })}
        </AIConversationContent>
      </AIConversation>
      <div className="p-2">
        <AIInput>
          <AIInputTextarea
            disabled
            placeholder="Type your response as an operator..."
          />
          <AIInputToolbar>
            <AIInputTools />
            <AIInputSubmit disabled type="submit" status="ready" />
          </AIInputToolbar>
        </AIInput>
      </div>
    </div>
  );
};
