import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });
  }
  return pineconeClient;
}

export async function queryAssistant(query: string): Promise<{
  context: string;
  citations: Array<{ content: string; reference: string }>;
}> {
  const pc = getPineconeClient();
  const assistantName = process.env.PINECONE_ASSISTANT_NAME || 'portable-spas';
  const assistant = pc.Assistant(assistantName);

  const response = await assistant.chat({
    messages: [
      {
        role: 'user',
        content: `You are a technical expert for Portable Spas New Zealand. Extract and provide relevant technical specifications, features, and details that would be useful for creating an infographic based on the following query. Be concise and factual, focusing on key data points, specifications, and benefits.

Query: ${query}`,
      },
    ],
  });

  const citations = response.citations?.map((citation) => ({
    content: String(citation.position || ''),
    reference: Array.isArray(citation.references)
      ? citation.references.map((r) => String(r)).join(', ')
      : String(citation.references || ''),
  })) || [];

  return {
    context: response.message?.content || '',
    citations,
  };
}
