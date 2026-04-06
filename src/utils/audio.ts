/**
 * Audio utility for generating gentle notification sounds
 * 
 * This module uses the Web Audio API to synthesize sounds programmatically
 * instead of loading audio files. This keeps the app lightweight and ensures
 * consistent sound across all platforms.
 */

/**
 * Plays a deep, calming gong-like sound at the end of a break
 * 
 * How it works:
 * 1. Creates multiple oscillators at lower frequencies for a deep, resonant tone
 * 2. Uses sine waves for smooth, meditative quality
 * 3. The frequencies create a rich harmonic spectrum like a Tibetan singing bowl
 * 4. Long, slow fade out (4 seconds) mimics the natural decay of a gong
 * 5. Adds subtle frequency modulation for organic shimmer
 * 6. The audio context is cleaned up after the sound finishes
 * 
 * @returns void - The sound plays asynchronously and doesn't block execution
 */
export const playBreakEndSound = () => {
  try {
    // Create audio context - the "canvas" for all Web Audio operations
    // Supports both standard and webkit-prefixed versions for browser compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Get current audio time as reference point for scheduling
    const now = audioContext.currentTime;
    
    // === CREATE OSCILLATORS FOR DEEP GONG SOUND ===
    
    // Fundamental frequency - Deep D note (146.83 Hz)
    // Much lower than before (was 880 Hz) for a calming, grounding tone
    const fundamental = audioContext.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(146.83, now);
    
    // Second harmonic - Perfect fifth above (220 Hz - A3)
    // Adds warmth and richness
    const harmonic2 = audioContext.createOscillator();
    harmonic2.type = 'sine';
    harmonic2.frequency.setValueAtTime(220, now);
    
    // Third harmonic - Octave above fundamental (293.66 Hz - D4)
    // Reinforces the fundamental for fuller sound
    const harmonic3 = audioContext.createOscillator();
    harmonic3.type = 'sine';
    harmonic3.frequency.setValueAtTime(293.66, now);
    
    // Fourth harmonic - Minor third for slight dissonance (349.23 Hz - F4)
    // Adds complexity and "gong-like" character
    const harmonic4 = audioContext.createOscillator();
    harmonic4.type = 'sine';
    harmonic4.frequency.setValueAtTime(349.23, now);
    
    // === CREATE SUBTLE VIBRATO FOR ORGANIC FEEL ===
    
    // LFO (Low Frequency Oscillator) for subtle pitch modulation
    // This creates the "shimmer" effect of a real gong
    const vibrato = audioContext.createOscillator();
    vibrato.type = 'sine';
    vibrato.frequency.setValueAtTime(2, now); // Wobble 2 times per second
    
    const vibratoGain = audioContext.createGain();
    vibratoGain.gain.setValueAtTime(0.5, now); // Very subtle pitch variation
    
    vibrato.connect(vibratoGain);
    vibratoGain.connect(fundamental.frequency);
    
    // === CREATE GAIN NODES (VOLUME CONTROLS) ===
    
    const gainNode1 = audioContext.createGain();
    const gainNode2 = audioContext.createGain();
    const gainNode3 = audioContext.createGain();
    const gainNode4 = audioContext.createGain();
    
    // Master gain for overall volume control
    const masterGain = audioContext.createGain();
    
    // === SET INITIAL VOLUMES ===
    
    // Lower volumes for a gentle, calming effect
    // The fundamental is strongest, harmonics add subtle texture
    gainNode1.gain.setValueAtTime(0.15, now);  // 15% - deep fundamental
    gainNode2.gain.setValueAtTime(0.08, now);  // 8% - warm fifth
    gainNode3.gain.setValueAtTime(0.06, now);  // 6% - reinforcing octave
    gainNode4.gain.setValueAtTime(0.04, now);  // 4% - subtle dissonance
    
    // === CREATE LONG, GONG-LIKE FADE OUT ===
    
    // Much longer fade (4 seconds) for calming, meditative quality
    const fadeOutEnd = now + 4.0;
    
    // Gradual exponential fade mimics the natural decay of a struck gong
    // The sound slowly dissolves into silence
    gainNode1.gain.exponentialRampToValueAtTime(0.001, fadeOutEnd);
    gainNode2.gain.exponentialRampToValueAtTime(0.001, fadeOutEnd);
    gainNode3.gain.exponentialRampToValueAtTime(0.001, fadeOutEnd);
    gainNode4.gain.exponentialRampToValueAtTime(0.001, fadeOutEnd);
    
    // === CONNECT THE AUDIO GRAPH ===
    
    // Audio flow:
    // Oscillator → Gain Node → Master Gain → Speakers
    // Vibrato LFO → Vibrato Gain → Fundamental Frequency (modulation)
    
    fundamental.connect(gainNode1);
    harmonic2.connect(gainNode2);
    harmonic3.connect(gainNode3);
    harmonic4.connect(gainNode4);
    
    gainNode1.connect(masterGain);
    gainNode2.connect(masterGain);
    gainNode3.connect(masterGain);
    gainNode4.connect(masterGain);
    
    masterGain.connect(audioContext.destination);
    
    // === START AND STOP ALL OSCILLATORS ===
    
    // Start all sound generators
    fundamental.start(now);
    harmonic2.start(now);
    harmonic3.start(now);
    harmonic4.start(now);
    vibrato.start(now);
    
    // Schedule all to stop after the long fade completes
    fundamental.stop(fadeOutEnd);
    harmonic2.stop(fadeOutEnd);
    harmonic3.stop(fadeOutEnd);
    harmonic4.stop(fadeOutEnd);
    vibrato.stop(fadeOutEnd);
    
    // === CLEANUP ===
    
    // Close the audio context after 5 seconds to free up resources
    // Gives extra buffer time after the 4-second fade
    setTimeout(() => {
      audioContext.close();
    }, 5000);
    
    console.log('[Audio] Played calming gong sound');
  } catch (error) {
    // If anything goes wrong (e.g., browser doesn't support Web Audio),
    // fail silently so the app continues to work without sound
    console.error('[Audio] Failed to play break end sound:', error);
  }
};
