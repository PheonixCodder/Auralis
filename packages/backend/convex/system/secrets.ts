import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { setSecretValue } from "../lib/secrets";

export const upsert = internalAction({
  args: {
    organizationId: v.string(),
    service: v.union(v.literal("vapi")),
    value: v.any(),
  },
  async handler(ctx, args) {
    const secretName = `tenant/${args.organizationId}/${args.service}`;
    await setSecretValue(secretName, args.value);
    await ctx.runMutation(internal.system.plugins.upsert, {
      organizationId: args.organizationId,
      service: args.service,
      secretName,
    });

    return { status: "success" };
  },
});
