# Resumen de Implementación: Sistema de Donación de Puntos con Evaluación Automática

## 📋 Objetivo
Implementar un sistema donde los usuarios juegan respondiendo preguntas y, al finalizar, pueden donar puntos a participantes solo si aprueban con al menos 70% de respuestas correctas.

## 🎯 Reglas del Sistema

1. **Umbral de Aprobación:** Usuario debe responder correctamente ≥70% de las preguntas
2. **Donación de Puntos:**
   - **Aprobado (≥70%):** → 1 punto donado al participante seleccionado
   - **Reprobado (<70%):** → 0 puntos donados
3. **Cálculo Automático:** Todo el proceso de evaluación y donación se maneja mediante triggers en la base de datos
4. **Selección de Beneficiario:** El usuario elige a qué participante donar después de completar las preguntas

## 🔧 Cambios Implementados

### 1. Migración de Base de Datos

**Archivo:** `scripts/02-add-session-completion-logic.sql`

#### Nuevas Columnas en `qa_sessions`:
```sql
- status VARCHAR(20)           -- 'in_progress', 'completed', 'failed'
- total_questions INTEGER      -- Total de preguntas respondidas
- correct_answers INTEGER      -- Número de respuestas correctas
- points_donated INTEGER       -- Puntos donados (1 o 0)
```

#### Triggers Creados:

**1. `trigger_process_session_completion`**
- Se ejecuta BEFORE UPDATE en `qa_sessions`
- Calcula automáticamente el porcentaje de respuestas correctas
- Determina si el usuario pasó (≥70%) o falló (<70%)
- Dona automáticamente el punto al participante si pasó
- Actualiza todos los campos relevantes

**Lógica del Trigger:**
```
1. Usuario actualiza session con status='completed' y participant_id
2. Trigger cuenta preguntas totales y correctas
3. Calcula: success_rate = (correctas / totales) * 100
4. Si success_rate >= 70%:
   - status → 'completed'
   - points_donated → 1
   - participants.points += 1
   - completed_at → NOW()
5. Si success_rate < 70%:
   - status → 'failed'
   - points_donated → 0
   - completed_at → NULL
```

**2. `trigger_validate_session_completion`**
- Valida que se haya seleccionado un `participant_id` antes de completar
- Previene completar sesiones sin beneficiario

#### Vista Creada:

**`session_statistics`**
Vista consolidada que muestra:
- Información del usuario y participante
- Estadísticas de la sesión
- Success rate calculado
- Puntos donados

### 2. Tipos TypeScript Actualizados

**Archivo:** `lib/types.ts`

```typescript
// Nuevo tipo para estado de sesión
export type SessionStatus = 'in_progress' | 'completed' | 'failed'

// Interface actualizada
export interface QASession {
  id: string
  user_id: string
  participant_id: string | null
  status: SessionStatus              // ⭐ Nuevo
  total_questions: number            // ⭐ Nuevo
  correct_answers: number            // ⭐ Nuevo
  points_donated: number             // ⭐ Nuevo
  created_at: string
  completed_at: string | null
}

// Nueva interface para estadísticas
export interface SessionStatistics {
  session_id: string
  user_id: string
  participant_id: string | null
  user_name: string
  user_phone: string
  participant_name: string | null
  status: SessionStatus
  total_questions: number
  correct_answers: number
  success_rate: number
  points_donated: number
  created_at: string
  completed_at: string | null
}
```

### 3. API Route Actualizada

**Archivo:** `app/api/sessions/[sessionId]/complete/route.ts`

#### Cambios Principales:

**Antes:**
- Recibía sesión sin validación de porcentaje
- Donaba punto manualmente sin verificar desempeño
- No validaba participant_id

**Después:**
```typescript
POST /api/sessions/{sessionId}/complete
Body: { participant_id: "uuid" }

// Nueva lógica:
1. Valida que participant_id esté presente
2. Verifica que sesión esté en 'in_progress'
3. Actualiza status='completed' y participant_id
4. El trigger automáticamente:
   - Calcula success_rate
   - Dona punto si ≥70%
   - Marca como 'failed' si <70%
5. Retorna resultado detallado con estadísticas
```

**Respuesta Exitosa (Aprobado):**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "completed",
    "total_questions": 10,
    "correct_answers": 8,
    "success_rate": "80.00",
    "points_donated": 1,
    "completed_at": "2024-01-01T00:00:00Z"
  },
  "participant": {
    "id": "uuid",
    "name": "John Doe",
    "points": 16
  },
  "message": "¡Felicidades! Pasaste con 80.0%. Se donó 1 punto a John Doe"
}
```

**Respuesta Exitosa (Reprobado):**
```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "failed",
    "total_questions": 10,
    "correct_answers": 6,
    "success_rate": "60.00",
    "points_donated": 0,
    "completed_at": null
  },
  "participant": {
    "id": "uuid",
    "name": "John Doe",
    "points": 15
  },
  "message": "Lo siento, necesitas al menos 70% para aprobar. Obtuviste 60.0%"
}
```

### 4. Documentación Actualizada

**Archivo:** `API_DOCUMENTATION.md`

- Actualizado endpoint `/api/sessions/{sessionId}/complete`
- Documentado nuevo flujo de trabajo
- Agregada sección "Important Rules" explicando las reglas del sistema
- Actualizado "Typical Flow" para reflejar selección de participante al final

**Archivo:** `scripts/README.md` (Nuevo)

- Guía completa de migraciones
- Explicación del sistema de triggers
- Instrucciones de ejecución
- Proceso de rollback
- Verificación post-migración

## 🔄 Flujo Completo del Usuario

```
1. Usuario inicia sesión
   └─> POST /api/sessions { user_id }
       └─> Recibe session_id y preguntas

2. Usuario responde preguntas
   └─> POST /api/sessions/{sessionId}/answer
       └─> Por cada pregunta

3. Usuario completa todas las preguntas
   └─> GET /api/participants
       └─> Lista de participantes para donar

4. Usuario selecciona beneficiario
   └─> POST /api/sessions/{sessionId}/complete { participant_id }
       └─> Trigger evalúa automáticamente:
           ├─> ≥70% → status='completed', dona 1 punto
           └─> <70% → status='failed', dona 0 puntos

5. Usuario recibe resultado
   └─> Mensaje indicando si aprobó o falló
   └─> Puntos del participante actualizados
```

## 🎨 Ventajas de la Implementación

### 1. **Integridad de Datos**
- Los triggers garantizan que los cálculos sean siempre precisos
- No hay posibilidad de inconsistencia entre cálculos y donaciones

### 2. **Atomicidad**
- Toda la lógica de evaluación y donación ocurre en una sola transacción
- Si algo falla, todo se revierte (rollback automático)

### 3. **Rendimiento**
- Los cálculos se realizan a nivel de base de datos (más rápido)
- No hay múltiples queries desde la aplicación

### 4. **Mantenibilidad**
- Lógica de negocio centralizada en la base de datos
- Fácil de auditar y modificar el umbral de aprobación

### 5. **Seguridad**
- El usuario no puede manipular los puntos directamente
- Todo se calcula en el servidor basado en respuestas registradas

## 📊 Consultas Útiles

### Ver Estadísticas de Todas las Sesiones
```sql
SELECT * FROM session_statistics 
ORDER BY created_at DESC;
```

### Ver Sesiones Aprobadas vs Reprobadas
```sql
SELECT 
  status,
  COUNT(*) as total_sessions,
  AVG(success_rate) as avg_success_rate,
  SUM(points_donated) as total_points_donated
FROM session_statistics
GROUP BY status;
```

### Top Participantes por Puntos
```sql
SELECT 
  p.name,
  p.points,
  COUNT(qs.id) as sessions_received
FROM participants p
LEFT JOIN qa_sessions qs ON p.id = qs.participant_id AND qs.status = 'completed'
GROUP BY p.id, p.name, p.points
ORDER BY p.points DESC
LIMIT 10;
```

### Rendimiento de un Usuario Específico
```sql
SELECT 
  user_name,
  COUNT(*) as total_sessions,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as passed,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
  AVG(success_rate) as avg_success_rate
FROM session_statistics
WHERE user_id = 'uuid-del-usuario'
GROUP BY user_name;
```

## 🚀 Próximos Pasos

1. **Ejecutar Migraciones:**
   ```bash
   # Conectar a Supabase y ejecutar:
   # 1. scripts/01-create-tables.sql (si no está hecho)
   # 2. scripts/02-add-session-completion-logic.sql
   ```

2. **Actualizar Frontend:**
   - Implementar pantalla de selección de participante
   - Mostrar resultado de evaluación (aprobado/reprobado)
   - Actualizar componentes para usar nuevos tipos TypeScript

3. **Testing:**
   - Probar con diferentes porcentajes de respuestas correctas
   - Verificar donación automática de puntos
   - Validar que sesiones no se puedan completar dos veces

4. **Monitoreo:**
   - Configurar alertas para sesiones fallidas
   - Dashboard de estadísticas en tiempo real
   - Tracking de tendencias de aprobación

## ⚙️ Configuración Ajustable

Si necesitas cambiar el umbral de aprobación (actualmente 70%):

```sql
-- Editar función process_session_completion
-- Cambiar esta línea:
IF v_success_rate >= 70 THEN
-- Por ejemplo, para 80%:
IF v_success_rate >= 80 THEN
```

## 📝 Notas Importantes

- Las sesiones solo pueden completarse una vez
- No se puede cambiar el participant_id después de completar
- El trigger valida que haya un participant_id antes de completar
- Los puntos se donan instantáneamente al completar exitosamente
- Las sesiones fallidas no afectan los puntos del participante

---

**Fecha de Implementación:** Octubre 27, 2025  
**Versión:** 1.0.0  
**Autor:** Sistema DebtFreedom Game

