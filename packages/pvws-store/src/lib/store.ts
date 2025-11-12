"use client";

import { subscribeWithSelector } from "zustand/middleware";
import { createWithEqualityFn } from "zustand/traditional";
import type { PvData } from "./schemas";
import { updateMessageSchema } from "./schemas";
import { comparePvData, formatLogMessage, mergePvDataUpdate } from "./utils";

interface PVWSState {
  isConnected: boolean;
  pvSubscriberCounts: Map<string, number>; // Tracks how many components subscribe to a PV
  subscriptionData: Map<string, PvData>; // tracks which PVs are subscribed to and their latest data
  ws: WebSocket | null; // The WebSocket instance
}

// Define the actions/methods that can modify the state or perform side effects
interface PVWSActions {
  initializeWebSocket: (url: string) => void;
  closeWebSocket: () => void;
  subscribePv: (pvName: string) => void;
  unsubscribePv: (pvName: string) => void;
  subscribePvs: (pvNames: string[]) => void;
  unsubscribePvs: (pvNames: string[]) => void;
  _handleUpdateMessage: (pv: string, data: Partial<PvData>) => void;
  _sendSubscriptionMessage: (
    type: "subscribe" | "clear",
    pvs: string[],
  ) => void;
}

type PVWSStore = PVWSState & PVWSActions;

export const _usePVWS = createWithEqualityFn<PVWSStore>()(
  subscribeWithSelector((set, get) => {
    return {
      isConnected: false,
      pvSubscriberCounts: new Map(),
      subscriptionData: new Map(),
      ws: null,

      initializeWebSocket: (url: string) => {
        const currentWs = get().ws;
        if (currentWs && currentWs.readyState === WebSocket.OPEN) {
          console.log(
            formatLogMessage(
              "WebSocket already open. Reusing existing connection.",
            ),
          );
          set({ isConnected: true });
          return;
        }

        console.log(
          formatLogMessage(`Attempting to connect to WebSocket at ${url}...`),
        );
        const newWs = new WebSocket(url);

        newWs.onopen = () => {
          console.log(formatLogMessage("WebSocket connected."));
          set({ ws: newWs, isConnected: true });

          const pvsToResubscribe = Array.from(get().pvSubscriberCounts.keys());
          if (pvsToResubscribe.length > 0) {
            get()._sendSubscriptionMessage("subscribe", pvsToResubscribe);
          }
        };

        newWs.onmessage = (event) => {
          try {
            const jsonData: unknown = JSON.parse(event.data as string);
            const data = updateMessageSchema
              .required({ pv: true })
              .parse(jsonData);
            get()._handleUpdateMessage(data.pv, data);
          } catch (error) {
            console.error(
              formatLogMessage("Failed to parse WebSocket message:"),
              error,
              JSON.parse(event.data as string),
            );
          }
        };

        newWs.onclose = (event) => {
          console.log(
            formatLogMessage("WebSocket closed:"),
            event.code,
            event.reason,
          );
          set({ isConnected: false });
          set({ ws: null });
          setTimeout(() => get().initializeWebSocket(url), 3000);
        };

        newWs.onerror = (error) => {
          console.error(formatLogMessage("WebSocket error:"), error);
          newWs.close();
        };

        set({ ws: newWs });
      },

      closeWebSocket: () => {
        const currentWs = get().ws;
        if (currentWs && currentWs.readyState === WebSocket.OPEN) {
          console.log(formatLogMessage("Closing WebSocket..."));
          const pvsToUnsubscribe = Array.from(get().pvSubscriberCounts.keys());
          if (pvsToUnsubscribe.length > 0) {
            get()._sendSubscriptionMessage("clear", pvsToUnsubscribe);
          }
          currentWs.close(1000, "App Unmount");
          set({ ws: null, isConnected: false });
        }
      },

      subscribePv: (pvName: string) => {
        set((state) => {
          const currentCount = state.pvSubscriberCounts.get(pvName) ?? 0;
          const newRefCounts = new Map(state.pvSubscriberCounts);
          newRefCounts.set(pvName, currentCount + 1);

          if (currentCount === 0) {
            get()._sendSubscriptionMessage("subscribe", [pvName]);
          }

          return { pvSubscriberCounts: newRefCounts };
        });
      },

      unsubscribePv: (pvName: string) => {
        set((state) => {
          const currentCount = state.pvSubscriberCounts.get(pvName) ?? 0;
          if (currentCount <= 0) {
            console.warn(
              formatLogMessage(`No subscriptions found for PV: ${pvName}`),
            );
            return state; // No action needed
          }

          const newRefCounts = new Map(state.pvSubscriberCounts);
          newRefCounts.set(pvName, currentCount - 1);

          if (newRefCounts.get(pvName) === 0) {
            newRefCounts.delete(pvName);
            get()._sendSubscriptionMessage("clear", [pvName]);
          }

          return { pvSubscriberCounts: newRefCounts };
        });
      },

      subscribePvs: (pvNames: string[]) => {
        set((state) => {
          const pvsToSubscribe: string[] = [];
          const newRefCounts = new Map(state.pvSubscriberCounts);
          pvNames.forEach((pvName) => {
            const currentCount = newRefCounts.get(pvName) ?? 0;
            newRefCounts.set(pvName, currentCount + 1);
            if (currentCount === 0) {
              pvsToSubscribe.push(pvName);
            }
          });
          if (pvsToSubscribe.length > 0) {
            get()._sendSubscriptionMessage("subscribe", pvsToSubscribe);
          }
          return { pvSubscriberCounts: newRefCounts };
        });
      },

      unsubscribePvs: (pvNames: string[]) => {
        set((state) => {
          const newRefCounts = new Map(state.pvSubscriberCounts);

          pvNames.forEach((pvName) => {
            const currentCount = newRefCounts.get(pvName) ?? 0;
            if (currentCount > 0) {
              newRefCounts.set(pvName, currentCount - 1);
              if (newRefCounts.get(pvName) === 0) {
                newRefCounts.delete(pvName);
              }
            }
          });

          const unsubscribedPvs = pvNames.filter(
            (pvName) => !newRefCounts.has(pvName),
          );

          if (unsubscribedPvs.length > 0) {
            console.log(
              formatLogMessage(
                `Unsubscribed from PVs: ${unsubscribedPvs.join(", ")}`,
              ),
            );
            get()._sendSubscriptionMessage("clear", unsubscribedPvs);
          }
          return { pvSubscriberCounts: newRefCounts };
        });
      },

      _handleUpdateMessage: (pv: string, data: Partial<PvData>) => {
        set((state) => {
          const previousData = state.subscriptionData.get(pv);
          const updatedData = mergePvDataUpdate(previousData, data);

          if (comparePvData(previousData, updatedData)) {
            return state;
          }

          const newPvDataMap = new Map(state.subscriptionData);
          newPvDataMap.set(pv, updatedData);
          return { subscriptionData: newPvDataMap };
        });
      },

      _sendSubscriptionMessage: (
        type: "subscribe" | "clear",
        pvs: string[],
      ) => {
        const currentWs = get().ws;
        if (!currentWs || currentWs.readyState !== WebSocket.OPEN) {
          console.warn(
            formatLogMessage(
              "WebSocket not open. Cannot send subscription message.",
            ),
            pvs,
          );
          return;
        }
        const message = { type, pvs };
        currentWs.send(JSON.stringify(message));
        console.log(formatLogMessage("Sent WebSocket message:"), message);
      },
    };
  }),
);
