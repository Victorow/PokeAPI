from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from datetime import timedelta
import os

# Importar os modelos e blueprints
from models import db
from routes.auth import bp_auth
from routes.pokemon import bp_pokemon
from routes.user_pokemon import bp_user_pokemon
from routes.users import bp_users

app = Flask(__name__)

# CORS CONFIGURADO
CORS(app, 
     origins=['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:5000', 'http://127.0.0.1:5000'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

# Configurações de banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pokeapi.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurações de JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'fallback-key-development')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_ENCODE_ISSUER'] = None
app.config['JWT_DECODE_ISSUER'] = None

db.init_app(app)
jwt = JWTManager(app)

# Registra os blueprints
app.register_blueprint(bp_auth)
app.register_blueprint(bp_pokemon)
app.register_blueprint(bp_user_pokemon)
app.register_blueprint(bp_users)

@app.route('/')
def home():
    return 'API PokeAPI está funcionando!'

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
