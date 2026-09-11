export async function fetchWithRetry(
  url: string,
  init: RequestInit & { next?: { revalidate?: number } },
  retries = 3,
  baseDelayMs = 500,
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || res.status >= 500) {
        if (attempt < retries) {
          await sleep(baseDelayMs * 2 ** attempt);
          continue;
        }
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(baseDelayMs * 2 ** attempt);
      }
    }
  }

  throw lastError ?? new Error(`fetchWithRetry: failed after ${retries} retries`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
