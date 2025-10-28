"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import type { QuestionWithAnswers } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Save } from "lucide-react";

interface QuestionFormProps {
  questionId?: string;
}

interface AnswerForm {
  id?: string;
  text: string;
  is_correct: boolean;
}

export function QuestionForm({ questionId }: QuestionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [active, setActive] = useState(true);
  const [answers, setAnswers] = useState<AnswerForm[]>([
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ]);

  useEffect(() => {
    if (questionId) {
      loadQuestion();
    }
  }, [questionId]);

  async function loadQuestion() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("questions")
      .select(
        `
        *,
        answers (*)
      `
      )
      .eq("id", questionId)
      .single();

    if (error) {
      console.error(" Error loading question:", error);
      return;
    }

    const question = data as QuestionWithAnswers;
    setQuestionText(question.text);
    setActive(question.active);
    setAnswers(
      question.answers.map((a) => ({
        id: a.id,
        text: a.text,
        is_correct: a.is_correct,
      }))
    );
  }

  function addAnswer() {
    setAnswers([...answers, { text: "", is_correct: false }]);
  }

  function removeAnswer(index: number) {
    setAnswers(answers.filter((_, i) => i !== index));
  }

  function updateAnswer(
    index: number,
    field: keyof AnswerForm,
    value: string | boolean
  ) {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      if (questionId) {
        // Update existing question
        const { error: questionError } = await supabase
          .from("questions")
          .update({ text: questionText, active })
          .eq("id", questionId);

        if (questionError) throw questionError;

        // Delete removed answers
        const existingAnswerIds = answers.filter((a) => a.id).map((a) => a.id);
        const { error: deleteError } = await supabase
          .from("answers")
          .delete()
          .eq("question_id", questionId)
          .not("id", "in", `(${existingAnswerIds.join(",")})`);

        if (deleteError) throw deleteError;

        // Update or insert answers
        for (const answer of answers) {
          if (answer.id) {
            // Update existing answer
            const { error } = await supabase
              .from("answers")
              .update({ text: answer.text, is_correct: answer.is_correct })
              .eq("id", answer.id);

            if (error) throw error;
          } else {
            // Insert new answer
            const { error } = await supabase
              .from("answers")
              .insert({
                question_id: questionId,
                text: answer.text,
                is_correct: answer.is_correct,
              });

            if (error) throw error;
          }
        }
      } else {
        // Get the maximum display_order to set the next one
        const { data: maxOrderData } = await supabase
          .from("questions")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1);

        const nextOrder =
          maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].display_order + 1
            : 0;

        // Create new question
        const { data: newQuestion, error: questionError } = await supabase
          .from("questions")
          .insert({ text: questionText, active, display_order: nextOrder })
          .select()
          .single();

        if (questionError) throw questionError;

        // Insert answers
        const answersToInsert = answers.map((a) => ({
          question_id: newQuestion.id,
          text: a.text,
          is_correct: a.is_correct,
        }));

        const { error: answersError } = await supabase
          .from("answers")
          .insert(answersToInsert);

        if (answersError) throw answersError;
      }

      router.push("/admin/questions");
    } catch (error) {
      console.error(" Error saving question:", error);
      alert("Error al guardar la pregunta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pregunta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Texto de la pregunta</Label>
            <Textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Escribe tu pregunta aquí..."
              required
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="active">Pregunta activa</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Respuestas</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAnswer}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Respuesta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {answers.map((answer, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-3">
                <Input
                  value={answer.text}
                  onChange={(e) => updateAnswer(index, "text", e.target.value)}
                  placeholder="Texto de la respuesta"
                  required
                />
                <div className="flex items-center gap-2">
                  <Switch
                    id={`correct-${index}`}
                    checked={answer.is_correct}
                    onCheckedChange={(checked) =>
                      updateAnswer(index, "is_correct", checked)
                    }
                  />
                  <Label htmlFor={`correct-${index}`}>Respuesta correcta</Label>
                </div>
              </div>
              {answers.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAnswer(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Guardando..." : "Guardar Pregunta"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.push("/admin/questions")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
