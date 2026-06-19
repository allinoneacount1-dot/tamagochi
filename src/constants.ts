export const STARTERS = {
  bulbasaur: { name: 'Bulbasaur', dex: [1, 2, 3], color: '#7EC850', desc: 'Grass / Poison' },
  charmander: { name: 'Charmander', dex: [4, 5, 6], color: '#F08030', desc: 'Fire' },
  squirtle: { name: 'Squirtle', dex: [7, 8, 9], color: '#6890F0', desc: 'Water' },
} as const

export type StarterId = keyof typeof STARTERS

export const STAGE_NAMES = ['Baby', 'Child', 'Adult'] as const
export type Stage = (typeof STAGE_NAMES)[number]

export const EVOLUTION_LEVEL = [1, 6, 14] as const

export const WILD_POKEMON = [
  { name: 'Caterpie', dex: 10, minLv: 1, maxLv: 3 },
  { name: 'Weedle', dex: 13, minLv: 1, maxLv: 3 },
  { name: 'Pidgey', dex: 16, minLv: 1, maxLv: 4 },
  { name: 'Rattata', dex: 19, minLv: 1, maxLv: 4 },
  { name: 'Spearow', dex: 21, minLv: 2, maxLv: 5 },
  { name: 'Zubat', dex: 41, minLv: 3, maxLv: 6 },
] as const

export const XP_PER_LEVEL = 80
export const SAVE_KEY = 'poketchi_save'
