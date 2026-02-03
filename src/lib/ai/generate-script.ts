import Anthropic from "@anthropic-ai/sdk";
import type { VideoScript } from "@/types";

interface GenerateScriptParams {
  productName: string;
  description: string;
  price: number;
  currency: string;
  language: string;
}

function buildFallbackScript(params: GenerateScriptParams): VideoScript {
  return {
    hook: params.productName,
    featureLines: [params.description.slice(0, 100)],
    priceCallout: `${params.currency} ${params.price}`,
    cta: "Shop now",
  };
}

export async function generateScript(
  params: GenerateScriptParams
): Promise<VideoScript> {
  const { productName, description, price, currency, language } = params;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const systemPrompt = `You are a creative ad copywriter. Generate a short video advertisement script for a product. Write all text in the language specified by the ISO 639-3 code provided. Respond with JSON only, no markdown fences or extra text. The JSON must have this exact structure:
{
  "hook": "An attention-grabbing opening line",
  "featureLines": ["Feature 1", "Feature 2", "Feature 3"],
  "priceCallout": "A compelling price highlight",
  "cta": "A call to action"
}`;

    const userPrompt = `Product: ${productName}
Description: ${description}
Price: ${currency} ${price}
Language: ${language}

Generate the video ad script as JSON.`;

    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return buildFallbackScript(params);
    }

    const parsed = JSON.parse(textBlock.text) as VideoScript;

    // Validate required fields
    if (
      !parsed.hook ||
      !Array.isArray(parsed.featureLines) ||
      !parsed.priceCallout ||
      !parsed.cta
    ) {
      return buildFallbackScript(params);
    }

    return parsed;
  } catch {
    return buildFallbackScript(params);
  }
}
