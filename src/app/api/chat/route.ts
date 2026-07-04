import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, stepCountIs } from 'ai';
import { createUIMessageStreamResponse, toUIMessageStream, convertToModelMessages } from 'ai';
import { tool } from '@ai-sdk/provider-utils';
import { z } from 'zod';
import { getInventory, checkStock, updateStock, setThreshold } from '@/lib/inventory';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      maxRetries: 1,
      system: 'You are an inventory management AI assistant. You help users manage their inventory smoothly via chat. ' +
        'Be concise, professional, and helpful. When a user asks about stock, use the check_stock tool or list_inventory tool. ' +
        'When a user wants to add, remove, or record sales/purchases, use the update_stock tool. ' +
        'When a user wants to set a low stock threshold or alert level for an item, use the set_threshold tool. ' +
        'Always confirm with the user what actions you have taken. Make the interface feel robust and reliable.',
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      tools: {
        list_inventory: tool({
          description: 'Lists all items currently in the inventory database',
          inputSchema: z.object({}),
          execute: async () => {
            const inventory = await getInventory();
            return JSON.stringify(inventory);
          },
        }),
        check_stock: tool({
          description: 'Check the current stock of a specific item',
          inputSchema: z.object({
            itemName: z.string().describe('The name of the item to check'),
          }),
          execute: async ({ itemName }) => {
            const item = await checkStock(itemName);
            if (!item) {
              return JSON.stringify({ error: `Item "${itemName}" not found in inventory.` });
            }
            return JSON.stringify(item);
          },
        }),
        update_stock: tool({
          description: 'Update the quantity of an item in the inventory (add/subtract). Use negative numbers for sales/removals.',
          inputSchema: z.object({
            itemName: z.string().describe('The name of the item to update'),
            quantityChange: z.number().describe('The amount to change. Positive for restocking/purchases, negative for sales/usage.'),
            unit: z.string().default('units').describe('The unit of measurement (e.g., kg, pcs, boxes). Defaults to "units".'),
          }),
          execute: async ({ itemName, quantityChange, unit }) => {
            const item = await updateStock(itemName, quantityChange, unit);
            return JSON.stringify({
              success: true,
              message: `Stock updated for ${itemName}. New quantity is ${item.quantity} ${item.unit}.`,
              item,
            });
          },
        }),
        set_threshold: tool({
          description: 'Set a low stock threshold for a specific item to alert the user when stock falls below this amount.',
          inputSchema: z.object({
            itemName: z.string().describe('The name of the item to set the threshold for'),
            threshold: z.number().describe('The minimum quantity threshold'),
          }),
          execute: async ({ itemName, threshold }) => {
            const item = await setThreshold(itemName, threshold);
            return JSON.stringify({
              success: true,
              message: `Threshold for ${itemName} set to ${threshold}.`,
              item,
            });
          },
        }),
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return String(error);
        },
      }),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
