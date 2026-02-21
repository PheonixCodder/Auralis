import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";

export const getOne = internalQuery({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactSessionId);
  },
});

const REFRESH_THRESHOLD = 4 * 60 * 60 * 1000;
export const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const refresh = internalMutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, { contactSessionId }) => {
    const session = await ctx.db.get(contactSessionId);

    if (!session)
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Contact session not found",
      });

    if (session.expiresAt < Date.now())
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Contact session expired",
      });

    const timeRemaining = session.expiresAt - Date.now();

    if (timeRemaining < REFRESH_THRESHOLD) {
      const newExpiresAt = Date.now() + SESSION_DURATION;
      await ctx.db.patch(contactSessionId, {
        expiresAt: newExpiresAt,
      });
      return { ...session, expiresAt: newExpiresAt };
    }
    return session;
  },
});
