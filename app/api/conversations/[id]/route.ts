import type { NextRequest } from "next/server";
import { db } from "../../../../db/db";
import { conversationsTable, chatMessagesTable } from "../../../../db/schema";
import { eq, sql } from "drizzle-orm";
import type { UIMessage } from "ai";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const rows = await db
    .select()
    .from(chatMessagesTable)
    .where(eq(chatMessagesTable.conversationId, id))
    .orderBy(chatMessagesTable.seq);

  const messages: UIMessage[] = rows.map((r) => JSON.parse(r.content));

  return Response.json({ id, messages });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const { messages, title } = (await req.json()) as {
    messages: UIMessage[];
    title: string;
  };

  await db
    .insert(conversationsTable)
    .values({ id, title, updatedAt: sql`CURRENT_TIMESTAMP` })
    .onConflictDoUpdate({
      target: conversationsTable.id,
      set: { title, updatedAt: sql`CURRENT_TIMESTAMP` },
    });

  await db
    .delete(chatMessagesTable)
    .where(eq(chatMessagesTable.conversationId, id));

  if (messages.length > 0) {
    await db.insert(chatMessagesTable).values(
      messages.map((msg, i) => ({
        id: msg.id,
        conversationId: id,
        content: JSON.stringify(msg),
        seq: i,
      }))
    );
  }

  return Response.json({ ok: true });
}
