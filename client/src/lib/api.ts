import { config } from '../config';

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown,
  options?: { isFormData?: boolean }
): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept": "application/json"
  };

  if (data && !options?.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${config.apiBaseUrl}${path}`;
  
  const res = await fetch(url, {
    method,
    headers,
    body: data instanceof FormData ? data : data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Clone the response before checking if it's ok
  // This allows us to read the body multiple times if needed
  const resClone = res.clone();
  await throwIfResNotOk(resClone);
  return res;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || res.statusText);
    } catch (e) {
      // If parsing JSON fails, fall back to text
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
  }
}

export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const url = `${config.apiBaseUrl}${queryKey[0]}`;
      const res = await fetch(url, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("[Auth] Returning null for unauthorized request");
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    }; 