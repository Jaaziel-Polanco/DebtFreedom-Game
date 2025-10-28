"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { QuestionWithAnswers } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

export function QuestionsList() {
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    const supabase = getSupabaseBrowserClient();
    const { data: questionsData, error } = await supabase
      .from("questions")
      .select(
        `
        *,
        answers (*)
      `
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(" Error loading questions:", error);
      return;
    }

    setQuestions(questionsData as QuestionWithAnswers[]);
    setLoading(false);
  }

  async function updateQuestionOrder(questionId: string, newOrder: number) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("questions")
      .update({ display_order: newOrder })
      .eq("id", questionId);

    if (error) {
      console.error(" Error updating question order:", error);
      return;
    }

    loadQuestions();
  }

  async function moveQuestionUp(index: number) {
    if (index === 0) return;

    const question = questions[index];
    const prevQuestion = questions[index - 1];

    // Swap display_order
    const tempOrder = question.display_order;
    question.display_order = prevQuestion.display_order;
    prevQuestion.display_order = tempOrder;

    // Update both in database
    await updateQuestionOrder(question.id, question.display_order);
    await updateQuestionOrder(prevQuestion.id, prevQuestion.display_order);

    loadQuestions();
  }

  async function moveQuestionDown(index: number) {
    if (index === questions.length - 1) return;

    const question = questions[index];
    const nextQuestion = questions[index + 1];

    // Swap display_order
    const tempOrder = question.display_order;
    question.display_order = nextQuestion.display_order;
    nextQuestion.display_order = tempOrder;

    // Update both in database
    await updateQuestionOrder(question.id, question.display_order);
    await updateQuestionOrder(nextQuestion.id, nextQuestion.display_order);

    loadQuestions();
  }

  async function toggleActive(questionId: string, currentActive: boolean) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("questions")
      .update({ active: !currentActive })
      .eq("id", questionId);

    if (error) {
      console.error(" Error toggling question:", error);
      return;
    }

    loadQuestions();
  }

  async function deleteQuestion(questionId: string) {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta pregunta? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error(" Error deleting question:", error);
      return;
    }

    loadQuestions();
  }

  if (loading) {
    return <div className="text-center py-8">Cargando preguntas...</div>;
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No hay preguntas creadas aún
          </p>
          <Link href="/admin/questions/new">
            <Button>Crear Primera Pregunta</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 mr-4">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveQuestionUp(index)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveQuestionDown(index)}
                    disabled={index === questions.length - 1}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 border-2 border-primary/20">
                  <span className="text-xl font-bold text-primary">
                    {index + 1}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl">{question.text}</CardTitle>
                  <Badge variant={question.active ? "default" : "secondary"}>
                    {question.active ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <div className="space-y-2 mt-4">
                  {question.answers?.map((answer) => (
                    <div
                      key={answer.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {answer.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={
                          answer.is_correct
                            ? "font-medium"
                            : "text-muted-foreground"
                        }
                      >
                        {answer.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Activa</span>
                  <Switch
                    checked={question.active}
                    onCheckedChange={() =>
                      toggleActive(question.id, question.active)
                    }
                  />
                </div>
                <Link href={`/admin/questions/${question.id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => deleteQuestion(question.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
