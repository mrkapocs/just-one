import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  animate,
  sequence,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('simpleFadeAnimation', [
      state('hidden', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('hidden <=> visible', [animate('1s ease')]),
    ]),
    trigger('slideLeft', [
      state('out', style({ transform: 'translateX(0px)' })),
      state('over', style({ transform: 'translateX(-365px)' })),
      transition(
        'out => over',
        animate('0.5s ease', style({ transform: 'translateX(-365px)', opacity: 1 }))
      ),
      transition(
        'over => out',
        animate('0.5s ease', style({ transform: 'translateX(-365px)', opacity: 0 }))
      ),
    ]),
  ],
})
export class AppComponent {
  title = 'just-one';

  deckSlideState: 'out' | 'over' = 'out';

  deckAnimationFinished(event: any) {
    if (event.fromState === 'out' && event.toState === 'over') {
      this.deckSlideState = 'out';
      this.drawCardAfterAnimation();
    } else {
      this.deckSlideState = 'out';
    }
  }

  deck: string[][] = [];
  discardPile: string[][] = [];
  drawnCard: string[] = [];

  constructor(httpClient: HttpClient) {
    httpClient
      .get('assets/JUST_ONE_LIST_OF_WORD_CARDS.txt', {
        responseType: 'text',
      })
      .pipe(
        map((data) =>
          data.split('\r\n').reduce<string[][]>((acc, curr) => {
            const lastIndex = acc.length - 1;
            const normalizedCurr = curr.trim().toLowerCase().slice(3);
            if (lastIndex >= 0 && acc[lastIndex].length < 5) {
              acc[acc.length - 1].push(normalizedCurr);
              return acc;
            } else {
              acc.push([normalizedCurr]);
              return acc;
            }
          }, [])
        ),
        map(this.shuffle),
        tap((data) => (this.deck = data))
      )
      .subscribe();
  }

  drawCard() {
    this.deckSlideState = 'over';
  }

  drawCardAfterAnimation() {
    if (this.deck.length === 0) {
      alert('No more cards in the deck!');
      return;
    }
    this.discardPile.push(this.drawnCard);
    this.drawnCard = this.deck.pop() ?? [];
  }

  reset() {
    const fullDeck = [...this.deck, ...this.discardPile];
    this.deck = this.shuffle(fullDeck);
    this.discardPile = [];
    this.drawnCard = [];
  }

  private shuffle<T>(array: T[]) {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  }
}
