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
    let value = "";
    while (!done) {
      const { value: chunk, done: d } = await reader.read();
      if (chunk) {
        value += new TextDecoder().decode(chunk);
      }
      const messages = parseMessagesFromText(value);
      console.log(value.length, messages.length);
      for await (const message of messages) {
        const innerMessage = parseInnerMessage(message.msg);
        if (innerMessage) {
          yield innerMessage;
        }
      }
      done = d;
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

  const matches = input.match(messageRegex) || [];

  const parsedMessages = matches
    .map((jsonStr) => {
      const parsed = JSON.parse(jsonStr);
      const result = MessageSchema.safeParse(parsed);
      return result.success ? result.data : null;
    })
    .filter((msg): msg is Message => msg !== null);

  return parsedMessages;
}

type ParsedLogMessage = {
  logLevel: string;
  date: string;
  timestamp: string;
  service: string;
  textMessage: string;
};

function parseInnerMessage(message: string): ParsedLogMessage | null {
  const innerMessageRegex = /^\[(.*?)\]\s*(.*)$/s;
  const match = message.match(innerMessageRegex);

  if (!match) {
    console.error("Failed to parse inner message:", message);
    return null;
  }

  const [, bracketContent, textMessage] = match;

  const [logLevel, date, timestamp, service] = bracketContent.split(/\s+/);

  return {
    logLevel,
    date,
    timestamp,
    service,
    textMessage,
  };
}
