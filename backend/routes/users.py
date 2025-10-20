from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Usuario

bp_users = Blueprint('users', __name__, url_prefix='/usuarios')

@bp_users.route('', methods=['GET'])
@jwt_required()
def listar_usuarios():
    """Lista todos os usuários (apenas para administradores)"""
    user_id = get_jwt_identity()
    current_user = Usuario.query.get(user_id)
    
    # Verificar se o usuário é admin
    if not current_user or current_user.Role != 'admin':
        return jsonify({'msg': 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'}), 403
    
    usuarios = Usuario.query.all()
    
    return jsonify([
        {
            'id': u.IDUsuario,
            'nome': u.Nome,
            'login': u.Login,
            'email': u.Email,
            'role': u.Role,
            'dtInclusao': u.DtInclusao.isoformat() if u.DtInclusao else None,
            'dtAlteracao': u.DtAlteracao.isoformat() if u.DtAlteracao else None
        } for u in usuarios
    ]), 200

@bp_users.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def obter_usuario(user_id):
    """Obtém um usuário específico por ID"""
    current_user_id = get_jwt_identity()
    current_user = Usuario.query.get(current_user_id)
    
    # Verificar se o usuário está tentando ver seus próprios dados ou se é admin
    if int(current_user_id) != user_id and (not current_user or current_user.Role != 'admin'):
        return jsonify({'msg': 'Acesso negado. Você só pode ver seus próprios dados.'}), 403
    
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'msg': 'Usuário não encontrado'}), 404
    
    # Se não for admin, não mostrar informações sensíveis
    if not current_user or current_user.Role != 'admin':
        return jsonify({
            'id': usuario.IDUsuario,
            'nome': usuario.Nome,
            'login': usuario.Login,
            'email': usuario.Email
        }), 200
    
    return jsonify({
        'id': usuario.IDUsuario,
        'nome': usuario.Nome,
        'login': usuario.Login,
        'email': usuario.Email,
        'role': usuario.Role,
        'dtInclusao': usuario.DtInclusao.isoformat() if usuario.DtInclusao else None,
        'dtAlteracao': usuario.DtAlteracao.isoformat() if usuario.DtAlteracao else None
    }), 200

@bp_users.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def atualizar_usuario(user_id):
    """Atualiza um usuário específico"""
    current_user_id = get_jwt_identity()
    current_user = Usuario.query.get(current_user_id)
    data = request.get_json()
    
    # Verificar se o usuário está tentando atualizar seus próprios dados ou se é admin
    if int(current_user_id) != user_id and (not current_user or current_user.Role != 'admin'):
        return jsonify({'msg': 'Acesso negado. Você só pode atualizar seus próprios dados.'}), 403
    
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'msg': 'Usuário não encontrado'}), 404
    
    # Atualizar campos permitidos
    if 'nome' in data:
        usuario.Nome = data['nome']
    if 'email' in data:
        # Verificar se o email já existe em outro usuário
        existing_user = Usuario.query.filter_by(Email=data['email']).first()
        if existing_user and existing_user.IDUsuario != user_id:
            return jsonify({'msg': 'Email já está em uso'}), 400
        usuario.Email = data['email']
    
    # Apenas admin pode alterar role
    if 'role' in data and current_user and current_user.Role == 'admin':
        usuario.Role = data['role']
    
    db.session.commit()
    
    return jsonify({
        'msg': 'Usuário atualizado com sucesso',
        'usuario': {
            'id': usuario.IDUsuario,
            'nome': usuario.Nome,
            'login': usuario.Login,
            'email': usuario.Email,
            'role': usuario.Role if current_user and current_user.Role == 'admin' else None
        }
    }), 200

@bp_users.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def deletar_usuario(user_id):
    """Deleta um usuário específico (apenas para administradores)"""
    current_user_id = get_jwt_identity()
    current_user = Usuario.query.get(current_user_id)
    
    # Apenas admin pode deletar usuários
    if not current_user or current_user.Role != 'admin':
        return jsonify({'msg': 'Acesso negado. Apenas administradores podem deletar usuários.'}), 403
    
    # Admin não pode deletar a si mesmo
    if int(current_user_id) == user_id:
        return jsonify({'msg': 'Você não pode deletar seu próprio usuário.'}), 400
    
    usuario = Usuario.query.get(user_id)
    if not usuario:
        return jsonify({'msg': 'Usuário não encontrado'}), 404
    
    # Em um sistema real, você poderia fazer soft delete ou verificar dependências
    db.session.delete(usuario)
    db.session.commit()
    
    return jsonify({'msg': 'Usuário deletado com sucesso'}), 200
