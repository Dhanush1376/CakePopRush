export type MascotReaction =
  | 'happy' | 'winking' | 'blushing' | 'heartEyes' | 'laughing'
  | 'excited' | 'surprised' | 'oops' | 'curious' | 'thinking'
  | 'confused' | 'shrug' | 'cool' | 'sleeping' | 'tired'
  | 'yawning' | 'love' | 'grateful' | 'cheeky' | 'silly'
  | 'proud' | 'determined' | 'shy' | 'peeking' | 'hiding'
  | 'wave' | 'goodbye' | 'tada' | 'clapping' | 'party' | 'sad';

export type MascotState = 'IDLE' | 'ENTERING_REACTION' | 'PLAYING_REACTION' | 'RECOVERING';

export interface ReactionConfig {
  name: MascotReaction;
  duration: number; // approximate duration in ms, mostly for playground progress
  // We'll define specific timeline sequences using framer-motion useAnimate inside useMascotController
}

export type MascotSize = 'small' | 'medium' | 'large';

export interface MascotRef {
  play: (reaction: MascotReaction) => void;
  stop: () => void;
  reset: () => void;
  getState: () => MascotState;
  getCurrentReaction: () => MascotReaction | null;
}
