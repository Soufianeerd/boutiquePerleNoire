import { NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/features/settings/actions';
import { getAuthenticatedAdmin } from '@/lib/auth/admin';

export async function GET() {
  const settings = await getStoreSettings();
  return NextResponse.json(settings);
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'Non autorisé : privilèges administrateur requis.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = await updateStoreSettings(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result.settings);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Paramètres invalides';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
