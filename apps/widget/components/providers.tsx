"use client";

import * as React from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Provider } from "jotai";
import { Toaster } from "@workspace/ui/components/sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <Toaster />
      <Provider>{children}</Provider>
    </ConvexProvider>
  );
}
