from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, Usuario

bp_auth = Blueprint('auth', __name__, url_prefix='/auth')

@bp_auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['login', 'senha']):
        return jsonify({'msg': 'Campos obrigatórios faltando'}), 400
    
    # Validação básica de entrada
    if not isinstance(data['login'], str) or not isinstance(data['senha'], str):
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    if len(data['login']) > 100 or len(data['senha']) > 200:
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    user = Usuario.query.filter_by(Login=data['login']).first()
    
    if not user or not check_password_hash(user.Senha, data['senha']):
        return jsonify({'msg': 'Credenciais inválidas'}), 401
    
    access_token = create_access_token(identity=user.IDUsuario)
    return jsonify({
        'access_token': access_token,
        'token_type': 'Bearer',
        'usuario': {
            'id': user.IDUsuario,
            'nome': user.Nome,
            'login': user.Login,
            'email': user.Email,
            'role': user.Role
        }
    }), 200

@bp_auth.route('/register', methods=['POST'])
def register():
    """Registra um novo usuário"""
    data = request.get_json()
    
    if not data or not all(key in data for key in ['nome', 'login', 'email', 'senha']):
        return jsonify({'msg': 'Campos obrigatórios faltando'}), 400
    
    # Validações de entrada
    if not all(isinstance(data[key], str) for key in ['nome', 'login', 'email', 'senha']):
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    # Validações de tamanho
    if len(data['nome']) > 100 or len(data['login']) > 100 or len(data['email']) > 100:
        return jsonify({'msg': 'Dados muito longos'}), 400
    
    if len(data['senha']) < 6 or len(data['senha']) > 200:
        return jsonify({'msg': 'Senha deve ter entre 6 e 200 caracteres'}), 400
    
    # Validação básica de email
    if '@' not in data['email'] or '.' not in data['email']:
        return jsonify({'msg': 'Email inválido'}), 400
    
    # Verificar se login/email já existem
    if Usuario.query.filter_by(Login=data['login']).first():
        return jsonify({'msg': 'Login já existe'}), 400
    
    if Usuario.query.filter_by(Email=data['email']).first():
        return jsonify({'msg': 'Email já cadastrado'}), 400
    
    try:
        hashed_password = generate_password_hash(data['senha'])
        novo_usuario = Usuario(
            Nome=data['nome'].strip(),
            Login=data['login'].strip().lower(),
            Email=data['email'].strip().lower(),
            Senha=hashed_password,
            Role='user'  # Sempre cria como usuário comum
        )
        
        db.session.add(novo_usuario)
        db.session.commit()
        
        return jsonify({
            'msg': 'Usuário registrado com sucesso!',
            'usuario': {
                'id': novo_usuario.IDUsuario,
                'nome': novo_usuario.Nome,
                'login': novo_usuario.Login,
                'email': novo_usuario.Email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Erro interno do servidor'}), 500

@bp_auth.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Altera a senha do usuário logado"""
    
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or not all(key in data for key in ['senhaAtual', 'novaSenha']):
        return jsonify({'msg': 'Campos obrigatórios faltando'}), 400
    
    # Validações de entrada
    if not isinstance(data['senhaAtual'], str) or not isinstance(data['novaSenha'], str):
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    if len(data['novaSenha']) < 6 or len(data['novaSenha']) > 200:
        return jsonify({'msg': 'Nova senha deve ter entre 6 e 200 caracteres'}), 400
    
    if data['senhaAtual'] == data['novaSenha']:
        return jsonify({'msg': 'A nova senha deve ser diferente da senha atual'}), 400
    
    try:
        user = Usuario.query.get(user_id)
        if not user:
            return jsonify({'msg': 'Usuário não encontrado'}), 404
        
        # Verificar senha atual
        if not check_password_hash(user.Senha, data['senhaAtual']):
            return jsonify({'msg': 'Senha atual incorreta'}), 400
        
        # Atualizar senha
        user.Senha = generate_password_hash(data['novaSenha'])
        db.session.commit()
        
        return jsonify({'msg': 'Senha alterada com sucesso!'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Erro interno do servidor'}), 500

@bp_auth.route('/admin/reset-password', methods=['POST'])
@jwt_required()
def admin_reset_password():
    """Admin reseta a senha de outro usuário"""
    data = request.get_json()
    admin_id = get_jwt_identity()
    
    if not data or not all(key in data for key in ['userId', 'novaSenha']):
        return jsonify({'msg': 'Campos obrigatórios faltando'}), 400
    
    # Validações de entrada
    if not isinstance(data['userId'], int) or not isinstance(data['novaSenha'], str):
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    if len(data['novaSenha']) < 6 or len(data['novaSenha']) > 200:
        return jsonify({'msg': 'Nova senha deve ter entre 6 e 200 caracteres'}), 400
    
    try:
        # Verificar se o usuário logado é admin
        admin_user = Usuario.query.get(admin_id)
        if not admin_user or admin_user.Role != 'admin':
            return jsonify({'msg': 'Acesso negado. Apenas administradores podem resetar senhas.'}), 403
        
        # Buscar o usuário alvo
        target_user = Usuario.query.get(data['userId'])
        if not target_user:
            return jsonify({'msg': 'Usuário não encontrado'}), 404
        
        # Admin não pode resetar sua própria senha por esta rota
        if target_user.IDUsuario == admin_id:
            return jsonify({'msg': 'Use a funcionalidade de alteração de senha para alterar sua própria senha'}), 400
        
        # Atualizar senha
        target_user.Senha = generate_password_hash(data['novaSenha'])
        db.session.commit()
        
        return jsonify({
            'msg': f'Senha do usuário "{target_user.Nome}" foi resetada com sucesso!',
            'usuario': {
                'id': target_user.IDUsuario,
                'nome': target_user.Nome,
                'login': target_user.Login,
                'email': target_user.Email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Erro interno do servidor'}), 500