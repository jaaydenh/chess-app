import { Chess, Square, Move } from 'chess.js';
import { HintSquare } from '../types';

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

export const showHintsForSquare = (square: Square, game: Chess) => {
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

export const buildSquareStyles = (
  sourceSquare: Square | null,
  game: Chess,
) => {
  const hintSquares = sourceSquare ? showHintsForSquare(sourceSquare, game) : [];
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