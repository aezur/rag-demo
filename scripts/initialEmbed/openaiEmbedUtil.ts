export async function fetchOpenAIEmbeddings(
  lines: string[],
  apiKey: string,
): Promise<number[][]> {
  if (!apiKey) throw new Error("Missing OpenAI API key");
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-ada-002",
      input: lines,
    }),
  });
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {};
    throw Object.assign(new Error(`OpenAI API error: ${response.status}`), {
      code: response.status,
      ...err,
    });
  }
  const data = (await response.json()) as any;
  if (!data.data || !Array.isArray(data.data))
    throw new Error("Malformed OpenAI response");
  return data.data.map((d: any) => d.embedding);
}
