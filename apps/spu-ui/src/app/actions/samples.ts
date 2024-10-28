"use server";

import type { Sample } from "../_components/sample";
import { trayColumns, trayOptions, trayRows } from "../../lib/constants";

function createEmptySamples() {
  const [TRAY1, TRAY2] = trayOptions;
  const emptyTray1 = trayRows.flatMap((row) =>
    trayColumns.map((column) => ({
      id: `${TRAY1}-${column}${row}`,
      tray: TRAY1,
      relativePosition: `${column}${row}`,
      type: null,
    })),
  );
  const emptyTray2 = trayRows.flatMap((row) =>
    trayColumns.map((column) => ({
      id: `${TRAY2}-${column}${row}`,
      tray: TRAY2,
      relativePosition: `${column}${row}`,
      type: null,
    })),
  );
  return [...emptyTray1, ...emptyTray2] as Sample[];
}

let samples: Sample[] = createEmptySamples();
const clients = new Set<ReadableStreamDefaultController>();

export async function getClients() {
  return new Promise<Set<ReadableStreamDefaultController>>((resolve) => {
    resolve(clients);
  });
}

export async function getSamples() {
  return new Promise<Sample[]>((resolve) => {
    resolve(samples);
  });
}

export async function clearSamples() {
  samples = createEmptySamples();
  await notifyClients();
  return new Promise<Sample[]>((resolve) => {
    resolve(samples);
  });
}

export async function setSamples(newSamples: Sample[]) {
  samples = newSamples;
  await notifyClients();
  return new Promise<Sample[]>((resolve) => {
    resolve(samples);
  });
}

const notifyClients = async () => {
  const data = await getSamples();
  clients.forEach((client) => {
    try {
      client.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      if (e instanceof TypeError) {
        clients.delete(client);
        return;
      }
      throw e;
    }
  });
};
