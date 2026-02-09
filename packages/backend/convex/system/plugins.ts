import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "../_generated/server";

export const upsert = internalMutation({
  args: {
    service: v.union(v.literal("vapi")),
    organizationId: v.string(),
    secretName: v.string(),
  },
  async handler(ctx, args) {
    const existingPlugin = await ctx.db
      .query("plugins")
      .withIndex("by_organization_id_and_service", (q) =>
        q.eq("organizationId", args.organizationId).eq("service", args.service),
      )
      .unique();

    if (existingPlugin) {
      await ctx.db.patch(existingPlugin._id, {
        service: args.service,
        serviceName: args.secretName,
      });
    } else {
      await ctx.db.insert("plugins", {
        service: args.service,
        serviceName: args.secretName,
        organizationId: args.organizationId,
      });
    }
  },
});

export const getByOrganizationIdAndService = internalQuery({
  args: {
    service: v.union(v.literal("vapi")),
    organizationId: v.string(),
  },
  async handler(ctx, args) {
      return await ctx.db
        .query("plugins")
        .withIndex("by_organization_id_and_service", (q) =>
          q.eq("organizationId", args.organizationId).eq("service", args.service),
        )
        .unique();
  },
});
