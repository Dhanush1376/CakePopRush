import { ReactionContext } from '../animations/animationTypes';
import { ParticleType } from '../effects/ParticleEffects';

export const spawnHearts = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'hearts']);
  // Auto cleanup after duration
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'hearts'));
  }, 2000);
};

export const spawnSparkles = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'sparkles']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'sparkles'));
  }, 1500);
};

export const spawnConfetti = (ctx: ReactionContext, config?: any) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'confetti']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'confetti'));
  }, 2500);
};

export const wobble = async (ctx: ReactionContext, selector: string, degrees: number, duration: number) => {
  return ctx.animate([
    [selector, { rotate: [0, degrees, -degrees, 0] }, { duration: duration / 1000, ease: 'easeInOut' }]
  ]);
};

export const spawnQuestionMarks = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'questionMarks']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'questionMarks'));
  }, 2000);
};

export const spawnThoughtDots = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'thoughtDots']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'thoughtDots'));
  }, 2000);
};

export const spawnSleepZs = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'sleepZ']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'sleepZ'));
  }, 3000);
};

export const spawnExcitementLines = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'excitementLines']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'excitementLines'));
  }, 1000);
};

export const spawnImpactLines = (ctx: ReactionContext) => {
  if (ctx.prefersReducedMotion) return;
  ctx.setActiveParticles((prev: ParticleType[]) => [...prev, 'impactLines']);
  setTimeout(() => {
    ctx.setActiveParticles((prev: ParticleType[]) => prev.filter((p: ParticleType) => p !== 'impactLines'));
  }, 800);
};

export const clearEffects = (ctx: ReactionContext) => {
  ctx.setActiveParticles([]);
};
