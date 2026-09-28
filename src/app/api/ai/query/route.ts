import { NextRequest } from 'next/server';
import { generateOperationalAIResponse } from '@/lib/services/ai-service';
import { apiSuccess, apiError, handleApiError } from '@/lib/api-response';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = typeof body?.query === 'string' ? body.query.trim() : '';

    if (!query) {
      return apiError('Missing required field "query"', 'VALIDATION_ERROR', 400);
    }

    const reply = await generateOperationalAIResponse(query);
    return apiSuccess({ reply });
  } catch (error: unknown) {
    return handleApiError(error, 'Failed to process operational query', 'DATABASE_ERROR');
  }
}
