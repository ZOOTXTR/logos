import { Share, Platform, Clipboard } from 'react-native';
import { GAME_MODE_INFO, LetterStatus } from '../constants/words';

export async function shareScoreGrid(
  board: { status: LetterStatus }[][],
  currentRow: number,
  mode: string,
  won: boolean,
  colorBlind: boolean,
  language: string
): Promise<string | null> {
  let grid = '';
  const limit = won ? currentRow : board.length;
  board.slice(0, limit).forEach(row => {
    let rowStr = '';
    row.forEach(letter => {
      if (letter.status === 'correct') rowStr += colorBlind ? '🟦' : '🟩';
      else if (letter.status === 'present') rowStr += colorBlind ? '🟧' : '🟨';
      else rowStr += '⬛';
    });
    grid += rowStr + '\n';
  });

  const modeLabel = GAME_MODE_INFO[mode as keyof typeof GAME_MODE_INFO]?.label ?? mode;
  const resultStr = won ? `${currentRow + 1}/${board.length}` : `X/${board.length}`;
  const shareText = `💎 Logos (${modeLabel}) - ${resultStr}\n\n${grid}${language === 'en' ? 'Play now!' : 'Sen de oyna!'} 🚀`;

  if (Platform.OS === 'web') {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        return language === 'en' ? 'Copied to clipboard!' : 'Panoya kopyalandı!';
      }
    } catch {}
  }

  try {
    await Share.share({ message: shareText });
  } catch {
    Clipboard.setString(shareText);
    return language === 'en' ? 'Copied to clipboard!' : 'Panoya kopyalandı!';
  }

  return null;
}
