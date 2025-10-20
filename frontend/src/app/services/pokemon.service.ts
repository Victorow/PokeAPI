import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getPokemons(filters?: any): Observable<any> {
    let url = `${this.apiUrl}/pokemon`;
    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      url += `?${params.toString()}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getPokemonDetails(name: string): Observable<any> {
    return this.http.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
  }

  getFavoritos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-pokemon/favoritos`, { headers: this.getHeaders() });
  }

  addFavorito(pokemon: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-pokemon/favoritos`, pokemon, { headers: this.getHeaders() });
  }

  removeFavorito(codigo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user-pokemon/favoritos/${codigo}`, { headers: this.getHeaders() });
  }

  getEquipe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-pokemon/equipe`, { headers: this.getHeaders() });
  }

  addEquipe(pokemon: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/user-pokemon/equipe`, pokemon, { headers: this.getHeaders() });
  }

  removeEquipe(codigo: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/user-pokemon/equipe/${codigo}`, { headers: this.getHeaders() });
  }
}
