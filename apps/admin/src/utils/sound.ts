let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
  return audioCtx
}

function beep(ctx: AudioContext, freq: number, start: number, duration: number) {
  const osc  = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, start)
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.35, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
  osc.start(start)
  osc.stop(start + duration)
}

export function playNewOrder() {
  try {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const t = ctx.currentTime
    beep(ctx, 880,  t,       0.18)
    beep(ctx, 1100, t + 0.2, 0.18)
    beep(ctx, 1320, t + 0.4, 0.3)
  } catch { /* audio blocked */ }
}

export function unlockAudio() {
  try { getCtx().resume() } catch { /* ignore */ }
}
