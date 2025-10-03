import { z } from "zod";

// User validation schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Screenshot request validation
export const screenshotSchema = z.object({
  url: z.string().url("Invalid URL format"),
  type: z.enum(["screenshot", "pdf"], "Type must be 'screenshot' or 'pdf'"),
  options: z.object({
    viewport: z.object({
      width: z.number().min(100).max(3840).optional(),
      height: z.number().min(100).max(3840).optional(),
    }).optional(),
    fullPage: z.boolean().optional(),
    format: z.enum(["png", "jpeg", "pdf"]).optional(),
    quality: z.number().min(1).max(100).optional(),
    waitForSelector: z.string().optional(),
    waitForTimeout: z.number().min(0).max(30000).optional(),
  }).optional(),
});

// API Key validation
export const apiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: "Validation failed" };
  }
}

export async function parseJsonBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    return validateRequest(schema, body);
  } catch {
    return { success: false, error: "Invalid JSON body" };
  }
}