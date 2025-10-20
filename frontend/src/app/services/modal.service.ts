import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalData {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData | null>(null);
  public modal$ = this.modalSubject.asObservable();

  constructor() {
    // Proteger contra manipulação via console
    this.protectConsole();
  }

  private protectConsole(): void {
    // Sobrescrever window.alert para usar nosso modal
    window.alert = (message: any) => {
      this.showAlert(String(message));
    };

    // Sobrescrever window.confirm para usar nosso modal
    window.confirm = (message: any) => {
      // Para confirm nativo, vamos usar um modal simples
      this.showAlert(String(message), 'info');
      return true; // Sempre retorna true para evitar problemas
    };

    // Proteger contra sobrescrita do alert e confirm
    Object.defineProperty(window, 'alert', {
      value: (message: any) => {
        this.showAlert(String(message));
      },
      writable: false,
      configurable: false
    });

    Object.defineProperty(window, 'confirm', {
      value: (message: any) => {
        this.showAlert(String(message), 'info');
        return true;
      },
      writable: false,
      configurable: false
    });

    // Proteger console.log para evitar spam
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      // Permitir apenas logs de desenvolvimento
      if (args.some(arg => typeof arg === 'string' && arg.includes('Angular'))) {
        originalConsoleLog.apply(console, args);
      }
    };

    // Proteger contra manipulação do modal service
    Object.freeze(this);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private processMessage(message: string): string {
    // Capitaliza nomes de Pokémon que estão em minúsculo
    return message.replace(/\b[a-z]+\b/g, (match) => {
      // Lista de nomes de Pokémon comuns para capitalizar
      const pokemonNames = [
        'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard',
        'squirtle', 'wartortle', 'blastoise', 'caterpie', 'metapod', 'butterfree',
        'weedle', 'kakuna', 'beedrill', 'pidgey', 'pidgeotto', 'pidgeot',
        'rattata', 'raticate', 'spearow', 'fearow', 'ekans', 'arbok',
        'pikachu', 'raichu', 'sandshrew', 'sandslash', 'nidoran', 'nidorina',
        'nidoqueen', 'nidorino', 'nidoking', 'clefairy', 'clefable', 'vulpix',
        'ninetales', 'jigglypuff', 'wigglytuff', 'zubat', 'golbat', 'oddish',
        'gloom', 'vileplume', 'paras', 'parasect', 'venonat', 'venomoth',
        'diglett', 'dugtrio', 'meowth', 'persian', 'psyduck', 'golduck',
        'mankey', 'primeape', 'growlithe', 'arcanine', 'poliwag', 'poliwhirl',
        'poliwrath', 'abra', 'kadabra', 'alakazam', 'machop', 'machoke',
        'machamp', 'bellsprout', 'weepinbell', 'victreebel', 'tentacool',
        'tentacruel', 'geodude', 'graveler', 'golem', 'ponyta', 'rapidash',
        'slowpoke', 'slowbro', 'magnemite', 'magneton', 'farfetchd', 'doduo',
        'dodrio', 'seel', 'dewgong', 'grimer', 'muk', 'shellder', 'cloyster',
        'gastly', 'haunter', 'gengar', 'onix', 'drowzee', 'hypno', 'krabby',
        'kingler', 'voltorb', 'electrode', 'exeggcute', 'exeggutor', 'cubone',
        'marowak', 'hitmonlee', 'hitmonchan', 'lickitung', 'koffing', 'weezing',
        'rhyhorn', 'rhydon', 'chansey', 'tangela', 'kangaskhan', 'horsea',
        'seadra', 'goldeen', 'seaking', 'staryu', 'starmie', 'mr-mime',
        'scyther', 'jynx', 'electabuzz', 'magmar', 'pinsir', 'tauros',
        'magikarp', 'gyarados', 'lapras', 'ditto', 'eevee', 'vaporeon',
        'jolteon', 'flareon', 'porygon', 'omanyte', 'omastar', 'kabuto',
        'kabutops', 'aerodactyl', 'snorlax', 'articuno', 'zapdos', 'moltres',
        'dratini', 'dragonair', 'dragonite', 'mewtwo', 'mew'
      ];
      
      if (pokemonNames.includes(match.toLowerCase())) {
        return this.capitalizeFirstLetter(match);
      }
      return match;
    });
  }

  showAlert(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.modalSubject.next({
      message: this.processMessage(message),
      type,
      showCancel: false,
      confirmText: 'OK'
    });
  }

  showConfirm(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Observable<boolean> {
    return new Observable(observer => {
      this.modalSubject.next({
        message: this.processMessage(message),
        type,
        showCancel: true,
        confirmText,
        cancelText,
        onConfirm: () => {
          observer.next(true);
          observer.complete();
        },
        onCancel: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  showSuccess(message: string): void {
    this.showAlert(message, 'success');
  }

  showError(message: string): void {
    this.showAlert(message, 'error');
  }

  showInfo(message: string): void {
    this.showAlert(message, 'info');
  }

  showWarning(message: string): void {
    this.showAlert(message, 'warning');
  }

  close(): void {
    this.modalSubject.next(null);
  }
}
