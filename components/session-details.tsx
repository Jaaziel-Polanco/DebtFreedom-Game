"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface SessionDetail {
  id: string;
  created_at: string;
  completed_at: string | null;
  user: {
    name: string;
    phone: string;
  };
  participant: {
    name: string;
    points: number;
  } | null;
  session_questions: Array<{
    id: string;
    answered_at: string | null;
    question: {
      text: string;
      display_order: number;
    };
    answer: {
      text: string;
      is_correct: boolean;
    } | null;
  }>;
}

export function SessionDetails({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("qa_sessions")
      .select(
        `
        id,
        created_at,
        completed_at,
        user:users(name, phone),
        participant:participants(name, points),
        session_questions(
          id,
          answered_at,
          question:questions(text, display_order),
          answer:answers(text, is_correct)
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error(" Error loading session:", error);
      return;
    }

    // Sort session_questions by display_order
    if (data.session_questions) {
      data.session_questions.sort(
        (a: any, b: any) =>
          (a.question?.display_order || 0) - (b.question?.display_order || 0)
      );
    }

    setSession(data as unknown as SessionDetail);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-center py-8">Cargando detalles de la sesión...</div>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Sesión no encontrada</p>
          <Button onClick={() => router.push("/admin/sessions")}>
            Volver a Sesiones
          </Button>
        </CardContent>
      </Card>
    );
  }

  const answeredQuestions = session.session_questions.filter(
    (sq) => sq.answered_at
  );
  const correctAnswers = answeredQuestions.filter(
    (sq) => sq.answer?.is_correct
  );

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/sessions")}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Sesiones
      </Button>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información de la Sesión</CardTitle>
              <Badge variant={session.completed_at ? "secondary" : "default"}>
                {session.completed_at ? "Completada" : "Activa"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Usuario</div>
                    <div className="font-medium">
                      {session.user.name} ({session.user.phone})
                    </div>
                  </div>
                </div>
                {session.participant && (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Participante
                      </div>
                      <div className="font-medium">
                        {session.participant.name} ({session.participant.points}{" "}
                        puntos)
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Iniciada
                    </div>
                    <div className="font-medium">
                      {formatDate(session.created_at)}
                    </div>
                  </div>
                </div>
                {session.completed_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Completada
                      </div>
                      <div className="font-medium">
                        {formatDate(session.completed_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">
                    {session.session_questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Preguntas
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {correctAnswers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Correctas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {answeredQuestions.length - correctAnswers.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Incorrectas
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Respuestas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {session.session_questions.map((sq, index) => (
                <div key={sq.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium mb-2">{sq.question.text}</div>
                      {sq.answer ? (
                        <div className="flex items-center gap-2">
                          {sq.answer.is_correct ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span
                            className={
                              sq.answer.is_correct
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {sq.answer.text}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline">Sin responder</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
