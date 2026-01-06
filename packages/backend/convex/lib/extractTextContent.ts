import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { StorageActionWriter } from "convex/server";
import { assert } from "convex-helpers";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
  image: openai.chat("gpt-4o-mini"),
  pdf: openai.chat("gpt-4o"),
  html: openai.chat("gpt-4o-mini"),
} as const;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SYSTEM_PROMPTS = {
  image:
    "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe the image in detail.",
  pdf: "You extract and summarize text content from PDF documents.",
  html: "You extract and transform content from HTML documents into markdown.",
} as const;

export type ExtractTextContentArgs = {
  storageId: Id<"_storage">;
  fileName: string;
  bytes: ArrayBuffer;
  mimeType: string;
};

export async function extractTextContent(
  ctx: { storage: StorageActionWriter },
  args: ExtractTextContentArgs
): Promise<string> {
  const { storageId, fileName, bytes, mimeType } = args;

  const url = await ctx.storage.getUrl(storageId);
  assert(url, "Failed to get storage URL");

  if (SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
    return extractImageText(url);
  }

  if (mimeType.toLowerCase().includes("pdf")) {
    return extractPdfText(url, mimeType, fileName);
  }

  if (mimeType.toLowerCase().includes("text")) {
    return extractHtmlText(ctx, storageId, bytes, mimeType);
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractImageText(url: string): Promise<string> {
  const response = await generateText({
    model: AI_MODELS.image,
    system: SYSTEM_PROMPTS.image,
    messages: [
      {
        role: "user",
        content: [{ type: "image", image: new URL(url) }],
      },
    ],
  });

  return response.text;
}

async function extractPdfText(
  url: string,
  mimeType: string,
  fileName: string
): Promise<string> {
  const response = await generateText({
    model: AI_MODELS.pdf,
    system: SYSTEM_PROMPTS.pdf,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            data: new URL(url),
            mediaType: mimeType,
            filename: fileName,
          },
          {
            type: "text",
            text: "Extract and print the text from this PDF without explaining you'll do so",
          },
        ],
      },
    ],
  });
  return response.text;
}

async function extractHtmlText(
  ctx: { storage: StorageActionWriter },
  storageId: Id<"_storage">,
  bytes: ArrayBuffer | undefined,
  mimeType: string
): Promise<string> {
  const arrayBuffer =
    bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());

  if (!arrayBuffer) {
    throw new Error("Failed to read HTML file content");
  }

  const text = new TextDecoder().decode(arrayBuffer);

  if (mimeType.toLowerCase() !== "text/plain") {
    const result = await generateText({
      model: AI_MODELS.html,
      system: SYSTEM_PROMPTS.html,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text,
            },
            {
              type: "text",
              text: "Extract the main content from this HTML and convert it to markdown format. without explaining you'll do so.",
            },
          ],
        },
      ],
    });
    return result.text;
  }
  return text;
}
