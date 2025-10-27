import { QuestionForm } from "@/components/question-form"

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Editar Pregunta</h1>
        <p className="text-muted-foreground mb-8">Modifica la pregunta y sus respuestas</p>

        <QuestionForm questionId={id} />
      </div>
    </div>
  )
}
