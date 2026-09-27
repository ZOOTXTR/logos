import React from 'react';
import { render } from '@testing-library/react-native';
import { Keyboard } from '../components/Keyboard';

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: { colors: { correct: '#00FF00', present: '#FFFF00', card: '#333333', text: '#FFFFFF' } },
    colorBlind: false,
    dyslexiaFont: false,
  }),
}));

describe('a11y - Keyboard erişilebilir adlar', () => {
  it('harf tuşları button rolüne ve ada sahip', () => {
    const { getByRole } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} />
    );
    expect(getByRole('button', { name: 'E' })).toBeTruthy();
    expect(getByRole('button', { name: 'A' })).toBeTruthy();
  });

  it('özel tuşlar (Sil / Gönder) erişilebilir ada sahip', () => {
    const { getByLabelText } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} />
    );
    expect(getByLabelText('Sil')).toBeTruthy();
    expect(getByLabelText('Gönder')).toBeTruthy();
  });

  it('İngilizce düzende Delete / Submit etiketleri', () => {
    const { getByLabelText } = render(
      <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language="en" />
    );
    expect(getByLabelText('Delete')).toBeTruthy();
    expect(getByLabelText('Submit')).toBeTruthy();
  });
});
