import { env } from "~/env";

export function appendBasePath(path: string): string {
  const basePath = env.NEXT_PUBLIC_BASE_PATH;
  return `${basePath}${path}`;
}
