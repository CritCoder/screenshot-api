import * as bcrypt from "bcrypt";
import { create, verify, getNumericDate } from "jwt";
import { encodeBase64 } from "@std/encoding/base64";

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "your-secret-key";
let _key: CryptoKey | null = null;

async function getJWTKey(): Promise<CryptoKey> {
  if (!_key) {
    _key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return _key;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function generateJWT(payload: Record<string, unknown>): Promise<string> {
  const key = await getJWTKey();
  return await create(
    { alg: "HS256", typ: "JWT" },
    {
      ...payload,
      exp: getNumericDate(60 * 60 * 24), // 24 hours
    },
    key
  );
}

export async function verifyJWT(token: string): Promise<Record<string, unknown> | null> {
  try {
    const key = await getJWTKey();
    const payload = await verify(token, key);
    return payload;
  } catch {
    return null;
  }
}

export function generateApiKey(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  return encodeBase64(randomBytes).replace(/[+/=]/g, '').substring(0, 40);
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export async function authenticateRequest(req: Request): Promise<{ userId: string } | null> {
  const authHeader = req.headers.get('Authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) return null;

  const payload = await verifyJWT(token);
  if (!payload || typeof payload.userId !== 'string') {
    return null;
  }

  return { userId: payload.userId };
}