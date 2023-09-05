import { useEffect, useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess, Square } from 'chess.js';

import { buildSquareStyles } from './utils/styleHelpers';
import { getGameStatus } from './utils/gameLogic';
import moveAudio from './assets/sounds/move.mp3';
import captureAudio from './assets/sounds/capture.mp3';
import './App.css';

function App() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [fen, setFen] = useState('');
  const [gameStatus, setGameStatus] = useState('W');
  const [activeSquare, setActiveSquare] = useState<string>('');
  const [activeDragSquare, setActiveDragSquare] = useState<string>('');
  const [squareStyles, setSquareStyles] = useState({});
  const [reset, setReset] = useState(false);
  const dropSquareStyle = { backgroundColor: 'hsla(81, 18%, 50%, 1)' };

  useEffect(() => {
    setGameStatus(getGameStatus(game));
    try {
      const fen = window.localStorage.getItem('fen');
      if (fen) {
        setGame(new Chess(fen));
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (reset || game.fen() !== new Chess().fen()) {
      window.localStorage.setItem('fen', fen);
      setReset(false);
    }
  }, [fen]);

  const onDragOverSquare = (square: Square) => {
    if (activeDragSquare === '') {
      setActiveDragSquare(square);
      setSquareStyles(buildSquareStyles(square, game));
    }
  };

  const onSquareClick = (square: Square) => {
    switch (activeSquare) {
      // clear move hints and deactivate active square
      case square:
        setSquareStyles(buildSquareStyles(null, game));
        setActiveSquare('');
        break;
      // set active square and display move hints
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
            }).catch((error) => {
              console.log(error);
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
    movePiece(obj).catch((error) => {
      console.log(error);
    });
  };

  const movePiece = async (obj: {
    sourceSquare: Square;
    targetSquare: Square;
  }) => {
    const move = game.move({
      from: obj.sourceSquare,
      to: obj.targetSquare,
      promotion: 'q', // TODO: allow player to choose piece
    });
    setFen(game.fen());
    setSquareStyles(buildSquareStyles(null, game));
    setActiveSquare('');
    setGameStatus(getGameStatus(game));

    const audio = new Audio(move.captured ? captureAudio : moveAudio);
    try {
      await audio.play();
    } catch (error) {
      console.log(error);
    }
  };

  const restartGame = () => {
    setReset(true);
    const game = new Chess();
    setGame(game);
    setFen(game.fen());
    setSquareStyles(buildSquareStyles(null, game));
    setGameStatus(getGameStatus(game));
  };

  return (
    <>
      <button className="restart" onClick={restartGame}>
        Restart
      </button>
      <div className="statusText">{gameStatus}</div>
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
    </>
  );
}

export default App;
