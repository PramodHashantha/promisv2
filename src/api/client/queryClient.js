import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 60 * 1000, // 30 min — enum/status data treated as fresh
            gcTime: 60 * 60 * 1000,    // 1 hr  — keep in memory even when unused
            retry: 2,
        },
    },
});
