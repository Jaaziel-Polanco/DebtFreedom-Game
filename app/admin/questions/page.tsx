import { Suspense } from "react"
import { QuestionsList } from "@/components/questions-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function QuestionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Gestión de Preguntas</h1>
          <p className="text-muted-foreground">Crea y administra preguntas con respuestas múltiples</p>
        </div>
        <Link href="/admin/questions/new">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Pregunta
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="text-center py-8">Cargando preguntas...</div>}>
        <QuestionsList />
      </Suspense>
    </div>
  )
}
