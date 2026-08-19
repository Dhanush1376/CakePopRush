import { MascotReaction } from '../reactions/reactionTypes';
import { MascotPose } from '../poses/types';

// BATCH 1
import { winkingPose } from '../poses/winkingPose';
import { playWinking } from './winking';
import { happyPose } from '../poses/happyPose';
import { playHappy } from './happy';
import { blushingPose } from '../poses/blushingPose';
import { playBlushing } from './blushing';
import { laughingPose } from '../poses/laughingPose';
import { playLaughing } from './laughing';
import { surprisedPose } from '../poses/surprisedPose';
import { playSurprised } from './surprised';

// BATCH 2
import { oopsPose } from '../poses/oopsPose';
import { playOops } from './oops';
import { confusedPose } from '../poses/confusedPose';
import { playConfused } from './confused';

// BATCH 3
import { sleepingPose } from '../poses/sleepingPose';
import { playSleeping } from './sleeping';
import { tiredPose } from '../poses/tiredPose';
import { playTired } from './tired';
import { yawningPose } from '../poses/yawningPose';
import { playYawning } from './yawning';
import { lovePose } from '../poses/lovePose';
import { playLove } from './love';

// BATCH 4
import { heartEyesPose } from '../poses/heartEyesPose';
import { playHeartEyes } from './heartEyes';
import { excitedPose } from '../poses/excitedPose';
import { playExcited } from './excited';
import { coolPose } from '../poses/coolPose';
import { playCool } from './cool';
import { sillyPose } from '../poses/sillyPose';
import { playSilly } from './silly';

// BATCH 5
import { partyPose } from '../poses/partyPose';
import { playParty } from './party';
import { sadPose } from '../poses/sadPose';
import { playSad } from './sad';
import { bonkPose } from '../poses/bonkPose';
import { playBonk } from './bonk';
import { cryingFountainPose } from '../poses/cryingFountainPose';
import { playCryingFountain } from './cryingFountain';
import { blowKissPose } from '../poses/blowKissPose';
import { playBlowKiss } from './blowKiss';
import { emotionalCutePose } from '../poses/emotionalCutePose';
import { playEmotionalCute } from './emotionalCute';
import { pleadingCutePose } from '../poses/pleadingCutePose';
import { playPleadingCute } from './pleadingCute';
import { determinedPose } from '../poses/determinedPose';
import { playDetermined } from './determined';

export interface ReactionDefinition {
  id: MascotReaction;
  label: string;
  duration: number; // approximate duration in ms
  category: 'positive' | 'playful' | 'thinking' | 'negative' | 'sleepy' | 'social' | 'celebration' | 'utility';
  intensity: 'micro' | 'medium' | 'major';
  priority: 1 | 2 | 3 | 4 | 5;
  pose: MascotPose;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playFn: (ctx: any) => Promise<void | { holdState: boolean }>;
}

export const REACTIONS: Record<MascotReaction, ReactionDefinition> = {
  happy: { id: 'happy', label: '00 Happy', duration: 2500, category: 'positive', intensity: 'medium', priority: 2, pose: happyPose, playFn: playHappy },
  determined: { id: 'determined', label: '23 Determined', duration: 3000, category: 'thinking', intensity: 'medium', priority: 3, pose: determinedPose, playFn: playDetermined },
  winking: { id: 'winking', label: '01 Winking', duration: 1200, category: 'playful', intensity: 'medium', priority: 2, pose: winkingPose, playFn: playWinking },
  blushing: { id: 'blushing', label: '02 Blushing', duration: 2200, category: 'positive', intensity: 'medium', priority: 2, pose: blushingPose, playFn: playBlushing },
  heartEyes: { id: 'heartEyes', label: '03 Heart Eyes', duration: 2500, category: 'playful', intensity: 'medium', priority: 2, pose: heartEyesPose, playFn: playHeartEyes },
  laughing: { id: 'laughing', label: '04 Laughing', duration: 3500, category: 'positive', intensity: 'medium', priority: 2, pose: laughingPose, playFn: playLaughing },
  excited: { id: 'excited', label: '05 Excited', duration: 3500, category: 'playful', intensity: 'major', priority: 2, pose: excitedPose, playFn: playExcited },
  surprised: { id: 'surprised', label: '06 Surprised', duration: 1200, category: 'negative', intensity: 'medium', priority: 3, pose: surprisedPose, playFn: playSurprised },
  oops: { id: 'oops', label: '07 Oops!', duration: 1800, category: 'negative', intensity: 'medium', priority: 3, pose: oopsPose, playFn: playOops },
  confused: { id: 'confused', label: '08 Confused', duration: 2500, category: 'thinking', intensity: 'medium', priority: 3, pose: confusedPose, playFn: playConfused },
  cool: { id: 'cool', label: '09 Cool', duration: 2200, category: 'playful', intensity: 'micro', priority: 3, pose: coolPose, playFn: playCool },
  sleeping: { id: 'sleeping', label: '10 Sleeping', duration: 3500, category: 'sleepy', intensity: 'medium', priority: 3, pose: sleepingPose, playFn: playSleeping },
  tired: { id: 'tired', label: '11 Tired', duration: 2800, category: 'sleepy', intensity: 'medium', priority: 3, pose: tiredPose, playFn: playTired },
  yawning: { id: 'yawning', label: '12 Yawning', duration: 3100, category: 'sleepy', intensity: 'medium', priority: 3, pose: yawningPose, playFn: playYawning },
  love: { id: 'love', label: '13 Love', duration: 2800, category: 'positive', intensity: 'medium', priority: 2, pose: lovePose, playFn: playLove },
  silly: { id: 'silly', label: '14 Silly', duration: 2000, category: 'playful', intensity: 'medium', priority: 3, pose: sillyPose, playFn: playSilly },
  party: { id: 'party', label: '15 Party', duration: 3200, category: 'social', intensity: 'major', priority: 1, pose: partyPose, playFn: playParty },
  sad: { id: 'sad', label: '16 Sad', duration: 2800, category: 'negative', intensity: 'medium', priority: 3, pose: sadPose, playFn: playSad },
  bonk: { id: 'bonk', label: '17 Bonk', duration: 4500, category: 'playful', intensity: 'micro', priority: 1, pose: bonkPose, playFn: playBonk },
  cryingFountain: { id: 'cryingFountain', label: '18 Crying', duration: 4500, category: 'negative', intensity: 'major', priority: 3, pose: cryingFountainPose, playFn: playCryingFountain },
  blowKiss: { id: 'blowKiss', label: '19 Blow Kiss', duration: 3500, category: 'social', intensity: 'medium', priority: 1, pose: blowKissPose, playFn: playBlowKiss },
  emotionalCute: { id: 'emotionalCute', label: '20 Cute', duration: 3700, category: 'positive', intensity: 'micro', priority: 2, pose: emotionalCutePose, playFn: playEmotionalCute },
  pleadingCute: { id: 'pleadingCute', label: '21 Pleading', duration: 3700, category: 'positive', intensity: 'micro', priority: 2, pose: pleadingCutePose, playFn: playPleadingCute },
};
