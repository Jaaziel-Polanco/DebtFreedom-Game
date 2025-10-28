# API Testing Guide

Este directorio contiene pruebas automatizadas para el API de DebtFreedom Game.

## 📋 Descripción

El archivo `test_api.py` es un suite de pruebas completo que valida el flujo end-to-end del sistema de donación de puntos basado en desempeño.

## 🎯 Casos de Prueba

### Usuario 1: John Yeste (8494011362)
- **Objetivo:** Aprobar el quiz (≥70% respuestas correctas)
- **Comportamiento:** Responderá correctamente el 80% de las preguntas
- **Resultado esperado:** 
  - Status: `completed`
  - Puntos donados: `1`
  - Participante recibe el punto

### Usuario 2: Jaaziel (8496541362)
- **Objetivo:** Reprobar el quiz (<70% respuestas correctas)
- **Comportamiento:** Responderá correctamente solo el 50% de las preguntas
- **Resultado esperado:**
  - Status: `failed`
  - Puntos donados: `0`
  - Participante NO recibe puntos

### Participante Beneficiario
- **ID:** `d42988b1-aec0-4560-a99f-e111751866f9`
- Ambos usuarios intentarán donar a este participante
- Solo John Yeste logrará donar exitosamente

## 🚀 Instalación

### 1. Instalar Python (si no lo tienes)
```bash
# macOS (con Homebrew)
brew install python3

# Verificar instalación
python3 --version
```

### 2. Instalar Dependencias
```bash
# Desde el directorio raíz del proyecto
pip3 install -r requirements-test.txt
```

O instalar manualmente:
```bash
pip3 install requests colorama
```

## ▶️ Ejecución

### Paso 1: Iniciar el servidor
En una terminal:
```bash
npm run dev
```

El servidor debería estar corriendo en `http://localhost:3000`

### Paso 2: Ejecutar las pruebas
En otra terminal:
```bash
# Dar permisos de ejecución (solo primera vez)
chmod +x test_api.py

# Ejecutar
python3 test_api.py
```

O simplemente:
```bash
python3 test_api.py
```

## 📊 Salida Esperada

Las pruebas mostrarán una salida con colores indicando:

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   DEBTFREEDOM GAME - API TEST SUITE                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

[HH:MM:SS] ℹ Base URL: http://localhost:3000/api
[HH:MM:SS] ℹ Participant ID: d42988b1-aec0-4560-a99f-e111751866f9
[HH:MM:SS] ℹ Total de pruebas: 2

================================================================================
                        PROBANDO USUARIO: John Yeste                          
================================================================================

[HH:MM:SS] ℹ Descripción: Usuario que responderá bien
[HH:MM:SS] ℹ Objetivo: Aprobar (≥70%)
[HH:MM:SS] ℹ Creando/obteniendo usuario: John Yeste (8494011362)
[HH:MM:SS] ✓ Usuario obtenido: John Yeste (ID: xxx-xxx-xxx)
...
[HH:MM:SS] ✓ Respuesta: Correcta
[HH:MM:SS] ✓ Respuesta: Correcta
...

--------------------------------------------------------------------------------
 SESIÓN COMPLETADA - APROBADO 
[HH:MM:SS] ✓ Porcentaje de éxito: 80.0%
[HH:MM:SS] ✓ Puntos donados: 1
[HH:MM:SS] ℹ Mensaje: ¡Felicidades! Pasaste con 80.0%. Se donó 1 punto a ...
--------------------------------------------------------------------------------

================================================================================
                          PROBANDO USUARIO: Jaaziel                           
================================================================================

[HH:MM:SS] ℹ Descripción: Usuario que responderá mal
[HH:MM:SS] ℹ Objetivo: Reprobar (<70%)
...
[HH:MM:SS] ⚠ Respuesta: Incorrecta
[HH:MM:SS] ⚠ Respuesta: Incorrecta
...

--------------------------------------------------------------------------------
 SESIÓN FALLIDA - REPROBADO 
[HH:MM:SS] ✗ Porcentaje de éxito: 50.0%
[HH:MM:SS] ⚠ Puntos donados: 0
[HH:MM:SS] ℹ Mensaje: Lo siento, necesitas al menos 70% para aprobar...
--------------------------------------------------------------------------------

================================================================================
                              RESUMEN DE PRUEBAS                              
================================================================================
  ✓ John Yeste: PASS
  ✓ Jaaziel: PASS

  Total: 2 | Exitosas: 2 | Fallidas: 0
--------------------------------------------------------------------------------

 ✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE 
```

## 🔧 Configuración

Puedes modificar las constantes al inicio del archivo `test_api.py`:

```python
# Cambiar URL del API
API_BASE_URL = "http://localhost:3000/api"

# Cambiar participante beneficiario
PARTICIPANT_ID = "d42988b1-aec0-4560-a99f-e111751866f9"

# Agregar más usuarios de prueba
TEST_USERS = [
    {
        "name": "Nuevo Usuario",
        "phone": "8091234567",
        "should_pass": True,
        "description": "Descripción del usuario"
    }
]
```

## 🧪 Qué Prueba el Script

1. **Creación de Usuarios**
   - POST `/api/users` con nombre y teléfono
   - Validación de respuesta

2. **Listado de Participantes**
   - GET `/api/participants`
   - Verificación de que el participant_id existe

3. **Creación de Sesión**
   - POST `/api/sessions` con user_id
   - Recepción de preguntas

4. **Envío de Respuestas**
   - POST `/api/sessions/{sessionId}/answer` por cada pregunta
   - Validación de respuesta correcta/incorrecta
   - Control de porcentaje de respuestas correctas

5. **Completar Sesión**
   - POST `/api/sessions/{sessionId}/complete` con participant_id
   - Validación de status final (completed vs failed)
   - Verificación de puntos donados (1 vs 0)
   - Validación del umbral de 70%

6. **Triggers Automáticos**
   - Cálculo automático de success_rate
   - Donación automática de puntos
   - Actualización de status

## 🐛 Troubleshooting

### Error: `Connection refused`
- Asegúrate de que el servidor Next.js esté corriendo
- Verifica que esté en el puerto 3000

### Error: `Participant not found`
- Verifica que el participante con ID `d42988b1-aec0-4560-a99f-e111751866f9` exista
- Puedes crear uno desde el admin panel o actualizar el ID en el script

### Error: `Module not found: requests`
```bash
pip3 install requests colorama
```

### Error: Las pruebas no muestran colores
- Es normal en algunos terminales
- Instala colorama: `pip3 install colorama`
- O ignora los colores, las pruebas funcionarán igual

## 📝 Exit Codes

- `0`: Todas las pruebas pasaron exitosamente
- `1`: Una o más pruebas fallaron

Útil para integración con CI/CD:
```bash
python3 test_api.py && echo "Tests passed!" || echo "Tests failed!"
```

## 🔍 Debugging

Para ver las respuestas completas del API, modifica el script y agrega:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

O imprime las respuestas:
```python
print(json.dumps(response.json(), indent=2))
```

## 🎨 Características

- ✅ Output con colores para mejor legibilidad
- ✅ Timestamps en cada operación
- ✅ Resumen de pruebas al final
- ✅ Exit codes para CI/CD
- ✅ Validación completa del flujo
- ✅ Prueba de ambos escenarios (aprobar/reprobar)
- ✅ Sin dependencias complejas

## 📚 Recursos Adicionales

- [API Documentation](./API_DOCUMENTATION.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Database Scripts](./scripts/README.md)


