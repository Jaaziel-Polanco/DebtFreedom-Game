import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, Code, FileText } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground mb-8">Ajustes del sistema y recursos</p>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Base de Datos</CardTitle>
                  <CardDescription>Configuración de Supabase</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Para configurar la conexión a Supabase, agrega las siguientes variables de entorno en tu proyecto:
              </p>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <div>NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key</div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Ejecuta los scripts SQL en tu base de datos de Supabase:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <code className="bg-muted px-2 py-1 rounded">scripts/01-create-tables.sql</code> - Crea las tablas necesarias
                  </li>
                  <li>
                    <code className="bg-muted px-2 py-1 rounded">scripts/02-add-display-order.sql</code> - Agrega el campo de orden (solo si ya tienes una base de datos existente)
                  </li>
                </ul>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-chart-2/10 rounded-lg">
                  <Code className="w-6 h-6 text-chart-2" />
                </div>
                <div>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>Integración con WhatsApp</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Los endpoints API están disponibles para integración con el cliente de WhatsApp. Consulta la
                documentación completa para más detalles.
              </p>
              <Link href="/API_DOCUMENTATION.md" target="_blank">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Ver Documentación API
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versión:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework:</span>
                  <span className="font-medium">Next.js 16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base de Datos:</span>
                  <span className="font-medium">Supabase (PostgreSQL)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
