import { openaiWebSearchProvider } from "./openai-websearch";
import type { DataProvider } from "./types";

export function getDataProvider(): DataProvider {
  return openaiWebSearchProvider;
}

export * from "./types";
