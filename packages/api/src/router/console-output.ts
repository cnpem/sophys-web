import { nanoid } from "nanoid";
import { z } from "zod";
import { env } from "../../env";
import { protectedProcedure } from "../trpc";

export const consoleOutputRouter = {
  stream: protectedProcedure.query(async function* ({ ctx }) {
    const fetchURL = `${env.BLUESKY_HTTPSERVER_URL}/api/stream_console_output`;
    const res = await fetch(fetchURL, {
      method: "GET",
      headers: {
        "Content-Type": "text/plain",
        Authorization: `Bearer ${ctx.session.user.blueskyAccessToken}`,
      },
    });
    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader");
    }
    let done = false;
    while (!done) {
      const { value: chunk, done: readerDone } = await reader.read();
      if (chunk) {
        const decoded = new TextDecoder().decode(chunk);
        const messages = parseMessagesFromText(decoded);
        for (const message of messages) {
          const innerMessage = parseInnerMessage(message.msg);
          if (innerMessage) {
            const id = nanoid();
            yield {
              id,
              ...innerMessage,
            };
          }
        }
      }
      done = readerDone;
    }
  }),
} as const;

const MessageSchema = z.object({
  time: z.number(),
  msg: z.string(),
});

type Message = z.infer<typeof MessageSchema>;

function parseMessagesFromText(input: string): Message[] {
  const messageRegex = /(\{.*?\})(?=\{|\s*$)/g;

  const matches = input.match(messageRegex) ?? [];

  const parsedMessages = matches
    .map((jsonStr) => {
      const parsed = JSON.parse(jsonStr) as unknown;
      const result = MessageSchema.safeParse(parsed);
      return result.success ? result.data : null;
    })
    .filter((msg): msg is Message => msg !== null);

  return parsedMessages;
}

interface ParsedLogMessage {
  logLevel: string;
  date: string;
  timestamp: string;
  service: string;
  textMessage: string;
}

function parseInnerMessage(message: string): ParsedLogMessage | null {
  const innerMessageRegex = /^\[(.*?)\]\s*([\s\S]*)$/;
  const match = innerMessageRegex.exec(message);

  if (!match) {
    console.error("Failed to parse inner message:", message);
    return null;
  }

  const [, bracketContent, textMessage] = match;
  if (!bracketContent) {
    console.error("Failed to parse bracket content:", message);
    return null;
  }

  const [logLevel, date, timestamp, service] = bracketContent.split(/\s+/);

  if (!logLevel || !date || !timestamp || !service || !textMessage) {
    console.error("Failed to parse bracket content:", message);
    return null;
  }

  return {
    logLevel,
    date,
    timestamp,
    service,
    textMessage,
  };
}
