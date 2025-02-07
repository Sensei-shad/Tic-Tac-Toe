import React from 'react';

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="text-center animate-fade-in">
        <h1 className="text-6xl font-bold text-white mb-4 animate-scale-in">
          Tic Tac Toe
        </h1>
        <div className="flex justify-center space-x-4">
          <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-100" />
          <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-200" />
          <div className="w-4 h-4 bg-white rounded-full animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;