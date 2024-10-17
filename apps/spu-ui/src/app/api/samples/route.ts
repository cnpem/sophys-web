import { getClients, getSamples } from "../../actions/samples";

export const dynamic = "force-dynamic";

async function GET() {
  const data = await getSamples();
  const clients = await getClients();
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
    },
    cancel() {
      clients.delete(this as ReadableStreamDefaultController);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export { GET };
