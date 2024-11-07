"use client";

import { useCallback, useEffect, useState } from "react";
import { env } from "../../env";

export const useSSEData = <T,>(
  url: string,
  opts: {
    initialData: T;
  },
) => {
  const [data, setData] = useState(opts.initialData);

  const connect = useCallback(() => {
    const eventSource = new EventSource(`${env.NEXT_PUBLIC_BASE_PATH}${url}`);

    eventSource.onmessage = (event: MessageEvent<string>) => {
      const newData = JSON.parse(event.data) as T;
      setData(newData);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(connect, 3000);
    };

    return eventSource;
  }, [url]);

  useEffect(() => {
    const eventSource = connect();

    return () => {
      eventSource.close();
    };
  }, [connect]);
  return [data, setData] as const;
};
