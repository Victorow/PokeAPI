#!/usr/bin/env python3
"""
Script de migração do banco de dados para Docker
"""
import sqlite3
import os
import sys

def migrate_database():
    """Migra o banco de dados adicionando a coluna Role se necessário"""
    db_path = '/app/instance/pokeapi.db'
    
    # Criar diretório instance se não existir
    os.makedirs('/app/instance', exist_ok=True)
    
    # Conectar ao banco SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Verificar se a coluna Role já existe
        cursor.execute("PRAGMA table_info(usuario)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'Role' in columns:
            print("INFO: Coluna 'Role' já existe na tabela 'usuario'")
        else:
            print("INFO: Adicionando coluna 'Role' à tabela 'usuario'...")
            
            # Adicionar a coluna Role com valor padrão 'user'
            cursor.execute("ALTER TABLE usuario ADD COLUMN Role VARCHAR(20) DEFAULT 'user'")
            
            # Atualizar todos os usuários existentes para ter role 'user'
            cursor.execute("UPDATE usuario SET Role = 'user' WHERE Role IS NULL")
            
            conn.commit()
            print("INFO: Migração concluída com sucesso!")
        
        # Verificar se já existe um admin
        cursor.execute("SELECT * FROM usuario WHERE Role = 'admin'")
        if cursor.fetchone():
            print("INFO: Usuário admin já existe!")
        else:
            print("INFO: Criando usuário administrador...")
            
            # Criar usuário admin (senha: admin123)
            from werkzeug.security import generate_password_hash
            password_hash = generate_password_hash('admin123')
            
            cursor.execute("""
                INSERT INTO usuario (Nome, Login, Email, Senha, Role, DtInclusao, DtAlteracao)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """, ('Administrador', 'admin', 'admin@pokedex.com', password_hash, 'admin'))
            
            conn.commit()
            print("INFO: Usuário administrador criado com sucesso!")
            print("INFO: Login: admin | Senha: admin123")
        
        return True
        
    except Exception as e:
        print(f"ERRO durante a migração: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    success = migrate_database()
    sys.exit(0 if success else 1)

