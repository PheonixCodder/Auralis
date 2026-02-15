import z from "zod/v4";
import { widgetSettingsSchema } from "../schema/schema";

export type FormSchema = z.infer<typeof widgetSettingsSchema>;
