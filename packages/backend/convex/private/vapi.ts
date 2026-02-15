import { VapiClient, Vapi } from "@vapi-ai/server-sdk";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";
import { getSecretValue, parseSecretValue } from "../lib/secrets";
import { ConvexError } from "convex/values";

export const getAssistants = action({
  async handler(ctx): Promise<Vapi.Assistant[]> {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: orgId, service: "vapi" },
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found",
      });
    }

    const secretName = plugin.secretName;
    const secret = await getSecretValue(secretName);
    const secretData = parseSecretValue<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secret);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Incomplete credentials please reconnect your Vapi Account.",
      });
    }

    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });

    return await vapiClient.assistants.list();
  },
});

export const getPhoneNumbers = action({
  async handler(ctx): Promise<Vapi.ListPhoneNumbersResponseItem[]> {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Identity not found",
      });
    }
    const orgId = identity.orgId as string;

    if (!orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Organization not found",
      });
    }

    const plugin = await ctx.runQuery(
      internal.system.plugins.getByOrganizationIdAndService,
      { organizationId: orgId, service: "vapi" },
    );

    if (!plugin) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Plugin not found",
      });
    }

    const secretName = plugin.secretName;
    const secret = await getSecretValue(secretName);
    const secretData = parseSecretValue<{
      privateApiKey: string;
      publicApiKey: string;
    }>(secret);

    if (!secretData) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    }

    if (!secretData.privateApiKey || !secretData.publicApiKey) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Incomplete credentials please reconnect your Vapi Account.",
      });
    }

    const vapiClient = new VapiClient({
      token: secretData.privateApiKey,
    });

    return await vapiClient.phoneNumbers.list();
  },
});
