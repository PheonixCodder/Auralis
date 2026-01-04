"use client";

import { useAtomValue } from "jotai";
import { WidgetFooter } from "../components/widget-footer";
import { WidgetHeader } from "../components/widget-header";
import { WidgetAuthScreen } from "../screens/widget-auth-screen";
import { screenAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetErrorScreen } from "../screens/widget-error-screen";
import { WidgetSelectionScreen } from "../screens/widget-selection-screen";
import { WidgetLoadingScreen } from "../screens/widget-loading-screen";
import { WidgetChatScreen } from "../screens/widget-chat-screen";

interface Props {
    organizationId: string
}

export const WidgetView = ({ organizationId }: Props) => {
    const screen = useAtomValue(screenAtom)

    const screenComponents = {
        error: <WidgetErrorScreen />,
        loading: <WidgetLoadingScreen organizationId={organizationId} />,
        auth: <WidgetAuthScreen />,
        voice: "",
        inbox: "",
        selection: <WidgetSelectionScreen />,
        chat: <WidgetChatScreen />,
        contact: "",
    }

    return (
        <main className="min-h-screen min-w-screen flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted font-semibold">
            {screenComponents[screen]}
        </main>
    )
}