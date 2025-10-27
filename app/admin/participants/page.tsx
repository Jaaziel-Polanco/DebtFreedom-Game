import { Suspense } from "react"
import { ParticipantsList } from "@/components/participants-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ParticipantsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gestión de Participantes</h1>
          <p className="text-muted-foreground">Administra participantes y visualiza sus puntos acumulados</p>
        </div>
        <Link href="/admin/participants/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Participante
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Cargando participantes...</div>}>
        <ParticipantsList />
      </Suspense>
    </div>
  )
}
