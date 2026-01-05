"use client"

import { useAtomValue, useSetAtom } from "jotai"
import { AlertTriangleIcon, ArrowLeftIcon } from "lucide-react"
import { contactSessionIdAtomFamily, conversationIdAtom, errorMessageAtom, orgIdAtom, screenAtom } from "@/modules/widget/atoms/widget-atoms"
import { WidgetHeader } from "../components/widget-header"
import { WidgetFooter } from "../components/widget-footer"
import { Button } from "@workspace/ui/components/button"
import { usePaginatedQuery } from "convex/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { formatDistanceToNow } from "date-fns"
import { ConversationStatusIcon } from '@workspace/ui/components/conversation-status-icon';
import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll"
import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger"

export const WidgetInboxScreen = () => {
    const setScreen = useSetAtom(screenAtom)
    const setConversationId = useSetAtom(conversationIdAtom)
    const orgId = useAtomValue(orgIdAtom)
    const contactSessionId = useAtomValue(contactSessionIdAtomFamily(orgId || ""))
    const conversations = usePaginatedQuery(api.public.conversations.getMany, contactSessionId ? {contactSessionId} : "skip", { initialNumItems: 10 })

    const { topElementRef, handleLoadMore, canLoadMore, isLoadingMore } = useInfiniteScroll({ status: conversations.status, loadMore: conversations.loadMore, loadSize: 10 })

    return (
        <>
        <WidgetHeader>
            <Button variant={"transparent"} size={"icon"} onClick={() => setScreen("selection")}>
                <ArrowLeftIcon />
            </Button>
        </WidgetHeader>
        <div className="flex flex-1 flex-col gap-y-2 p-4 overflow-y-auto">
            {conversations.results.length > 0 && (
                conversations.results.map((conversation) => (
                    <Button className="h-20 w-full justify-between" onClick={() => {
                        setScreen("chat")
                        setConversationId(conversation._id)} } key={conversation._id} variant={"outline"}>
                            <div className="flex w-full flex-col gap-4 overflow-hidden text-start">
                                <div className="flex w-full items-center justify-between gap-x-2">
                                    <p className="text-muted-foreground text-xs">Chat</p>
                                    <p className="text-muted-foreground text-xs">{formatDistanceToNow(new Date(conversation._creationTime))}</p>
                                </div>
                                <div className="flex w-full items-center justify-between gap-x-2">
                                    <p className="truncate text-sm">
                                        {conversation.lastMsg?.text}
                                    </p>
                                    <ConversationStatusIcon className="stroke-0" status={conversation.status} />
                                </div>
                            </div>
                        </Button>
                ))
            )}
            <InfiniteScrollTrigger canLoadMore={canLoadMore} isLoadingMore={isLoadingMore} onLoadMore={handleLoadMore} ref={topElementRef}  />
        </div>
        <WidgetFooter />
        </>
    )
}