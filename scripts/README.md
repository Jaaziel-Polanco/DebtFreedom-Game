# Database Migration Scripts

Este directorio contiene los scripts SQL para configurar y actualizar la base de datos del sistema DebtFreedom Game.

## Scripts Disponibles

### 01-create-tables.sql
Script inicial que crea todas las tablas necesarias para el sistema:
- `questions` - Preguntas del juego
- `answers` - Respuestas para cada pregunta
- `participants` - Participantes que reciben puntos
- `users` - Usuarios que juegan el juego
- `qa_sessions` - Sesiones de juego
- `session_questions` - Tracking de respuestas por sesión
- `local_game_prizes` - Premios para modo local

### 02-add-session-completion-logic.sql
Migración que agrega el sistema de evaluación y donación automática de puntos:

**Nuevas Columnas en `qa_sessions`:**
- `status` - Estado de la sesión: `in_progress`, `completed`, `failed`
- `total_questions` - Total de preguntas respondidas
- `correct_answers` - Número de respuestas correctas
- `points_donated` - Puntos donados (1 o 0)

**Triggers Automáticos:**
- `trigger_process_session_completion` - Calcula el porcentaje de respuestas correctas y:
  - Si ≥70%: Marca como `completed` y dona 1 punto al participante
  - Si <70%: Marca como `failed` y no dona puntos
- `trigger_validate_session_completion` - Valida que se haya seleccionado un participante

**Vista Nueva:**
- `session_statistics` - Vista consolidada de todas las sesiones con estadísticas calculadas

## Cómo Ejecutar las Migraciones

### Opción 1: Supabase Dashboard (Recomendado)
1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido del script
5. Ejecuta el script

### Opción 2: CLI de Supabase
```bash
# Asegúrate de estar logueado en Supabase
supabase login

# Vincula tu proyecto local
supabase link --project-ref tu-project-ref

# Ejecuta el script
supabase db push --file scripts/01-create-tables.sql
supabase db push --file scripts/02-add-session-completion-logic.sql
```

### Opción 3: Cliente PostgreSQL
```bash
# Conecta a tu base de datos
psql "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Ejecuta los scripts
\i scripts/01-create-tables.sql
\i scripts/02-add-session-completion-logic.sql
```

## Orden de Ejecución

**IMPORTANTE:** Los scripts deben ejecutarse en orden:

1. ✅ `01-create-tables.sql` - Primero (crea las tablas base)
2. ✅ `02-add-session-completion-logic.sql` - Segundo (agrega columnas y triggers)

## Sistema de Evaluación - Cómo Funciona

### Reglas de Evaluación
- **Umbral de Aprobación:** 70% de respuestas correctas
- **Punto Donado:** Solo si el usuario aprueba (≥70%)
- **Automático:** El trigger calcula todo automáticamente

### Flujo del Trigger

1. **Usuario completa sesión** - Se actualiza `status` a `'completed'`
2. **Trigger se activa** automáticamente:
   ```sql
   - Cuenta total de preguntas respondidas
   - Cuenta respuestas correctas
   - Calcula porcentaje: (correctas / total) * 100
   ```
3. **Evaluación:**
   - **Si ≥70%:**
     - `status` → `'completed'`
     - `points_donated` → `1`
     - `completed_at` → timestamp actual
     - **Actualiza `participants.points` += 1**
   - **Si <70%:**
     - `status` → `'failed'`
     - `points_donated` → `0`
     - `completed_at` → `NULL`

### Ejemplo de Uso

```sql
-- Usuario termina de responder 10 preguntas
-- 8 fueron correctas

-- API llama:
UPDATE qa_sessions 
SET status = 'completed', participant_id = 'uuid-del-participante'
WHERE id = 'uuid-de-sesion';

-- El trigger automáticamente:
-- 1. Calcula: 8/10 = 80% ✅ (≥70%)
-- 2. Marca status como 'completed'
-- 3. Dona 1 punto al participante
-- 4. Actualiza points_donated = 1
```

## Vista de Estadísticas

La vista `session_statistics` proporciona un reporte completo:

```sql
SELECT * FROM session_statistics 
WHERE user_id = 'uuid-del-usuario'
ORDER BY created_at DESC;
```

**Columnas:**
- `session_id`, `user_id`, `participant_id`
- `user_name`, `user_phone`, `participant_name`
- `status` - 'in_progress', 'completed', 'failed'
- `total_questions`, `correct_answers`
- `success_rate` - Porcentaje calculado
- `points_donated` - 1 o 0
- `created_at`, `completed_at`

## Rollback (Si es Necesario)

Si necesitas revertir la migración 02:

```sql
-- Eliminar triggers
DROP TRIGGER IF EXISTS trigger_process_session_completion ON qa_sessions;
DROP TRIGGER IF EXISTS trigger_validate_session_completion ON qa_sessions;

-- Eliminar funciones
DROP FUNCTION IF EXISTS process_session_completion();
DROP FUNCTION IF EXISTS validate_session_completion();

-- Eliminar vista
DROP VIEW IF EXISTS session_statistics;

-- Eliminar columnas (CUIDADO: esto borra datos)
ALTER TABLE qa_sessions 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS total_questions,
DROP COLUMN IF EXISTS correct_answers,
DROP COLUMN IF EXISTS points_donated;
```

## Verificación Post-Migración

Después de ejecutar las migraciones, verifica que todo esté correcto:

```sql
-- Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'qa_sessions';

-- Verificar que los triggers existen
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar que la vista existe
SELECT * FROM session_statistics LIMIT 1;
```

## Soporte

Si tienes problemas con las migraciones:
1. Verifica que tienes permisos suficientes en la base de datos
2. Asegúrate de ejecutar los scripts en el orden correcto
3. Revisa los logs de PostgreSQL para errores específicos
4. Consulta la [documentación de Supabase](https://supabase.com/docs)

