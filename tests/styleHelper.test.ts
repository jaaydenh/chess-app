import { Chess, Square } from 'chess.js';
import { describe, it, expect } from "vitest";
import { showHintsForSquare } from "../src/utils/styleHelpers"

describe('styleHelpers', () => {
  it('should return hints for square', () => {
    const game = new Chess();
    const hints = showHintsForSquare('f2', game)
    const testData = [{ square: 'f3', capture: false }, { square: 'f4', capture: false }];
    expect(hints).toStrictEqual(testData);
  })

  it('should return hints for square with possible capture', () => {
    const game = new Chess('rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
    const hints = showHintsForSquare('e4', game)
    const testData = [{ square: 'e5', capture: false }, { square: 'f5', capture: true }];
    expect(hints).toStrictEqual(testData);
  })

  it('should not return hints if move not possible', () => {
    const game = new Chess();
    const hints = showHintsForSquare('e1', game)
    expect(hints).toStrictEqual([]);
  })

  it('should not return hints if not players turn', () => {
    const game = new Chess();
    const hints = showHintsForSquare('e7', game)
    expect(hints).toStrictEqual([]);
  })
})


