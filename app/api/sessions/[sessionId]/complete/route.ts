import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

// POST /api/sessions/[sessionId]/complete - Complete a session and award points
export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params

    const supabase = await getSupabaseServerClient()

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("qa_sessions")
      .select("*, participant_id")
      .eq("id", sessionId)
      .single()

    if (sessionError) throw sessionError

    if (!session.participant_id) {
      return NextResponse.json({ error: "No participant assigned to this session" }, { status: 400 })
    }

    // Mark session as completed
    const { error: updateError } = await supabase
      .from("qa_sessions")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", sessionId)

    if (updateError) throw updateError

    // Award 1 point to the participant
    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select("points")
      .eq("id", session.participant_id)
      .single()

    if (participantError) throw participantError

    const { error: pointsError } = await supabase
      .from("participants")
      .update({ points: (participant.points || 0) + 1 })
      .eq("id", session.participant_id)

    if (pointsError) throw pointsError

    return NextResponse.json({
      success: true,
      message: "Session completed and points awarded",
      points_awarded: 1,
    })
  } catch (error) {
    console.error("[v0] Error completing session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
