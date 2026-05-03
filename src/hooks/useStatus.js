import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../utils/api/http';

// Fetches ALL values for an enum — filters are applied client-side only
const fetchStatusData = async (endpointName) => {
    const [display, map] = await Promise.all([
        apiGet(`/api/Status/GetEnum/${endpointName}`),
        apiGet(`/api/Status/GetEnumMap/${endpointName}`),
    ]);
    return { display, map };
};

export const useStatus = (endpointName, filters = {}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['status', endpointName],   // Same key → shared cache across all callers
        queryFn: () => fetchStatusData(endpointName),
        enabled: !!endpointName,
        staleTime: 30 * 60 * 1000,           // 30 min — treat as fresh, no background refetch
        gcTime: 60 * 60 * 1000,              // 1 hr  — keep in memory even when unused
    });

    const allStatuses = data?.display ?? [];
    const enumMap = data?.map ?? {};

    // Stable primitive deps for memo — avoids re-computing on every render
    const includeKey = filters.include ? filters.include.join(',') : '';
    const excludeKey = filters.exclude ? filters.exclude.join(',') : '';

    // Compute filtered list for dropdowns — purely client-side on cached full data
    const statuses = useMemo(() => {
        let filtered = allStatuses;
        if (filters.include?.length > 0) {
            filtered = filtered.filter(s => filters.include.includes(s.value));
        }
        if (filters.exclude?.length > 0) {
            filtered = filtered.filter(s => !filters.exclude.includes(s.value));
        }
        return filtered;
    }, [allStatuses, includeKey, excludeKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Stable reference — safe to use in useEffect deps without infinite loops
    const getLabel = useCallback((value) => {
        if (!allStatuses.length) return value;
        return allStatuses.find(s => s.value == value)?.label ?? value;
    }, [allStatuses]);

    // Look up value by programmatic name e.g. getValue("MaterialApproved")
    const getValue = useCallback((name) => {
        return enumMap[name] ?? null;
    }, [enumMap]);

    return { statuses, enums: enumMap, loading: isLoading, error, getLabel, getValue };
};
