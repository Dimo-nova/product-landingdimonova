export const AI_PROVIDER_IDS = ["chatgpt", "claude", "perplexity", "google"] as const;
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

const BUILDERS: Record<AiProviderId, (q: string) => string> = {
  chatgpt: (q) => `https://chat.openai.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(q)}`,
  google: (q) => `https://www.google.com/search?udm=50&q=${encodeURIComponent(q)}`,
};

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  google: "Google AI Mode",
};

/** Deep link that opens `question` already typed into the given assistant. */
export function buildProviderUrl(id: AiProviderId, question: string): string {
  return BUILDERS[id](question);
}
