import { MascotReaction } from '../reactions/reactionTypes';
import { MascotPose } from '../poses/types';

// BATCH 1
import { happyPose } from '../poses/happyPose';
import { playHappy } from './happy';
import { winkingPose } from '../poses/winkingPose';
import { playWinking } from './winking';
import { blushingPose } from '../poses/blushingPose';
import { playBlushing } from './blushing';
import { laughingPose } from '../poses/laughingPose';
import { playLaughing } from './laughing';
import { surprisedPose } from '../poses/surprisedPose';
import { playSurprised } from './surprised';

// BATCH 2
import { oopsPose } from '../poses/oopsPose';
import { playOops } from './oops';
import { curiousPose } from '../poses/curiousPose';
import { playCurious } from './curious';
import { thinkingPose } from '../poses/thinkingPose';
import { playThinking } from './thinking';
import { confusedPose } from '../poses/confusedPose';
import { playConfused } from './confused';
import { shrugPose } from '../poses/shrugPose';
import { playShrug } from './shrug';

// BATCH 3
import { sleepingPose } from '../poses/sleepingPose';
import { playSleeping } from './sleeping';
import { tiredPose } from '../poses/tiredPose';
import { playTired } from './tired';
import { yawningPose } from '../poses/yawningPose';
import { playYawning } from './yawning';
import { lovePose } from '../poses/lovePose';
import { playLove } from './love';
import { gratefulPose } from '../poses/gratefulPose';
import { playGrateful } from './grateful';
import { shyPose } from '../poses/shyPose';
import { playShy } from './shy';

// BATCH 4
import { heartEyesPose } from '../poses/heartEyesPose';
import { playHeartEyes } from './heartEyes';
import { excitedPose } from '../poses/excitedPose';
import { playExcited } from './excited';
import { coolPose } from '../poses/coolPose';
import { playCool } from './cool';
import { cheekyPose } from '../poses/cheekyPose';
import { playCheeky } from './cheeky';
import { sillyPose } from '../poses/sillyPose';
import { playSilly } from './silly';
import { proudPose } from '../poses/proudPose';
import { playProud } from './proud';
import { determinedPose } from '../poses/determinedPose';
import { playDetermined } from './determined';

// BATCH 5
import { peekingPose } from '../poses/peekingPose';
import { playPeeking } from './peeking';
import { hidingPose } from '../poses/hidingPose';
import { playHiding } from './hiding';
import { helloPose } from '../poses/helloPose';
import { playHello } from './wave';
import { goodbyePose } from '../poses/goodbyePose';
import { playGoodbye } from './goodbye';
import { tadaPose } from '../poses/tadaPose';
import { playTada } from './tada';
import { clappingPose } from '../poses/clappingPose';
import { playClapping } from './clapping';
import { partyPose } from '../poses/partyPose';
import { playParty } from './party';
import { playSad } from './sad';

export interface ReactionDefinition {
  id: MascotReaction;
  label: string;
  duration: number; // approximate duration in ms
  category: 'positive' | 'playful' | 'thinking' | 'negative' | 'sleepy' | 'social' | 'celebration' | 'utility';
  intensity: 'micro' | 'medium' | 'major';
  priority: 1 | 2 | 3 | 4 | 5;
  pose: MascotPose;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playFn: (ctx: any) => Promise<void>;
}

export const REACTIONS: Record<MascotReaction, ReactionDefinition> = {
  happy: { id: 'happy', label: '01 Happy', duration: 1800, category: 'positive', intensity: 'medium', priority: 2, pose: happyPose, playFn: playHappy },
  winking: { id: 'winking', label: '02 Winking', duration: 1500, category: 'playful', intensity: 'medium', priority: 2, pose: winkingPose, playFn: playWinking },
  blushing: { id: 'blushing', label: '03 Blushing', duration: 2200, category: 'positive', intensity: 'medium', priority: 2, pose: blushingPose, playFn: playBlushing },
  heartEyes: { id: 'heartEyes', label: '04 Heart Eyes', duration: 2500, category: 'playful', intensity: 'medium', priority: 2, pose: heartEyesPose, playFn: playHeartEyes },
  laughing: { id: 'laughing', label: '05 Laughing', duration: 2000, category: 'positive', intensity: 'medium', priority: 2, pose: laughingPose, playFn: playLaughing },
  excited: { id: 'excited', label: '06 Excited', duration: 2300, category: 'playful', intensity: 'major', priority: 2, pose: excitedPose, playFn: playExcited },
  surprised: { id: 'surprised', label: '07 Surprised', duration: 1200, category: 'negative', intensity: 'medium', priority: 3, pose: surprisedPose, playFn: playSurprised },
  oops: { id: 'oops', label: '08 Oops!', duration: 1800, category: 'negative', intensity: 'medium', priority: 3, pose: oopsPose, playFn: playOops },
  curious: { id: 'curious', label: '09 Curious', duration: 2300, category: 'thinking', intensity: 'micro', priority: 3, pose: curiousPose, playFn: playCurious },
  thinking: { id: 'thinking', label: '10 Thinking', duration: 2800, category: 'thinking', intensity: 'medium', priority: 3, pose: thinkingPose, playFn: playThinking },
  confused: { id: 'confused', label: '11 Confused', duration: 2500, category: 'thinking', intensity: 'medium', priority: 3, pose: confusedPose, playFn: playConfused },
  shrug: { id: 'shrug', label: '12 Shrug', duration: 2000, category: 'thinking', intensity: 'medium', priority: 3, pose: shrugPose, playFn: playShrug },
  cool: { id: 'cool', label: '13 Cool', duration: 2200, category: 'playful', intensity: 'micro', priority: 3, pose: coolPose, playFn: playCool },
  sleeping: { id: 'sleeping', label: '14 Sleeping', duration: 3500, category: 'sleepy', intensity: 'medium', priority: 3, pose: sleepingPose, playFn: playSleeping },
  tired: { id: 'tired', label: '15 Tired', duration: 2800, category: 'sleepy', intensity: 'medium', priority: 3, pose: tiredPose, playFn: playTired },
  yawning: { id: 'yawning', label: '16 Yawning', duration: 3100, category: 'sleepy', intensity: 'medium', priority: 3, pose: yawningPose, playFn: playYawning },
  love: { id: 'love', label: '17 Love', duration: 2800, category: 'positive', intensity: 'medium', priority: 2, pose: lovePose, playFn: playLove },
  grateful: { id: 'grateful', label: '18 Grateful', duration: 2500, category: 'positive', intensity: 'medium', priority: 2, pose: gratefulPose, playFn: playGrateful },
  cheeky: { id: 'cheeky', label: '19 Cheeky', duration: 1800, category: 'playful', intensity: 'medium', priority: 3, pose: cheekyPose, playFn: playCheeky },
  silly: { id: 'silly', label: '20 Silly', duration: 1800, category: 'playful', intensity: 'medium', priority: 3, pose: sillyPose, playFn: playSilly },
  proud: { id: 'proud', label: '21 Proud', duration: 2200, category: 'positive', intensity: 'medium', priority: 2, pose: proudPose, playFn: playProud },
  determined: { id: 'determined', label: '22 Determined', duration: 1900, category: 'positive', intensity: 'medium', priority: 2, pose: determinedPose, playFn: playDetermined },
  shy: { id: 'shy', label: '23 Shy', duration: 2500, category: 'social', intensity: 'medium', priority: 2, pose: shyPose, playFn: playShy },
  peeking: { id: 'peeking', label: '24 Peeking', duration: 3100, category: 'social', intensity: 'medium', priority: 1, pose: peekingPose, playFn: playPeeking },
  hiding: { id: 'hiding', label: '25 Hiding', duration: 2100, category: 'social', intensity: 'medium', priority: 1, pose: hidingPose, playFn: playHiding },
  wave: { id: 'wave', label: '26 Hello / Wave', duration: 2500, category: 'social', intensity: 'medium', priority: 1, pose: helloPose, playFn: playHello },
  goodbye: { id: 'goodbye', label: '27 Goodbye', duration: 2700, category: 'social', intensity: 'medium', priority: 1, pose: goodbyePose, playFn: playGoodbye },
  tada: { id: 'tada', label: '28 Ta-Da!', duration: 2500, category: 'celebration', intensity: 'major', priority: 2, pose: tadaPose, playFn: playTada },
  clapping: { id: 'clapping', label: '29 Clapping', duration: 2300, category: 'celebration', intensity: 'major', priority: 2, pose: clappingPose, playFn: playClapping },
  party: { id: 'party', label: '30 Party', duration: 3500, category: 'celebration', intensity: 'major', priority: 2, pose: partyPose, playFn: playParty },
  sad: { id: 'sad', label: '31 Sad', duration: 2800, category: 'negative', intensity: 'medium', priority: 3, pose: tiredPose, playFn: playSad },
};
