export const runtime = 'edge'

export async function GET() {
  return new Response(JSON.stringify({ runtime: 'edge' }), {
    headers: {
      'content-type': 'application/json',
    },
  })
} 