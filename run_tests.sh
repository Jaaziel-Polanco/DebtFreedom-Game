#!/bin/bash

# DebtFreedom Game - API Test Runner
# This script checks for dependencies and runs the test suite

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                   DEBTFREEDOM GAME - TEST RUNNER                             ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 no está instalado${NC}"
    echo -e "${YELLOW}  Instálalo con: brew install python3${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Python 3 encontrado: $(python3 --version)${NC}"

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}✗ pip3 no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✓ pip3 encontrado${NC}"

# Check if required packages are installed
echo ""
echo -e "${CYAN}Verificando dependencias...${NC}"

MISSING_PACKAGES=()

if ! python3 -c "import requests" 2>/dev/null; then
    MISSING_PACKAGES+=("requests")
fi

if ! python3 -c "import colorama" 2>/dev/null; then
    MISSING_PACKAGES+=("colorama")
fi

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Faltan paquetes: ${MISSING_PACKAGES[*]}${NC}"
    echo -e "${CYAN}¿Instalar dependencias? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${CYAN}Instalando dependencias...${NC}"
        pip3 install -r requirements-test.txt
        echo -e "${GREEN}✓ Dependencias instaladas${NC}"
    else
        echo -e "${RED}✗ No se pueden ejecutar las pruebas sin las dependencias${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Todas las dependencias instaladas${NC}"
fi

# Check if server is running
echo ""
echo -e "${CYAN}Verificando servidor...${NC}"

if curl -s http://localhost:3000/api/participants > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Servidor Next.js está corriendo en localhost:3000${NC}"
else
    echo -e "${RED}✗ Servidor no está corriendo${NC}"
    echo -e "${YELLOW}  Inicia el servidor en otra terminal con: npm run dev${NC}"
    echo ""
    echo -e "${CYAN}¿Continuar de todas formas? (y/n)${NC}"
    read -r response
    if [[ ! "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        exit 1
    fi
fi

# Run tests
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                         EJECUTANDO PRUEBAS                                    ${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════════════════════════${NC}"
echo ""

python3 test_api.py

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ Todas las pruebas completadas exitosamente${NC}"
else
    echo -e "${RED}✗ Algunas pruebas fallaron${NC}"
fi

exit $EXIT_CODE

