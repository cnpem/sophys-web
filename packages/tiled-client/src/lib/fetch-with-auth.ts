export async function fetchWithAuth(url: string, apiKey: string) {
  return fetch(url, {
    headers: {
      Authorization: `Apikey ${apiKey}`,
      accept: "application/json",
    },
  });
}
