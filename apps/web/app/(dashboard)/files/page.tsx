import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { FilesView } from "@/modules/files/ui/view/files-view";
import { Protect } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <Protect
      fallback={
        <PremiumFeatureOverlay>
          <FilesView />
        </PremiumFeatureOverlay>
      }
      condition={(has) => has({ plan: "pro" })}
    >
      <FilesView />
    </Protect>
  );
};

export default Page;
