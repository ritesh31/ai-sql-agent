import { streamText, UIMessage, convertToModelMessages, tool, stepCountIs } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

import { db } from "../../../db/db";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const SYSTEM_PROMPT = `
    You are an expert SQL assistant that helps to query their database using natural language.
     
    ${new Date().toLocaleString('sv-SE')}
    You have to access this following tools:
    1. schema tool: Call this tool to get the database schema which will help ypu to write SQl query
    2. db tool: Call this tool to query the database

    Rules:
    - Generate only select query(No UPDATE, DELETE, INSERT).
    - Always use the schema provided by the schema tool.
    - Pass in valid SQL syntax in db tool.
    - IMPORTANT: To query database call db tool, Don't return just SQL query.

    Always respond in a helpful, conversational tone while being technically accurate.
  `;
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    system: SYSTEM_PROMPT,
    tools: {     
      schema: tool({
        description: 'Call this tool to get database schema information',
        inputSchema: z.object({}),
        execute: async ({}) => {
          return `
            CREATE TABLE products (
              id integer PRIMARY KEY NOT NULL,
              name text NOT NULL,
              category text NOT NULL,
              price real NOT NULL,
              stock integer DEFAULT 0 NOT NULL,
              created_at text DEFAULT CURRENT_TIMESTAMP
            );
            --> statement-breakpoint
            CREATE TABLE sales (
              id integer PRIMARY KEY NOT NULL,
              product_id integer NOT NULL,
              quantity integer NOT NULL,
              total_amount real NOT NULL,
              sale_date text DEFAULT CURRENT_TIMESTAMP,
              customer_name text NOT NULL,
              region text NOT NULL,
              FOREIGN KEY (product_id) REFERENCES products(id) ON UPDATE no action ON DELETE no action
            );
          `;
        },
      }),
      db: tool({
        description: 'Call this tool to query a database',
        inputSchema: z.object({
          query: z.string().describe('The SQL query to be ran.'),
        }),
        execute: async ({ query }) => {
          console.log('This is query: ', query);
          return await db.run(query);
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}