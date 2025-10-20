import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../services/pokemon.service';
import { ModalService } from '../../services/modal.service';
import { Pokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, PokemonCardComponent],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.css']
})
export class EquipeComponent implements OnInit {
  equipe: Pokemon[] = [];
  isLoading = false;
  errorMessage = '';
  maxEquipe = 6;

  constructor(
    private pokemonService: PokemonService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadEquipe();
  }

  loadEquipe(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pokemonService.getEquipe().subscribe({
      next: (data) => {
        this.equipe = data.map((poke: any) => ({
          id: poke.id,
          nome: poke.codigo,
          imagem: poke.imagem,
          favorito: false,
          equipe: true
        }));

        this.equipe.forEach((pokemon: Pokemon) => {
          this.pokemonService.getPokemonDetails(pokemon.nome).subscribe({
            next: (details) => {
              pokemon.tipos = details.types;
              pokemon.stats = details.stats;
            }
          });
        });

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar equipe:', error);
        this.errorMessage = 'Erro ao carregar equipe. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  toggleFavorito(pokemon: Pokemon): void {
    const request = {
      codigo: pokemon.nome,
      nome: pokemon.nome,
      imagem: pokemon.imagem
    };

    this.pokemonService.addFavorito(request).subscribe({
      next: () => {
        pokemon.favorito = true;
        this.modalService.showSuccess(`${pokemon.nome} adicionado aos favoritos!`);
      },
      error: (error) => {
        console.error('Erro ao adicionar aos favoritos:', error);
        this.modalService.showError('Erro ao adicionar aos favoritos');
      }
    });
  }

  toggleEquipe(pokemon: Pokemon): void {
    this.modalService.showConfirm(
      `Deseja remover ${pokemon.nome} da equipe?`,
      'warning',
      'Sim, remover',
      'Cancelar'
    ).subscribe((result: boolean) => {
      if (result) {
        this.pokemonService.removeEquipe(pokemon.nome).subscribe({
          next: () => {
            this.equipe = this.equipe.filter(p => p.nome !== pokemon.nome);
            this.modalService.showSuccess(`${pokemon.nome} removido da equipe!`);
          },
          error: (error) => {
            console.error('Erro ao remover da equipe:', error);
            this.modalService.showError('Erro ao remover da equipe');
          }
        });
      }
    });
  }

  getSlotsVazios(): number[] {
    const vazios = this.maxEquipe - this.equipe.length;
    return Array(vazios).fill(0);
  }
}
