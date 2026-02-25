import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cat, RotateCcw, Info, Trophy, Ghost } from 'lucide-react';
import { Card } from './components/Card';
import { SuitPicker } from './components/SuitPicker';
import { useGameLogic } from './hooks/useGameLogic';
import { SUIT_SYMBOLS, SUIT_COLORS } from './constants';
import { Suit } from './types';

export default function App() {
  const { state, startNewGame, playCard, drawCard, skipTurn, setState } = useGameLogic();
  const [showRules, setShowRules] = useState(false);

  const topDiscard = state.discardPile[state.discardPile.length - 1];
  
  const isCardPlayable = (card: any) => {
    if (state.turn !== 'player' || state.status !== 'playing') return false;
    return card.rank === '8' || card.suit === state.currentSuit || card.rank === topDiscard?.rank;
  };

  const handleSelectSuit = (suit: Suit) => {
    if (state.pendingCardId) {
      playCard(state.pendingCardId, 'player', suit);
    }
  };

  return (
    <div className="min-h-screen w-full felt-bg flex flex-col items-center justify-between p-4 sm:p-8 overflow-hidden font-sans">
      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <div className="bg-kitty-orange p-2 rounded-full shadow-lg">
            <Cat size={24} />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-bold tracking-tight">Kitty 疯狂 8 点</h1>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRules(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <Info size={20} />
          </button>
          <button 
            onClick={startNewGame}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 w-full max-w-6xl flex flex-col items-center justify-center gap-8 py-4">
        
        {/* AI Hand */}
        <div className="relative w-full flex flex-col items-center">
          <div className="absolute -top-12 flex items-center gap-2 bg-black/30 px-4 py-1 rounded-full text-white text-sm backdrop-blur-sm">
            <Ghost size={16} className="text-kitty-teal" />
            <span>Kitty AI ({state.aiHand.length} 张)</span>
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 overflow-visible">
            {state.aiHand.map((_, i) => (
              <Card key={`ai-${i}`} isBack index={i} className="rotate-3" />
            ))}
            {state.aiHand.length === 0 && state.status === 'playing' && (
              <div className="h-28 sm:h-36" />
            )}
          </div>
        </div>

        {/* Center Table */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 my-4">
          {/* Draw Pile (Stack View) */}
          <div className="relative group">
            {/* Stack effect */}
            <div className="absolute inset-0 bg-black/20 rounded-xl translate-y-2 translate-x-1" />
            <div className="absolute inset-0 bg-kitty-purple/40 rounded-xl -translate-y-1 -translate-x-1 border border-white/20" />
            <div className="absolute inset-0 bg-kitty-purple/60 rounded-xl -translate-y-2 -translate-x-2 border border-white/20" />
            
            <Card 
              isBack 
              onClick={() => state.turn === 'player' && state.status === 'playing' && drawCard('player')}
              isPlayable={state.turn === 'player' && state.status === 'playing'}
              className="relative z-10"
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium whitespace-nowrap">
              摸牌堆 ({state.drawPile.length})
            </div>
          </div>

          {/* Discard Pile */}
          <div className="relative">
            <AnimatePresence mode="popLayout">
              {state.discardPile.map((card, i) => (
                i === state.discardPile.length - 1 && (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 1.5, rotate: 45, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    className="relative z-20"
                  >
                    <Card card={card} />
                    {state.currentSuit !== card.suit && (
                      <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg border-2 border-kitty-teal animate-bounce">
                        <span className={`text-xl ${SUIT_COLORS[state.currentSuit!]}`}>
                          {SUIT_SYMBOLS[state.currentSuit!]}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-xs font-medium uppercase tracking-widest">
              弃牌堆
            </div>
          </div>

          {/* Skip Turn Button (Only when it's player's turn) */}
          {state.turn === 'player' && state.status === 'playing' && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={skipTurn}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold transition-all active:scale-95"
            >
              跳过回合
            </motion.button>
          )}
        </div>

        {/* Player Hand */}
        <div className="relative w-full flex flex-col items-center">
          <div className="absolute -top-12 flex items-center gap-2 bg-black/30 px-4 py-1 rounded-full text-white text-sm backdrop-blur-sm">
            <Cat size={16} className="text-kitty-orange" />
            <span>你的手牌 ({state.playerHand.length} 张)</span>
          </div>
          <div className="flex flex-wrap justify-center -space-x-8 sm:-space-x-12 max-w-full px-4">
            {state.playerHand.map((card, i) => (
              <Card 
                key={card.id} 
                card={card} 
                isPlayable={isCardPlayable(card)}
                onClick={() => playCard(card.id, 'player')}
                className="hover:z-50 transition-all"
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl p-4 text-white text-center shadow-xl border border-white/10 mt-4">
        <p className="font-medium text-sm sm:text-base">
          {state.lastAction}
        </p>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {state.status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl text-center max-w-md w-full">
              <div className="w-24 h-24 bg-kitty-orange rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Cat size={48} className="text-white" />
              </div>
              <h2 className="text-4xl font-display font-bold text-kitty-brown mb-4">Kitty 疯狂 8 点</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                一款充满魅力的纸牌游戏！匹配花色或点数，使用 8 点来改变战局。你能打败 Kitty AI 吗？
              </p>
              <button 
                onClick={startNewGame}
                className="w-full py-4 bg-kitty-orange hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 transition-all active:scale-95 text-lg"
              >
                开始游戏！ 🐾
              </button>
            </div>
          </motion.div>
        )}

        {state.status === 'suit_selection' && (
          <SuitPicker onSelect={handleSelectSuit} />
        )}

        {state.status === 'game_over' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center max-w-md w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-kitty-orange via-kitty-pink to-kitty-teal" />
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${state.winner === 'player' ? 'bg-yellow-400' : 'bg-slate-200'}`}>
                {state.winner === 'player' ? <Trophy size={48} className="text-white" /> : <Ghost size={48} className="text-slate-400" />}
              </div>
              
              <h2 className="text-4xl font-display font-bold text-kitty-brown mb-2">
                {state.winner === 'player' ? '胜利！' : '失败！'}
              </h2>
              <p className="text-slate-600 mb-8 text-lg">
                {state.winner === 'player' ? '你比猫咪更聪明！' : '猫咪的动作太快了！'}
              </p>
              
              <button 
                onClick={startNewGame}
                className="w-full py-4 bg-kitty-teal hover:bg-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-200 transition-all active:scale-95 text-lg"
              >
                再玩一次 🐾
              </button>
            </div>
          </motion.div>
        )}

        {showRules && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div 
              onClick={e => e.stopPropagation()}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-display font-bold text-kitty-brown mb-4 flex items-center gap-2">
                <Info className="text-kitty-teal" /> 游戏规则
              </h2>
              <ul className="space-y-4 text-slate-600 text-sm sm:text-base">
                <li className="flex gap-3">
                  <span className="bg-kitty-cream w-6 h-6 rounded-full flex items-center justify-center text-kitty-orange font-bold flex-shrink-0">1</span>
                  <p>匹配弃牌堆顶牌的<strong>花色</strong>或<strong>点数</strong>。</p>
                </li>
                <li className="flex gap-3">
                  <span className="bg-kitty-cream w-6 h-6 rounded-full flex items-center justify-center text-kitty-orange font-bold flex-shrink-0">2</span>
                  <p><strong>8 点是万能牌！</strong> 你可以在任何牌上出 8，并选择一个新花色。</p>
                </li>
                <li className="flex gap-3">
                  <span className="bg-kitty-cream w-6 h-6 rounded-full flex items-center justify-center text-kitty-orange font-bold flex-shrink-0">3</span>
                  <p>如果你无牌可出，必须从<strong>摸牌堆</strong>摸一张牌。</p>
                </li>
                <li className="flex gap-3">
                  <span className="bg-kitty-cream w-6 h-6 rounded-full flex items-center justify-center text-kitty-orange font-bold flex-shrink-0">4</span>
                  <p>第一个<strong>清空手牌</strong>的玩家获胜！</p>
                </li>
              </ul>
              <button 
                onClick={() => setShowRules(false)}
                className="w-full mt-8 py-3 border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all"
              >
                知道了！
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
