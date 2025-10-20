export interface Pokemon {
  id: number;
  nome: string;
  imagem: string;
  favorito: boolean;
  equipe: boolean;
  tipo?: string;
  tipos?: PokemonType[];
  stats?: PokemonStat[]; // Adiciona stats
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonUsuario {
  id: number;
  codigo: string;
  nome: string;
  imagem: string;
  tipo?: string;
}

export interface AddPokemonRequest {
  codigo: string;
  nome: string;
  imagem: string;
}
