import { QuestionForm } from "@/components/question-form"

export default function NewQuestionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Nueva Pregunta</h1>
        <p className="text-muted-foreground mb-8">Crea una nueva pregunta con sus respuestas</p>

        <QuestionForm />
      </div>
    </div>
  )
}
