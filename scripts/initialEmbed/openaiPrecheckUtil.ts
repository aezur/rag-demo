export async function openaiPrecheck(
  apiKey: string,
): Promise<{ ok: boolean; status: number; message: string }> {
  if (!apiKey)
    return {
      ok: false,
      status: 401,
      message: "Missing OPENAI_API_KEY env var",
    };
  // Use a harmless request to /v1/models to check key and quota
  let resp: Response;
  try {
    resp = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    return {
      ok: false,
      status: 0,
      message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  if (resp.status === 401)
    return {
      ok: false,
      status: 401,
      message: "Invalid or missing OpenAI API key",
    };
  if (resp.status === 429)
    return { ok: false, status: 429, message: "Rate limit or quota exceeded" };
  if (!resp.ok)
    return {
      ok: false,
      status: resp.status,
      message: `OpenAI error: ${resp.status}`,
    };
  return {
    ok: true,
    status: 200,
    message: "OpenAI API key valid and quota available",
  };
}
