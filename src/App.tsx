import { useEffect, useState } from 'react';
import Chessboard from 'chessboardjsx';
import { Chess, Square, Move } from 'chess.js';
import moveAudio from './assets/sounds/move.mp3';
import captureAudio from './assets/sounds/capture.mp3';
import './App.css';

type HintSquare = {
  square: Square;
  capture: boolean;
};

const squareStyling = (opts: {
  pieceSquare: Square | null;
  history: Move[];
}) => {
  const sourceSquare =
    opts.history.length && opts.history[opts.history.length - 1].from;
  const targetSquare =
    opts.history.length && opts.history[opts.history.length - 1].to;

  return {
    ...(opts.pieceSquare && {
      [opts.pieceSquare]: { backgroundColor: 'hsla(81, 18%, 50%, 1)' },
    }),
    ...(opts.history.length && {
      [sourceSquare]: {
        backgroundColor: 'hsla(81, 58%, 50%, .6)',
      },
    }),
    ...(opts.history.length && {
      [targetSquare]: {
        backgroundColor: 'hsla(81, 58%, 50%, .6)',
      },
    }),
  };
};

const showHintsForSquare = (square: Square, game: Chess) => {
  const moves = game.moves({
    square: square,
    verbose: true,
  });

  const squaresToHighlight: HintSquare[] = moves.map((move) => {
    return {
      square: move.to,
      capture: move.captured ? true : false,
    };
  });

  return squaresToHighlight;
};

const buildSquareStyles = (
  sourceSquare: Square | null,
  hintSquares: HintSquare[],
  game: Chess,
) => {
  const hintStyles = [...hintSquares].reduce((a, c) => {
    return {
      ...a,
      ...(!c.capture && {
        [c.square]: {
          background:
            'radial-gradient(circle, hsla(81, 18%, 50%, .7), hsla(81, 18%, 50%, .7) 25%, transparent 25%)',
          borderRadius: '50%',
        },
      }),
      ...(c.capture && {
        [c.square]: {
          background:
            'radial-gradient(circle, transparent, transparent 78%, hsla(81, 18%, 50%, .7) 78%)',
        },
      }),
    };
  }, {});

  return {
    ...squareStyling({
      history: game.history({ verbose: true }),
      pieceSquare: sourceSquare,
    }),
    ...hintStyles,
  };
};

function App() {
  const [game, setGame] = useState<Chess>(new Chess());
  const [activeSquare, setActiveSquare] = useState<Square | string>('');
  const [activeDragSquare, setActiveDragSquare] = useState<Square | string>('');
  const [squareStyles, setSquareStyles] = useState({});
  const dropSquareStyle = { backgroundColor: 'hsla(81, 18%, 50%, .7)' };

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

      const hintSquares = showHintsForSquare(square, game);
      if (hintSquares.length > 0) {
        setSquareStyles(buildSquareStyles(square, hintSquares, game));
      } else {
        setSquareStyles(buildSquareStyles(square, [], game));
      }
    }
  };

  const onSquareClick = (square: Square) => {
    switch (activeSquare) {
      case square: // clear move hints and deactivate active square
        setSquareStyles(buildSquareStyles(null, [], game));
        setActiveSquare('');
        break;
      case '': {
        setActiveSquare(square);

        const hintSquares = showHintsForSquare(square, game);
        if (hintSquares.length > 0) {
          setSquareStyles(buildSquareStyles(square, hintSquares, game));
        }
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
            const hintSquares = showHintsForSquare(square, game);
            if (hintSquares.length > 0) {
              setActiveSquare(square);
              setSquareStyles(buildSquareStyles(square, hintSquares, game));
            }
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
    setSquareStyles(buildSquareStyles(null, [], game));
    setActiveSquare('');
    const audio = new Audio(move.captured ? captureAudio : moveAudio);
    audio.play();
  };

  return (
    <Chessboard
      position={game && game.fen()}
      onSquareClick={onSquareClick}
      onDrop={onDrop}
      onDragOverSquare={onDragOverSquare}
      dropSquareStyle={dropSquareStyle}
      squareStyles={squareStyles}
    />
  );
}

export default App;
