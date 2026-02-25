import React from 'react';
import { motion } from 'motion/react';
import { CardData } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../constants';
import { Cat } from 'lucide-react';

interface CardProps {
  card?: CardData;
  isBack?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  index?: number;
}

export const Card: React.FC<CardProps> = ({ 
  card, 
  isBack = false, 
  onClick, 
  isPlayable = false,
  className = "",
  index = 0
}) => {
  return (
    <motion.div
      layoutId={card?.id || `back-${index}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isPlayable ? { y: -20, scale: 1.05 } : {}}
      onClick={isPlayable ? onClick : undefined}
      className={`
        relative w-20 h-28 sm:w-24 sm:h-36 rounded-xl border-2 bg-white flex flex-col items-center justify-center cursor-pointer transition-all duration-200
        ${isBack ? 'card-back-pattern border-white' : 'border-slate-200'}
        ${isPlayable ? 'ring-4 ring-kitty-teal ring-offset-2' : ''}
        ${className}
        card-shadow
      `}
    >
      {isBack ? (
        <div className="flex flex-col items-center justify-center text-white">
          <Cat size={48} className="text-white mb-2 drop-shadow-md" />
          <span className="text-xs font-display font-bold uppercase tracking-widest text-white/90">Kitty</span>
        </div>
      ) : card ? (
        <>
          <div className={`absolute top-2 left-2 flex flex-col items-center leading-none ${SUIT_COLORS[card.suit]}`}>
            <span className="text-sm sm:text-lg font-bold">{card.rank}</span>
            <span className="text-xs sm:text-sm">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
          
          <div className={`text-3xl sm:text-4xl ${SUIT_COLORS[card.suit]}`}>
            {SUIT_SYMBOLS[card.suit]}
          </div>

          <div className={`absolute bottom-2 right-2 flex flex-col items-center leading-none rotate-180 ${SUIT_COLORS[card.suit]}`}>
            <span className="text-sm sm:text-lg font-bold">{card.rank}</span>
            <span className="text-xs sm:text-sm">{SUIT_SYMBOLS[card.suit]}</span>
          </div>
        </>
      ) : null}
    </motion.div>
  );
};
