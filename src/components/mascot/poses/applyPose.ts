import { MascotPose } from './types';
import { ReactionContext } from '../animations/animationTypes';
import { AnimationSequence } from 'framer-motion';

export const applyPose = async (ctx: ReactionContext, pose: MascotPose) => {
  const { animate, setMouthShape, setAccessories, setActiveParticles } = ctx;

  setMouthShape(pose.mouth);
  setAccessories(pose.accessories as any);
  setActiveParticles(pose.activeParticles);

  const seq: AnimationSequence = [
    // Body & Root
    ['#mascot-root', { scaleX: pose.body.scaleX, scaleY: pose.body.scaleY, y: pose.body.y, x: pose.body.x, rotate: pose.body.rotate }, { duration: 0.3, ease: 'easeOut' }],
    ['#torso-group', { scaleX: 1, scaleY: 1, y: 0, x: 0, rotate: 0 }, { duration: 0.3, ease: 'easeOut' }], // We usually animate torso-group, but pose applies to root/body or torso. Let's apply to torso as well if needed. Actually we'll just map body to torso.
    // Let's map pose.body to torso-group instead to match how animations work.
  ];

  // Let's map pose.body to mascot-root to avoid animating an element with bound MotionValues
  seq.push(['#mascot-root', { scaleX: pose.body.scaleX, scaleY: pose.body.scaleY, rotate: pose.body.rotate || 0, x: pose.body.x || 0, y: pose.body.y || 0 }, { duration: 0.3, ease: 'easeOut' }]);

  // Arms
  const lArmId = pose.leftArm.isFront ? '#left-arm-front' : '#left-arm';
  const rArmId = pose.rightArm.isFront ? '#right-arm-front' : '#right-arm';
  const lArmPathId = pose.leftArm.isFront ? '#left-arm-front-path' : '#left-arm-path';
  const rArmPathId = pose.rightArm.isFront ? '#right-arm-front-path' : '#right-arm-path';

  // Toggle opacities
  seq.push(['#left-arm', { opacity: pose.leftArm.isFront ? 0 : 1 }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#left-arm-front', { opacity: pose.leftArm.isFront ? 1 : 0 }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-arm', { opacity: pose.rightArm.isFront ? 0 : 1 }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-arm-front', { opacity: pose.rightArm.isFront ? 1 : 0 }, { duration: 0.3, ease: 'easeOut' }]);

  seq.push([lArmId, { rotate: pose.leftArm.rotate || 0, y: pose.leftArm.y || 0, x: pose.leftArm.x || 0 }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push([rArmId, { rotate: pose.rightArm.rotate || 0, y: pose.rightArm.y || 0, x: pose.rightArm.x || 0 }, { duration: 0.3, ease: 'easeOut' }]);
  if (pose.leftArm.path) seq.push([lArmPathId, { d: pose.leftArm.path }, { duration: 0.3, ease: 'easeOut' }]);
  if (pose.rightArm.path) seq.push([rArmPathId, { d: pose.rightArm.path }, { duration: 0.3, ease: 'easeOut' }]);
  
  // Legs
  seq.push(['#left-leg', { rotate: pose.leftLeg.rotate || 0, y: pose.leftLeg.y || 0, x: pose.leftLeg.x || 0 }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-leg', { rotate: pose.rightLeg.rotate || 0, y: pose.rightLeg.y || 0, x: pose.rightLeg.x || 0 }, { duration: 0.3, ease: 'easeOut' }]);

  // Eyes base
  const fx = pose.faceX || 0;
  const fy = pose.faceY || 0;
  seq.push(['#left-eye-container', { scaleX: pose.leftEye.scaleX, scaleY: pose.leftEye.scaleY, y: pose.leftEye.y + fy, x: pose.leftEye.x + fx }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-eye-container', { scaleX: pose.rightEye.scaleX, scaleY: pose.rightEye.scaleY, y: pose.rightEye.y + fy, x: pose.rightEye.x + fx }, { duration: 0.3, ease: 'easeOut' }]);

  // Eye shapes (Normal, Closed, Squeezed, Heart, Tired, Cute, Pleading)
  const eyeShapes = ['normal', 'closed', 'squeezed', 'heart', 'tired', 'cute', 'pleading'];
  eyeShapes.forEach(shape => {
    const isVisibleLeft = pose.leftEyeShape === shape || (shape === 'normal' && pose.leftEyeShape === 'tired');
    const isVisibleRight = pose.rightEyeShape === shape || (shape === 'normal' && pose.rightEyeShape === 'tired');
    seq.push([`#left-eye-${shape}`, { opacity: isVisibleLeft ? 1 : 0 }, { duration: 0.3, ease: 'easeOut' }]);
    seq.push([`#right-eye-${shape}`, { opacity: isVisibleRight ? 1 : 0 }, { duration: 0.3, ease: 'easeOut' }]);
  });

  // Pupils (Don't animate x and y because they track mouse in SideCart)
  seq.push(['#left-pupil-group', { scale: pose.leftPupil.scale }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-pupil-group', { scale: pose.rightPupil.scale }, { duration: 0.3, ease: 'easeOut' }]);

  // Eyebrows
  seq.push(['#left-eyebrow', { 
    y: pose.leftEyebrow.y + fy, 
    x: pose.leftEyebrow.x + fx, 
    rotate: pose.leftEyebrow.rotate,
    ...(pose.leftEyebrow.scaleY !== undefined ? { scaleY: pose.leftEyebrow.scaleY } : { scaleY: 1 }),
    ...(pose.leftEyebrow.scaleX !== undefined ? { scaleX: pose.leftEyebrow.scaleX } : { scaleX: 1 })
  }, { duration: 0.3, ease: 'easeOut' }]);
  
  seq.push(['#right-eyebrow', { 
    y: pose.rightEyebrow.y + fy, 
    x: pose.rightEyebrow.x + fx, 
    rotate: pose.rightEyebrow.rotate,
    ...(pose.rightEyebrow.scaleY !== undefined ? { scaleY: pose.rightEyebrow.scaleY } : { scaleY: 1 }),
    ...(pose.rightEyebrow.scaleX !== undefined ? { scaleX: pose.rightEyebrow.scaleX } : { scaleX: 1 })
  }, { duration: 0.3, ease: 'easeOut' }]);

  // Cheeks / Blush
  seq.push(['#left-cheek', { opacity: pose.blushOpacity, scale: pose.blushOpacity > 0 ? 1 : 0, x: fx, y: fy }, { duration: 0.3, ease: 'easeOut' }]);
  seq.push(['#right-cheek', { opacity: pose.blushOpacity, scale: pose.blushOpacity > 0 ? 1 : 0, x: fx, y: fy }, { duration: 0.3, ease: 'easeOut' }]);
  
  // Mouth
  seq.push(['#mouth', { x: fx, y: fy }, { duration: 0.3, ease: 'easeOut' }]);

  // Wait for React to render conditional accessories before applying sequence
  await new Promise(r => setTimeout(r, 20));

  // Accessories that follow face
  if (document.querySelector('#party-blower')) {
    seq.push(['#party-blower', { x: fx, y: fy }, { duration: 0.3, ease: 'easeOut' }]);
  }

  // Execute animations individually so one failure doesn't abort the entire pose
  await Promise.all(
    seq.map(async (item: any) => {
      try {
        await animate(item[0], item[1], item[2]);
      } catch (e: any) {
        if (e.message !== 'Aborted') {
          console.warn(`Failed to animate ${item[0]}:`, e);
        }
      }
    })
  );
};
