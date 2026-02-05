import { ConvexError, v } from "convex/values";
import { action, mutation, query, QueryCtx } from "../_generated/server";
import {
  contentHashFromArrayBuffer,
  Entry,
  EntryId,
  guessMimeTypeFromContents,
  guessMimeTypeFromExtension,
  vEntryId,
} from "@convex-dev/rag";
import { extractTextContent } from "../lib/extractTextContent";
import rag from "../system/rag";
import { Id } from "../_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

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
    filename: v.string(),
    mimeType: v.string(),
    bytes: v.bytes(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { filename, mimeType, bytes, category }) => {
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

    const newMimeType = mimeType || guessMimeType(filename, bytes);

    const blob = new Blob([bytes], { type: newMimeType });

    const storageId = await ctx.storage.store(blob);

    const text = await extractTextContent(ctx, {
      storageId,
      fileName: filename,
      bytes,
      mimeType: newMimeType,
    });

    const { entryId, created } = await rag.add(ctx, {
      namespace: orgId,
      text,
      key: filename,
      title: filename,
      metadata: {
        storageId,
        uploadedBy: orgId,
        filename,
        category: category || null,
      } as EntryMetaData,
      contentHash: await contentHashFromArrayBuffer(bytes),
    });

    if (!created) {
      // Clean up the newly stored file if it already existed.
      await ctx.storage.delete(storageId);
    }

    return { url: await ctx.storage.getUrl(storageId), entryId };
  },
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  async handler(ctx, args) {
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

    const namespace = await rag.getNamespace(ctx, {
      namespace: orgId,
    });

    if (!namespace) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const results = await rag.list(ctx, {
      namespaceId: namespace.namespaceId,
      paginationOpts: args.paginationOpts,
    });

    const files = await Promise.all(
      results.page.map((e) => convertEntryToPublicFile(ctx, e)),
    );

    const filteredFiles = args.category
      ? files.filter((f) => f.category === args.category)
      : files;

    return {
      page: filteredFiles,
      isDone: results.isDone,
      continueCursor: results.continueCursor,
    };
  },
});

export type PublicFile = {
  id: EntryId;
  name: string;
  type: string;
  size: string;
  status: "ready" | "processing" | "error";
  url: string | null;
  category?: string;
};

type EntryMetaData = {
  storageId: Id<"_storage">;
  uploadedBy: string;
  filename: string;
  category: string | null;
};

async function convertEntryToPublicFile(
  ctx: QueryCtx,
  entry: Entry,
): Promise<PublicFile> {
  const metadata = entry.metadata as EntryMetaData;
  const storageId = metadata.storageId;

  let fileSize = "unknown";

  if (storageId) {
    try {
      const storageMetadata = await ctx.db.system.get(storageId);
      if (storageMetadata) {
        fileSize = formatFileSize(storageMetadata.size);
      }
    } catch (err) {
      console.error("Failed to get storage metadata", err);
    }
  }

  const filename = entry.key || "Unknown";
  const extension = filename.split(".").pop()?.toLocaleLowerCase() || "txt";

  let status: "ready" | "processing" | "error" = "error";
  if (entry.status === "ready") {
    status = "ready";
  } else if (entry.status === "pending") {
    status = "processing";
  }

  const url = storageId ? await ctx.storage.getUrl(storageId) : null;

  return {
    id: entry.entryId,
    name: filename,
    type: extension,
    size: fileSize,
    status,
    url,
    category: metadata.category || undefined,
  };
}

function formatFileSize(size: number): string {
  if (size === 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(size) / Math.log(k));

  return `${Number.parseFloat((size / k ** i).toFixed(1))} ${sizes[i]}`;
}
