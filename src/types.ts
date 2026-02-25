export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface CardData {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GameStatus = 'idle' | 'dealing' | 'playing' | 'suit_selection' | 'game_over';
export type PlayerType = 'player' | 'ai';

export interface GameState {
  playerHand: CardData[];
  aiHand: CardData[];
  drawPile: CardData[];
  discardPile: CardData[];
  currentSuit: Suit | null;
  turn: PlayerType;
  status: GameStatus;
  winner: PlayerType | null;
  lastAction: string;
  pendingCardId?: string;
}
