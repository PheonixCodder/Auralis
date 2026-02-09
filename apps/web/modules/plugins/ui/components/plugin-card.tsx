import { Button } from "@workspace/ui/components/button";
import { ArrowLeftRightIcon, PlugIcon, type LucideIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export interface Feature {
  icon: LucideIcon;
  label: string;
  description: string;
}

interface PluginCardProps {
  isDisabled?: boolean;
  serviceName: string;
  serviceImage: string;
  features: Feature[];
  onSubmit: () => void;
}

const PluginCard = ({
  isDisabled,
  serviceName,
  serviceImage,
  features,
  onSubmit,
}: PluginCardProps) => {
  return (
    <div className="h-fit w-full rounded-lg border bg-background p-8">
      <div className="flex justify-center items-center gap-6 mb-6">
        <div className="flex flex-col items-center">
          <Image
            alt={serviceName}
            src={serviceImage}
            className="rounded object-contain"
            height={40}
            width={40}
          />
        </div>
        <div className="flex flex-col items-center gap-1">
          <ArrowLeftRightIcon />
        </div>
        <div className="flex flex-col items-center">
          <Image
            alt={"Platform"}
            src={"/logo.svg"}
            className="rounded object-contain"
            height={40}
            width={40}
          />
        </div>
      </div>
      <div className="mb-6 text-center">
        <p className="text-lg">
          <span>Connect your {serviceName} Account</span>
        </p>
      </div>
      <div className="mb-6">
        <div className="space-y-4">
          {features.map((feature) => (
            <div key={feature.label} className="flex items-start gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg border bg-muted">
                <feature.icon className="size-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-medium text-sm">{feature.label}</div>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Button className="size-full" disabled={isDisabled} onClick={onSubmit}>
            Connect <PlugIcon />
        </Button>
      </div>
    </div>
  );
};

export default PluginCard;
