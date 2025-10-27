"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { MessageSquare, Users, BarChart3, Settings, Home, Gamepad2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/admin/questions", label: "Preguntas", icon: MessageSquare },
  { href: "/admin/participants", label: "Participantes", icon: Users },
  { href: "/admin/sessions", label: "Sesiones", icon: BarChart3 },
  { href: "/admin/local-game", label: "Juego Local", icon: Gamepad2 },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 h-16">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/debtfreedom.png"
              alt="DebtFreedom Logo"
              width={45}
              height={45}
              className="rounded-lg shadow-md"
            />
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                DebtFreedom
              </h1>
              <p className="text-xs text-muted-foreground">TE HACE MILLONARIO</p>
            </div>
          </Link>
          <div className="flex gap-1 ml-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-yellow-900 dark:text-yellow-950 shadow-lg"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
