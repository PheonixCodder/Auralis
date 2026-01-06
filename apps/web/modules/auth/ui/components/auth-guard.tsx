"use client";

import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import AuthLayout from "../layouts/auth-layout";
import SignInView from "../views/sign-in-view";
import { ReactNode } from "react";
import { Spinner } from "@workspace/ui/components/spinner";

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    return (
        <>
        <AuthLoading>
        <AuthLayout>
            <Spinner />
        </AuthLayout>
        </AuthLoading>
        <Authenticated>
            {children}
        </Authenticated>
        <Unauthenticated>
            <AuthLayout>
                <SignInView />
            </AuthLayout>
        </Unauthenticated>
        </>
    )
}