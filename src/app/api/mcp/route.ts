import { NextResponse, type NextRequest } from 'next/server';
import { getAllBlogPosts } from '@/lib/blog';
import { EBOOKS } from '@/lib/library-data';
import { scanPrompt } from '@/lib/guarddog/scanner';

/**
 * WebMCP Endpoint — /api/mcp
 * Implements Model Context Protocol (JSON-RPC 2.0) for nirvandham.in
 * Allows AI assistants to interact with the site as structured tools.
 *
 * Spec: https://modelcontextprotocol.io/
 */

// ─── Tool Definitions ──────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'ask_ai_guide',
    description: 'Ask the Nirvan Dham AI spiritual guide a question about Advaita Vedanta, Aadisatv teachings, awareness, Maya, meditation, or self-inquiry.',
    inputSchema: {
      type: 'object',
      properties: {
        question: { type: 'string', description: 'The spiritual question to ask', maxLength: 500 },
      },
      required: ['question'],
    },
  },
  {
    name: 'get_teachings',
    description: 'Get a list of blog posts / teachings from Nirvan Dham.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of posts to return (default 10)', default: 10 },
      },
    },
  },
  {
    name: 'get_library',
    description: 'Get a list of books and ebooks available in the Nirvan Dham library.',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max number of books to return (default 10)', default: 10 },
      },
    },
  },
  {
    name: 'get_paths',
    description: 'Get the 3 Sadhana learning paths: Beginner, Intermediate, and Expert.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'site_info',
    description: 'Get general information about Nirvan Dham — what it is, what it offers, and how to get started.',
    inputSchema: { type: 'object', properties: {} },
  },
];

// ─── Tool Handlers ─────────────────────────────────────────────────────────────

async function handleAskAiGuide(args: { question?: string }) {
  const question = args.question?.trim();
  if (!question || question.length < 3) {
    return { error: 'Please provide a question of at least 3 characters.' };
  }

  // Guard: prompt injection scan
  const threat = scanPrompt(question);
  if (threat.detected) {
    return { error: 'This question cannot be processed.' };
  }

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://nirvandham.in';
    const res = await fetch(`${base}/api/ai-guide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-mcp-source': 'true' },
      body: JSON.stringify({ question, source: 'mcp' }),
    });
    const data = await res.json();
    return { answer: data.answer ?? data.error ?? 'No response available.' };
  } catch {
    return { error: 'AI guide is temporarily unavailable.' };
  }
}

function handleGetTeachings(args: { limit?: number }) {
  const limit = Math.min(args.limit ?? 10, 50);
  const posts = getAllBlogPosts().slice(0, limit);
  return {
    total: posts.length,
    teachings: posts.map((p) => ({
      title: p.hi.title,
      titleEn: p.en.title,
      slug: p.slug,
      excerpt: p.hi.excerpt,
      url: `https://nirvandham.in/blog/${p.slug}`,
      tags: p.tags,
    })),
  };
}

function handleGetLibrary(args: { limit?: number }) {
  const limit = Math.min(args.limit ?? 10, 50);
  const books = EBOOKS.filter((b) => !b.isPlaceholder).slice(0, limit);
  return {
    total: books.length,
    books: books.map((b) => ({
      titleEn: b.titleEnglish,
      titleHi: b.titleHindi,
      slug: b.slug,
      url: `https://nirvandham.in/library/${b.slug}`,
    })),
  };
}

function handleGetPaths() {
  return {
    paths: [
      {
        level: 'Beginner',
        description: 'Guided meditation, breath awareness, and first glimpses of inner stillness.',
        url: 'https://nirvandham.in/guided-meditation',
      },
      {
        level: 'Intermediate',
        description: 'Self-inquiry, witness consciousness, understanding Maya and ego.',
        url: 'https://nirvandham.in/nirvan-sutra',
      },
      {
        level: 'Expert',
        description: 'Advaita Vedanta, non-duality, direct seeing — Who am I?',
        url: 'https://nirvandham.in/course',
      },
    ],
  };
}

function handleSiteInfo() {
  return {
    name: 'Nirvan Dham',
    url: 'https://nirvandham.in',
    description:
      'A living digital ashram for seekers of awareness, self-inquiry, Advaita Vedanta, and Aadisatv\'s teachings. Offers teachings, books, courses, guided meditations, and an AI spiritual guide.',
    teacher: 'Aadisatv',
    offerings: [
      'Blog & Teachings',
      'Library (17+ books)',
      'Nirvan Sutra Course',
      'Guided Meditation Audio',
      'AI Spiritual Guide',
      'Nirvan Shakti Snan Program',
      'One-on-one Guidance',
    ],
    contact: 'https://nirvandham.in/spiritual-guidance',
  };
}

// ─── MCP Request Handler ───────────────────────────────────────────────────────

type McpRequest = {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  let body: McpRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 });
  }

  const { id, method, params } = body;

  // MCP protocol methods
  if (method === 'tools/list') {
    return NextResponse.json({ jsonrpc: '2.0', id, result: { tools: TOOLS } });
  }

  if (method === 'tools/call') {
    const toolName = (params?.name as string) ?? '';
    const args = (params?.arguments as Record<string, unknown>) ?? {};

    let result: unknown;
    try {
      switch (toolName) {
        case 'ask_ai_guide':
          result = await handleAskAiGuide(args as { question?: string });
          break;
        case 'get_teachings':
          result = handleGetTeachings(args as { limit?: number });
          break;
        case 'get_library':
          result = handleGetLibrary(args as { limit?: number });
          break;
        case 'get_paths':
          result = handleGetPaths();
          break;
        case 'site_info':
          result = handleSiteInfo();
          break;
        default:
          return NextResponse.json({
            jsonrpc: '2.0', id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` },
          });
      }
    } catch (err) {
      return NextResponse.json({
        jsonrpc: '2.0', id,
        error: { code: -32603, message: 'Internal error', data: String(err) },
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0', id,
      result: { content: [{ type: 'text', text: JSON.stringify(result) }] },
    });
  }

  // Unknown method
  return NextResponse.json({
    jsonrpc: '2.0', id,
    error: { code: -32601, message: `Method not found: ${method}` },
  });
}

// MCP discovery — GET returns tool manifest
export async function GET() {
  return NextResponse.json({
    name: 'nirvan-dham-mcp',
    version: '1.0.0',
    description: 'Nirvan Dham WebMCP — AI-accessible interface to spiritual teachings, library, courses, and guidance.',
    tools: TOOLS,
    endpoint: 'https://nirvandham.in/api/mcp',
    protocol: 'MCP/1.0 JSON-RPC 2.0',
  });
}
