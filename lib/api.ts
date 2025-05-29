export async function streamMessage(content: string): Promise<EventSource> {
    const source = new EventSource(`/api/chat-stream?content=${encodeURIComponent(content)}`);
    return source;
  } 