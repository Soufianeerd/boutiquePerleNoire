import { NextResponse } from 'next/server';
import { submitContactInquiry } from '@/features/contact/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitContactInquiry(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ message: result.message }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur interne';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
