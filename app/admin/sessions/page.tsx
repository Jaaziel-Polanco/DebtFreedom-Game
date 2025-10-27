import { Suspense } from "react"
import { SessionsList } from "@/components/sessions-list"
import { SessionsStats } from "@/components/sessions-stats"

export default function SessionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Monitoreo de Sesiones</h1>
        <p className="text-muted-foreground">Visualiza sesiones activas, historial y estadísticas de juego</p>
      </div>

      <Suspense fallback={<div className="text-center py-8">Cargando estadísticas...</div>}>
        <SessionsStats />
      </Suspense>

      <div className="mt-8">
        <Suspense fallback={<div className="text-center py-8">Cargando sesiones...</div>}>
          <SessionsList />
        </Suspense>
      </div>
    </div>
  )
}
