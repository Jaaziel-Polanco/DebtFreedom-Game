import { ParticipantForm } from "@/components/participant-form"

export default function NewParticipantPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Nuevo Participante</h1>
        <p className="text-muted-foreground mb-8">Crea un nuevo participante para recibir donaciones de puntos</p>

        <ParticipantForm />
      </div>
    </div>
  )
}
