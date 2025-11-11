"use client";

import { useEffect } from "react";
import { usePvDataMap, useSinglePvData } from "./lib/hooks";
import { _usePVWS } from "./lib/store";

function PVWSConnectionHandler({ url }: { url: string | undefined }) {
  const initialize = _usePVWS((state) => state.initializeWebSocket);
  const close = _usePVWS((state) => state.closeWebSocket);

  useEffect(() => {
    if (!url) {
      console.error(
        "PVWS_URL is not defined. WebSocket will not be initialized.",
      );
      return;
    }

    initialize(url);

    return () => {
      close();
    };
  }, [url, initialize, close]);

  return null; // This component doesn't render anything itself
}

export { PVWSConnectionHandler, usePvDataMap, useSinglePvData };
