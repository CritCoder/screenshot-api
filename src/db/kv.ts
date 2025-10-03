// Deno KV database layer
const kv = await Deno.openKv();

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  plan: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  userId: string;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
}

export interface ScreenshotRequest {
  id: string;
  userId: string;
  apiKeyId: string;
  url: string;
  type: string;
  options: string;
  status: string;
  filePath?: string;
  fileSize?: number;
  processingTime?: number;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Usage {
  id: string;
  userId: string;
  month: string;
  requests: number;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

// User operations
export async function createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
  const id = crypto.randomUUID();
  const now = new Date();
  const newUser: User = {
    ...user,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await kv.set(["users", id], newUser);
  await kv.set(["users_by_email", user.email], id);

  return newUser;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await kv.get<User>(["users", id]);
  return result.value;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userIdResult = await kv.get<string>(["users_by_email", email]);
  if (!userIdResult.value) return null;

  return getUserById(userIdResult.value);
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const user = await getUserById(id);
  if (!user) return null;

  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date(),
  };

  await kv.set(["users", id], updatedUser);
  return updatedUser;
}

// API Key operations
export async function createApiKey(apiKey: Omit<ApiKey, "id" | "createdAt">): Promise<ApiKey> {
  const id = crypto.randomUUID();
  const newApiKey: ApiKey = {
    ...apiKey,
    id,
    createdAt: new Date(),
  };

  await kv.set(["api_keys", id], newApiKey);
  await kv.set(["api_keys_by_key", apiKey.key], id);

  return newApiKey;
}

export async function getApiKeyByKey(key: string): Promise<ApiKey | null> {
  const keyIdResult = await kv.get<string>(["api_keys_by_key", key]);
  if (!keyIdResult.value) return null;

  const result = await kv.get<ApiKey>(["api_keys", keyIdResult.value]);
  return result.value;
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const iter = kv.list<ApiKey>({ prefix: ["api_keys"] });
  const apiKeys: ApiKey[] = [];

  for await (const entry of iter) {
    if (entry.value && entry.value.userId === userId) {
      apiKeys.push(entry.value);
    }
  }

  return apiKeys;
}

// Screenshot Request operations
export async function createScreenshotRequest(request: Omit<ScreenshotRequest, "id" | "createdAt">): Promise<ScreenshotRequest> {
  const id = crypto.randomUUID();
  const newRequest: ScreenshotRequest = {
    ...request,
    id,
    createdAt: new Date(),
  };

  await kv.set(["screenshot_requests", id], newRequest);

  return newRequest;
}

export async function getScreenshotRequest(id: string): Promise<ScreenshotRequest | null> {
  const result = await kv.get<ScreenshotRequest>(["screenshot_requests", id]);
  return result.value;
}

export async function updateScreenshotRequest(id: string, updates: Partial<ScreenshotRequest>): Promise<ScreenshotRequest | null> {
  const request = await getScreenshotRequest(id);
  if (!request) return null;

  const updatedRequest: ScreenshotRequest = {
    ...request,
    ...updates,
  };

  await kv.set(["screenshot_requests", id], updatedRequest);
  return updatedRequest;
}

export async function getUserScreenshots(userId: string): Promise<ScreenshotRequest[]> {
  const iter = kv.list<ScreenshotRequest>({ prefix: ["screenshot_requests"] });
  const requests: ScreenshotRequest[] = [];

  for await (const entry of iter) {
    if (entry.value && entry.value.userId === userId) {
      requests.push(entry.value);
    }
  }

  return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export { kv };