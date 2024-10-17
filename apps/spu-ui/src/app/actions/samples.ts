"use server";

import type { Sample } from "../_components/sample";
import { trayColumns, trayRows } from "../../lib/constants";

const emptyTray1 = () =>
  trayRows.flatMap((row) =>
    trayColumns.map((column) => ({
      id: `T1-${column}${row}`,
      position: `T1-${column}${row}`,
      relative_position: `${column}${row}`,
      type: null,
    })),
  );

const emptyTray2 = () =>
  trayRows.flatMap((row) =>
    trayColumns.map((column) => ({
      id: `T2-${column}${row}`,
      position: `T2-${column}${row}`,
      relative_position: `${column}${row}`,
      type: null,
    })),
  );

let samples: Sample[] = [...emptyTray1(), ...emptyTray2()];
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
  samples = [...emptyTray1(), ...emptyTray2()];
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
