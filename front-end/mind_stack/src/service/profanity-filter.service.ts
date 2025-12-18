import { Injectable } from '@angular/core';
import * as leoProfanity from 'leo-profanity';

@Injectable({
  providedIn: 'root'
})

export class ProfanityFilterService {

  constructor() {
    leoProfanity.add([
      'tanga',
      'gago',
      'bobo',
      'putangina',
      'punyeta',
      '8080',
      'bading',
      'tang ina mo',
      'galunggong',
      'tanginamo',
      'stupid',
      'idiot',
      'fuckyou'
    ]);
  }

  clean(text: string): string {
    return leoProfanity.clean(text);
  }

  hasBadWords(text: string): boolean {
    return leoProfanity.check(text);
  }
}