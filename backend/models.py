from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = 'usuario'
    IDUsuario = db.Column(db.Integer, primary_key=True)
    Nome = db.Column(db.String(100), nullable=False)
    Login = db.Column(db.String(100), unique=True, nullable=False)
    Email = db.Column(db.String(100), unique=True, nullable=False)
    Senha = db.Column(db.String(200), nullable=False)
    Role = db.Column(db.String(20), default='user', nullable=False)  # 'admin' ou 'user'
    DtInclusao = db.Column(db.DateTime, default=datetime.utcnow)
    DtAlteracao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    pokemons = db.relationship('PokemonUsuario', backref='usuario', lazy=True)

class TipoPokemon(db.Model):
    __tablename__ = 'tipopokemon'
    IDTipoPokemon = db.Column(db.Integer, primary_key=True)
    Descricao = db.Column(db.String(50), nullable=False)

class PokemonUsuario(db.Model):
    __tablename__ = 'pokemonusuario'
    IDPokemonUsuario = db.Column(db.Integer, primary_key=True)
    IDUsuario = db.Column(db.Integer, db.ForeignKey('usuario.IDUsuario'), nullable=False)
    IDTipoPokemon = db.Column(db.Integer, db.ForeignKey('tipopokemon.IDTipoPokemon'), nullable=False)
    Codigo = db.Column(db.String(50), nullable=False)
    ImagemUrl = db.Column(db.String(200))
    Nome = db.Column(db.String(100), nullable=False)
    GrupoBatalha = db.Column(db.Boolean, default=False)
    Favorito = db.Column(db.Boolean, default=False)
    tipo = db.relationship('TipoPokemon')