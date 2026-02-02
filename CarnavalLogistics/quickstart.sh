#!/bin/bash
# Quick Start Script - CarnavalLogistics

echo "=========================================="
echo "  CarnavalLogistics - Quick Start"
echo "=========================================="
echo ""

# Detectar sistema operativo
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "🔍 Sistema detectado: Windows"
    echo ""
    echo "Para empezar, ejecuta en PowerShell:"
    echo ""
    echo "cd C:\Users\busta\Desktop\pruebaArqui\PruebaArqui\CarnavalLogistics"
    echo "npm install"
    echo "npm run dev"
    echo ""
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🔍 Sistema detectado: Linux"
    
    # Instalar Node.js si no existe
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js no está instalado"
        echo "Para instalar, ejecuta:"
        echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
        echo "sudo apt-get install -y nodejs"
        exit 1
    fi
    
    echo "✅ Node.js está instalado"
    node --version
    
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🔍 Sistema detectado: macOS"
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js no está instalado"
        echo "Para instalar con Homebrew:"
        echo "brew install node"
        exit 1
    fi
    
    echo "✅ Node.js está instalado"
    node --version
fi

echo ""
echo "=========================================="
echo "  PRÓXIMOS PASOS"
echo "=========================================="
echo ""
echo "1. Navegar al proyecto:"
echo "   cd CarnavalLogistics"
echo ""
echo "2. Instalar dependencias:"
echo "   npm install"
echo ""
echo "3. Configurar variables de entorno:"
echo "   cp .env.example .env"
echo ""
echo "4. Ejecutar en desarrollo:"
echo "   npm run dev"
echo ""
echo "5. Abrir en navegador:"
echo "   http://localhost:3000"
echo ""
echo "=========================================="
echo "  COMANDOS ÚTILES"
echo "=========================================="
echo ""
echo "npm test              - Ejecutar tests"
echo "npm run build         - Compilar TypeScript"
echo "npm run lint          - Validar código"
echo "docker build .        - Construir Docker"
echo ""
echo "=========================================="
echo "  DOCUMENTACIÓN"
echo "=========================================="
echo ""
echo "📄 RESUMEN.md              - Resumen ejecutivo"
echo "📄 docs/ARQUITECTURA.md    - Diseño del sistema"
echo "📄 docs/DIAGRAMAS.md       - Diagramas técnicos"
echo "📄 docs/CI-CD-PIPELINE.md  - Pipeline explicado"
echo "📄 README.md               - Guía de uso"
echo ""
echo "=========================================="
echo "  ✅ ¡Proyecto listo para usar!"
echo "=========================================="
