#!/bin/bash
set -e

echo "=== Buildando e executando PokeAPI Backend ==="

echo ""
echo "1. Parando container existente (se houver)..."
docker stop pokeapi-backend 2>/dev/null || true
docker rm pokeapi-backend 2>/dev/null || true

echo ""
echo "2. Buildando nova imagem..."
docker build -t pokeapi-backend .

echo ""
echo "3. Executando container..."
docker run -d --name pokeapi-backend -p 5000:5000 pokeapi-backend

echo ""
echo "=== Container executando com sucesso! ==="
echo ""
echo "Para ver os logs:"
echo "docker logs -f pokeapi-backend"
echo ""
echo "Para parar o container:"
echo "docker stop pokeapi-backend"
echo ""
echo "Para acessar a aplicação:"
echo "http://localhost:5000"
echo ""

