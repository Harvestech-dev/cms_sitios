import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('components')
      .select('*')
      .order('type');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al cargar componentes:', error);
    return NextResponse.json(
      { error: 'Error al cargar componentes' },
      { status: 500 }
    );
  }
} 