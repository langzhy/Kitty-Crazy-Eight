import { useState, useEffect, useCallback } from 'react';
import { CardData, GameState, GameStatus, PlayerType, Suit } from '../types';
import { createDeck, shuffleDeck } from '../constants';

export const useGameLogic = () => {
  const [state, setState] = useState<GameState>({
    playerHand: [],
    aiHand: [],
    drawPile: [],
    discardPile: [],
    currentSuit: null,
    turn: 'player',
    status: 'idle',
    winner: null,
    lastAction: '欢迎来到 Kitty 疯狂 8 点！'
  });

  const startNewGame = useCallback(() => {
    const deck = shuffleDeck(createDeck());
    const playerHand = deck.splice(0, 8);
    const aiHand = deck.splice(0, 8);
    
    // Ensure first discard is not an 8 for simplicity
    let firstDiscardIndex = deck.findIndex(c => c.rank !== '8');
    if (firstDiscardIndex === -1) firstDiscardIndex = 0;
    const discardPile = [deck.splice(firstDiscardIndex, 1)[0]];
    
    setState({
      playerHand,
      aiHand,
      drawPile: deck,
      discardPile,
      currentSuit: discardPile[0].suit,
      turn: 'player',
      status: 'playing',
      winner: null,
      lastAction: '游戏开始！轮到你了。'
    });
  }, []);

  const checkWinner = useCallback((newState: GameState) => {
    if (newState.playerHand.length === 0) {
      return { ...newState, status: 'game_over' as GameStatus, winner: 'player' as PlayerType, lastAction: '你赢了！太棒了，喵！' };
    }
    if (newState.aiHand.length === 0) {
      return { ...newState, status: 'game_over' as GameStatus, winner: 'ai' as PlayerType, lastAction: 'Kitty AI 赢了！下次好运。' };
    }
    return newState;
  }, []);

  const playCard = useCallback((cardId: string, player: PlayerType, newSuit?: Suit) => {
    const suitNames: Record<string, string> = { hearts: '红心', diamonds: '方块', clubs: '梅花', spades: '黑桃' };
    setState(prev => {
      const hand = player === 'player' ? prev.playerHand : prev.aiHand;
      const cardIndex = hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const card = hand[cardIndex];
      const topCard = prev.discardPile[prev.discardPile.length - 1];
      
      // Validation
      const isEight = card.rank === '8';
      const matchesSuit = card.suit === prev.currentSuit;
      const matchesRank = card.rank === topCard.rank;

      if (!isEight && !matchesSuit && !matchesRank) {
        return { ...prev, lastAction: "你不能出这张牌！" };
      }

      const newHand = [...hand];
      newHand.splice(cardIndex, 1);

      let nextState: GameState = {
        ...prev,
        [player === 'player' ? 'playerHand' : 'aiHand']: newHand,
        discardPile: [...prev.discardPile, card],
        currentSuit: isEight ? (newSuit || card.suit) : card.suit,
        turn: player === 'player' ? 'ai' : 'player',
        status: 'playing',
        pendingCardId: undefined,
        lastAction: `${player === 'player' ? '你' : 'Kitty'} 出了 ${suitNames[card.suit]}${card.rank}。`
      };

      if (isEight && player === 'player' && !newSuit) {
        return { 
          ...prev, 
          status: 'suit_selection' as GameStatus, 
          pendingCardId: cardId,
          lastAction: '请选择一个新花色！' 
        };
      }

      return checkWinner(nextState);
    });
  }, [checkWinner]);

  const drawCard = useCallback((player: PlayerType, endTurn: boolean = false) => {
    setState(prev => {
      let currentDrawPile = [...prev.drawPile];
      let currentDiscardPile = [...prev.discardPile];

      if (currentDrawPile.length === 0) {
        // Refill from discard pile if possible
        if (currentDiscardPile.length <= 1) {
          return { 
            ...prev, 
            turn: endTurn ? (player === 'player' ? 'ai' : 'player') : prev.turn,
            lastAction: '摸牌堆和弃牌堆都空了！' 
          };
        }
        const topCard = currentDiscardPile.pop()!;
        currentDrawPile = shuffleDeck(currentDiscardPile);
        currentDiscardPile = [topCard];
      }

      const card = currentDrawPile.pop()!;
      const newHand = [...(player === 'player' ? prev.playerHand : prev.aiHand), card];

      return {
        ...prev,
        drawPile: currentDrawPile,
        discardPile: currentDiscardPile,
        [player === 'player' ? 'playerHand' : 'aiHand']: newHand,
        lastAction: `${player === 'player' ? '你' : 'Kitty'} 摸了一张牌。`,
        turn: endTurn ? (player === 'player' ? 'ai' : 'player') : prev.turn
      };
    });
  }, []);

  const skipTurn = useCallback(() => {
    setState(prev => ({
      ...prev,
      turn: prev.turn === 'player' ? 'ai' : 'player',
      lastAction: `${prev.turn === 'player' ? '你' : 'Kitty'} 跳过了回合。`
    }));
  }, []);

  // AI Turn logic
  useEffect(() => {
    if (state.status === 'playing' && state.turn === 'ai') {
      const timer = setTimeout(() => {
        const topCard = state.discardPile[state.discardPile.length - 1];
        const playableCards = state.aiHand.filter(c => 
          c.rank === '8' || c.suit === state.currentSuit || c.rank === topCard.rank
        );

        if (playableCards.length > 0) {
          // AI Strategy: Play non-8s first, then 8s
          const nonEight = playableCards.find(c => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === '8') {
            // AI picks suit it has most of
            const suitCounts: Record<string, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            state.aiHand.forEach(c => suitCounts[c.suit]++);
            const bestSuit = Object.entries(suitCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as Suit;
            playCard(cardToPlay.id, 'ai', bestSuit);
          } else {
            playCard(cardToPlay.id, 'ai');
          }
        } else {
          drawCard('ai', true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state.status, state.turn, state.aiHand, state.discardPile, state.currentSuit, playCard, drawCard]);

  return { state, startNewGame, playCard, drawCard, skipTurn, setState };
};
