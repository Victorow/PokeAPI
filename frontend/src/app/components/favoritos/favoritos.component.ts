import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../services/pokemon.service';
import { ModalService } from '../../services/modal.service';
import { Pokemon } from '../../models/pokemon.model';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, PokemonCardComponent],
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css']
})
export class FavoritosComponent implements OnInit {
  favoritos: Pokemon[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private pokemonService: PokemonService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadFavoritos();
  }

  loadFavoritos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.pokemonService.getFavoritos().subscribe({
      next: (data) => {
        this.favoritos = data.map((poke: any) => ({
          id: poke.id,
          nome: poke.codigo,
          imagem: poke.imagem,
          favorito: true,
          equipe: false
        }));

        this.favoritos.forEach((pokemon: Pokemon) => {
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
        console.error('Erro ao carregar favoritos:', error);
        this.errorMessage = 'Erro ao carregar favoritos. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  toggleFavorito(pokemon: Pokemon): void {
    this.modalService.showConfirm(
      `Deseja remover ${pokemon.nome} dos favoritos?`,
      'warning',
      'Sim, remover',
      'Cancelar'
    ).subscribe((result: boolean) => {
      if (result) {
        this.pokemonService.removeFavorito(pokemon.nome).subscribe({
          next: () => {
            this.favoritos = this.favoritos.filter(p => p.nome !== pokemon.nome);
            this.modalService.showSuccess(`${pokemon.nome} removido dos favoritos!`);
          },
          error: (error) => {
            console.error('Erro ao remover favorito:', error);
            this.modalService.showError('Erro ao remover dos favoritos');
          }
        });
      }
    });
  }

  toggleEquipe(pokemon: Pokemon): void {
    const request = {
      codigo: pokemon.nome,
      nome: pokemon.nome,
      imagem: pokemon.imagem
    };

    this.pokemonService.addEquipe(request).subscribe({
      next: () => {
        pokemon.equipe = true;
        this.modalService.showSuccess(`${pokemon.nome} adicionado à equipe!`);
      },
      error: (error) => {
        console.error('Erro ao adicionar à equipe:', error);
        const msg = error.error?.msg || 'Equipe completa! Máximo de 6 Pokémon.';
        this.modalService.showError(msg);
      }
    });
  }
}
