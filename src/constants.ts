export const STARTERS = {
  bulbasaur: { name: 'Bulbasaur', dex: [1, 2, 3], color: '#7EC850', desc: 'Grass / Poison' },
  charmander: { name: 'Charmander', dex: [4, 5, 6], color: '#F08030', desc: 'Fire' },
  squirtle: { name: 'Squirtle', dex: [7, 8, 9], color: '#6890F0', desc: 'Water' },
} as const

export type StarterId = keyof typeof STARTERS

export const STAGE_NAMES = ['Baby', 'Child', 'Adult'] as const
export type Stage = (typeof STAGE_NAMES)[number]

export const EVOLUTION_AGE = [0, 60, 300] as const

export const SAVE_KEY = 'poketchi_save'
