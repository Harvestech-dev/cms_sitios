import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Error fetching products:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 