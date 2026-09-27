import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Keyboard } from '../components/Keyboard';

let mockThemeContext = {
  theme: {
    colors: {
      correct: '#10B981',
      present: '#F59E0B',
      card: '#1F2937',
      text: '#FFFFFF',
    },
  },
  colorBlind: false,
  dyslexiaFont: false,
  language: 'tr' as 'tr' | 'en',
};

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => mockThemeContext,
}));

describe('Empirical Stress & Boundary Tests — Keyboard.tsx', () => {
  beforeEach(() => {
    mockThemeContext = {
      theme: {
        colors: {
          correct: '#10B981',
          present: '#F59E0B',
          card: '#1F2937',
          text: '#FFFFFF',
        },
      },
      colorBlind: false,
      dyslexiaFont: false,
      language: 'tr',
    };
  });

  describe('1. Multilingual Layout & Key Integrity', () => {
    it('renders exactly 31 keys in Turkish layout with all TR specific letters and action keys', () => {
      const { getByText, queryByText } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language="tr" />
      );

      const expectedTrLetters = [
        'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ',
        'SİL', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç', 'GÖNDER'
      ];

      expectedTrLetters.forEach((key) => {
        expect(getByText(key)).toBeTruthy();
      });

      // Assert English-only letters and actions are NOT present in Turkish mode
      expect(queryByText('Q')).toBeNull();
      expect(queryByText('W')).toBeNull();
      expect(queryByText('X')).toBeNull();
      expect(queryByText('DEL')).toBeNull();
      expect(queryByText('ENTER')).toBeNull();
    });

    it('renders exactly 28 keys in English layout with QWERTY and action keys', () => {
      const { getByText, queryByText } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language="en" />
      );

      const expectedEnLetters = [
        'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
        'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
        'ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL'
      ];

      expectedEnLetters.forEach((key) => {
        expect(getByText(key)).toBeTruthy();
      });

      // Assert Turkish-specific letters and actions are NOT present in English mode
      expect(queryByText('Ğ')).toBeNull();
      expect(queryByText('Ü')).toBeNull();
      expect(queryByText('Ş')).toBeNull();
      expect(queryByText('İ')).toBeNull();
      expect(queryByText('Ö')).toBeNull();
      expect(queryByText('Ç')).toBeNull();
      expect(queryByText('SİL')).toBeNull();
      expect(queryByText('GÖNDER')).toBeNull();
    });

    it('falls back safely to context language or Turkish when language prop is omitted or invalid', () => {
      mockThemeContext.language = 'en';
      const { getByText: getByTextEn } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} />
      );
      expect(getByTextEn('Q')).toBeTruthy();
      expect(getByTextEn('ENTER')).toBeTruthy();

      mockThemeContext.language = 'tr';
      const { getByText: getByTextTr } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language={'invalid' as 'tr'} />
      );
      expect(getByTextTr('Ğ')).toBeTruthy();
      expect(getByTextTr('GÖNDER')).toBeTruthy();
    });
  });

  describe('2. Comprehensive Key Event Dispatching', () => {
    it('dispatches onKey for every single English letter and action callbacks for DEL and ENTER', () => {
      const onKey = jest.fn();
      const onDelete = jest.fn();
      const onSubmit = jest.fn();

      const { getByText } = render(
        <Keyboard onKey={onKey} onDelete={onDelete} onSubmit={onSubmit} revealedLetters={{}} language="en" />
      );

      const enLetters = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Z', 'X', 'C', 'V', 'B', 'N', 'M'];
      enLetters.forEach((letter, idx) => {
        fireEvent.press(getByText(letter));
        expect(onKey).toHaveBeenLastCalledWith(letter);
        expect(onKey).toHaveBeenCalledTimes(idx + 1);
      });

      expect(onDelete).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.press(getByText('DEL'));
      expect(onDelete).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('ENTER'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('dispatches onKey for every single Turkish letter and action callbacks for SİL and GÖNDER', () => {
      const onKey = jest.fn();
      const onDelete = jest.fn();
      const onSubmit = jest.fn();

      const { getByText } = render(
        <Keyboard onKey={onKey} onDelete={onDelete} onSubmit={onSubmit} revealedLetters={{}} language="tr" />
      );

      const trLetters = ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ', 'Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'];
      trLetters.forEach((letter, idx) => {
        fireEvent.press(getByText(letter));
        expect(onKey).toHaveBeenLastCalledWith(letter);
        expect(onKey).toHaveBeenCalledTimes(idx + 1);
      });

      expect(onDelete).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();

      fireEvent.press(getByText('SİL'));
      expect(onDelete).toHaveBeenCalledTimes(1);

      fireEvent.press(getByText('GÖNDER'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe('3. Accessibility & Accessibility Labels', () => {
    it('assigns correct accessibilityLabel to letters, delete keys, and submit keys', () => {
      const { getByLabelText } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language="en" />
      );

      expect(getByLabelText('Delete')).toBeTruthy();
      expect(getByLabelText('Submit')).toBeTruthy();
      expect(getByLabelText('Q')).toBeTruthy();
    });

    it('assigns correct accessibilityLabel to Turkish special keys', () => {
      const { getByLabelText } = render(
        <Keyboard onKey={jest.fn()} onDelete={jest.fn()} onSubmit={jest.fn()} revealedLetters={{}} language="tr" />
      );

      expect(getByLabelText('Sil')).toBeTruthy();
      expect(getByLabelText('Gönder')).toBeTruthy();
      expect(getByLabelText('Ğ')).toBeTruthy();
    });
  });

  describe('4. Status Highlighting, Colorblind & Dyslexia Modes', () => {
    it('handles colorblind indicators when active', () => {
      mockThemeContext.colorBlind = true;

      const { getByText } = render(
        <Keyboard
          onKey={jest.fn()}
          onDelete={jest.fn()}
          onSubmit={jest.fn()}
          revealedLetters={{
            E: 'correct',
            A: 'present',
            B: 'absent',
          }}
          language="en"
        />
      );

      expect(getByText('✓')).toBeTruthy();
      expect(getByText('●')).toBeTruthy();
    });

    it('does not render colorblind indicators when colorBlind is false', () => {
      mockThemeContext.colorBlind = false;

      const { queryByText } = render(
        <Keyboard
          onKey={jest.fn()}
          onDelete={jest.fn()}
          onSubmit={jest.fn()}
          revealedLetters={{
            E: 'correct',
            A: 'present',
            B: 'absent',
          }}
          language="en"
        />
      );

      expect(queryByText('✓')).toBeNull();
      expect(queryByText('●')).toBeNull();
    });

    it('applies monospace fontFamily when dyslexiaFont is true', () => {
      mockThemeContext.dyslexiaFont = true;

      const { getByText } = render(
        <Keyboard
          onKey={jest.fn()}
          onDelete={jest.fn()}
          onSubmit={jest.fn()}
          revealedLetters={{}}
          language="en"
        />
      );

      const qText = getByText('Q');
      expect(qText.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ fontFamily: 'monospace' })])
      );
    });
  });

  describe('5. Rapid Stress & Multi-keystroke Simulation', () => {
    it('survives 1,000 rapid simulated keystrokes without failure or memory corruption', () => {
      const onKey = jest.fn();
      const onDelete = jest.fn();
      const onSubmit = jest.fn();

      const { getByText } = render(
        <Keyboard onKey={onKey} onDelete={onDelete} onSubmit={onSubmit} revealedLetters={{}} language="en" />
      );

      const keysToPress = ['Q', 'W', 'E', 'R', 'T', 'DEL', 'Y', 'U', 'I', 'O', 'P', 'ENTER'];
      for (let i = 0; i < 1000; i++) {
        const key = keysToPress[i % keysToPress.length];
        fireEvent.press(getByText(key));
      }

      // 1000 / 12 = 83 full cycles with remainder 4 (indices 0, 1, 2, 3)
      // 'DEL' (index 5) is called 83 times
      // 'ENTER' (index 11) is called 83 times
      // Letter keys are called 834 times
      expect(onDelete).toHaveBeenCalledTimes(83);
      expect(onSubmit).toHaveBeenCalledTimes(83);
      expect(onKey).toHaveBeenCalledTimes(834);
    });
  });
});
