import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = () => {
      // Do nothing as HTMLMediaElement.prototype.play is not implemented
      return Promise.resolve();
    };
  });

  afterEach(() => {
    window.localStorage.setItem('fen', '');
  });

  it('renders white pawn in a new position after moving by clicking', async () => {
    const user = userEvent.setup();
    const { getByTestId, container } = render(<App />);

    const squareE2 = container.querySelector('[data-squareid="e2"]');
    const squareE4 = container.querySelector('[data-squareid="e4"]');

    const whitePawnAtE2 = getByTestId('wP-e2');
    expect(whitePawnAtE2).toBeInTheDocument();

    squareE2 && (await user.click(squareE2));
    squareE4 && (await user.click(squareE4));

    const whitePawnAtE4 = getByTestId('wP-e4');
    expect(whitePawnAtE4).toBeInTheDocument();
  });

  it('renders white pawn after capturing black pawn by clicking', async () => {
    const user = userEvent.setup();
    const { getByTestId, container } = render(<App />);

    const squareE2 = container.querySelector('[data-squareid="e2"]');
    const squareE4 = container.querySelector('[data-squareid="e4"]');
    const squareF7 = container.querySelector('[data-squareid="f7"]');
    const squareF5 = container.querySelector('[data-squareid="f5"]');

    squareE2 && (await user.click(squareE2));
    squareE4 && (await user.click(squareE4));
    squareF7 && (await user.click(squareF7));
    squareF5 && (await user.click(squareF5));

    squareE4 && (await user.click(squareE4));
    squareF5 && (await user.click(squareF5));

    const whitePawnAtF5 = getByTestId('wP-f5');
    expect(whitePawnAtF5).toBeInTheDocument();
  });

  it('renders piece at initial position after invalid move', async () => {
    const user = userEvent.setup();
    const { getByTestId, container } = render(<App />);

    const squareD1 = container.querySelector('[data-squareid="d1"]');
    const squareD3 = container.querySelector('[data-squareid="d3"]');

    squareD1 && (await user.click(squareD1));
    squareD3 && (await user.click(squareD3));

    const whiteQueenAtD1 = getByTestId('wQ-d1');
    expect(whiteQueenAtD1).toBeInTheDocument();
  });

  it('renders piece at initial position after reset button clicked', async () => {
    const user = userEvent.setup();
    const { getByTestId, container } = render(<App />);

    const squareE2 = container.querySelector('[data-squareid="e2"]');
    const squareE4 = container.querySelector('[data-squareid="e4"]');

    squareE2 && (await user.click(squareE2));
    squareE4 && (await user.click(squareE4));

    const restartButton = screen.getByRole('button', { name: 'Restart' });
    await user.click(restartButton);

    const whitePawnAtE4 = getByTestId('wP-e2');
    expect(whitePawnAtE4).toBeInTheDocument();
  });
});
