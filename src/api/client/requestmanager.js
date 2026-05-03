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

export async function managedRequest(apiFn, args = [], {
    maxRetries = 4,
    baseDelay = 500,
    signal,
} = {}) {
    // No deduplication — each component owns its request fully

    const attempt = async (retryCount) => {
        if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

        try {
            return await apiFn(...args, signal);
        } catch (err) {
            if (err?.name === "AbortError") throw err;

            const isRateLimit =
                err?.status === 429 ||
                err?.message?.toLowerCase().includes("rate limit") ||
                err?.message?.toLowerCase().includes("too many requests");

            if (isRateLimit && retryCount < maxRetries) {
                const delay = baseDelay * 2 ** retryCount;
                console.warn(`[managedRequest] 429 — retry ${retryCount + 1}/${maxRetries} in ${delay}ms`);
                await sleep(delay);
                return attempt(retryCount + 1);
            }

            throw err;
        }
    };

    return attempt(0);
}