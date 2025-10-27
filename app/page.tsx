import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, BarChart3, Settings, DollarSign, TrendingUp, Trophy, Gamepad2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-amber-950/20 dark:via-amber-950/40 to-muted relative overflow-hidden">
      {/* Money animation background */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 rotate-12 text-6xl animate-pulse">💰</div>
        <div className="absolute top-40 right-20 -rotate-12 text-5xl animate-pulse" style={{ animationDelay: "1s" }}>💵</div>
        <div className="absolute bottom-40 left-20 rotate-45 text-4xl animate-pulse delay-2000">💸</div>
        <div className="absolute bottom-60 right-40 -rotate-12 text-5xl animate-pulse" style={{ animationDelay: "0.5s" }}>💴</div>
        <div className="absolute top-60 left-1/3 rotate-12 text-6xl animate-pulse" style={{ animationDelay: "1.5s" }}>💶</div>
        <div className="absolute bottom-20 right-1/3 -rotate-45 text-4xl animate-pulse" style={{ animationDelay: "0.7s" }}>💷</div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <Image
                src="/debtfreedom.png"
                alt="DebtFreedom"
                width={200}
                height={200}
                className="rounded-2xl shadow-2xl dark:shadow-amber-500/20"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              DebtFreedom
            </h1>
            <p className="text-2xl font-semibold mb-2 text-yellow-600 dark:text-yellow-500">
              TE HACE MILLONARIO
            </p>
            <p className="text-lg text-muted-foreground text-balance">
              Sistema de Administración del Concurso
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Link href="/admin/questions">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-yellow-500/50 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <CardTitle className="text-yellow-700 dark:text-yellow-400">Preguntas</CardTitle>
                  </div>
                  <CardDescription>Crea y administra preguntas con respuestas múltiples</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg">
                    Gestionar Preguntas
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/participants">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-yellow-500/50 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-lg">
                      <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <CardTitle className="text-yellow-700 dark:text-yellow-400">Participantes</CardTitle>
                  </div>
                  <CardDescription>Administra participantes y sus puntos acumulados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg" variant="secondary">
                    Gestionar Participantes
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/sessions">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-yellow-500/50 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <CardTitle className="text-yellow-700 dark:text-yellow-400">Sesiones</CardTitle>
                  </div>
                  <CardDescription>Monitorea sesiones de juego y respuestas</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg">
                    Ver Sesiones
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/settings">
              <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-yellow-500/50 hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-600/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                    </div>
                    <CardTitle className="text-yellow-700 dark:text-yellow-400">Configuración</CardTitle>
                  </div>
                  <CardDescription>Ajustes del sistema y base de datos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg">
                    Configurar
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <div className="col-span-2">
              <Link href="/admin/local-game">
                <Card className="hover:shadow-xl transition-all cursor-pointer h-full border-2 hover:border-yellow-500/50 hover:scale-105 border-amber-500/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-yellow-500/30 to-amber-600/30 rounded-lg">
                        <Gamepad2 className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
                          🎮 Juego Local
                          <Badge variant="secondary" className="ml-auto">Nuevo</Badge>
                        </CardTitle>
                        <CardDescription>Modo de demostración para jugar localmente con premios personalizados</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg">
                      Configurar y Jugar
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
