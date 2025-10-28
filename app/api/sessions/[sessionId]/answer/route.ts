import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// POST /api/sessions/[sessionId]/answer - Submit an answer
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { question_id, answer_id } = body;

    if (!question_id || !answer_id) {
      return NextResponse.json(
        { error: "question_id and answer_id are required" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Update session_question with the answer
    const { data, error } = await supabase
      .from("session_questions")
      .update({
        answer_id,
        answered_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .eq("question_id", question_id)
      .select(
        `
        *,
        answer:answers(*)
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      is_correct: data.answer?.is_correct || false,
      session_question: data,
    });
  } catch (error) {
    console.error(" Error submitting answer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
