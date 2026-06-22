// Safe Web Audio API synthesizer for retro mechanical game sounds
// Avoids requiring external static files, keeping it 100% responsive and offline-first!

class RetroAudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private voiceType: string = "female"; // "female" | "male" | "child"

  private bgmInterval: any = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    // resume if suspended by browser auto-play policy
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    this.updateBgmVolume();
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  setVoiceType(type: string) {
    this.voiceType = type;
  }

  getVoiceType(): string {
    return this.voiceType;
  }

  // Speaks Japanese syllable or full word using SpeechSynthesis API
  speakJapanese(text: string, cancelActive: boolean = true) {
    if (this.isMuted) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja-JP";
        
        // Custom pitch/rate based on selected speaker gender/type
        if (this.voiceType === "male") {
          utterance.rate = 0.80; // slightly slower, authoritative cadence
          utterance.pitch = 0.76; // deeper masculine register
        } else if (this.voiceType === "child") {
          utterance.rate = 1.05; // bouncy and energetic
          utterance.pitch = 1.42; // high-pitched cute anime guide
        } else if (this.voiceType === "alien") {
          utterance.rate = 1.45; // ultra-fast cyber alien
          utterance.pitch = 1.95; // maximum high pitch electronic squeal
        } else if (this.voiceType === "elderly") {
          utterance.rate = 0.60; // very slow, wise grandpa pace
          utterance.pitch = 0.55; // deep, weathered hoarse quality
        } else {
          // female (default)
          utterance.rate = 0.88; // gentle, elegant instructional pace
          utterance.pitch = 1.05; // bright, high contrast clarity
        }

        // Try selecting a Japanese-specific voice package if available
        const voices = window.speechSynthesis.getVoices();
        let jaVoice = null;

        if (this.voiceType === "male") {
          // Look for male Japanese voices
          jaVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("man") || name.includes("guy"));
          });
        } else if (this.voiceType === "child") {
          // Look for cute / young sounding voices or standard female
          jaVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ayumi") || name.includes("haruka") || name.includes("sakura") || name.includes("child") || name.includes("xiaoxiao"));
          });
        } else if (this.voiceType === "alien") {
          // Cosmic / Google-synthesized robotic character voice
          jaVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) && (name.includes("google") || name.includes("natural"));
          });
        } else if (this.voiceType === "elderly") {
          // Elderly can try to find a deep male voice (e.g. Ichiro / Otoya)
          jaVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("ichiro") || name.includes("otoya") || name.includes("male") || name.includes("keiji"));
          });
        } else {
          // Look for elegant female voices
          jaVoice = voices.find((v) => {
            const name = v.name.toLowerCase();
            const lang = v.lang.toLowerCase();
            return (lang === "ja-jp" || lang.startsWith("ja")) &&
              (name.includes("kyoko") || name.includes("nanami") || name.includes("female") || name.includes("woman") || name.includes("ayumi"));
          });
        }

        // Fallback to generic Japanese speakers if the customized searches yielded nothing
        if (!jaVoice) {
          jaVoice = voices.find((v) => v.lang === "ja-JP" || v.lang.toLowerCase().startsWith("ja"));
        }

        if (jaVoice) {
          utterance.voice = jaVoice;
        }

        if (cancelActive && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          // Give a small setTimeout buffer for Chrome/Safari to safely clear and speak the new utterance
          setTimeout(() => {
            if (!this.isMuted) {
              window.speechSynthesis.speak(utterance);
            }
          }, 15);
        } else {
          window.speechSynthesis.speak(utterance);
        }
      } catch (err) {
        console.warn("Speech synthesis failed or was interrupted:", err);
      }
    }
  }

  // Soft crisp typewriter key click synthesis with wood/metal resonance
  playTyping() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // 1. Bass "Thump" - key bottoming out
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = "sine";
      thudOsc.frequency.setValueAtTime(140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(70, now + 0.04);
      thudGain.gain.setValueAtTime(0.12, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.05);

      // 2. High-frequency Metal "Click"
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = "triangle";
      clickOsc.frequency.setValueAtTime(1800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      clickGain.gain.setValueAtTime(0.07, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.04);

      // 3. Subtle noise burst for physical friction click
      const bufferSize = this.ctx.sampleRate * 0.02; // 20ms burst
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2400; // high frequency metallic clack
      filter.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      noiseNode.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noiseNode.start(now);
      noiseNode.stop(now + 0.02);
    } catch (e) {
      // Fallback simple beep to guarantee no crashes
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    }
  }

  // Vintage Desk Typewriter margin bell "Ding!"
  playTypewriterBell() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // High-pitched crystal clear bell resonance
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(2637.02, now); // E7 high chime
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3135.96, now); // G7 harmonics
      
      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(0.18, now + 0.005);
      bellGain.gain.exponentialRampToValueAtTime(0.06, now + 0.06);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc1.connect(bellGain);
      osc2.connect(bellGain);
      bellGain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch (e) {
      this.playCharacterResolved();
    }
  }

  // Mechanical carriage return "whir-clack-zing" when cards are flipped
  playCarriageReturn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // 1. Spring tension release swept sound ("Zing")
      const sweepOsc = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweepOsc.type = "triangle";
      sweepOsc.frequency.setValueAtTime(150, now);
      sweepOsc.frequency.exponentialRampToValueAtTime(650, now + 0.16);
      
      sweepGain.gain.setValueAtTime(0.06, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      sweepOsc.connect(sweepGain);
      sweepGain.connect(this.ctx.destination);
      sweepOsc.start(now);
      sweepOsc.stop(now + 0.2);

      // 2. Carriage slide mechanical impact ("Clack")
      const impactOsc = this.ctx.createOscillator();
      const impactGain = this.ctx.createGain();
      impactOsc.type = "sawtooth";
      impactOsc.frequency.setValueAtTime(80, now + 0.15);
      
      impactGain.gain.setValueAtTime(0, now);
      impactGain.gain.setValueAtTime(0.12, now + 0.15);
      impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);
      
      impactOsc.connect(impactGain);
      impactGain.connect(this.ctx.destination);
      impactOsc.start(now + 0.14);
      impactOsc.stop(now + 0.22);
    } catch (e) {
      this.playCardSlide();
    }
  }

  // Gentle pop when complete single character is resolved
  playCharacterResolved() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Classic low buzzer sound for wrong key typed
  playError() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Joyous retro arcade chord fanfare for completing the entire word spelling!
  playFanfare() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.07 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.4);
    });
  }

  // Retro alarm sound for training session complete
  playTimeCompleted() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 698.46, 880.00, 1174.66, 1396.91];

    notes.forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.1);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + index * 0.1 + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.1, now + index * 0.1 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.1);
      osc.stop(now + index * 0.1 + 0.35);
    });
  }

  // Whoosh slider / card sliding sound effect using audio synthesizer
  playCardSlide() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Procedural Zen environment pad and wind-chimes synthesizer
  startAmbientBGM() {
    if (this.isBgmPlaying) return;
    this.init();
    if (!this.ctx) return;
    this.isBgmPlaying = true;

    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, now);
      // Very soft background atmospheric level (0.02 volume)
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.02, now + 2);
      this.droneGain.connect(this.ctx.destination);

      // Low frequency calming chord: 110Hz (A2) and 165Hz (E3)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = "sine";
      this.droneOsc1.frequency.setValueAtTime(110.00, now);
      this.droneOsc1.connect(this.droneGain);

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = "sine";
      this.droneOsc2.frequency.setValueAtTime(165.00, now);
      this.droneOsc2.connect(this.droneGain);

      this.droneOsc1.start();
      this.droneOsc2.start();

      // Periodic gentle Japanese pentatonic wind chimes (C5, D5, E5, G5, A5, C6)
      const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      const playChime = () => {
        if (!this.ctx || this.isMuted || !this.isBgmPlaying) return;
        try {
          const chimeOsc = this.ctx.createOscillator();
          const chimeGain = this.ctx.createGain();

          chimeOsc.type = "sine";
          const randomNote = pentatonic[Math.floor(Math.random() * pentatonic.length)];
          chimeOsc.frequency.setValueAtTime(randomNote, this.ctx.currentTime);

          chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
          chimeGain.gain.linearRampToValueAtTime(0.012, this.ctx.currentTime + 1.2);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 4.8);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(this.ctx.destination);

          chimeOsc.start();
          chimeOsc.stop(this.ctx.currentTime + 5.0);
        } catch (e) {}
      };

      playChime();
      this.bgmInterval = setInterval(playChime, 4500);
    } catch (e) {
      console.error("Failed to compile ambient music:", e);
    }
  }

  stopAmbientBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }

    const fadeOutAndStop = (osc: OscillatorNode | null, gain: GainNode | null) => {
      if (!this.ctx || !osc || !gain) return;
      try {
        const now = this.ctx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch (e) {}
        }, 500);
      } catch (err) {}
    };

    fadeOutAndStop(this.droneOsc1, this.droneGain);
    fadeOutAndStop(this.droneOsc2, this.droneGain);
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
  }

  updateBgmVolume() {
    if (!this.droneGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.droneGain.gain.cancelScheduledValues(now);
      this.droneGain.gain.setValueAtTime(this.droneGain.gain.value, now);
      this.droneGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.02, now + 0.5);
    } catch (e) {}
  }
}

export const audioSynth = new RetroAudioSynth();
