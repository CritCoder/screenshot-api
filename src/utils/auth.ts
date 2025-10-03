import { create, verify, getNumericDate } from "jwt";
import { encodeBase64, decodeBase64 } from "@std/encoding/base64";

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
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordBytes = new TextEncoder().encode(password);
  const saltedPassword = new Uint8Array(salt.length + passwordBytes.length);
  saltedPassword.set(salt);
  saltedPassword.set(passwordBytes, salt.length);

  const hashBuffer = await crypto.subtle.digest("SHA-256", saltedPassword);
  const hashArray = new Uint8Array(hashBuffer);

  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);

  return encodeBase64(combined);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const combined = decodeBase64(hash);
    const salt = combined.slice(0, 16);
    const storedHash = combined.slice(16);

    const passwordBytes = new TextEncoder().encode(password);
    const saltedPassword = new Uint8Array(salt.length + passwordBytes.length);
    saltedPassword.set(salt);
    saltedPassword.set(passwordBytes, salt.length);

    const hashBuffer = await crypto.subtle.digest("SHA-256", saltedPassword);
    const newHash = new Uint8Array(hashBuffer);

    // Compare hashes
    if (newHash.length !== storedHash.length) return false;
    let isEqual = true;
    for (let i = 0; i < newHash.length; i++) {
      if (newHash[i] !== storedHash[i]) isEqual = false;
    }
    return isEqual;
  } catch {
    return false;
  }
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