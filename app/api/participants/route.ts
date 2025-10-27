import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase-server"

// GET /api/participants - Get all participants with their points
export async function GET() {
  try {
    const supabase = await getSupabaseServerClient()

    const { data, error } = await supabase.from("participants").select("*").order("points", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching participants:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
