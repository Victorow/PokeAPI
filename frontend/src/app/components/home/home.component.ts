import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../services/pokemon.service';
import { ModalService } from '../../services/modal.service';
import { TeamStateService } from '../../services/team-state.service';
import { Pokemon, AddPokemonRequest } from '../../models/pokemon.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, PokemonCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  isLoading = false;
  errorMessage = '';
  totalPokemons = 1025;

  // Filtros
  searchName = '';
  searchId = '';
  selectedGeneration = '';
  generations = ['1', '2', '3', '4', '5', '6', '7', '8'];

  // Paginação
  limit = 20;
  offset = 0;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private pokemonService: PokemonService,
    private modalService: ModalService,
    private teamStateService: TeamStateService
  ) {}

  ngOnInit(): void {
    this.loadPokemons();
    this.loadTeamAndFavoritos();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadTeamAndFavoritos(): void {
    // Carregar equipe e favoritos do servidor para sincronizar
    const teamSub = this.pokemonService.getEquipe().subscribe({
      next: (teamData) => {
        const favoritosSub = this.pokemonService.getFavoritos().subscribe({
          next: (favoritosData) => {
            this.teamStateService.syncWithServer(teamData, favoritosData);
          },
          error: (error) => console.error('Erro ao carregar favoritos:', error)
        });
        this.subscriptions.push(favoritosSub);
      },
      error: (error) => console.error('Erro ao carregar equipe:', error)
    });
    this.subscriptions.push(teamSub);
  }

  loadPokemons(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filters: any = { limit: this.limit, offset: this.offset };
    
    if (this.searchName) {
      filters.nome = this.searchName;
    }
    
    if (this.searchId) {
      filters.id = this.searchId;
    }
    
    if (this.selectedGeneration) {
      filters.geracao = this.selectedGeneration;
    }

    this.pokemonService.getPokemons(filters).subscribe({
      next: (data) => {
        data.forEach((pokemon: Pokemon) => {
          this.pokemonService.getPokemonDetails(pokemon.nome).subscribe({
            next: (details) => {
              pokemon.tipos = details.types;
              pokemon.stats = details.stats;
            }
          });
        });
        
        // Sincronizar com estado global
        data.forEach((pokemon: Pokemon) => {
          pokemon.equipe = this.teamStateService.isInTeam(pokemon.nome);
          pokemon.favorito = this.teamStateService.isInFavoritos(pokemon.nome);
        });
        
        this.pokemons = data;
        this.filteredPokemons = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pokémons:', error);
        this.errorMessage = 'Erro ao carregar pokémons. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.offset = 0;
    this.loadPokemons();
  }

  onGenerationChange(): void {
    this.offset = 0;
    this.loadPokemons();
  }

  clearFilters(): void {
    this.searchName = '';
    this.searchId = '';
    this.selectedGeneration = '';
    this.offset = 0;
    this.loadPokemons();
  }

  getFavoritosCount(): number {
    return this.teamStateService.getFavoritosCount();
  }

  getEquipeCount(): number {
    return this.teamStateService.getTeamCount();
  }

  toggleFavorito(pokemon: Pokemon): void {
    const request: AddPokemonRequest = {
      codigo: pokemon.nome,
      nome: pokemon.nome,
      imagem: pokemon.imagem
    };

    if (pokemon.favorito) {
      this.modalService.showConfirm(
        `Deseja remover ${pokemon.nome} dos favoritos?`,
        'warning',
        'Sim, remover',
        'Cancelar'
      ).subscribe((result: boolean) => {
        if (result) {
          this.pokemonService.removeFavorito(pokemon.nome).subscribe({
            next: () => {
              pokemon.favorito = false;
              this.teamStateService.removeFromFavoritos(pokemon.nome);
              this.modalService.showSuccess(`${pokemon.nome} removido dos favoritos!`);
            },
            error: (error) => {
              console.error('Erro ao remover favorito:', error);
              this.modalService.showError('Erro ao remover dos favoritos');
            }
          });
        }
      });
    } else {
      this.pokemonService.addFavorito(request).subscribe({
        next: () => {
          pokemon.favorito = true;
          this.teamStateService.addToFavoritos(pokemon.nome);
          this.modalService.showSuccess(`${pokemon.nome} adicionado aos favoritos!`);
        },
        error: (error) => {
          console.error('Erro ao adicionar favorito:', error);
          this.modalService.showError('Erro ao adicionar aos favoritos');
        }
      });
    }
  }

  toggleEquipe(pokemon: Pokemon): void {
    const request: AddPokemonRequest = {
      codigo: pokemon.nome,
      nome: pokemon.nome,
      imagem: pokemon.imagem
    };

    if (pokemon.equipe) {
      this.modalService.showConfirm(
        `Deseja remover ${pokemon.nome} da equipe?`,
        'warning',
        'Sim, remover',
        'Cancelar'
      ).subscribe((result: boolean) => {
        if (result) {
          this.pokemonService.removeEquipe(pokemon.nome).subscribe({
            next: () => {
              pokemon.equipe = false;
              this.teamStateService.removeFromTeam(pokemon.nome);
              this.modalService.showSuccess(`${pokemon.nome} removido da equipe!`);
            },
            error: (error) => {
              console.error('Erro ao remover da equipe:', error);
              this.modalService.showError('Erro ao remover da equipe');
            }
          });
        }
      });
    } else {
      this.pokemonService.addEquipe(request).subscribe({
        next: () => {
          pokemon.equipe = true;
          this.teamStateService.addToTeam(pokemon.nome);
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

  loadMore(): void {
    this.offset += this.limit;
    this.loadPokemons();
  }
}