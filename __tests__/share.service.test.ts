import { Share, Platform } from 'react-native';
import { shareScoreGrid } from '../services/share.service';

jest.mock('react-native', () => ({
  Share: { share: jest.fn() },
  Platform: { OS: 'ios' },
  Clipboard: { setString: jest.fn() },
}));

describe('shareScoreGrid', () => {
  const board = [
    [{ status: 'correct' as const }, { status: 'present' as const }, { status: 'absent' as const }],
    [{ status: 'correct' as const }, { status: 'correct' as const }, { status: 'correct' as const }],
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates win grid with proper emojis', async () => {
    (Share.share as jest.Mock).mockResolvedValue(undefined);
    await shareScoreGrid(board, 1, 'classic', true, false, 'tr');
    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('🟩🟨⬛'),
    });
  });

  it('uses colorblind symbols when enabled', async () => {
    (Share.share as jest.Mock).mockResolvedValue(undefined);
    await shareScoreGrid(board, 1, 'classic', true, true, 'tr');
    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('🟦'),
    });
  });

  it('shows X/6 on loss', async () => {
    (Share.share as jest.Mock).mockResolvedValue(undefined);
    await shareScoreGrid(board, 6, 'classic', false, false, 'en');
    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('X/2'),
    });
  });

  it('shows win ratio on win', async () => {
    (Share.share as jest.Mock).mockResolvedValue(undefined);
    await shareScoreGrid(board, 1, 'classic', true, false, 'en');
    expect(Share.share).toHaveBeenCalledWith({
      message: expect.stringContaining('2/2'),
    });
  });
});
