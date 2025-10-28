import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

/**
 * POST /api/sessions/[sessionId]/complete
 *
 * Complete a session and automatically evaluate if user passed (>=70% correct).
 * - If passed: awards 1 point to participant and marks as 'completed'
 * - If failed: marks as 'failed' and no points awarded
 *
 * The trigger 'process_session_completion' handles all the logic automatically.
 *
 * Body: { participant_id: string }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const body = await request.json();
    const { participant_id } = body;

    if (!participant_id) {
      return NextResponse.json(
        { error: "participant_id is required to donate points" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseServerClient();

    // Verify session exists and is in progress
    const { data: session, error: sessionError } = await supabase
      .from("qa_sessions")
      .select("id, status, user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: `Session already ${session.status}` },
        { status: 400 }
      );
    }

    // Verify participant exists
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("id, name")
      .eq("id", participant_id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: "Invalid participant_id" },
        { status: 400 }
      );
    }

    // Update session status to 'completed' with participant_id
    // The trigger will automatically:
    // 1. Calculate total_questions and correct_answers
    // 2. Determine if user passed (>=70%)
    // 3. Set status to 'completed' or 'failed'
    // 4. Donate point if passed
    const { data: updatedSession, error: updateError } = await supabase
      .from("qa_sessions")
      .update({
        status: "completed",
        participant_id: participant_id,
      })
      .eq("id", sessionId)
      .select("*, participant:participants(id, name, points)")
      .single();

    if (updateError) {
      // Handle validation error from trigger
      if (updateError.message.includes("Cannot complete session")) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        );
      }
      throw updateError;
    }

    // Return detailed result
    const passed = updatedSession.status === "completed";
    const successRate =
      updatedSession.total_questions > 0
        ? (updatedSession.correct_answers / updatedSession.total_questions) *
          100
        : 0;

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        status: updatedSession.status,
        total_questions: updatedSession.total_questions,
        correct_answers: updatedSession.correct_answers,
        success_rate: successRate.toFixed(2),
        points_donated: updatedSession.points_donated,
        completed_at: updatedSession.completed_at,
      },
      participant: {
        id: participant.id,
        name: participant.name,
        points: updatedSession.participant?.points || 0,
      },
      message: passed
        ? `¡Felicidades! Pasaste con ${successRate.toFixed(
            1
          )}%. Se donó 1 punto a ${participant.name}`
        : `Lo siento, necesitas al menos 70% para aprobar. Obtuviste ${successRate.toFixed(
            1
          )}%`,
    });
  } catch (error) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
