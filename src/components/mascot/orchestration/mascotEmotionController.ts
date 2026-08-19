import { MascotReaction } from '../reactions/reactionTypes';
import { MascotTriggerEvent, PRIORITY_WEIGHTS, OrchestratorConfig } from './mascotEmotionTypes';
import { EventKey, MASCOT_EVENT_MAP, TAP_REACTION_POOL } from './mascotEventMap';

type Listener = (reaction: MascotReaction | null, message?: string) => void;

class MascotEmotionController {
  private config: OrchestratorConfig = {
    defaultCooldownMs: 800,
    categoryCooldowns: {
      cart: 800,
      wishlist: 1000,
      checkout: 2000,
      idle: 5000,
    },
    idleIntervals: {
      tired: [30, 60],
      yawning: [45, 90],
      sleeping: [60, 120],
    },
  };

  private listeners: Set<Listener> = new Set();
  private history: MascotReaction[] = []; // Track recent reactions to avoid repetition
  private activeReaction: { event: MascotTriggerEvent; expiresAt: number } | null = null;
  private categoryLastPlayed: Record<string, number> = {};
  private pendingCartEvent: { event: MascotTriggerEvent; timeout: ReturnType<typeof setTimeout> } | null = null;
  
  // State for idle behavior
  private lastActivityTime: number = Date.now();
  private idleReaction: MascotReaction | null = null;
  private idleCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startIdleChecker();
  }

  // --- Public API ---

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public triggerEvent(eventKey: EventKey, message?: string): void {
    const event = MASCOT_EVENT_MAP[eventKey];
    if (!event) return;
    this.triggerReaction({ ...event, message: message || event.message });
  }

  public playDirectEmotion(emotion: MascotReaction, message?: string, category: 'cart' | 'idle' | 'mascot' | 'system' = 'cart'): void {
    // Treat direct emotions as high priority events
    const event: MascotTriggerEvent = {
      emotion,
      reason: 'DIRECT_EMOTION_TRIGGER',
      priority: 'high',
      category: category as any, // casting safely since category types usually match
      message
    };
    this.triggerReaction(event);
  }

  public triggerReaction(event: MascotTriggerEvent): void {
    const now = Date.now();

    // 1. Handle cart event debounce (300ms)
    if (event.category === 'cart') {
      if (this.pendingCartEvent) clearTimeout(this.pendingCartEvent.timeout);
      
      this.pendingCartEvent = {
        event,
        timeout: setTimeout(() => {
          this.pendingCartEvent = null;
          this.evaluateReaction(event, Date.now());
        }, 100)
      };
      return;
    }
    
    this.evaluateReaction(event, now);
  }

  private evaluateReaction(event: MascotTriggerEvent, now: number): void {
    // 2. Check Cooldowns
    const cooldownMs = event.cooldownMs || this.config.categoryCooldowns[event.category] || this.config.defaultCooldownMs;
    const lastPlayed = this.categoryLastPlayed[event.category] || 0;
    
    if (now - lastPlayed < cooldownMs) {
      if (this.activeReaction && PRIORITY_WEIGHTS[event.priority] <= PRIORITY_WEIGHTS[this.activeReaction.event.priority]) {
        return; // Ignored due to cooldown and priority
      }
    }

    // 3. Priority & Same-Reaction Checks
    if (this.activeReaction && now < this.activeReaction.expiresAt) {
      const activeWeight = PRIORITY_WEIGHTS[this.activeReaction.event.priority];
      const newWeight = PRIORITY_WEIGHTS[event.priority];
      
      // If it's a low priority event (e.g. idle/system), it cannot interrupt any active reaction
      if (newWeight < PRIORITY_WEIGHTS['medium']) {
        return;
      }
      
      // Can't interrupt higher priority
      if (newWeight < activeWeight) {
        return;
      }
      
      // Same reaction retrigger guard (unless critical)
      if (this.activeReaction.event.emotion === event.emotion && newWeight < PRIORITY_WEIGHTS['critical']) {
        return;
      }
    }

    // 4. Select Reaction (Repetition Prevention)
    const reactionToPlay = this.selectReaction(event.emotion, event.alternatives);

    // 5. Play Reaction
    this.play(reactionToPlay, event, event.message);
  }

  public handleTap(): void {
    // Weighted random selection with repetition prevention
    this.resetIdleTimer();
    
    // Calculate total weight
    const totalWeight = TAP_REACTION_POOL.reduce((sum, item) => sum + item.weight, 0);
    
    // Try picking up to 3 times to avoid repetition
    let selectedReaction = 'bonk' as MascotReaction; // Fallback
    
    for (let attempt = 0; attempt < 3; attempt++) {
      let randomVal = Math.random() * totalWeight;
      for (const item of TAP_REACTION_POOL) {
        if (randomVal < item.weight) {
          selectedReaction = item.emotion;
          break;
        }
        randomVal -= item.weight;
      }
      
      // Check if it was played recently
      if (!this.history.slice(-2).includes(selectedReaction)) {
        break; // Good selection, not played recently
      }
    }

    this.triggerReaction({
      ...MASCOT_EVENT_MAP['mascot:tapped'],
      emotion: selectedReaction
    });
  }

  public resetIdleTimer(): void {
    this.lastActivityTime = Date.now();
    // Wake up if sleeping/tired and no other reaction is playing
    if (this.idleReaction && (!this.activeReaction || Date.now() > this.activeReaction.expiresAt)) {
      this.idleReaction = null;
      this.triggerEvent('user:returns');
    } else {
       this.idleReaction = null;
    }
  }

  public getIdleReaction(): MascotReaction | null {
    return this.idleReaction;
  }

  // --- Internal Logic ---

  private selectReaction(primary: MascotReaction, alternatives?: MascotReaction[]): MascotReaction {
    if (!alternatives || alternatives.length === 0) {
      return primary;
    }

    // If primary was played recently, try an alternative
    if (this.history.slice(-2).includes(primary)) {
      // Find an alternative that hasn't been played recently
      const availableAlts = alternatives.filter(alt => !this.history.slice(-3).includes(alt));
      if (availableAlts.length > 0) {
        // Pick a random available alternative
        return availableAlts[Math.floor(Math.random() * availableAlts.length)];
      }
    }

    return primary;
  }

  private play(reaction: MascotReaction, event: MascotTriggerEvent, message?: string) {
    const now = Date.now();
    
    // Update tracking
    this.history.push(reaction);
    if (this.history.length > 10) this.history.shift(); // keep history bounded
    
    this.categoryLastPlayed[event.category] = now;
    
    // Rough estimate of reaction duration (could read from reactionRegistry in a full implementation)
    const estimatedDuration = 3500; 
    
    this.activeReaction = {
      event,
      expiresAt: now + estimatedDuration
    };

    // Notify listeners
    this.listeners.forEach(listener => listener(reaction, message));
    
    // Reset activity to prevent idle state interrupting the reaction
    this.lastActivityTime = Date.now();
  }

  private startIdleChecker() {
    if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
    
    this.idleCheckInterval = setInterval(() => {
      // Don't trigger idle if an active reaction is playing
      if (this.activeReaction && Date.now() < this.activeReaction.expiresAt) return;
      
      const idleSeconds = (Date.now() - this.lastActivityTime) / 1000;
      let nextIdleReaction: MascotReaction | null = null;

      // Determine appropriate idle state based on config intervals
      if (idleSeconds > this.config.idleIntervals.sleeping[0]) {
         // Optionally randomize within the window, for simplicity we just trigger when past min
         nextIdleReaction = 'sleeping';
      } else if (idleSeconds > this.config.idleIntervals.yawning[0]) {
         nextIdleReaction = 'yawning';
      } else if (idleSeconds > this.config.idleIntervals.tired[0]) {
         nextIdleReaction = 'tired';
      }

      // If state changed, play it
      if (nextIdleReaction && nextIdleReaction !== this.idleReaction) {
         // Only play if it's an escalation (normal -> tired -> yawning -> sleeping)
         const states = ['tired', 'yawning', 'sleeping'];
         const currIdx = this.idleReaction ? states.indexOf(this.idleReaction) : -1;
         const nextIdx = states.indexOf(nextIdleReaction);
         
         if (nextIdx > currIdx) {
            this.idleReaction = nextIdleReaction;
            
            // Only broadcast the idle change, don't register it as a full "event" with cooldowns
            this.listeners.forEach(listener => listener(nextIdleReaction));
         }
      }
    }, 5000); // Check every 5s
  }
}

// Singleton instance
export const mascotEmotionController = new MascotEmotionController();
