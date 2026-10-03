import { MascotPose } from './types';
import { defaultPose } from './defaultPose';

/** Reference #16 Yawning: sleepy eyes, yawn mouth wide, body stretching */
export const yawningPose: MascotPose = {
  ...defaultPose,
  body: { ...defaultPose.body, y: -4, scaleY: 1.08, scaleX: 0.92 }, // Deep stretch upwards
  leftEyeShape: 'tired',
  rightEyeShape: 'tired',
  mouth: 'yawn',
};
