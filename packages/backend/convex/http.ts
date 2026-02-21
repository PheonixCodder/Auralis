import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { createClerkClient, type WebhookEvent } from "@clerk/backend";
import { internal } from "./_generated/api";

const http = httpRouter();
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

http.route({
  path: "/clerk",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const event = await validateRequest(req);
    if (!event) return new Response("Error Occurred", { status: 400 });
    switch (event.type) {
      case "subscription.updated": {
        const subscriptions = event.data;
        const orgId = subscriptions.payer?.organization_id;
        if (!orgId)
          return new Response("Missing organization ID", { status: 400 });

        const maxAllowedMemberships = subscriptions.status === "active" ? 5 : 1;

        await clerkClient.organizations.updateOrganization(orgId, {
          maxAllowedMemberships: maxAllowedMemberships,
        });

        await ctx.runMutation(internal.system.subscriptions.upsert, {
          organizationId: orgId,
          status: subscriptions.status,
        });
        break;
      }
      default:
        console.log(`Ignored webhook event: ${event.type}`);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  try {
    return wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default http;
