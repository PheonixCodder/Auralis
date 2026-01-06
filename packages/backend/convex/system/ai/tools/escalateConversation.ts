import { createTool } from "@convex-dev/agent";
import { internal } from "../../../_generated/api";
import z from "zod";
import { supportAgent } from "../agents/supportAgent";

export const escalateConversationTool = createTool({
  description: "Escalate a support conversation by its thread ID.",
  args: z.object({}),
  handler: async (ctx) => {
    if (!ctx.threadId) {
      return "Missing Thread ID";
    }
    await ctx.runMutation(internal.system.conversations.resolve, {
      threadId: ctx.threadId,
    });

    await supportAgent.saveMessage(ctx, {
      threadId: ctx.threadId,
      message: {
        role: "assistant",
        content: "The conversation has been resolved.",
      },
    });

    return "Conversation resolved successfully.";
  },
});
