import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import VapiView from "@/modules/plugins/ui/view/vapi-view";
import { Protect } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <Protect
      fallback={
        <PremiumFeatureOverlay>
          <VapiView />
        </PremiumFeatureOverlay>
      }
      condition={(has) => has({ plan: "pro" })}
    >
      <VapiView />
    </Protect>
  );
};

export default Page;
