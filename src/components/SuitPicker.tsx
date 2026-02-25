import React from 'react';
import { motion } from 'motion/react';
import { Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';

interface SuitPickerProps {
  onSelect: (suit: Suit) => void;
}

export const SuitPicker: React.FC<SuitPickerProps> = ({ onSelect }) => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

const suitNames: Record<Suit, string> = {
    hearts: '红心',
    diamonds: '方块',
    clubs: '梅花',
    spades: '黑桃'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full mx-4">
        <h2 className="text-2xl font-display mb-6 text-kitty-brown">选择一个新花色！ 🐾</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-kitty-teal hover:bg-kitty-cream transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${SUIT_COLORS[suit]} group-hover:scale-110 transition-transform`}>
                {SUIT_SYMBOLS[suit]}
              </span>
              <span className="font-medium text-slate-600">{suitNames[suit]}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
