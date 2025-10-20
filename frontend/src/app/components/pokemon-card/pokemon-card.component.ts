import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon, PokemonStat } from '../../models/pokemon.model';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.css']
})
export class PokemonCardComponent {
  @Input() pokemon!: Pokemon;
  @Output() toggleFavorito = new EventEmitter<Pokemon>();
  @Output() toggleEquipe = new EventEmitter<Pokemon>();

  // Mapeamento de tipos em português
  private typeTranslations: { [key: string]: string } = {
    'normal': 'Normal',
    'fire': 'Fogo',
    'water': 'Água',
    'grass': 'Grama',
    'electric': 'Elétrico',
    'ice': 'Gelo',
    'fighting': 'Lutador',
    'poison': 'Venenoso',
    'ground': 'Terrestre',
    'flying': 'Voador',
    'psychic': 'Psíquico',
    'bug': 'Inseto',
    'rock': 'Pedra',
    'ghost': 'Fantasma',
    'dragon': 'Dragão',
    'dark': 'Sombrio',
    'steel': 'Metálico',
    'fairy': 'Fada'
  };

  // Mapeamento de stats em português
  private statTranslations: { [key: string]: string } = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defesa',
    'special-attack': 'Atq. Esp.',
    'special-defense': 'Def. Esp.',
    'speed': 'Velocidade'
  };

  onToggleFavorito(): void {
    this.toggleFavorito.emit(this.pokemon);
  }

  onToggleEquipe(): void {
    this.toggleEquipe.emit(this.pokemon);
  }

  getFirstType(): string {
    if (this.pokemon.tipos && this.pokemon.tipos.length > 0) {
      return this.pokemon.tipos[0].type.name;
    }
    return 'normal';
  }

  getTypeName(type: string): string {
    return this.typeTranslations[type] || type;
  }

  getStatName(statName: string): string {
    return this.statTranslations[statName] || statName;
  }

  // Retorna apenas HP, Ataque e Defesa
  getMainStats(): PokemonStat[] {
    if (!this.pokemon.stats) return [];
    return this.pokemon.stats.filter((stat: PokemonStat) => 
      ['hp', 'attack', 'defense'].includes(stat.stat.name)
    );
  }

  // Calcula porcentagem para a barra (max 255)
  getStatPercentage(baseStat: number): number {
    return (baseStat / 255) * 100;
  }
}
