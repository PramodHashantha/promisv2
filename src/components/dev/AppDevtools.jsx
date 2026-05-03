import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

/** Loaded only in development (see App.jsx dynamic import). */
export default function AppDevtools() {
  return <ReactQueryDevtools initialIsOpen={false} />;
}
