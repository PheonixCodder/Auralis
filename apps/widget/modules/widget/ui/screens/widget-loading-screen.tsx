"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import {
  contactSessionIdAtomFamily,
  errorMessageAtom,
  loadingMessageAtom,
  orgIdAtom,
  screenAtom,
  vapiSecretsAtom,
  widgetSettingsAtom,
} from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "../components/widget-header";
import { useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { Id } from "@workspace/backend/convex/_generated/dataModel";

type InitStep = "org" | "session" | "settings" | "vapi" | "done";

export const WidgetLoadingScreen = ({
  organizationId,
}: {
  organizationId: string | null;
}) => {
  const [step, setStep] = useState<InitStep>("org");
  const [sessionValid, setSessionValid] = useState(false);

  const loadingMessage = useAtomValue(loadingMessageAtom);
  const setWidgetSettings = useSetAtom(widgetSettingsAtom);
  const setOrgId = useSetAtom(orgIdAtom);
  const setErrorMessage = useSetAtom(errorMessageAtom);
  const setLoadingMessage = useSetAtom(loadingMessageAtom);
  const setScreen = useSetAtom(screenAtom);
  const setVapiSecrets = useSetAtom(vapiSecretsAtom);

  const contactSessionId = useAtomValue(
    contactSessionIdAtomFamily(organizationId || ""),
  );

  const validateOrg = useAction(api.public.organizations.validate);

  useEffect(() => {
    if (step !== "org") return;

    setLoadingMessage("Finding Organization ID");

    if (!organizationId) {
      setErrorMessage("Organization ID is required");
      setScreen("error");
      return;
    }

    setLoadingMessage("Verifying Organization");

    validateOrg({ organizationId })
      .then((result) => {
        if (result.valid) {
          setOrgId(organizationId);
          setStep("session");
        } else {
          setErrorMessage(result.reason || "Invalid Configuration");
          setScreen("error");
        }
      })
      .catch(() => {
        setErrorMessage("Unable to verify organization");
        setScreen("error");
      });
  }, [
    step,
    organizationId,
    setErrorMessage,
    setLoadingMessage,
    setOrgId,
    validateOrg,
    setScreen,
  ]);

  const validateContactSession = useMutation(
    api.public.contactSessions.validate,
  );
  useEffect(() => {
    if (step !== "session") return;

    setLoadingMessage("Finding Contact Session ID");

    if (!contactSessionId) {
      setSessionValid(false);
      setStep("settings");
      return;
    }

    setLoadingMessage("Validating Session");

    validateContactSession({
      contactSessionId: contactSessionId,
    })
      .then((result) => {
        setSessionValid(result.valid);
        setStep("settings");
      })
      .catch(() => {
        setSessionValid(false);
        setStep("settings");
      });
  }, [step, contactSessionId, setLoadingMessage, validateContactSession]);

  const widgetSettings = useQuery(
    api.public.widgetSettings.getByOrganizationId,
    organizationId ? { organizationId } : "skip",
  );

  useEffect(() => {
    if (step !== "settings") return;
    setLoadingMessage("Loading Widget Settings");
    if (widgetSettings !== undefined) {
      setWidgetSettings(widgetSettings);
      setStep("vapi");
    }
  }, [step, widgetSettings, setWidgetSettings, setLoadingMessage, setStep]);

  const getVapiSecrets = useAction(api.public.secrets.getVapiSecrets);

  useEffect(() => {
    if (step !== "vapi" || !organizationId) return;
    setLoadingMessage("Loading Vapi Settings");
    getVapiSecrets({ organizationId })
      .then((secret) => {
        setVapiSecrets(secret);
        setStep("done");
      })
      .catch(() => {
        setVapiSecrets(null);
        setStep("done");
      });
  }, [
    step,
    organizationId,
    getVapiSecrets,
    setVapiSecrets,
    setLoadingMessage,
    setStep,
  ]);

  useEffect(() => {
    if (step !== "done") {
      return;
    }
    const hasValidSession = contactSessionId && sessionValid;
    setScreen(hasValidSession ? "selection" : "auth");
  }, [contactSessionId, sessionValid, step, setScreen]);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">Hi there!</p>
          <p className="text-lg">Let&apos;s get you started</p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-4 text-muted-foreground">
        <LoaderIcon className="animate-spin" />
        <p className="text-sm">{loadingMessage}</p>
      </div>
    </>
  );
};
