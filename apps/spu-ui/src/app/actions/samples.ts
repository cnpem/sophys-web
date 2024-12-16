"use server";

import type { Sample } from "../_components/sample";
import { env } from "~/env";
import { trayColumns, trayOptions, trayRows } from "../../lib/constants";

function createEmptySamples() {
  const [TRAY1, TRAY2] = trayOptions;
  const emptyTray1 = trayRows.flatMap((row) =>
    trayColumns.map(
      (column) =>
        ({
          id: `${TRAY1}-${column}${row}`,
          tray: TRAY1,
          relativePosition: `${column}${row}`,
          type: undefined,
          row: row,
          col: column,
          sampleTag: undefined,
          bufferTag: undefined,
        }) satisfies Sample,
    ),
  );
  const emptyTray2 = trayRows.flatMap((row) =>
    trayColumns.map(
      (column) =>
        ({
          id: `${TRAY2}-${column}${row}`,
          tray: TRAY2,
          relativePosition: `${column}${row}`,
          type: undefined,
          row: row,
          col: column,
          sampleTag: undefined,
          bufferTag: undefined,
        }) satisfies Sample,
    ),
  );
  return [...emptyTray1, ...emptyTray2] as Sample[];
}

declare const globalThis: {
  sampleStore: SampleStore | undefined;
} & typeof global;

const store =
  globalThis.sampleStore ??
  ({
    samples: createEmptySamples(),
    clients: new Set<ReadableStreamDefaultController>(),
  } as SampleStore);

interface SampleStore {
  samples: Sample[];
  clients: Set<ReadableStreamDefaultController>;
}
if (env.NODE_ENV !== "production") {
  globalThis.sampleStore = store;
}

export async function getClients() {
  return new Promise<Set<ReadableStreamDefaultController>>((resolve) => {
    resolve(store.clients);
  });
}

export async function getSamples() {
  return new Promise<Sample[]>((resolve) => {
    resolve(store.samples);
  });
}

export async function clearSamples() {
  store.samples = createEmptySamples();
  await notifyClients();
  return store.samples;
}

export async function clearTray(tray: string) {
  store.samples = store.samples.map((sample) => {
    if (sample.tray === tray) {
      return { ...sample, type: undefined } as Sample;
    }
    return sample;
  });
  await notifyClients();
  return new Promise<Sample[]>((resolve) => {
    resolve(store.samples);
  });
}

export async function setSamples(newSamples: Sample[]) {
  store.samples = newSamples;
  await notifyClients();
  return new Promise<Sample[]>((resolve) => {
    resolve(store.samples);
  });
}

const notifyClients = async () => {
  const data = await getSamples();
  store.clients.forEach((client) => {
    try {
      client.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      if (e instanceof TypeError) {
        store.clients.delete(client);
        return;
      }
      throw e;
    }
  });
};
