import { useCallback, useEffect, useRef, useState } from "react";
import { managedRequest, stableStringify } from "../utils/api/requestmanager";

export const useApi = (apiFn, params = [], auto = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const abortRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // apiFn passed directly — no .name, no minification bug
      const res = await managedRequest(apiFn, args, {
        signal: controller.signal,
      });

      if (!controller.signal.aborted && mountedRef.current) setData(res);
      return res;
    } catch (err) {
      if (err?.name === "AbortError") return;
      if (!controller.signal.aborted && mountedRef.current) setError(err);
      throw err;
    } finally {
      // Only clears loading if this request wasn't superseded
      if (!controller.signal.aborted && mountedRef.current) setLoading(false);
    }
  }, [apiFn]);

  // paramsKey: re-runs effect only when params values actually change
  // execute in deps: always has the latest apiFn closure
  const paramsKey = stableStringify(params);

  useEffect(() => {
    if (!auto) return;
    execute(...params);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, paramsKey, execute]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  return { data, loading, error, execute, cancel };
};