"use client";

import AuthLayout from "../layouts/auth-layout";
import { ReactNode } from "react";
import { useOrganization } from "@clerk/nextjs";
import OrgSelectView from "@/modules/auth/ui/views/org-select-view";

export const OrganizationGuard = ({ children }: { children: ReactNode }) => {
    const { organization } = useOrganization()

    if (!organization) {
        return (
            <AuthLayout>
                <OrgSelectView />
            </AuthLayout>
        )
    }

    return (
        {children}
    )
}