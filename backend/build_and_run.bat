@echo off
echo === Buildando e executando PokeAPI Backend ===

echo.
echo 1. Parando container existente (se houver)...
docker stop pokeapi-backend 2>nul
docker rm pokeapi-backend 2>nul

echo.
echo 2. Buildando nova imagem...
docker build -t pokeapi-backend .

if %ERRORLEVEL% neq 0 (
    echo ERRO: Falha no build da imagem Docker
    pause
    exit /b 1
)

echo.
echo 3. Executando container...
docker run -d --name pokeapi-backend -p 5000:5000 pokeapi-backend

if %ERRORLEVEL% neq 0 (
    echo ERRO: Falha ao executar container
    pause
    exit /b 1
)

echo.
echo === Container executando com sucesso! ===
echo.
echo Para ver os logs:
echo docker logs -f pokeapi-backend
echo.
echo Para parar o container:
echo docker stop pokeapi-backend
echo.
echo Para acessar a aplicacao:
echo http://localhost:5000
echo.
pause

