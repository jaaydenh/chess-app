import { useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess, Square } from 'chess.js';

import { buildSquareStyles } from './utils/styleHelpers';
import moveAudio from './assets/sounds/move.mp3';
import captureAudio from './assets/sounds/capture.mp3';
import './App.css';

function App() {
  const [game] = useState<Chess>(new Chess());
  const [activeSquare, setActiveSquare] = useState<string>('');
  const [activeDragSquare, setActiveDragSquare] = useState<string>('');
  const [squareStyles, setSquareStyles] = useState({});
  const dropSquareStyle = { backgroundColor: 'hsla(81, 18%, 50%, 1)' };

  // useEffect(() => {
  //   try {
  //     const fen = window.localStorage.getItem('fen');
  //     const json = fen ? JSON.parse(fen || '') : '';

  //     if (json !== '') {
  //       setGame(new Chess(json));
  //     } else {
  //       setGame(new Chess());
  //     }
  //     console.log(fen);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);

  // useEffect(() => {
  //   console.log('store game fen');
  //   game && window.localStorage.setItem('fen', JSON.stringify(game.fen()));
  // }, [game]);

  const onDragOverSquare = (square: Square) => {
    if (activeDragSquare === '') {
      setActiveDragSquare(square);
      setSquareStyles(buildSquareStyles(square, game));
    }
  };

  const onSquareClick = (square: Square) => {
    switch (activeSquare) {
      case square: // clear move hints and deactivate active square
        setSquareStyles(buildSquareStyles(null, game));
        setActiveSquare('');
        break;
      case '': {
        setActiveSquare(square);
        setSquareStyles(buildSquareStyles(square, game));
        break;
      }
      // Make a move if possible
      default:
        {
          const moves = game.moves({
            square: activeSquare as Square,
            verbose: true,
          });

          if (moves.some((move) => move.to === square)) {
            movePiece({
              sourceSquare: activeSquare as Square,
              targetSquare: square,
            });
          } else {
            setActiveSquare(square);
            setSquareStyles(buildSquareStyles(square, game));
          }
        }
        break;
    }
  };

  const onDrop = (obj: {
    sourceSquare: Square;
    targetSquare: Square;
  }): void => {
    setActiveDragSquare('');
    try {
      movePiece(obj);
    } catch (error) {
      console.log(error);
    }
  };

  const movePiece = (obj: { sourceSquare: Square; targetSquare: Square }) => {
    const move = game.move({
      from: obj.sourceSquare,
      to: obj.targetSquare,
      promotion: 'q',
    });
    setSquareStyles(buildSquareStyles(null, game));
    setActiveSquare('');
    const audio = new Audio(move.captured ? captureAudio : moveAudio);
    audio.play().catch((error) => {
      console.log(error);
    });
  };

  return (
    <Chessboard
      id="board"
      calcWidth={({ screenWidth }) => (screenWidth < 560 ? 350 : 480)}
      position={game.fen()}
      onSquareClick={onSquareClick}
      onDrop={onDrop}
      onDragOverSquare={onDragOverSquare}
      dropSquareStyle={dropSquareStyle}
      squareStyles={squareStyles}
      boardStyle={{
        borderRadius: '5px',
        boxShadow: `0 4px 12px rgba(0, 0, 0, 0.5)`,
      }}
    />
  );
}

export default App;
