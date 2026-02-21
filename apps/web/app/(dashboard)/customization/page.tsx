import { PremiumFeatureOverlay } from "@/modules/billing/ui/components/premium-feature-overlay";
import { CustomizationView } from "@/modules/customization/ui/views/customization-view";
import { Protect } from "@clerk/nextjs";
import React from "react";

const Page = () => {
  return (
    <Protect
      fallback={
        <PremiumFeatureOverlay>
          <CustomizationView />
        </PremiumFeatureOverlay>
      }
      condition={(has) => has({ plan: "pro" })}
    >
      <CustomizationView />
    </Protect>
  );
};

export default Page;
