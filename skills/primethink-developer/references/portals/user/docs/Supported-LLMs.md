# Supported LLM Providers and Models

Our platform integrates with multiple Large Language Model (LLM) providers to offer you flexibility and choice in selecting the most suitable AI models for your needs. Each provider offers unique capabilities and model variations, allowing you to leverage state-of-the-art AI technology through a unified interface. This document outlines the currently supported providers, their available models, and the requirements for using them.

| Provider | Prefix | Required setting | Available Models | Model names URL |
|----------|--------|------------------|------------------|-----------------|
| OpenAI | `openai` | `OPENAI_API_KEY` | gpt-5.6-sol, gpt-5.6-terra, gpt-5.6-luna, gpt-5.5, gpt-5.4, gpt-5.4-mini, gpt-5.4-nano, gpt-4.1, gpt-4.1-mini, gpt-4.1-nano | [https://platform.openai.com/docs/models](https://platform.openai.com/docs/models) |
| Anthropic | `anthropic` | `ANTHROPIC_API_KEY` | claude-fable-5, claude-opus-5, claude-sonnet-5, claude-haiku-4-5, claude-opus-4-8, claude-opus-4-7, claude-opus-4-6, claude-sonnet-4-6, claude-sonnet-4-5, claude-opus-4-5 | [https://docs.anthropic.com/en/docs/about-claude/models/all-models](https://docs.anthropic.com/en/docs/about-claude/models/all-models) |
| AWS Bedrock | `bedrock` | `AWS_BEDROCK_CREDENTIALS` | claude-fable-5, claude-opus-5, claude-sonnet-5, claude-haiku-4-5, claude-opus-4-8, claude-opus-4-7, claude-opus-4-6, claude-sonnet-4-6, claude-sonnet-4-5, claude-opus-4-5, gpt-5-6-sol, gpt-5-6-terra, gpt-5-6-luna, mistral-large, deepseek-v3-2, kimi-k2-5 | [https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html](https://docs.aws.amazon.com/bedrock/latest/userguide/model-cards.html) |
| Google | `google_genai` | `GOOGLE_API_KEY` | gemini-3.6-flash, gemini-3.5-flash, gemini-3.5-flash-lite, gemini-3.1-pro-preview, gemini-3.1-flash-lite, gemini-3-flash-preview, gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite | [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models) |
| Groq | `groq` | `GROQ_API_KEY` | groq/compound, groq/compound-mini, openai/gpt-oss-120b, openai/gpt-oss-20b, llama-3.3-70b-versatile, llama-3.1-8b-instant, meta-llama/llama-4-scout-17b-16e-instruct, qwen/qwen3-32b | [https://console.groq.com/docs/models](https://console.groq.com/docs/models) |
| DeepSeek | `deepseek` | `DEEPSEEK_API_KEY` | deepseek-v4-pro, deepseek-v4-flash | [https://api-docs.deepseek.com/quick_start/pricing](https://api-docs.deepseek.com/quick_start/pricing) |
| Mistral AI | `mistralai` | `MISTRAL_API_KEY` | mistral-medium-3-5-2604, mistral-small-4-0-2603, mistral-large-2512, mistral-medium-2508, magistral-medium-2509, devstral-2-25-12, ministral-3-14b-25-12, ministral-8b-2512, ministral-3-3b-25-12 | [https://docs.mistral.ai/getting-started/models/models_overview/](https://docs.mistral.ai/getting-started/models/models_overview/) |
| OpenRouter | `openrouter` | `OPENROUTER_API_KEY` | anthropic/claude-opus-5, anthropic/claude-sonnet-5, anthropic/claude-fable-5, anthropic/claude-opus-4.8, anthropic/claude-sonnet-4.6, anthropic/claude-haiku-4.5, openai/gpt-5.6-sol, openai/gpt-5.6-terra, openai/gpt-5.6-luna, openai/gpt-5.5, openai/gpt-4.1, openai/gpt-4.1-mini, google/gemini-3.6-flash, google/gemini-3.5-flash, google/gemini-3.1-pro-preview, deepseek/deepseek-v4-pro, deepseek/deepseek-v4-flash, qwen/qwen3.8-max, qwen/qwen3.7-flash, z-ai/glm-5.2, z-ai/glm-5.3, z-ai/glm-5.3-flash, moonshotai/kimi-k2-thinking, moonshotai/kimi-k3, minimax/minimax-m3, meta-llama/llama-4-maverick, qwen/qwen3.8-27b, qwen/qwen3.8-2.4t-a95b, google/gemini-3.7-flash, x-ai/grok-4.6 | [https://openrouter.ai/docs](https://openrouter.ai/docs) |

The list above reflects the platform's model catalog at the time of writing; the authoritative list is the model selector inside the app, which is generated from the same catalog.

## How it works

When using these models in your application:

1. Each model requires its corresponding credential setting to be set in your user or group settings
2. The model name must be prefixed with the provider's prefix, separated by a colon (`provider:model`). Examples:
    - Google: `google_genai:gemini-3.5-flash`
    - Anthropic: `anthropic:claude-sonnet-5`
    - AWS Bedrock: `bedrock:claude-sonnet-5`
    - OpenAI: `openai:gpt-5.5`
3. The system will automatically:
    - Validate the presence of the required credential setting
    - Strip the provider prefix when needed (for providers like Anthropic and Groq)
    - Initialize the appropriate client with the correct endpoints and configurations

## AWS Bedrock Setup

AWS Bedrock models run through your AWS account rather than a direct provider API key. The provider carries the Claude families plus GPT-5.6 Sol/Terra/Luna, Mistral Large, DeepSeek V3.2, and Kimi K2.5. Before selecting one:

1. Enable access to the required model in your AWS Bedrock account.
2. Create AWS credentials with permission to invoke that model.
3. Add `AWS_BEDROCK_CREDENTIALS` as a User Variable or Group Variable using this exact pipe-delimited format:

```text
region|access_key_id|secret_access_key[|session_token]
```

For example:

```text
us-east-1|AKIAEXAMPLE|secret-access-key
```

The optional fourth field is required for temporary credentials that use an AWS session token.

The Claude and GPT-5.6 models are invoked through cross-region inference profiles, so their region must be in a supported inference geography: US/Canada, Europe, Japan, or Australia/New Zealand. Mistral Large, DeepSeek V3.2, and Kimi K2.5 are invoked on demand with the plain Bedrock model id, so they simply need to be enabled in the region you configure.

Bedrock Claude supports vision, reasoning, and native PDF input. It does **not** provide Anthropic's hosted MCP connector or provider-side web search, web fetch, and code-execution tools. PrimeThink can still use separately configured external web-search tools and its sandbox capabilities.

The non-Claude Bedrock models go through Amazon's Converse API. They also have no provider-side builtin tools, and PDFs are handled by extracting their text rather than being passed to the model as a native document. GPT-5.6 on Bedrock is a reasoning model with vision; Mistral Large accepts text only.

!!! warning "Protect the compound credential"
    The setting contains an AWS access key and secret key. Store it only in User or Group Variables, grant the minimum Bedrock permissions required, and never place it in prompts, documents, or capability configuration.

## OpenRouter Setup

OpenRouter is an aggregator: one API key reaches models from several vendors through a single endpoint. Add `OPENROUTER_API_KEY` as a User Variable or Group Variable, then pick a model whose name keeps the upstream vendor in it, for example `openrouter:anthropic/claude-sonnet-5` or `openrouter:google/gemini-3.6-flash`. Because the vendor is part of the model name, searching the model selector for "anthropic" shows both the direct Anthropic models and the routed ones.

A routed model is not identical to the same model bought directly:

- **No hosted MCP.** MCP capabilities are skipped on OpenRouter models. See [MCP Capabilities](/admin/MCP-Capabilities/).
- **Web search** can use OpenRouter's own search plugin, or the external search providers you configure such as Tavily, Perplexity, or Serper, which take precedence. See [Web search on OpenRouter models](/admin/Internal-Capabilities/#web-search-on-openrouter-models) for the cost implications.
- **PDF handling depends on the route.** Where the route reads PDFs natively, the file is sent as a document; otherwise PrimeThink extracts the text first, deliberately, because OpenRouter would otherwise bill its own paid OCR engine.
- **Context and output limits follow the route** that OpenRouter actually serves, which can be smaller than the model's headline figures.
- **The key is required explicitly.** A missing user or group setting is an error rather than a silent fall-back to a platform-wide key, so usage is never billed to the wrong account.

## Future Updates

We are actively working on expanding our supported providers and models. Future updates will include:
- Additional language model providers
- New model versions as they become available
- Enhanced capabilities and specialized models
- Support for more regional endpoints and deployment options

Please check our documentation regularly for updates on newly supported models and providers.
