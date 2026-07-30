import { Category } from './words';

export const WORD_BANK_EN: Record<Exclude<Category, 'random'>, string[]> = {
  hayvanlar: [
    'TIGER', 'ZEBRA', 'KOALA', 'COBRA', 'SHEEP', 'SHARK', 'CAMEL', 'PANDA',
    'LEMUR', 'HIPPO', 'CHIMP', 'SKUNK', 'EAGLE', 'CRANE', 'SNAKE', 'MOUSE',
    'MOOSE', 'WHALE', 'STORK', 'SLOTH', 'HYENA', 'GOOSE', 'BEAR', 'WOLF',
    'ROBIN', 'BISON', 'HORSE', 'PUPPY', 'KITTY', 'SHREW', 'SQUID', 'COWBOY'
  ],
  sehirler: [
    'TOKYO', 'PARIS', 'SEOUL', 'MIAMI', 'OSLO', 'LAGOS', 'CAIRO', 'DELHI',
    'MINSK', 'SOFIA', 'PERTH', 'ROME', 'VEGAS', 'RENO', 'LEEDS', 'MILAN',
    'DUBAI', 'HANOI', 'TUNIS', 'MACAU', 'BOISE', 'DOHA', 'NICE', 'LYON'
  ],
  yiyecek: [
    'APPLE', 'PEACH', 'ONION', 'LEMON', 'BREAD', 'SALAD', 'PASTA', 'STEAK',
    'CREAM', 'GRAIN', 'MELON', 'MANGO', 'BERRY', 'CHIPS', 'SAUCE', 'HONEY',
    'JELLY', 'CANDY', 'FRIES', 'TOAST', 'PIZZA', 'BASIL', 'PECAN', 'SYRUP',
    'FUDGE', 'WAFERS', 'SUSHI', 'GRAVY', 'FLOUR', 'WHEAT', 'YEAST', 'OLIVE'
  ],
  meslekler: [
    'ACTOR', 'PILOT', 'NURSE', 'BAKER', 'CLERK', 'GUARD', 'COACH', 'JUDGE',
    'CHEF', 'WRITER', 'MINER', 'AGENT', 'SCOUT', 'TUTOR', 'USHER', 'SAILOR',
    'MAYOR', 'PRIEST', 'POLICE', 'DENTIST', 'ARTIST', 'NURSE', 'MODEL', 'GUIDE'
  ],
  doga: [
    'RIVER', 'OCEAN', 'STORM', 'FLOOD', 'CLOUD', 'GRASS', 'STONE', 'CREEK',
    'CLIFF', 'BEACH', 'PLANT', 'OASIS', 'VALLEY', 'FOREST', 'SHORE', 'EARTH',
    'SUNNY', 'RAINY', 'WINDY', 'FLAME', 'FROST', 'SWAMP', 'MOUNT', 'DESERT'
  ],
  spor: [
    'TENNIS', 'RUGBY', 'TRACK', 'ROWER', 'PITCH', 'BALLS', 'SPORT', 'MATCH',
    'CYCLE', 'DRAFT', 'SCORE', 'CLIMB', 'EVENT', 'BOARD', 'SURFER', 'COURT',
    'SKATE', 'BANDS', 'GLOVE', 'RIDER', 'CHESS', 'DARTS', 'JOGGER', 'RACES'
  ],
};

export const ALL_WORDS_EN: string[] = Object.values(WORD_BANK_EN).flat();
