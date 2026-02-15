"use client";

import { api } from "@workspace/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { CustomizationForm } from "../components/customization-form";

export const CustomizationView = () => {
  const widgetSettings = useQuery(api.private.widgetSettings.getOne);
  const vapiPlugin = useQuery(api.private.plugins.getOne, { service: "vapi" });

  if (widgetSettings === undefined || vapiPlugin === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-y-2 bg-muted p-8">
        <Loader2Icon className="text-muted-foreground animate-spin" />
        <p className="text-muted-foreground text-sm">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted p-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Widget Customization</h1>
          <p className="text-muted-foreground">
            Customize the appearance and behavior of your chat widget to match
            your brand and provide the best experience for your customers.
            Configure colors, fonts, welcome messages, and more to create a
            unique and engaging chat experience.
          </p>
        </div>
        <div className="mt-8">
          <CustomizationForm
            hasVapiPlugin={!!vapiPlugin}
            initialData={widgetSettings}
          />
        </div>
      </div>
    </div>
  );
};
