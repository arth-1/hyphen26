import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Create or resume form session
export async function POST(request: NextRequest) {
  try {
    const { templateId, userId, language } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    // Check for existing incomplete session
    const { data: existingSession } = await supabaseAdmin
      .from('form_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('template_id', templateId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSession) {
      return NextResponse.json(existingSession);
    }

    // Create new session
    const { data: newSession, error } = await supabaseAdmin
      .from('form_sessions')
      .insert({
        user_id: userId,
        template_id: templateId,
        language: language || 'hi',
        current_field_index: 0,
        answers: {},
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json(newSession);
  } catch (error) {
    console.error('Form session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update form session
export async function PATCH(request: NextRequest) {
  try {
    const { sessionId, answers, currentIndex, status } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Server not ready' }, { status: 500 });
    }

    const updates: Record<string, string | number | Record<string, unknown>> = {};
    
    if (answers !== undefined) updates.answers = answers;
    if (currentIndex !== undefined) updates.current_field_index = currentIndex;
    if (status !== undefined) updates.status = status;
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('form_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('Session update error:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Form session update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
