import { openai } from "@ai-sdk/openai";

/**
 * Centralized AI model configuration
 * This is the single source of truth for all AI model usage in the project
 */
export const model = openai("gpt-4o-mini");

/**
 * To change models globally:
 * 1. Update the openai() call above (e.g., "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo")
 * 2. Changes apply everywhere automatically - no need to update individual files
 *
 * Examples:
 * - openai("gpt-4o")         - Most capable, higher cost, better for complex SQL
 * - openai("gpt-4o-mini")    - Balanced: fast, cheap, good quality (current)
 * - openai("gpt-3.5-turbo")  - Cheapest option, acceptable quality
 */
