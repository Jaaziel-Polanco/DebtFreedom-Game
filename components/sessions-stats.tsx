"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, PlayCircle, CheckCircle2, Trophy } from "lucide-react"

interface Stats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  totalUsers: number
}

export function SessionsStats() {
  const [stats, setStats] = useState<Stats>({
    totalSessions: 0,
    activeSessions: 0,
    completedSessions: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const supabase = getSupabaseBrowserClient()

    const [sessionsResult, usersResult] = await Promise.all([
      supabase.from("qa_sessions").select("completed_at"),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ])

    if (sessionsResult.data) {
      const total = sessionsResult.data.length
      const completed = sessionsResult.data.filter((s) => s.completed_at !== null).length
      const active = total - completed

      setStats({
        totalSessions: total,
        activeSessions: active,
        completedSessions: completed,
        totalUsers: usersResult.count || 0,
      })
    }

    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando estadísticas...</div>
  }

  const statsCards = [
    {
      title: "Total Sesiones",
      value: stats.totalSessions,
      icon: PlayCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
    },
    {
      title: "Sesiones Activas",
      value: stats.activeSessions,
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
    },
    {
      title: "Sesiones Completadas",
      value: stats.completedSessions,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
