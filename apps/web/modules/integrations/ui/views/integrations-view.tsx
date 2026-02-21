"use client";

import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { IntegrationId, INTEGRATIONS } from "../../constants";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { useState } from "react";
import { createScript } from "../../utils";

export const IntegrationsView = () => {
  const { organization } = useOrganization();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("Organization ID copied to clipboard");
    } catch (error) {
      console.error("Failed to copy organization id:", error);
      toast.error("Failed to copy organization id");
    }
  };

  const handleIntegrationClick = (integrationId: IntegrationId) => {
    if (!organization) return;
    const snippet = createScript(integrationId, organization.id);
    setSelectedSnippet(snippet);
    setDialogOpen(true);
  };

  return (
    <>
      <IntegrationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        snippet={selectedSnippet}
      />
      <div className="flex min-h-screen flex-col bg-muted p-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-4xl">Setup & Integrations</h1>
            <p className="text-muted-foreground">
              Choose the integration that&apos;s right for your application
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <div className="flex items-center gap-4">
              <Label className="w-34" htmlFor="website-id">
                Organization ID
              </Label>
              <Input
                disabled
                id="organization-id"
                readOnly
                value={organization?.id}
                className="flex-1 bg-background font-mono text-sm"
              />
              <Button onClick={handleCopy} className="gap-2" size={"sm"}>
                <CopyIcon className="size-4" />
                Copy
              </Button>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="space-y-6">
            <div className="space-y-1">
              <Label className="text-lg">Integrations</Label>
              <p className="text-muted-foreground text-sm">
                Add the following code to your website to enable chatbox.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {INTEGRATIONS.map((i) => (
                <button
                  key={i.id}
                  className="flex items-center gap-4 rounded-lg border bg-background p-4 hover:bg-accent"
                  type="button"
                  onClick={() => handleIntegrationClick(i.id)}
                >
                  <Image src={i.icon} alt={i.title} height={32} width={32} />
                  <p>{i.title}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const IntegrationsDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("Snippet copied to clipboard");
    } catch (error) {
      console.error("Failed to copy snippet:", error);
      toast.error("Failed to copy snippet");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Integrate with your website</DialogTitle>
          <DialogDescription>
            Follow these steps to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[300px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-md bg-foreground p-2 font-mono text-secondary text-sm">
                {snippet}
              </pre>
              <Button
                className="absolute top-4 right-6 size-6 transition-opacity opacity-0 group-hover:opacity-100"
                size={"icon"}
                variant={"secondary"}
                onClick={handleCopy}
              >
                <CopyIcon className="size-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              1. Add the code in your page
            </div>
            <p className="text-muted-foreground text-sm">
              Paste the chatbot code above in your page. You can add it in the
              HTML head section.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
