import { ConvexError, v } from "convex/values";
import { action, mutation } from "../_generated/server";
import {
  contentHashFromArrayBuffer,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/rag";
import { Id } from "../_generated/dataModel";

function guessMimeType(fileName: string, bytes: ArrayBuffer): string {
  return (
    guessMimeTypeFromExtension(fileName) ||
    guessMimeTypeFromContents(bytes) ||
    "application/octet-stream"
  );
}

export const deleteFile = mutation({
  args: {
    entryId: vEntryId,
  },
  handler: async (ctx, args) => {
    const { entryId } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
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
    const nameSpace = await rag.getNamespace(ctx, { namespace: orgId });

    if (!nameSpace) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Namespace not found",
      });
    }

    const entry = await rag.getEntry(ctx, {
      entryId,
    });
    if (!entry) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Entry not found",
      });
    }
    if (entry.metadata?.uploadedBy !== orgId) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "You do not have permission to delete this file",
      });
    }

    if (entry.metadata?.storageId) {
      await ctx.storage.delete(entry.metadata?.storageId as Id<"_storage">);
    }
    await rag.deleteAsync(ctx, { entryId });
  },
});

export const addFile = action({
  args: {
    fileName: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { fileName, mimeType, bytes, category }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
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

    const newMimeType = mimeType || guessMimeType(fileName, bytes);

    const blob = new Blob([bytes], { type: newMimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      fileName,
      bytes,
      mimeType: newMimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: fileName,
      title: fileName,
      metadata: {
        storageId,
        uploadedBy: orgId,
        fileName,
        category: category || null,
      },
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      // Clean up the newly stored file if it already existed.
      await ctx.storage.delete(storageId);
    }

    return { url: await ctx.storage.getUrl(storageId), entryId };
  },
});
