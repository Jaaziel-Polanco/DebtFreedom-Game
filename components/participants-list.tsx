"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { Participant } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Trophy, Phone } from "lucide-react"
import Link from "next/link"

export function ParticipantsList() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadParticipants()
  }, [])

  async function loadParticipants() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase.from("participants").select("*").order("points", { ascending: false })

    if (error) {
      console.error("[v0] Error loading participants:", error)
      return
    }

    setParticipants(data)
    setLoading(false)
  }

  async function deleteParticipant(participantId: string) {
    if (!confirm("¿Estás seguro de eliminar este participante? Esta acción no se puede deshacer.")) {
      return
    }

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.from("participants").delete().eq("id", participantId)

    if (error) {
      console.error("[v0] Error deleting participant:", error)
      return
    }

    loadParticipants()
  }

  if (loading) {
    return <div className="text-center py-8">Cargando participantes...</div>
  }

  if (participants.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No hay participantes creados aún</p>
          <Link href="/admin/participants/new">
            <Button>Crear Primer Participante</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {participants.map((participant, index) => (
        <Card key={participant.id} className="relative overflow-hidden">
          {index < 3 && (
            <div className="absolute top-0 right-0 w-16 h-16">
              <div
                className={`absolute transform rotate-45 ${
                  index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                } text-white text-xs font-bold py-1 right-[-35px] top-[15px] w-[100px] text-center`}
              >
                #{index + 1}
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-xl mb-1">{participant.name}</div>
                {participant.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-normal">
                    <Phone className="w-3 h-3" />
                    {participant.phone}
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold">{participant.points}</span>
                <span className="text-muted-foreground">puntos</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/participants/${participant.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => deleteParticipant(participant.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
