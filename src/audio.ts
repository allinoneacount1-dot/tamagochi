let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.08, delay = 0) {
  const c = getCtx()
  const t = c.currentTime + delay
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur)
}

function multi(notes: [number, number, OscillatorType?, number?][]) {
  notes.forEach(([f, d, t, v]) => tone(f, d, t ?? 'sine', v ?? 0.08))
}

export const sfx = {
  feed() { multi([[523, 0.12], [659, 0.15, 'sine', 0.06]]) },
  play() { multi([[784, 0.08, 'square', 0.04], [988, 0.08, 'square', 0.04], [1175, 0.12, 'square', 0.04]]) },
  clean() { tone(200, 0.2, 'sawtooth', 0.03) },
  evolution() { multi([[262, 0.25], [330, 0.25], [392, 0.25], [523, 0.3], [659, 0.3], [784, 0.4]]) },
  poo() { tone(80, 0.3, 'square', 0.04) },
  click() { tone(1000, 0.04, 'sine', 0.04) },
  success() { multi([[523, 0.08], [659, 0.08], [784, 0.15]]) },
  death() { tone(200, 0.5, 'sawtooth', 0.05); setTimeout(() => tone(100, 0.8, 'sawtooth', 0.04), 200) },
  select() { tone(440, 0.08); setTimeout(() => tone(660, 0.1), 60) },
}
