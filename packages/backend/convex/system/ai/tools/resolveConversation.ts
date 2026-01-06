import { createTool } from "@convex-dev/agent";
import { internal } from "../../../_generated/api";
import z from "zod";
import { supportAgent } from "../agents/supportAgent";

export const resolveConversationTool = createTool({
  description: "Resolve a support conversation by its thread ID.",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing Thread ID";
    }
    await ctx.runMutation(internal.system.conversations.escalate, {
      threadId: ctx.threadId,
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "The conversation has been escalated to a human operator.",
      },
    });

    return "Conversation escalated successfully to a human operator.";
  },
});
