"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { QuestionWithAnswers, LocalGamePrize } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, ArrowLeft, CheckCircle2, XCircle, DollarSign, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface GameState {
    currentQuestionIndex: number
    selectedAnswers: Record<string, string>
    isComplete: boolean
    totalPrize: number
    answeredQuestions: Record<string, { isCorrect: boolean; prize: number }>
    canTakeMoney: boolean
}

export default function LocalGamePlayPage() {
    const router = useRouter()
    const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])
    const [prizes, setPrizes] = useState<LocalGamePrize[]>([])
    const [gameState, setGameState] = useState<GameState>({
        currentQuestionIndex: 0,
        selectedAnswers: {},
        isComplete: false,
        totalPrize: 0,
        answeredQuestions: {},
        canTakeMoney: false,
    })
    const [loading, setLoading] = useState(true)
    const [showingResult, setShowingResult] = useState(false)
    const [showAnimation, setShowAnimation] = useState(false)
    const [animationType, setAnimationType] = useState<'win' | 'lose' | null>(null)
    const [currentPrizeAmount, setCurrentPrizeAmount] = useState(0)
    const [preSelectedAnswer, setPreSelectedAnswer] = useState<string | null>(null)

    useEffect(() => {
        loadGameData()
    }, [])

    async function loadGameData() {
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

        // Load prizes
        const { data: prizesData } = await supabase
            .from("local_game_prizes")
            .select("*")

        if (prizesData) {
            setPrizes(prizesData as LocalGamePrize[])
        }

        setLoading(false)
    }

    function handleAnswerSelect(questionId: string, answerId: string) {
        // If already selected, it means this is the confirmation click
        if (gameState.selectedAnswers[questionId]) {
            return // Already confirmed, don't do anything
        }

        // If this answer is already pre-selected, confirm it
        if (preSelectedAnswer === answerId) {
            const currentQuestion = questions.find(q => q.id === questionId)
            const selectedAnswer = currentQuestion?.answers.find(a => a.id === answerId)
            const isCorrect = selectedAnswer?.is_correct || false
            const prize = prizes.find(p => p.question_id === questionId)
            const prizeAmount = prize?.prize_amount || 0

            setGameState(prev => ({
                ...prev,
                selectedAnswers: {
                    ...prev.selectedAnswers,
                    [questionId]: answerId,
                },
                answeredQuestions: {
                    ...prev.answeredQuestions,
                    [questionId]: { isCorrect, prize: prizeAmount },
                },
                // Enable "take money" option if answered correctly
                canTakeMoney: isCorrect,
            }))

            // Show animation
            if (isCorrect) {
                setAnimationType('win')
                setCurrentPrizeAmount(prizeAmount)
            } else {
                setAnimationType('lose')
                setCurrentPrizeAmount(prizeAmount)
            }
            setShowAnimation(true)

            // Hide animation after 5 seconds
            setTimeout(() => {
                setShowAnimation(false)
                setAnimationType(null)
            }, 5000)

            // Reset preselection
            setPreSelectedAnswer(null)
        } else {
            // First click - just pre-select
            setPreSelectedAnswer(answerId)
        }
    }

    function handleTakeMoney() {
        // Player chooses to take the money and end the game
        setGameState(prev => ({ ...prev, isComplete: true }))
        setShowingResult(true)
    }

    function handleContinue() {
        // Player chooses to risk it for the next question
        setGameState(prev => ({
            ...prev,
            canTakeMoney: false,
            currentQuestionIndex: prev.currentQuestionIndex + 1,
        }))
    }

    // Removed - now using handleContinue instead

    function handlePrevious() {
        if (gameState.currentQuestionIndex > 0) {
            setGameState(prev => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex - 1,
            }))
        }
    }

    // Removed - now using handleTakeMoney or reaching the end

    // Calculate current prize in real-time and handle losing everything
    useEffect(() => {
        let total = 0
        let hasIncorrect = false

        // Check all answered questions
        Object.values(gameState.answeredQuestions).forEach(({ isCorrect, prize }) => {
            if (!isCorrect) {
                hasIncorrect = true
            } else if (!hasIncorrect) {
                total += prize
            }
        })

        // If any answer is incorrect, reset to 0
        if (hasIncorrect) {
            total = 0
        }

        if (gameState.totalPrize !== total) {
            setGameState(prev => ({ ...prev, totalPrize: total }))
        }
    }, [gameState.answeredQuestions, gameState.totalPrize])

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Cargando juego...</div>
    }

    if (questions.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">No hay preguntas configuradas</p>
                        <Link href="/admin/local-game">
                            <Button>Configurar Juego</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (showingResult) {
        const correctCount = questions.filter(q => {
            const selectedAnswerId = gameState.selectedAnswers[q.id]
            const selectedAnswer = q.answers.find(a => a.id === selectedAnswerId)
            return selectedAnswer?.is_correct
        }).length

        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-amber-950/20 dark:via-amber-950/40 to-muted flex items-center justify-center p-4">
                <Card className="max-w-2xl w-full">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl">¡Juego Completado!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-yellow-600 dark:text-yellow-500 mb-2">
                                ${gameState.totalPrize.toLocaleString()}
                            </div>
                            <p className="text-muted-foreground">Premio Total Acumulado</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="py-4 text-center">
                                    <div className="text-3xl font-bold">{correctCount}</div>
                                    <p className="text-sm text-muted-foreground">Correctas</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="py-4 text-center">
                                    <div className="text-3xl font-bold">{questions.length - correctCount}</div>
                                    <p className="text-sm text-muted-foreground">Incorrectas</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-3">
                            {questions.map((question, index) => {
                                const selectedAnswerId = gameState.selectedAnswers[question.id]
                                const selectedAnswer = question.answers.find(a => a.id === selectedAnswerId)
                                const isCorrect = selectedAnswer?.is_correct
                                const prize = prizes.find(p => p.question_id === question.id)

                                return (
                                    <Card key={question.id} className={isCorrect ? "border-green-500" : "border-red-500"}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                {isCorrect ? (
                                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-6 h-6 text-red-600" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-medium">Pregunta {index + 1}</p>
                                                    <p className="text-sm text-muted-foreground">{question.text}</p>
                                                    {isCorrect && prize && prize.prize_amount > 0 && (
                                                        <p className="text-sm text-yellow-600 dark:text-yellow-500 font-bold mt-1">
                                                            +${prize.prize_amount.toLocaleString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                className="flex-1"
                                onClick={() => {
                                    router.push("/admin/local-game/play")
                                    window.location.reload()
                                }}
                            >
                                Jugar de Nuevo
                            </Button>
                            <Link href="/admin/local-game" className="flex-1">
                                <Button variant="outline" className="w-full">
                                    Configurar Premios
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const currentQuestion = questions[gameState.currentQuestionIndex]
    const selectedAnswerId = gameState.selectedAnswers[currentQuestion.id]
    const progress = ((gameState.currentQuestionIndex + 1) / questions.length) * 100

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-amber-950/20 dark:via-amber-950/40 to-muted relative overflow-hidden">
            {/* Animation Overlay */}
            {showAnimation && (
                <div className={`fixed inset-0 z-50 pointer-events-none flex items-center justify-center ${animationType === 'win' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                    {animationType === 'win' ? (
                        <div className="text-center">
                            <div className="text-8xl mb-6 animate-bounce">💰</div>
                            <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent animate-pulse">
                                +${currentPrizeAmount.toLocaleString()}
                            </div>
                            <div className="text-3xl text-green-500 mt-2 animate-pulse">¡CORRECTO!</div>
                            {/* Confetti and emojis */}
                            <div className="absolute inset-0">
                                {[...Array(30)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute animate-ping"
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                            animationDelay: `${Math.random() * 0.5}s`,
                                            fontSize: `${20 + Math.random() * 20}px`,
                                            color: ['red', 'blue', 'yellow', 'green', 'purple'][Math.floor(Math.random() * 5)],
                                        }}
                                    >
                                        {['🎉', '✨', '⭐', '💵', '🎊'][Math.floor(Math.random() * 5)]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="text-8xl mb-6 animate-bounce">❌</div>
                            <div className="text-5xl font-bold text-red-600 animate-pulse">
                                -${currentPrizeAmount.toLocaleString()}
                            </div>
                            <div className="text-3xl text-red-500 mt-2">INCORRECTO</div>
                            {/* Money flying away animation with rotation */}
                            <div className="absolute inset-0">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute text-4xl animate-bounce"
                                        style={{
                                            left: `${50 + (Math.random() - 0.5) * 100}%`,
                                            top: `${50 + (Math.random() - 0.5) * 100}%`,
                                            animationDelay: `${Math.random() * 0.3}s`,
                                            transform: `rotate(${Math.random() * 360}deg)`,
                                            fontSize: `${20 + Math.random() * 15}px`,
                                        }}
                                    >
                                        💸
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="h-screen w-full overflow-hidden p-3">
                <div className="grid grid-cols-12 gap-3 h-full">
                    {/* Left Column - Logo, Phone, Money */}
                    <div className="col-span-3 flex flex-col gap-2">
                        <Card className="bg-black/50 backdrop-blur-sm">
                            <CardContent className="p-3 flex flex-col items-center text-center gap-1.5">
                                <Image
                                    src="/debtfreedom.png"
                                    alt="DebtFreedom"
                                    width={90}
                                    height={90}
                                    className="rounded-lg"
                                />
                                <h2 className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                                    DebtFreedom
                                </h2>
                                <p className="text-sm text-yellow-600 dark:text-yellow-500">TE HACE MILLONARIO</p>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg">
                                    <Phone className="w-5 h-5 text-white" />
                                    <p className="text-base font-bold text-white">1-800-854-3030</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/30">
                            <CardContent className="p-3 text-center">
                                <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-1" />
                                <p className="text-sm text-muted-foreground mb-1">Dinero Acumulado</p>
                                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500">
                                    ${gameState.totalPrize.toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Center Column - Current Question */}
                    <div className="col-span-6 flex flex-col gap-2">
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Pregunta {gameState.currentQuestionIndex + 1}/{questions.length}</span>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-yellow-600" />
                                        <span className="text-lg font-bold text-yellow-600">${prizes.find(p => p.question_id === currentQuestion.id)?.prize_amount.toLocaleString() || "0"}</span>
                                    </div>
                                </div>
                                <Progress value={progress} className="h-1.5" />
                                <CardTitle className="text-2xl mt-3 leading-tight">{currentQuestion.text}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-3">
                                <div className="space-y-2">
                                    {currentQuestion.answers.map((answer) => {
                                        const isSelected = selectedAnswerId === answer.id
                                        const isPreSelected = preSelectedAnswer === answer.id
                                        return (
                                            <Button
                                                key={answer.id}
                                                variant={isSelected ? "default" : "outline"}
                                                size="default"
                                                className={`w-full justify-start h-auto py-3 px-4 text-base ${isSelected
                                                    ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                                                    : isPreSelected
                                                        ? "bg-yellow-500/20 border-yellow-500 border-2"
                                                        : ""
                                                    }`}
                                                onClick={() => handleAnswerSelect(currentQuestion.id, answer.id)}
                                            >
                                                {answer.text}
                                                {isPreSelected && !isSelected && <span className="ml-2 text-sm">(click para confirmar)</span>}
                                            </Button>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        {gameState.canTakeMoney && (
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleTakeMoney}
                                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 text-base font-bold"
                                >
                                    🏆 TOMAR ${gameState.totalPrize.toLocaleString()}
                                </Button>
                                <Button
                                    onClick={handleContinue}
                                    className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 py-3 text-base font-bold"
                                >
                                    ⚠️ ARRIESGAR TODO
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Metas (Next Prizes) */}
                    <div className="col-span-3 flex flex-col gap-2">
                        {/* Phone Number Card */}
                        <Card className="bg-gradient-to-r from-yellow-500 to-amber-600">
                            <CardContent className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <Phone className="w-5 h-5 text-white" />
                                    <p className="text-sm font-semibold text-white">Llama Ahora</p>
                                </div>
                                <p className="text-2xl font-bold text-white">1-800-854-3030</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/50 backdrop-blur-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Metas</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2">
                                <div className="space-y-1.5 max-h-80 overflow-y-auto">
                                    {questions.map((q, idx) => {
                                        const prize = prizes.find(p => p.question_id === q.id)
                                        const isCurrent = idx === gameState.currentQuestionIndex
                                        const isPassed = idx < gameState.currentQuestionIndex

                                        return (
                                            <div
                                                key={q.id}
                                                className={`p-2 rounded ${isCurrent
                                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white'
                                                    : isPassed
                                                        ? 'bg-green-500/20 border border-green-500'
                                                        : 'bg-muted border'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold">Meta {idx + 1}</span>
                                                    <span className="font-bold text-sm">${prize?.prize_amount.toLocaleString() || "0"}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        <Link href="/admin/local-game">
                            <Button variant="ghost" className="w-full" size="default">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

