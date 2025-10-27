import { ParticipantForm } from "@/components/participant-form"

export default async function EditParticipantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Editar Participante</h1>
        <p className="text-muted-foreground mb-8">Modifica la información del participante</p>

        <ParticipantForm participantId={id} />
      </div>
    </div>
  )
}
