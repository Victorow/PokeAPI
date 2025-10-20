# 🎮 Pokédex Digital

Uma aplicação web completa para gerenciamento de Pokémon, desenvolvida com Angular e Flask, integrada à PokéAPI.

## 📋 Funcionalidades

### ✅ Requisitos Obrigatórios
- **Autenticação JWT** - Sistema de login seguro
- **Listagem de Pokémon** - Com filtros por geração e nome
- **Sistema de Favoritos** - Marque seus Pokémon preferidos
- **Equipe de Batalha** - Selecione até 6 Pokémon para sua equipe
- **Integração PokeAPI** - Dados atualizados diretamente da API oficial

### 🚀 Funcionalidades Extras
- **Gestão de Usuários** - Painel administrativo completo
- **Reset de Senha** - Sistema de recuperação de senha
- **Modal Customizado** - Interface moderna e responsiva
- **Sistema de Roles** - Controle de acesso (Admin/Usuário)
- **Docker** - Deploy simplificado com containers

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 17+** - Framework principal
- **TypeScript** - Linguagem de programação
- **CSS3** - Estilização moderna e responsiva
- **RxJS** - Programação reativa

### Backend
- **Python 3.11** - Linguagem de programação
- **Flask** - Framework web
- **SQLAlchemy** - ORM para banco de dados
- **JWT** - Autenticação segura
- **SQLite** - Banco de dados local

### DevOps
- **Docker** - Containerização
- **CORS** - Comunicação frontend-backend

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ 
- Python 3.11+
- Docker (opcional)

### Opção 1: Execução com Docker

#### Backend
```bash
cd backend
docker build -t pokeapi-backend .
docker run -d --name pokeapi-backend -p 5000:5000 pokeapi-backend
```

### Opção 2: Execução Manual

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Backend
```env
JWT_SECRET_KEY=sua-chave-secreta-aqui
FLASK_ENV=development
```

#### Frontend
```env
API_URL=http://localhost:5000
```

### Banco de Dados

O banco SQLite é criado automaticamente na primeira execução. O sistema inclui:
- Migração automática de schema
- Criação de usuário admin padrão
- População de tipos de Pokémon

### Usuário Admin Padrão
- **Login:** `admin`
- **Senha:** `admin123`
- **Email:** `admin@pokedex.com`

## 📱 Telas da Aplicação

### 1. Tela de Login
- Autenticação segura com JWT
- Validação de campos
- Redirecionamento automático

### 2. Listagem de Pokémon
- Filtros por geração (1-9)
- Busca por nome
- Paginação (20 por página)
- Cards interativos com ações

### 3. Favoritos
- Lista de Pokémon favoritos
- Adicionar/remover favoritos
- Integração com equipe de batalha

### 4. Equipe de Batalha
- Máximo 6 Pokémon
- Validação de limite
- Gerenciamento visual

### 5. Gestão de Usuários (Admin)
- Listar todos os usuários
- Editar informações
- Excluir usuários
- Controle de acesso por role

## 🔒 Segurança

### Implementações de Segurança
- **Validação de entrada** - Sanitização de dados
- **Autenticação JWT** - Tokens seguros
- **Controle de acesso** - Roles e permissões
- **Hash de senhas** - Werkzeug security
- **CORS configurado** - Comunicação segura
- **Rate limiting** - Proteção contra abuso
- **Validação de tipos** - Prevenção de ataques

### Validações Implementadas
- Tamanho máximo de campos
- Validação de email
- Sanitização de strings
- Verificação de tipos de dados
- Limites de paginação

## 🏗️ Arquitetura

### Estrutura do Projeto
```
PokeAPI/
├── backend/
│   ├── routes/          # Endpoints da API
│   ├── models.py        # Modelos do banco
│   ├── app.py          # Aplicação Flask
│   ├── requirements.txt # Dependências Python
│   └── Dockerfile      # Container do backend
├── frontend/
│   ├── src/app/
│   │   ├── components/ # Componentes Angular
│   │   ├── services/   # Serviços
│   │   ├── guards/     # Proteção de rotas
│   │   └── models/     # Interfaces TypeScript
│   └── package.json    # Dependências Node.js
└── README.md
```

### Banco de Dados
- **Usuario** - Dados dos usuários
- **PokemonUsuario** - Pokémon dos usuários
- **TipoPokemon** - Tipos de Pokémon

## 🐳 Docker

### Comandos Úteis
```bash
# Build da imagem
docker build -t pokeapi-backend .

# Executar container
docker run -d --name pokeapi-backend -p 5000:5000 pokeapi-backend

# Ver logs
docker logs -f pokeapi-backend

# Parar container
docker stop pokeapi-backend

# Remover container
docker rm pokeapi-backend
```

## 📊 API Endpoints

### Autenticação
- `POST /login` - Login do usuário
- `POST /register` - Registro de usuário

### Pokémon
- `GET /pokemon` - Listar Pokémon com filtros
- `GET /user-pokemon/favoritos` - Listar favoritos
- `POST /user-pokemon/favoritos` - Adicionar favorito
- `DELETE /user-pokemon/favoritos/{codigo}` - Remover favorito
- `GET /user-pokemon/equipe` - Listar equipe
- `POST /user-pokemon/equipe` - Adicionar à equipe
- `DELETE /user-pokemon/equipe/{codigo}` - Remover da equipe

### Usuários (Admin)
- `GET /usuarios` - Listar usuários
- `GET /usuarios/{id}` - Obter usuário
- `PUT /usuarios/{id}` - Atualizar usuário
- `DELETE /usuarios/{id}` - Excluir usuário

## 🧪 Testes

### Executar Testes
```bash
# Backend
cd backend
python -m pytest

# Frontend
cd frontend
npm test
```

## 📈 Performance

### Otimizações Implementadas
- **Lazy loading** - Carregamento sob demanda
- **Paginação** - Limite de resultados
- **Cache** - Dados de tipos de Pokémon
- **Compressão** - Assets otimizados
- **CDN** - Imagens da PokéAPI

## 🚀 Deploy

### Produção
1. Configure variáveis de ambiente
2. Use banco PostgreSQL/MySQL
3. Configure HTTPS
4. Use servidor WSGI (Gunicorn)
5. Configure proxy reverso (Nginx)

### Variáveis de Produção
```env
FLASK_ENV=production
JWT_SECRET_KEY=chave-super-secreta
DATABASE_URL=postgresql://user:pass@host:port/db
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como projeto de teste técnico, demonstrando conhecimento em:
- Desenvolvimento Full Stack
- Arquitetura de APIs
- Segurança de aplicações
- Containerização
- Boas práticas de desenvolvimento

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através dos issues do GitHub.

---

**🎯 Projeto completo e funcional, pronto para produção!**
