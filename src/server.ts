import { serveDir } from "@std/http/file-server";
import { extname, join } from "@std/path";
import { load } from "@std/dotenv";
// Simple CORS helper
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
import { createUser, getUserByEmail, getUserById, createApiKey, createScreenshotRequest, getUserScreenshots, getApiKeyByKey } from "./db/kv.ts";
import { hashPassword, verifyPassword, generateJWT, authenticateRequest, generateApiKey } from "./utils/auth.ts";
import { parseJsonBody, registerSchema, loginSchema, screenshotSchema } from "./utils/validation.ts";

// Load environment variables
await load({ export: true });

const PORT = parseInt(Deno.env.get("PORT") || "8000");

// Static file handler
async function handleStatic(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Serve uploads
  if (pathname.startsWith("/uploads/")) {
    try {
      return await serveDir(req, {
        fsRoot: "./uploads",
        urlRoot: "uploads",
        enableCors: true,
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  // Serve React app static files
  if (pathname.startsWith("/assets/") || [".js", ".css", ".ico", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".woff", ".woff2", ".ttf", ".eot"].includes(extname(pathname))) {
    try {
      return await serveDir(req, {
        fsRoot: "./ui/dist",
        urlRoot: "",
        enableCors: true,
      });
    } catch {
      return null;
    }
  }

  return null;
}

// Main request handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return addCorsHeaders(new Response(null, { status: 200 }));
  }

  // Handle static files first
  const staticResponse = await handleStatic(req);
  if (staticResponse) {
    return addCorsHeaders(staticResponse);
  }

  // Health check
  if (pathname === "/health") {
    return addCorsHeaders(new Response(JSON.stringify({
      status: "OK",
      timestamp: new Date().toISOString(),
    }), {
      headers: { "Content-Type": "application/json" },
    }));
  }

  // API routes
  if (pathname.startsWith("/api/")) {
    return addCorsHeaders(await handleAPI(req));
  }

  // Serve React app for all other routes
  try {
    const indexFile = await Deno.readTextFile("./ui/dist/index.html");
    return addCorsHeaders(new Response(indexFile, {
      headers: { "Content-Type": "text/html" },
    }));
  } catch {
    return addCorsHeaders(new Response("App not found", { status: 404 }));
  }
}

// API handler placeholder
async function handleAPI(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname.startsWith("/api/auth")) {
    return await handleAuth(req);
  }

  if (pathname.startsWith("/api/screenshots")) {
    return await handleScreenshots(req);
  }

  return new Response(JSON.stringify({ error: "API endpoint not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// Auth handler
async function handleAuth(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const path = url.pathname.replace("/api/auth", "");

  if (req.method === "POST" && path === "/register") {
    return await handleRegister(req);
  }

  if (req.method === "POST" && path === "/login") {
    return await handleLogin(req);
  }

  if (req.method === "GET" && path === "/me") {
    return await handleGetProfile(req);
  }

  if (req.method === "GET" && path === "/test") {
    return new Response(JSON.stringify({ message: "Auth API is working" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Auth endpoint not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// Screenshots handler placeholder
async function handleScreenshots(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "POST") {
    // Screenshot creation logic will go here
    return new Response(JSON.stringify({ message: "Screenshot endpoint" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    // Get screenshots logic will go here
    return new Response(JSON.stringify({ screenshots: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Screenshot endpoint not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

// Auth handlers
async function handleRegister(req: Request): Promise<Response> {
  try {
    const validation = await parseJsonBody(req, registerSchema);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await createUser({
      email,
      password: hashedPassword,
      name,
      plan: "free",
      credits: 100,
    });

    // Generate JWT
    const token = await generateJWT({ userId: user.id, email: user.email });

    return new Response(JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        credits: user.credits,
      },
      token,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(JSON.stringify({
      error: "Registration failed",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function handleLogin(req: Request): Promise<Response> {
  const validation = await parseJsonBody(req, loginSchema);
  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, password } = validation.data;

  // Find user
  const user = await getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password))) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Generate JWT
  const token = await generateJWT({ userId: user.id, email: user.email });

  return new Response(JSON.stringify({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    },
    token,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleGetProfile(req: Request): Promise<Response> {
  const auth = await authenticateRequest(req);
  if (!auth) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const user = await getUserById(auth.userId);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      credits: user.credits,
    },
  }), {
    headers: { "Content-Type": "application/json" },
  });
}

console.log(`🚀 Server starting on http://localhost:${PORT}`);

Deno.serve({ port: PORT }, handler);