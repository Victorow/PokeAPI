from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import requests
from models import PokemonUsuario

bp_pokemon = Blueprint('pokemon', __name__, url_prefix='/pokemon')

POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon'
POKEAPI_GENERATION_URL = 'https://pokeapi.co/api/v2/generation'

@bp_pokemon.route('', methods=['GET'])
@jwt_required()
def listar_pokemons():
    """Lista pokémons com filtros de nome, geração, limit e offset"""
    nome = request.args.get('nome')
    geracao = request.args.get('geracao')
    
    # Validação e sanitização de parâmetros
    try:
        limit = int(request.args.get('limit', 20))
        offset = int(request.args.get('offset', 0))
    except (ValueError, TypeError):
        return jsonify({'msg': 'Parâmetros inválidos'}), 400
    
    # Limitar valores para evitar abuso
    limit = min(max(limit, 1), 100)  # Entre 1 e 100
    offset = max(offset, 0)  # Não negativo
    
    # Validação de entrada para filtros
    if nome and (len(nome) > 50 or not isinstance(nome, str)):
        return jsonify({'msg': 'Nome inválido'}), 400
    
    if geracao and (not geracao.isdigit() or int(geracao) < 1 or int(geracao) > 9):
        return jsonify({'msg': 'Geração inválida'}), 400
    
    user_id = get_jwt_identity()

    # Buscar favoritos e equipe do usuário
    favoritos = set()
    equipe = set()
    user_pokemons = PokemonUsuario.query.filter_by(IDUsuario=int(user_id)).all()
    for up in user_pokemons:
        if up.Favorito:
            favoritos.add(up.Codigo)
        if up.GrupoBatalha:
            equipe.add(up.Codigo)

    def enrich(poke_data):
        """Adiciona flags de favorito e equipe ao pokémon"""
        codigo = poke_data['name'] if 'name' in poke_data else poke_data.get('codigo')
        return {
            'id': poke_data['id'],
            'nome': poke_data['name'],
            'imagem': poke_data['sprites']['front_default'],
            'favorito': codigo in favoritos,
            'equipe': codigo in equipe
        }

    # Filtro por geração
    if geracao:
        gen_url = f"{POKEAPI_GENERATION_URL}/{geracao}"
        gen_resp = requests.get(gen_url)
        if gen_resp.status_code != 200:
            return jsonify({'msg': 'Geração não encontrada!'}), 404
        gen_data = gen_resp.json()
        pokemons = [p['name'] for p in gen_data['pokemon_species']]
        if nome:
            pokemons = [p for p in pokemons if nome.lower() in p.lower()]
        paginated = pokemons[offset:offset+limit]
        result = []
        for poke_name in paginated:
            poke_resp = requests.get(f"{POKEAPI_URL}/{poke_name}")
            if poke_resp.status_code == 200:
                poke_data = poke_resp.json()
                result.append(enrich(poke_data))
        return jsonify(result), 200
    
    # Filtro por nome (busca parcial)
    if nome:
        # Buscar uma lista maior de Pokémon para fazer busca parcial
        search_params = {'limit': 1000, 'offset': 0}  # Buscar mais Pokémon para filtrar
        search_resp = requests.get(POKEAPI_URL, params=search_params)
        
        if search_resp.status_code == 200:
            search_data = search_resp.json()
            # Filtrar Pokémon que contêm o termo de busca no nome
            matching_pokemon = []
            for poke in search_data['results']:
                if nome.lower() in poke['name'].lower():
                    matching_pokemon.append(poke)
            
            # Aplicar paginação aos resultados filtrados
            paginated_results = matching_pokemon[offset:offset+limit]
            
            result = []
            for poke in paginated_results:
                poke_resp = requests.get(poke['url'])
                if poke_resp.status_code == 200:
                    poke_data = poke_resp.json()
                    result.append(enrich(poke_data))
            
            return jsonify(result), 200
        else:
            return jsonify([]), 200
    
    # Listagem padrão com paginação
    params = {'limit': limit, 'offset': offset}
    resp = requests.get(POKEAPI_URL, params=params)
    data = resp.json()
    result = []
    for poke in data['results']:
        poke_resp = requests.get(poke['url'])
        if poke_resp.status_code == 200:
            poke_data = poke_resp.json()
            result.append(enrich(poke_data))
    return jsonify(result), 200
