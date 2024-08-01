"use client";

import { api } from "../../trpc/react";

export default function QueueView() {
  const { data } = api.queue.queueGet.useQuery(undefined, {
    refetchInterval: 10000,
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Queue</h2>
        <div>
          {data?.items.length ? (
            <ul>
              {data.items.map((item) => (
                <ul key={item.item_uid}>
                  <div className="flex flex-row gap-2">
                    <p>
                      Item: <span className="text-blue-500">{item.name}</span>
                    </p>
                    <p>
                      Args: <span className="text-blue-500">{item.args}</span>
                    </p>
                  </div>
                </ul>
              ))}
            </ul>
          ) : (
            <p>No items in queue</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Running</h2>
        <div>
          {data?.running_item ? (
            <div className="flex flex-row gap-2">
              <p>
                Item:{" "}
                <span className="text-blue-500">{data.running_item.name}</span>
              </p>
              <p>
                Args:{" "}
                <span className="text-blue-500">{data.running_item.args}</span>
              </p>
            </div>
          ) : (
            <p>No running item</p>
          )}
        </div>
      </div>
    </div>
  );
}
