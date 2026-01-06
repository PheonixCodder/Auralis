import { components } from "../../../_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { resolveConversationTool } from "../tools/resolveConversation";
import { escalateConversationTool } from "../tools/escalateConversation";

export const supportAgent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: `You are a customer support AI assistant. Your job is to help users with their issues and escalate conversations to human operators when user expresses frustration or requests explicitly with "escalateConversationTool" and when user expresses finalization of the conversation resolve the conversation using "resolveConversationTool". Always be polite and professional in your responses.`,
  maxSteps: 3,
});
