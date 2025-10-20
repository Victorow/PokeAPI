#!/usr/bin/env python3
"""
Script de inicialização da aplicação com migração automática
"""
import subprocess
import sys
import os

def run_migration():
    """Executa a migração do banco de dados"""
    print("=== Executando migração do banco de dados ===")
    try:
        # Executar migração sem capturar saída para ver logs em tempo real
        result = subprocess.run([sys.executable, 'migrate_db.py'], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"ERRO na migração: {e}")
        return False

def start_app():
    """Inicia a aplicação Flask"""
    print("=== Iniciando aplicação Flask ===")
    try:
        # Executar a aplicação Flask sem capturar saída
        subprocess.run([sys.executable, 'app.py'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"ERRO ao iniciar aplicação: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nAplicação interrompida pelo usuário")
        sys.exit(0)

if __name__ == '__main__':
    # Executar migração primeiro
    if not run_migration():
        print("ERRO: Falha na migração do banco de dados")
        sys.exit(1)
    
    # Iniciar aplicação
    start_app()
