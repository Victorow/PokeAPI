import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';

@Injectable({
  providedIn: 'root'
})
export class TeamStateService {
  private teamSubject = new BehaviorSubject<Set<string>>(new Set());
  private favoritosSubject = new BehaviorSubject<Set<string>>(new Set());
  
  public team$ = this.teamSubject.asObservable();
  public favoritos$ = this.favoritosSubject.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const savedTeam = localStorage.getItem('team');
    const savedFavoritos = localStorage.getItem('favoritos');
    
    if (savedTeam) {
      this.teamSubject.next(new Set(JSON.parse(savedTeam)));
    }
    
    if (savedFavoritos) {
      this.favoritosSubject.next(new Set(JSON.parse(savedFavoritos)));
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('team', JSON.stringify([...this.teamSubject.value]));
    localStorage.setItem('favoritos', JSON.stringify([...this.favoritosSubject.value]));
  }

  addToTeam(pokemonName: string): void {
    const currentTeam = this.teamSubject.value;
    if (currentTeam.size < 6) {
      currentTeam.add(pokemonName);
      this.teamSubject.next(new Set(currentTeam));
      this.saveToStorage();
    }
  }

  removeFromTeam(pokemonName: string): void {
    const currentTeam = this.teamSubject.value;
    currentTeam.delete(pokemonName);
    this.teamSubject.next(new Set(currentTeam));
    this.saveToStorage();
  }

  addToFavoritos(pokemonName: string): void {
    const currentFavoritos = this.favoritosSubject.value;
    currentFavoritos.add(pokemonName);
    this.favoritosSubject.next(new Set(currentFavoritos));
    this.saveToStorage();
  }

  removeFromFavoritos(pokemonName: string): void {
    const currentFavoritos = this.favoritosSubject.value;
    currentFavoritos.delete(pokemonName);
    this.favoritosSubject.next(new Set(currentFavoritos));
    this.saveToStorage();
  }

  isInTeam(pokemonName: string): boolean {
    return this.teamSubject.value.has(pokemonName);
  }

  isInFavoritos(pokemonName: string): boolean {
    return this.favoritosSubject.value.has(pokemonName);
  }

  getTeamCount(): number {
    return this.teamSubject.value.size;
  }

  getFavoritosCount(): number {
    return this.favoritosSubject.value.size;
  }

  getTeam(): string[] {
    return [...this.teamSubject.value];
  }

  getFavoritos(): string[] {
    return [...this.favoritosSubject.value];
  }

  clearTeam(): void {
    this.teamSubject.next(new Set());
    this.saveToStorage();
  }

  clearFavoritos(): void {
    this.favoritosSubject.next(new Set());
    this.saveToStorage();
  }

  // Método para sincronizar com dados do servidor
  syncWithServer(teamData: any[], favoritosData: any[]): void {
    const teamNames = new Set(teamData.map(p => p.codigo || p.nome));
    const favoritosNames = new Set(favoritosData.map(p => p.codigo || p.nome));
    
    this.teamSubject.next(teamNames);
    this.favoritosSubject.next(favoritosNames);
    this.saveToStorage();
  }
}
