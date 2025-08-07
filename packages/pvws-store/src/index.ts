"use client";

import { useEffect } from "react";
import { usePvDataMap, useSinglePvData } from "./lib/hooks";
import { _usePVWS } from "./lib/store";

function PVWSConnectionHandler({ pvwsUrl }: { pvwsUrl: string }) {
  const initialize = _usePVWS((state) => state.initializeWebSocket);
  const close = _usePVWS((state) => state.closeWebSocket);

  useEffect(() => {
    if (!pvwsUrl) {
      console.error(
        "NEXT_PUBLIC_PVWS_URL is not defined. WebSocket will not be initialized.",
      );
      throw new Error(
        "NEXT_PUBLIC_PVWS_URL is not defined. WebSocket will not be initialized.",
      );
    }

    initialize(pvwsUrl);

    return () => {
      close();
    };
  }, [pvwsUrl, initialize, close]);

  return null; // This component doesn't render anything itself
}

export { PVWSConnectionHandler, usePvDataMap, useSinglePvData };
