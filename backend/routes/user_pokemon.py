from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, PokemonUsuario, TipoPokemon
import requests

bp_user_pokemon = Blueprint('user_pokemon', __name__, url_prefix='/user-pokemon')

POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon'

def get_ou_cria_tipo(tipo_nome):
    """Busca ou cria um tipo de pokémon no banco"""
    tipo = TipoPokemon.query.filter_by(Descricao=tipo_nome.capitalize()).first()
    if not tipo:
        tipo = TipoPokemon(Descricao=tipo_nome.capitalize())
        db.session.add(tipo)
        db.session.commit()
    return tipo.IDTipoPokemon

def buscar_tipo_pokemon(codigo):
    """Busca o tipo principal do pokémon na PokeAPI"""
    try:
        response = requests.get(f"{POKEAPI_URL}/{codigo}")
        if response.status_code == 200:
            data = response.json()
            if data['types']:
                tipo_nome = data['types'][0]['type']['name']
                return get_ou_cria_tipo(tipo_nome)
        return get_ou_cria_tipo('Normal')
    except:
        return get_ou_cria_tipo('Normal')

# ========== FAVORITOS ==========

@bp_user_pokemon.route('/favoritos', methods=['GET'])
@jwt_required()
def listar_favoritos():
    """Lista todos os pokémons favoritos do usuário"""
    user_id = get_jwt_identity()
    favoritos = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), Favorito=True).all()
    return jsonify([
        {
            'id': p.IDPokemonUsuario,
            'codigo': p.Codigo,
            'nome': p.Nome,
            'imagem': p.ImagemUrl,
            'tipo': p.tipo.Descricao if p.tipo else None
        } for p in favoritos
    ]), 200

@bp_user_pokemon.route('/favoritos', methods=['POST'])
@jwt_required()
def adicionar_favorito():
    """Adiciona um pokémon aos favoritos"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not all(key in data for key in ['codigo', 'nome', 'imagem']):
        return jsonify({'msg': 'Dados incompletos (codigo, nome, imagem são obrigatórios)'}), 400
    
    # Validações de entrada
    if not all(isinstance(data[key], str) for key in ['codigo', 'nome', 'imagem']):
        return jsonify({'msg': 'Dados inválidos'}), 400
    
    if len(data['codigo']) > 50 or len(data['nome']) > 100 or len(data['imagem']) > 200:
        return jsonify({'msg': 'Dados muito longos'}), 400
    
    # Validação básica de URL de imagem
    if not data['imagem'].startswith('http'):
        return jsonify({'msg': 'URL de imagem inválida'}), 400
    
    try:
        poke = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), Codigo=data['codigo']).first()
        
        if not poke:
            tipo_id = buscar_tipo_pokemon(data['codigo'])
            poke = PokemonUsuario(
                IDUsuario=int(user_id),
                IDTipoPokemon=tipo_id,
                Codigo=data['codigo'].strip(),
                Nome=data['nome'].strip(),
                ImagemUrl=data['imagem'].strip(),
                Favorito=True,
                GrupoBatalha=False
            )
            db.session.add(poke)
        else:
            poke.Favorito = True
        
        db.session.commit()
        return jsonify({'msg': 'Favorito adicionado!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': 'Erro interno do servidor'}), 500

@bp_user_pokemon.route('/favoritos/<codigo>', methods=['DELETE'])
@jwt_required()
def remover_favorito(codigo):
    """Remove um pokémon dos favoritos"""
    user_id = get_jwt_identity()
    poke = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), Codigo=codigo).first()
    
    if not poke:
        return jsonify({'msg': 'Pokémon não encontrado nos favoritos'}), 404
    
    poke.Favorito = False
    
    if not poke.GrupoBatalha:
        db.session.delete(poke)
    
    db.session.commit()
    return jsonify({'msg': 'Favorito removido!'}), 200

# ========== EQUIPE (GRUPO DE BATALHA) ==========

@bp_user_pokemon.route('/equipe', methods=['GET'])
@jwt_required()
def listar_equipe():
    """Lista todos os pokémons da equipe do usuário"""
    user_id = get_jwt_identity()
    equipe = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), GrupoBatalha=True).all()
    return jsonify([
        {
            'id': p.IDPokemonUsuario,
            'codigo': p.Codigo,
            'nome': p.Nome,
            'imagem': p.ImagemUrl,
            'tipo': p.tipo.Descricao if p.tipo else None
        } for p in equipe
    ]), 200

@bp_user_pokemon.route('/equipe', methods=['POST'])
@jwt_required()
def adicionar_equipe():
    """Adiciona um pokémon à equipe (máximo 6)"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not all(key in data for key in ['codigo', 'nome', 'imagem']):
        return jsonify({'msg': 'Dados incompletos (codigo, nome, imagem são obrigatórios)'}), 400
    
    equipe_count = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), GrupoBatalha=True).count()
    if equipe_count >= 6:
        return jsonify({'msg': 'Equipe já possui 6 Pokémon!'}), 400
    
    poke = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), Codigo=data['codigo']).first()
    
    if not poke:
        tipo_id = buscar_tipo_pokemon(data['codigo'])
        poke = PokemonUsuario(
            IDUsuario=int(user_id),
            IDTipoPokemon=tipo_id,
            Codigo=data['codigo'],
            Nome=data['nome'],
            ImagemUrl=data['imagem'],
            Favorito=False,
            GrupoBatalha=True
        )
        db.session.add(poke)
    else:
        if poke.GrupoBatalha:
            return jsonify({'msg': 'Pokémon já está na equipe'}), 400
        poke.GrupoBatalha = True
    
    db.session.commit()
    return jsonify({'msg': 'Pokémon adicionado à equipe!'}), 201

@bp_user_pokemon.route('/equipe/<codigo>', methods=['DELETE'])
@jwt_required()
def remover_equipe(codigo):
    """Remove um pokémon da equipe"""
    user_id = get_jwt_identity()
    poke = PokemonUsuario.query.filter_by(IDUsuario=int(user_id), Codigo=codigo).first()
    
    if not poke or not poke.GrupoBatalha:
        return jsonify({'msg': 'Pokémon não encontrado na equipe'}), 404
    
    poke.GrupoBatalha = False
    
    if not poke.Favorito:
        db.session.delete(poke)
    
    db.session.commit()
    return jsonify({'msg': 'Pokémon removido da equipe!'}), 200
