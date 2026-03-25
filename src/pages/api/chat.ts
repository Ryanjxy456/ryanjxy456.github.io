import type { APIRoute } from 'astro';
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { articleContent, messages } = await request.json();

    const systemPrompt = `你是一个专业的博客助手。请基于以下文章内容回答问题。如果文章未提及，请如实告知。
---
${articleContent}
---`;

    // 组合消息
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // 直接使用原生 fetch 调用 DeepSeek
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        stream: true, // 开启流式
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    // 直接将 DeepSeek 的流式响应转发给前端
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};