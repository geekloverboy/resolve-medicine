// Use Node.js runtime for API routes
export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are a medicine name understanding engine.

Your only task is to identify what medicine the user most likely intended.

Rules:
- Do NOT explain what the medicine does
- Do NOT give medical advice
- Do NOT calculate risk or burden
- Do NOT invent or guess medicines that don't exist
- Be conservative when uncertain

Task:
Given a medicine name string, return the most likely canonical medicine ID used in a medical knowledge database.

Return JSON ONLY in this format:
{
  "canonical_id": string | "unknown",
  "normalized_name": string,
  "confidence": number
}

The confidence should be:
- 0.9-1.0 for exact matches or very common medicines
- 0.7-0.89 for likely matches with minor variations
- 0.4-0.69 for uncertain but plausible matches
- 0.0-0.39 for very uncertain matches
- Use "unknown" for canonical_id if you cannot identify the medicine

Examples:
Input: "paracetamol" -> {"canonical_id": "paracetamol", "normalized_name": "Paracetamol", "confidence": 0.98}
Input: "tylenol" -> {"canonical_id": "paracetamol", "normalized_name": "Paracetamol (Tylenol)", "confidence": 0.95}
Input: "ibuprofin" -> {"canonical_id": "ibuprofen", "normalized_name": "Ibuprofen", "confidence": 0.92}
Input: "xyzabc123" -> {"canonical_id": "unknown", "normalized_name": "Unknown", "confidence": 0.1}`;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
  
  if (init?.headers) {
    Object.assign(headers, init.headers);
  }
  
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers,
  });
}

function extractJsonFromContent(
  content: string,
  medicineName: string,
): { canonical_id: string; normalized_name: string; confidence: number } {
  let parsed: unknown;

  try {
    const match = content.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("No JSON found");
    parsed = JSON.parse(match[0]);
  } catch {
    return {
      canonical_id: "unknown",
      normalized_name: medicineName,
      confidence: 0.3,
    };
  }

  const parsedObj = parsed as {
    canonical_id?: unknown;
    normalized_name?: unknown;
    confidence?: unknown;
  };

  const canonical_id =
    typeof parsedObj?.canonical_id === "string"
      ? parsedObj.canonical_id
      : "unknown";

  const normalized_name =
    typeof parsedObj?.normalized_name === "string"
      ? parsedObj.normalized_name
      : medicineName;

  let confidence: number;
  if (typeof parsedObj?.confidence === "number") {
    confidence = parsedObj.confidence;
  } else if (canonical_id === "unknown") {
    confidence = 0.3;
  } else {
    confidence = 0.5;
  }

  confidence = Math.max(0, Math.min(confidence, 1));

  return { canonical_id, normalized_name, confidence };
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => null);
    const medicineName = body?.medicineName;

    if (!medicineName || typeof medicineName !== "string") {
      return jsonResponse(
        { error: "Medicine name is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        { error: "OPENROUTER_API_KEY is not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : "http://localhost:3000",
          "X-Title": "Medicine Burden Visualizer",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          temperature: 0,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Identify this medicine: "${medicineName}"` },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");

      if (response.status === 429) {
        return jsonResponse(
          { error: "Rate limit exceeded. Please try again shortly." },
          { status: 429 },
        );
      }

      if (response.status === 402) {
        return jsonResponse(
          { error: "Service temporarily unavailable. Please try again later." },
          { status: 402 },
        );
      }

      return jsonResponse(
        {
          error: "Failed to reach OpenRouter",
          status: response.status,
          details: errorText || undefined,
        },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content: string | undefined =
      data?.choices?.[0]?.message?.content;

    if (!content) {
      return jsonResponse(
        { error: "No response from AI" },
        { status: 502 },
      );
    }

    const result = extractJsonFromContent(content, medicineName);
    return jsonResponse(result, { status: 200 });

  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to resolve medicine name",
      },
      { status: 500 },
    );
  }
}
