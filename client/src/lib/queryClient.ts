import { QueryClient, QueryFunction } from "@tanstack/react-query";

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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
  options?: { isFormData?: boolean }
): Promise<Response> {
  const headers: Record<string, string> = {
    "Accept": "application/json"
  };

  if (data && !options?.isFormData) {
    headers["Content-Type"] = "application/json";
  }

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

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("[Auth] Returning null for unauthorized request");
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});