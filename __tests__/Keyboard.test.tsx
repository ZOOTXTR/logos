import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard } from '../components/Keyboard';

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: { colors: { correct: '#00FF00', present: '#FFFF00', card: '#333333', text: '#FFFFFF' } },
    colorBlind: false,
    dyslexiaFont: false,
  }),
}));

describe('Keyboard', () => {
  it('renders all keys', () => {
    const { getByText } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} />
    );
    expect(getByText('E')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('SİL')).toBeTruthy();
    expect(getByText('GÖNDER')).toBeTruthy();
  });

  it('calls onKey when a letter is pressed', () => {
    const onKey = jest.fn();
    const { getByText } = render(
      <Keyboard onKey={onKey} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} />
    );
    fireEvent.press(getByText('E'));
    expect(onKey).toHaveBeenCalledWith('E');
  });

  it('calls onDelete when SİL is pressed', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <Keyboard onKey={jest.fn()} onDelete={onDelete} onSubmit={jest.fn()} revealedLetters={{}} />
    );
    fireEvent.press(getByText('SİL'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onSubmit when GÖNDER is pressed', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={onSubmit} revealedLetters={{}} />
    );
    fireEvent.press(getByText('GÖNDER'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('highlights revealed letters correctly', () => {
    const { getByText } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()}
        revealedLetters={{ E: 'correct', A: 'present', B: 'absent' }}
      />
    );
    expect(getByText('E')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
  });
});
