/**
 * Generic singleton factory for async clients
 * Handles memoization and error handling automatically
 */
export const createAsyncClientFactory = <T>(
  factory: () => Promise<T | null>,
  name: string,
) => {
  let clientPromise: Promise<T | null> | null = null;

  return async (): Promise<T | null> => {
    clientPromise ??= factory().catch((error) => {
      console.error(`Failed to initialize ${name}:`, error);
      clientPromise = null; // Reset on error
      return null;
    });
    return clientPromise;
  };
};
