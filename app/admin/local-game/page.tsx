"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { LocalGamePrize, QuestionWithAnswers } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, DollarSign, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LocalGameConfigPage() {
    const router = useRouter()
    const [prizes, setPrizes] = useState<LocalGamePrize[]>([])
    const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const supabase = getSupabaseBrowserClient()

        // Load active questions
        const { data: questionsData, error: questionsError } = await supabase
            .from("questions")
            .select(
                `
        *,
        answers (*)
      `,
            )
            .eq("active", true)
            .order("display_order", { ascending: true })

        if (questionsError) {
            console.error("[v0] Error loading questions:", questionsError)
            return
        }

        setQuestions(questionsData as QuestionWithAnswers[])

        // Load existing prizes
        const { data: prizesData, error: prizesError } = await supabase
            .from("local_game_prizes")
            .select("*")

        if (prizesError) {
            console.error("[v0] Error loading prizes:", prizesError)
        } else {
            setPrizes(prizesData as LocalGamePrize[])
        }

        setLoading(false)
    }

    async function savePrize(questionId: string, amount: number) {
        const supabase = getSupabaseBrowserClient()

        const { error } = await supabase
            .from("local_game_prizes")
            .upsert(
                { question_id: questionId, prize_amount: amount },
                { onConflict: "question_id" }
            )

        if (error) {
            console.error("[v0] Error saving prize:", error)
            alert("Error al guardar el premio")
            return
        }

        await loadData()
    }

    async function handleSaveAll() {
        setSaving(true)
        await loadData()
        setSaving(false)
        alert("¡Premios guardados exitosamente!")
    }

    function getPrizeForQuestion(questionId: string) {
        return prizes.find(p => p.question_id === questionId)
    }

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Cargando configuración...</div>
    }

    if (questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">No hay preguntas activas disponibles</p>
                        <Link href="/admin/questions/new">
                            <Button>Crear Primera Pregunta</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Juego Local - Configuración de Premios</h1>
                <p className="text-muted-foreground">
                    Configura los premios para cada pregunta del juego local
                </p>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                                Configurar Premios por Pregunta
                            </CardTitle>
                            <CardDescription>Establece el monto del premio para cada pregunta activa</CardDescription>
                        </div>
                        <Link href="/admin/local-game/play">
                            <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700">
                                <Play className="w-4 h-4 mr-2" />
                                Iniciar Juego
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
            </Card>

            <div className="space-y-4">
                {questions.map((question, index) => {
                    const prize = getPrizeForQuestion(question.id)
                    return (
                        <Card key={question.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold">
                                                {index + 1}
                                            </div>
                                            <CardTitle>{question.text}</CardTitle>
                                        </div>
                                        <CardDescription>Pregunta {index + 1} de {questions.length}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4 min-w-[250px]">
                                        <div className="flex-1">
                                            <Label htmlFor={`prize-${question.id}`} className="text-sm">Premio ($)</Label>
                                            <Input
                                                id={`prize-${question.id}`}
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                defaultValue={prize?.prize_amount || 0}
                                                className="mt-1"
                                                onBlur={(e) => {
                                                    const amount = parseFloat(e.target.value) || 0
                                                    if (amount > 0) {
                                                        savePrize(question.id, amount)
                                                    }
                                                }}
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const input = document.getElementById(`prize-${question.id}`) as HTMLInputElement
                                                const amount = parseFloat(input.value) || 0
                                                if (amount > 0) {
                                                    savePrize(question.id, amount)
                                                }
                                            }}
                                        >
                                            <Save className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    )
                })}
            </div>

            <div className="mt-8 flex justify-center">
                <Button
                    size="lg"
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700"
                    onClick={handleSaveAll}
                    disabled={saving}
                >
                    Guardar Todos los Premios
                </Button>
            </div>
        </div>
    )
}

