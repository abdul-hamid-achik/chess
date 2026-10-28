const audioContext = typeof window !== "undefined" ? new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext)() : null

export type SoundType = "move" | "capture" | "check" | "gameStart" | "gameEnd" | "illegal"

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  if (!audioContext) return

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch {
    // Silently fail if audio is not supported
  }
}

export function playMoveSound() {
  playTone(440, 0.1, "sine", 0.2)
}

export function playCaptureSound() {
  playTone(220, 0.15, "square", 0.15)
  setTimeout(() => playTone(165, 0.15, "square", 0.1), 50)
}

export function playCheckSound() {
  playTone(523, 0.2, "sine", 0.25)
  setTimeout(() => playTone(659, 0.2, "sine", 0.25), 100)
  setTimeout(() => playTone(784, 0.3, "sine", 0.25), 200)
}

export function playGameStartSound() {
  playTone(392, 0.15, "sine", 0.2)
  setTimeout(() => playTone(523, 0.15, "sine", 0.2), 100)
  setTimeout(() => playTone(659, 0.2, "sine", 0.2), 200)
}

export function playGameEndSound() {
  playTone(523, 0.2, "sine", 0.25)
  setTimeout(() => playTone(440, 0.2, "sine", 0.25), 150)
  setTimeout(() => playTone(349, 0.3, "sine", 0.25), 300)
}

export function playIllegalMoveSound() {
  playTone(200, 0.1, "sawtooth", 0.15)
  setTimeout(() => playTone(150, 0.15, "sawtooth", 0.15), 80)
}

export function initAudio() {
  if (audioContext?.state === "suspended") {
    audioContext.resume()
  }
}
