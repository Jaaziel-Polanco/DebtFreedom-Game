import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

// POST /api/sessions - Create a new game session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, participant_id } = body

    if (!user_id) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("qa_sessions")
      .insert({ user_id, participant_id })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Get all active questions with their answers, ordered by display_order
    const { data: questions, error: questionsError } = await supabase
      .from("questions")
      .select(
        `
        id,
        text,
        display_order,
        answers (
          id,
          text,
          is_correct
        )
      `,
      )
      .eq("active", true)
      .order("display_order", { ascending: true })

    if (questionsError) throw questionsError

    // Create session_questions entries for all active questions
    const sessionQuestions = questions.map((q) => ({
      session_id: session.id,
      question_id: q.id,
    }))

    const { error: sqError } = await supabase.from("session_questions").insert(sessionQuestions)

    if (sqError) throw sqError

    // Return session with questions
    return NextResponse.json(
      {
        session,
        questions,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/sessions?session_id=xxx - Get session details
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    const { data: session, error: sessionError } = await supabase
      .from("qa_sessions")
      .select(
        `
        *,
        user:users(*),
        participant:participants(*),
        session_questions(
          *,
          question:questions(*),
          answer:answers(*)
        )
      `,
      )
      .eq("id", sessionId)
      .single()

    if (sessionError) throw sessionError

    // Sort session_questions by display_order
    if (session?.session_questions) {
      session.session_questions.sort((a: any, b: any) => 
        (a.question?.display_order || 0) - (b.question?.display_order || 0)
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("[v0] Error fetching session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
