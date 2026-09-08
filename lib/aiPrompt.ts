export const AI_PROVIDER_IDS = ["chatgpt", "claude", "perplexity", "gemini"] as const;
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

const BUILDERS: Record<AiProviderId, (q: string) => string> = {
  chatgpt: (q) => `https://chat.openai.com/?q=${encodeURIComponent(q)}`,
  claude: (q) => `https://claude.ai/new?q=${encodeURIComponent(q)}`,
  perplexity: (q) => `https://www.perplexity.ai/search/new?q=${encodeURIComponent(q)}`,
  // Gemini has no documented parameter for pre-filling the composer, unlike the three above.
  // The link still opens Gemini with the question attached, and the section's copy button is
  // the reliable path if it arrives empty.
  gemini: (q) => `https://gemini.google.com/app?q=${encodeURIComponent(q)}`,
};

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  chatgpt: "ChatGPT",
  claude: "Claude",
  perplexity: "Perplexity",
  gemini: "Gemini",
};

/**
 * Each provider's own official mark, downloaded from that provider's own site. Provenance and
 * the single edit made to one of them are recorded in `public/assets/ai/SOURCES.md`.
 */
export const AI_PROVIDER_LOGOS: Record<AiProviderId, string> = {
  chatgpt: "/assets/ai/openai.svg",
  claude: "/assets/ai/claude.svg",
  perplexity: "/assets/ai/perplexity.svg",
  gemini: "/assets/ai/gemini.svg",
};

/** Deep link that opens `question` already typed into the given assistant. */
export function buildProviderUrl(id: AiProviderId, question: string): string {
  return BUILDERS[id](question);
}
