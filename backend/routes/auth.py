from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
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