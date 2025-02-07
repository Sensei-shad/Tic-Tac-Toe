import React, { useState, useCallback, useEffect } from 'react';
import { X, Circle, Brain, Zap, Target, Cpu, Rocket, ArrowLeft } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import InteractiveBackground from './InteractiveBackground';

type Player = 'X' | 'O';
type GameMode = 'pvp' | 'pvc';
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'extreme';
type BoardSize = '3x3' | '4x4' | '5x5' | '6x6';
type BoardState = (Player | null)[];

const BOARD_SIZES: Record<Difficulty | BoardSize, number> = {
  easy: 3,
  medium: 3,
  hard: 4,
  expert: 5,
  extreme: 6,
  '3x3': 3,
  '4x4': 4,
  '5x5': 5,
  '6x6': 6
};

const WIN_LENGTHS: Record<Difficulty | BoardSize, number> = {
  easy: 3,
  medium: 3,
  hard: 4,
  expert: 5,
  extreme: 6,
  '3x3': 3,
  '4x4': 4,
  '5x5': 5,
  '6x6': 6
};

const SEARCH_DEPTHS: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 3,
  expert: 3,
  extreme: 2
};

const getMoveScore = (board: BoardState, move: number, player: Player): number => {
  const size = Math.sqrt(board.length);
  const row = Math.floor(move / size);
  const col = move % size;
  
  if ((row === Math.floor(size/2) && col === Math.floor(size/2)) ||
      (row === 0 && col === 0) ||
      (row === 0 && col === size-1) ||
      (row === size-1 && col === 0) ||
      (row === size-1 && col === size-1)) {
    return 3;
  }
  
  if (row === 0 || row === size-1 || col === 0 || col === size-1) {
    return 2;
  }
  
  return 1;
};

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [boardSize, setBoardSize] = useState<BoardSize | null>(null);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
  const [winningCells, setWinningCells] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (difficulty) {
      const size = BOARD_SIZES[difficulty];
      setBoard(Array(size * size).fill(null));
    } else if (boardSize) {
      const size = BOARD_SIZES[boardSize];
      setBoard(Array(size * size).fill(null));
    }
  }, [difficulty, boardSize]);

  const checkWinner = useCallback((boardState: BoardState): [Player | 'Draw' | null, number[]] => {
    if (!difficulty && !boardSize) return [null, []];
    
    const size = difficulty ? BOARD_SIZES[difficulty] : BOARD_SIZES[boardSize!];
    const winLength = difficulty ? WIN_LENGTHS[difficulty] : WIN_LENGTHS[boardSize!];

    // Check rows
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        const row = Array(winLength).fill(0).map((_, k) => i * size + j + k);
        const values = row.map(idx => boardState[idx]);
        if (values.every(v => v === 'X')) return ['X', row];
        if (values.every(v => v === 'O')) return ['O', row];
      }
    }

    // Check columns
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = 0; j < size; j++) {
        const col = Array(winLength).fill(0).map((_, k) => (i + k) * size + j);
        const values = col.map(idx => boardState[idx]);
        if (values.every(v => v === 'X')) return ['X', col];
        if (values.every(v => v === 'O')) return ['O', col];
      }
    }

    // Check diagonals
    for (let i = 0; i <= size - winLength; i++) {
      for (let j = 0; j <= size - winLength; j++) {
        const diag1 = Array(winLength).fill(0).map((_, k) => (i + k) * size + j + k);
        const diag2 = Array(winLength).fill(0).map((_, k) => (i + k) * size + (j + winLength - 1 - k));
        
        const values1 = diag1.map(idx => boardState[idx]);
        const values2 = diag2.map(idx => boardState[idx]);
        
        if (values1.every(v => v === 'X')) return ['X', diag1];
        if (values1.every(v => v === 'O')) return ['O', diag1];
        if (values2.every(v => v === 'X')) return ['X', diag2];
        if (values2.every(v => v === 'O')) return ['O', diag2];
      }
    }

    if (boardState.every(cell => cell !== null)) {
      return ['Draw', []];
    }

    return [null, []];
  }, [difficulty, boardSize]);

  // ... [AI evaluation functions remain the same]

  const makeMove = useCallback((index: number) => {
    if (board[index] !== null || winner || index < 0) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const [gameWinner, winningLine] = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningCells(winningLine);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  }, [board, currentPlayer, winner, checkWinner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameMode(null);
    setDifficulty(null);
    setBoardSize(null);
    setWinningCells([]);
    setPlayerSymbol('X');
  };

  const goBack = () => {
    if (winner) {
      setWinner(null);
      const size = difficulty ? BOARD_SIZES[difficulty] : boardSize ? BOARD_SIZES[boardSize] : 3;
      setBoard(Array(size * size).fill(null));
      setCurrentPlayer('X');
      setWinningCells([]);
    } else if (playerSymbol && gameMode === 'pvc') {
      setPlayerSymbol('X');
      setDifficulty(null);
    } else if (difficulty) {
      setDifficulty(null);
    } else if (boardSize) {
      setBoardSize(null);
    } else if (gameMode) {
      setGameMode(null);
    }
  };

  const renderCell = (index: number) => {
    const isWinningCell = winningCells.includes(index);
    return (
      <button
        onClick={() => makeMove(index)}
        disabled={!!board[index] || (gameMode === 'pvc' && currentPlayer !== playerSymbol)}
        className={`aspect-square bg-white/80 backdrop-blur-sm rounded-lg border-2 ${
          isWinningCell ? 'border-green-400 shadow-lg shadow-green-200' : 'border-gray-200'
        } flex items-center justify-center text-4xl hover:bg-white/90 transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:hover:bg-white/80`}
      >
        {board[index] === 'X' && (
          <X className={`w-2/3 h-2/3 ${isWinningCell ? 'text-green-600' : 'text-blue-600'} animate-scale-in`} />
        )}
        {board[index] === 'O' && (
          <Circle className={`w-2/3 h-2/3 ${isWinningCell ? 'text-green-600' : 'text-red-600'} animate-scale-in`} />
        )}
      </button>
    );
  };

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  const renderBackButton = () => (
    <button
      onClick={goBack}
      className="absolute top-4 left-4 p-2 rounded-full bg-white/80 hover:bg-white/90 transition-all transform hover:scale-110"
    >
      <ArrowLeft className="w-6 h-6 text-gray-600" />
    </button>
  );

  if (!gameMode) {
    return (
      <>
        <InteractiveBackground />
        <div className="min-h-screen relative flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full transform transition-all hover:scale-105">
            <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tic Tac Toe
            </h1>
            <div className="space-y-4">
              <button
                onClick={() => setGameMode('pvp')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>Player vs Player</span>
              </button>
              <button
                onClick={() => setGameMode('pvc')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Cpu className="w-5 h-5" />
                <span>Player vs Computer</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (gameMode === 'pvp' && !boardSize) {
    return (
      <>
        <InteractiveBackground />
        <div className="min-h-screen relative flex items-center justify-center p-4">
          {renderBackButton()}
          <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Select Board Size
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setBoardSize('3x3')}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>3x3 (Match 3)</span>
              </button>
              <button
                onClick={() => setBoardSize('4x4')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>4x4 (Match 4)</span>
              </button>
              <button
                onClick={() => setBoardSize('5x5')}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>5x5 (Match 5)</span>
              </button>
              <button
                onClick={() => setBoardSize('6x6')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>6x6 (Match 6)</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (gameMode === 'pvc' && !difficulty) {
    return (
      <>
        <InteractiveBackground />
        <div className="min-h-screen relative flex items-center justify-center p-4">
          {renderBackButton()}
          <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Select Difficulty
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => setDifficulty('easy')}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <Brain className="w-5 h-5" />
                <span>Easy (3x3, Match 3)</span>
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <Zap className="w-5 h-5" />
                <span>Medium (3x3, Match 3)</span>
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all flex items-center justify-center space-x-2"
              >
                <Target className="w-5 h-5" />
                <span>Hard (4x4, Match 4)</span>
              </button>
              <button
                onClick={() => setDifficulty('expert')}
                className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center space-x-2"
              >
                <Cpu className="w-5 h-5" />
                <span>Expert (5x5, Match 5)</span>
              </button>
              <button
                onClick={() => setDifficulty('extreme')}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
              >
                <Rocket className="w-5 h-5" />
                <span>Extreme (6x6, Match 6)</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (gameMode === 'pvc' && !playerSymbol) {
    return (
      <>
        <InteractiveBackground />
        <div className="min-h-screen relative flex items-center justify-center p-4">
          {renderBackButton()}
          <div className="bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Symbol
            </h2>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setPlayerSymbol('X')}
                className="px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <X className="w-8 h-8" />
                <span className="text-lg">Play as X</span>
              </button>
              <button
                onClick={() => setPlayerSymbol('O')}
                className="px-8 py-6 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Circle className="w-8 h-8" />
                <span className="text-lg">Play as O</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const size = difficulty ? BOARD_SIZES[difficulty] : boardSize ? BOARD_SIZES[boardSize] : 3;

  return (
    <>
      <InteractiveBackground />
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {renderBackButton()}
        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-2xl w-full">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tic Tac Toe
            </h1>
            {!winner && (
              <p className="text-lg text-gray-600 flex items-center justify-center space-x-2">
                <span>Current Player:</span>
                {currentPlayer === 'X' ? 
                  <X className="w-6 h-6 text-blue-600" /> : 
                  <Circle className="w-6 h-6 text-red-600" />
                }
              </p>
            )}
            {winner && (
              <p className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {winner === 'Draw' ? "It's a Draw!" : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>Winner:</span>
                    {winner === 'X' ? 
                      <X className="w-6 h-6 text-blue-600" /> : 
                      <Circle className="w-6 h-6 text-red-600" />
                    }
                  </span>
                )}
              </p>
            )}
          </div>
          
          <div 
            className="grid gap-3 mb-6 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              maxWidth: `${size * 5}rem`
            }}
          >
            {Array(size * size).fill(null).map((_, index) => renderCell(index))}
          </div>

          <button
            onClick={resetGame}
            className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105"
          >
            New Game
          </button>
        </div>
      </div>
    </>
  );
}

export default App;