import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { RegisteredQuery } from "convex/server";
import { Doc } from "../_generated/dataModel";

export const getByOrganizationId: RegisteredQuery<
  "public",
  { organizationId: string },
  Promise<Doc<"widgetSettings"> | null>
> = query({
  args: {
    organizationId: v.string(),
  },
  async handler(ctx, args) {
    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();

    return widgetSettings;
  },
});

export const getOne: RegisteredQuery<
  "public",
  {},
  Promise<Doc<"widgetSettings"> | null>
> = query({
  async handler(ctx) {
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

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .unique();

    return widgetSettings;
  },
});
