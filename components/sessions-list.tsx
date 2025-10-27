"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Clock, CheckCircle2, User, Trophy } from "lucide-react"
import Link from "next/link"

interface SessionWithDetails {
  id: string
  created_at: string
  completed_at: string | null
  user: {
    name: string
    phone: string
  }
  participant: {
    name: string
    points: number
  } | null
}

export function SessionsList() {
  const [sessions, setSessions] = useState<SessionWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from("qa_sessions")
      .select(
        `
        id,
        created_at,
        completed_at,
        user:users(name, phone),
        participant:participants(name, points)
      `,
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error loading sessions:", error)
      return
    }

    setSessions(data as unknown as SessionWithDetails[])
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando sesiones...</div>
  }

  const activeSessions = sessions.filter((s) => !s.completed_at)
  const completedSessions = sessions.filter((s) => s.completed_at)

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function SessionCard({ session }: { session: SessionWithDetails }) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-lg">Sesión #{session.id.slice(0, 8)}</CardTitle>
                <Badge variant={session.completed_at ? "secondary" : "default"}>
                  {session.completed_at ? "Completada" : "Activa"}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    {session.user.name} ({session.user.phone})
                  </span>
                </div>
                {session.participant && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>
                      Donando a: {session.participant.name} ({session.participant.points} pts)
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Iniciada: {formatDate(session.created_at)}</span>
                </div>
                {session.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completada: {formatDate(session.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
            <Link href={`/admin/sessions/${session.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No hay sesiones registradas aún</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3">
        <TabsTrigger value="all">Todas ({sessions.length})</TabsTrigger>
        <TabsTrigger value="active">Activas ({activeSessions.length})</TabsTrigger>
        <TabsTrigger value="completed">Completadas ({completedSessions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4 mt-6">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </TabsContent>

      <TabsContent value="active" className="space-y-4 mt-6">
        {activeSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay sesiones activas</p>
            </CardContent>
          </Card>
        ) : (
          activeSessions.map((session) => <SessionCard key={session.id} session={session} />)
        )}
      </TabsContent>

      <TabsContent value="completed" className="space-y-4 mt-6">
        {completedSessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No hay sesiones completadas</p>
            </CardContent>
          </Card>
        ) : (
          completedSessions.map((session) => <SessionCard key={session.id} session={session} />)
        )}
      </TabsContent>
    </Tabs>
  )
}
