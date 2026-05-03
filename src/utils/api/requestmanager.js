function stableStringify(value) {
    if (value === null || value === undefined) return String(value);
    if (typeof value !== "object") return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;

    const sorted = Object.keys(value)
        .sort()
        .reduce((acc, k) => { acc[k] = value[k]; return acc; }, {});

    return `{${Object.entries(sorted)
        .map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`)
        .join(",")}}`;
}

// Exported — used by useApi for paramsKey only
export { stableStringify };

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const toNumber = (value) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
};

const parseRetryAfterMs = (err) => {
    const explicit = toNumber(err?.retryAfterMs);
    if (explicit !== null && explicit >= 0) return explicit;

    const headerValue = err?.headers?.["retry-after"] ?? err?.headers?.["Retry-After"];
    if (headerValue === undefined || headerValue === null) return null;

    const seconds = toNumber(headerValue);
    if (seconds !== null && seconds >= 0) return seconds * 1000;

    const dateTs = Date.parse(headerValue);
    if (Number.isNaN(dateTs)) return null;
    return Math.max(0, dateTs - Date.now());
};

const withJitter = (delayMs, jitterRatio) => {
    if (!jitterRatio || jitterRatio <= 0) return delayMs;
    const jitter = delayMs * jitterRatio;
    const min = Math.max(0, delayMs - jitter);
    const max = delayMs + jitter;
    return Math.round(min + Math.random() * (max - min));
};

export async function managedRequest(apiFn, args = [], {
    maxRetries = 4,
    baseDelay = 500,
    maxDelay = 8000,
    jitterRatio = 0.2,
    respectRetryAfter = true,
    signal,
} = {}) {
    // No deduplication — each component owns its request fully

    const attempt = async (retryCount) => {
        if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

        try {
            return await apiFn(...args, signal);
        } catch (err) {
            if (err?.name === "AbortError") throw err;

            const status = err?.status;
            const isRateLimit =
                status === 429 ||
                err?.message?.toLowerCase().includes("rate limit") ||
                err?.message?.toLowerCase().includes("too many requests");

            if (isRateLimit && retryCount < maxRetries) {
                const retryAfterMs = respectRetryAfter ? parseRetryAfterMs(err) : null;
                const backoffDelay = Math.min(baseDelay * 2 ** retryCount, maxDelay);
                const rawDelay = retryAfterMs ?? backoffDelay;
                const delay = withJitter(rawDelay, jitterRatio);
                console.warn(`[managedRequest] 429 — retry ${retryCount + 1}/${maxRetries} in ${delay}ms`);
                await sleep(delay);
                if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");
                return attempt(retryCount + 1);
            }

            throw err;
        }
    };

    return attempt(0);
}