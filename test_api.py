#!/usr/bin/env python3
"""
API Test Suite for DebtFreedom Game
Tests the complete flow of user sessions with point donation based on performance.

Requirements:
    pip install requests colorama

Usage:
    python test_api.py
"""

import requests
import json
import math
from typing import Dict, List, Optional
from datetime import datetime
import sys

# Try to import colorama for colored output
try:
    from colorama import init, Fore, Style, Back

    init(autoreset=True)
    HAS_COLOR = True
except ImportError:
    HAS_COLOR = False

    # Fallback: no colors
    class Fore:
        GREEN = RED = YELLOW = CYAN = MAGENTA = BLUE = WHITE = ""

    class Style:
        BRIGHT = RESET_ALL = ""

    class Back:
        GREEN = RED = ""


# Configuration
API_BASE_URL = "http://localhost:3000/api"
PARTICIPANT_ID = "d42988b1-aec0-4560-a99f-e111751866f9"

# Test Users
TEST_USERS = [
    {
        "name": "John Yeste",
        "phone": "8494011362",
        "should_pass": True,  # Will answer correctly (>=70%)
        "description": "Usuario que responderá bien",
    },
    {
        "name": "Jaaziel",
        "phone": "8496541362",
        "should_pass": False,  # Will answer incorrectly (<70%)
        "description": "Usuario que responderá mal",
    },
]


class APITester:
    """Test suite for DebtFreedom Game API"""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []

    def log(self, message: str, level: str = "info"):
        """Log message with color coding"""
        timestamp = datetime.now().strftime("%H:%M:%S")

        if level == "success":
            prefix = f"{Fore.GREEN}✓{Style.RESET_ALL}"
            color = Fore.GREEN
        elif level == "error":
            prefix = f"{Fore.RED}✗{Style.RESET_ALL}"
            color = Fore.RED
        elif level == "warning":
            prefix = f"{Fore.YELLOW}⚠{Style.RESET_ALL}"
            color = Fore.YELLOW
        elif level == "info":
            prefix = f"{Fore.CYAN}ℹ{Style.RESET_ALL}"
            color = Fore.CYAN
        else:
            prefix = "•"
            color = ""

        print(
            f"{Fore.WHITE}[{timestamp}]{Style.RESET_ALL} {prefix} {color}{message}{Style.RESET_ALL}"
        )

    def separator(self, title: str = ""):
        """Print a separator line"""
        if title:
            print(f"\n{Fore.MAGENTA}{'='*80}")
            print(f"{Fore.MAGENTA}{title.center(80)}")
            print(f"{Fore.MAGENTA}{'='*80}{Style.RESET_ALL}\n")
        else:
            print(f"{Fore.WHITE}{'-'*80}{Style.RESET_ALL}")

    def create_or_get_user(self, name: str, phone: str) -> Optional[Dict]:
        """Create or retrieve a user"""
        self.log(f"Creando/obteniendo usuario: {name} ({phone})", "info")

        try:
            response = self.session.post(
                f"{self.base_url}/users",
                json={"name": name, "phone": phone},
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            user = response.json()

            self.log(f"Usuario obtenido: {user['name']} (ID: {user['id']})", "success")
            return user
        except Exception as e:
            self.log(f"Error creando usuario: {str(e)}", "error")
            return None

    def get_participants(self) -> List[Dict]:
        """Get all participants"""
        self.log("Obteniendo lista de participantes...", "info")

        try:
            response = self.session.get(f"{self.base_url}/participants")
            response.raise_for_status()
            participants = response.json()

            self.log(f"Encontrados {len(participants)} participantes", "success")
            return participants
        except Exception as e:
            self.log(f"Error obteniendo participantes: {str(e)}", "error")
            return []

    def create_session(self, user_id: str) -> Optional[Dict]:
        """Create a new game session"""
        self.log("Creando nueva sesión de juego...", "info")

        try:
            response = self.session.post(
                f"{self.base_url}/sessions",
                json={"user_id": user_id},
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            data = response.json()

            session = data.get("session")
            questions = data.get("questions", [])

            self.log(f"Sesión creada: {session['id']}", "success")
            self.log(f"Preguntas disponibles: {len(questions)}", "info")

            return {"session": session, "questions": questions}
        except Exception as e:
            self.log(f"Error creando sesión: {str(e)}", "error")
            return None

    def submit_answer(
        self, session_id: str, question_id: str, answer_id: str
    ) -> Optional[Dict]:
        """Submit an answer to a question"""
        try:
            response = self.session.post(
                f"{self.base_url}/sessions/{session_id}/answer",
                json={"question_id": question_id, "answer_id": answer_id},
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            result = response.json()

            is_correct = result.get("is_correct", False)
            status_icon = "✓" if is_correct else "✗"
            status_color = Fore.GREEN if is_correct else Fore.RED

            self.log(
                f"{status_color}{status_icon}{Style.RESET_ALL} Respuesta: "
                f"{'Correcta' if is_correct else 'Incorrecta'}",
                "success" if is_correct else "warning",
            )

            return result
        except Exception as e:
            self.log(f"Error enviando respuesta: {str(e)}", "error")
            return None

    def complete_session(self, session_id: str, participant_id: str) -> Optional[Dict]:
        """Complete a session and evaluate results"""
        self.log("Completando sesión y evaluando resultados...", "info")

        try:
            response = self.session.post(
                f"{self.base_url}/sessions/{session_id}/complete",
                json={"participant_id": participant_id},
                headers={"Content-Type": "application/json"},
            )
            response.raise_for_status()
            result = response.json()

            session_data = result.get("session", {})
            status = session_data.get("status")
            success_rate = float(session_data.get("success_rate", 0))
            points_donated = session_data.get("points_donated", 0)
            message = result.get("message", "")

            # Display results
            self.separator()
            if status == "completed":
                print(
                    f"{Back.GREEN}{Fore.WHITE} SESIÓN COMPLETADA - APROBADO {Style.RESET_ALL}"
                )
                self.log(f"Porcentaje de éxito: {success_rate}%", "success")
                self.log(f"Puntos donados: {points_donated}", "success")
            else:
                print(
                    f"{Back.RED}{Fore.WHITE} SESIÓN FALLIDA - REPROBADO {Style.RESET_ALL}"
                )
                self.log(f"Porcentaje de éxito: {success_rate}%", "error")
                self.log(f"Puntos donados: {points_donated}", "warning")

            self.log(f"Mensaje: {message}", "info")
            self.separator()

            return result
        except Exception as e:
            self.log(f"Error completando sesión: {str(e)}", "error")
            return None

    def run_user_test(self, user_config: Dict) -> bool:
        """Run complete test flow for a user"""
        self.separator(f"PROBANDO USUARIO: {user_config['name']}")
        self.log(f"Descripción: {user_config['description']}", "info")
        self.log(
            f"Objetivo: {'Aprobar (≥70%)' if user_config['should_pass'] else 'Reprobar (<70%)'}",
            "info",
        )
        print()

        # Step 1: Create/Get User
        user = self.create_or_get_user(user_config["name"], user_config["phone"])
        if not user:
            return False
        print()

        # Step 2: Create Session
        session_data = self.create_session(user["id"])
        if not session_data:
            return False

        session = session_data["session"]
        questions = session_data["questions"]
        print()

        # Step 3: Answer Questions
        self.log(f"Respondiendo {len(questions)} preguntas...", "info")
        print()

        correct_count = 0
        total_questions = len(questions)

        # Calculate how many to answer correctly based on should_pass
        if user_config["should_pass"]:
            # Answer ALL questions correctly to ensure passing (100%)
            target_correct = total_questions
            self.log(
                f"Objetivo: {target_correct}/{total_questions} correctas (100.0%)",
                "info",
            )
        else:
            # Answer less than 70% to ensure failing
            # Use floor to ensure we definitely fail
            max_to_fail = math.floor(total_questions * 0.69)
            target_correct = max(0, max_to_fail)
            expected_rate = (
                (target_correct / total_questions) * 100 if total_questions > 0 else 0
            )
            self.log(
                f"Objetivo: {target_correct}/{total_questions} correctas ({expected_rate:.1f}%)",
                "info",
            )

        for idx, question in enumerate(questions, 1):
            question_id = question["id"]
            question_text = question["text"]
            answers = question.get("answers", [])

            self.log(
                f"Pregunta {idx}/{total_questions}: {question_text[:60]}...", "info"
            )

            # Decide if this answer should be correct
            should_answer_correctly = correct_count < target_correct

            # Find correct and incorrect answers
            correct_answer = next((a for a in answers if a.get("is_correct")), None)
            incorrect_answer = next(
                (a for a in answers if not a.get("is_correct")), None
            )

            if should_answer_correctly and correct_answer:
                selected_answer = correct_answer
                correct_count += 1
            elif not should_answer_correctly and incorrect_answer:
                selected_answer = incorrect_answer
            else:
                # Fallback to first answer
                selected_answer = answers[0] if answers else None

            if not selected_answer:
                self.log("No hay respuestas disponibles para esta pregunta", "warning")
                continue

            # Submit answer
            result = self.submit_answer(
                session["id"], question_id, selected_answer["id"]
            )
            if not result:
                return False

        print()

        # Step 4: Complete Session
        completion_result = self.complete_session(session["id"], PARTICIPANT_ID)
        if not completion_result:
            return False

        # Validate result
        session_result = completion_result.get("session", {})
        status = session_result.get("status")
        expected_status = "completed" if user_config["should_pass"] else "failed"

        if status == expected_status:
            self.log(
                f"✓ Test EXITOSO: Usuario {user_config['name']} - "
                f"Status esperado '{expected_status}' obtenido",
                "success",
            )
            return True
        else:
            self.log(
                f"✗ Test FALLIDO: Usuario {user_config['name']} - "
                f"Se esperaba '{expected_status}' pero se obtuvo '{status}'",
                "error",
            )
            return False

    def run_all_tests(self):
        """Run all test scenarios"""
        print(
            f"\n{Style.BRIGHT}{Fore.CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗"
        )
        print(
            f"{Style.BRIGHT}{Fore.CYAN}║                   DEBTFREEDOM GAME - API TEST SUITE                          ║"
        )
        print(
            f"{Style.BRIGHT}{Fore.CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝{Style.RESET_ALL}\n"
        )

        self.log(f"Base URL: {self.base_url}", "info")
        self.log(f"Participant ID: {PARTICIPANT_ID}", "info")
        self.log(f"Total de pruebas: {len(TEST_USERS)}", "info")
        print()

        # Get participants list to verify it exists
        participants = self.get_participants()
        participant_exists = any(p.get("id") == PARTICIPANT_ID for p in participants)

        if not participant_exists:
            self.log(
                f"⚠ Advertencia: Participante {PARTICIPANT_ID} no encontrado. "
                "Las pruebas pueden fallar.",
                "warning",
            )
        print()

        # Run tests for each user
        results = []
        for user_config in TEST_USERS:
            success = self.run_user_test(user_config)
            results.append({"user": user_config["name"], "success": success})
            print("\n")

        # Summary
        self.separator("RESUMEN DE PRUEBAS")

        passed = sum(1 for r in results if r["success"])
        failed = len(results) - passed

        for result in results:
            status = "PASS" if result["success"] else "FAIL"
            color = Fore.GREEN if result["success"] else Fore.RED
            icon = "✓" if result["success"] else "✗"
            print(f"  {color}{icon} {result['user']}: {status}{Style.RESET_ALL}")

        print()
        print(
            f"  Total: {len(results)} | {Fore.GREEN}Exitosas: {passed}{Style.RESET_ALL} | "
            f"{Fore.RED}Fallidas: {failed}{Style.RESET_ALL}"
        )

        self.separator()

        if failed == 0:
            print(
                f"\n{Back.GREEN}{Fore.WHITE} ✓ TODAS LAS PRUEBAS PASARON EXITOSAMENTE {Style.RESET_ALL}\n"
            )
            return 0
        else:
            print(
                f"\n{Back.RED}{Fore.WHITE} ✗ ALGUNAS PRUEBAS FALLARON {Style.RESET_ALL}\n"
            )
            return 1


def main():
    """Main entry point"""
    # Check if requests is installed
    try:
        import requests
    except ImportError:
        print("Error: 'requests' module not found.")
        print("Install it with: pip install requests")
        sys.exit(1)

    # Run tests
    tester = APITester(API_BASE_URL)
    exit_code = tester.run_all_tests()
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
