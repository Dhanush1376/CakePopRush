import { MascotReaction } from '../reactions/reactionTypes';
import { MascotTriggerEvent, PRIORITY_WEIGHTS, OrchestratorConfig, MascotPageContext, MascotIntensity } from './mascotEmotionTypes';
import { EventKey, MASCOT_EVENT_MAP, TAP_REACTION_POOL } from './mascotEventMap';

type Listener = (reaction: MascotReaction | null, message?: string) => void;

interface ReactionHistoryEntry {
  emotion: MascotReaction;
  message?: string;
  category: string;
  timestamp: number;
}

const INTENSITY_WEIGHTS: Record<MascotIntensity, number> = {
  micro: 10,
  normal: 20,
  strong: 30,
  milestone: 40,
};

const SURPRISE_POOL: MascotReaction[] = ['silly', 'cool', 'laughing', 'winking'];

class MascotEmotionController {
  private config: OrchestratorConfig = {
    defaultCooldownMs: 800,
    categoryCooldowns: {
      cart: 800,
      wishlist: 1000,
      checkout: 2000,
      idle: 5000,
      page: 2000,
    },
    idleIntervals: {
      tired: [30, 60],
      yawning: [45, 90],
      sleeping: [60, 120],
    },
  };

  private listeners: Set<Listener> = new Set();
  private history: ReactionHistoryEntry[] = [];
  private actionTimestamps: number[] = [];
  private activeReaction: { event: MascotTriggerEvent; expiresAt: number } | null = null;
  private categoryLastPlayed: Record<string, number> = {};
  private pendingCartEvent: { event: MascotTriggerEvent; timeout: ReturnType<typeof setTimeout> } | null = null;
  private activeDelays: Set<ReturnType<typeof setTimeout>> = new Set();
  private pendingChain: ReturnType<typeof setTimeout> | null = null;
  
  // State for page and idle behavior
  private currentPageContext: MascotPageContext = 'other';
  private lastActivityTime: number = Date.now();
  private lastSurpriseTime: number = 0;
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

  public setPageContext(context: MascotPageContext): void {
    if (this.currentPageContext !== context) {
      this.currentPageContext = context;
    }
  }

  public getPageContext(): MascotPageContext {
    return this.currentPageContext;
  }

  public triggerEvent(eventKey: EventKey, message?: string): void {
    const event = MASCOT_EVENT_MAP[eventKey];
    if (!event) return;
    this.triggerReaction({ ...event, message: message || event.message });
  }

  public playDirectEmotion(emotion: MascotReaction, message?: string, category: 'cart' | 'idle' | 'mascot' | 'system' = 'cart'): void {
    const event: MascotTriggerEvent = {
      emotion,
      reason: 'DIRECT_EMOTION_TRIGGER',
      priority: 'high',
      category: category as any,
      intensity: 'normal',
      message
    };
    this.triggerReaction(event);
  }

  public triggerReaction(event: MascotTriggerEvent): void {
    const now = Date.now();

    // Track action timestamps for rapid-action dampening
    this.actionTimestamps.push(now);
    // Keep only last 10 seconds of timestamps
    this.actionTimestamps = this.actionTimestamps.filter(t => now - t < 10000);

    // 1. Page Context Filter
    if (event.pageContexts && event.pageContexts.length > 0) {
      if (!event.pageContexts.includes(this.currentPageContext)) {
        return; // Event not valid on this page
      }
    }

    // 2. Debounce cart events slightly
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
    // 3. Rapid Action Dampening
    const recent2s = this.actionTimestamps.filter(t => now - t < 2000).length;
    const recent5s = this.actionTimestamps.filter(t => now - t < 5000).length;

    const eventIntensity = event.intensity || 'normal';
    const intensityWeight = INTENSITY_WEIGHTS[eventIntensity];

    // Suppress non-critical if > 3 actions in 2s
    if (recent2s > 3 && event.priority !== 'critical') {
      return;
    }
    // Suppress < milestone if > 5 actions in 5s
    if (recent5s > 5 && eventIntensity !== 'milestone') {
      return;
    }

    // 4. Probability Check
    const probability = event.probability !== undefined ? event.probability : 1.0;
    if (Math.random() > probability) {
      return; // Skipped by probability engine
    }

    // 5. Check Cooldowns
    const cooldownMs = event.cooldownMs || this.config.categoryCooldowns[event.category] || this.config.defaultCooldownMs;
    const lastPlayed = this.categoryLastPlayed[event.category] || 0;
    
    if (now - lastPlayed < cooldownMs) {
      if (this.activeReaction && PRIORITY_WEIGHTS[event.priority] <= PRIORITY_WEIGHTS[this.activeReaction.event.priority]) {
        return; // Ignored due to cooldown and priority
      }
    }

    // 6. Priority & Active Reaction Checks
    if (this.activeReaction && now < this.activeReaction.expiresAt) {
      const activeWeight = PRIORITY_WEIGHTS[this.activeReaction.event.priority];
      const newWeight = PRIORITY_WEIGHTS[event.priority];
      
      if (newWeight < PRIORITY_WEIGHTS['medium']) {
        return;
      }
      if (newWeight < activeWeight) {
        return;
      }
    }

    // 7. Surprise System (Rare spontaneous reaction on normal events)
    // ~2% chance, max 1 every 3 minutes, only on normal/low priority interactions
    if ((event.priority === 'low' || event.priority === 'medium') && now - this.lastSurpriseTime > 180000 && Math.random() < 0.02) {
      this.lastSurpriseTime = now;
      const surpriseReaction = SURPRISE_POOL[Math.floor(Math.random() * SURPRISE_POOL.length)];
      this.play(surpriseReaction, { ...event, emotion: surpriseReaction, message: undefined }, undefined);
      return;
    }

    // 8. Silence Weight (Chance to do absolutely nothing, making future reactions feel special)
    const silenceWeight = event.silenceWeight !== undefined ? event.silenceWeight : 0;
    if (silenceWeight > 0 && Math.random() < silenceWeight) {
      return; // Intentionally silent
    }

    // 9. Select Message
    let selectedMessage = event.message;
    if (event.messages && event.messages.length > 0) {
      // Filter out messages used in the last 5 reactions
      const recentMessages = this.history.slice(-5).map(h => h.message).filter(Boolean);
      const availableMessages = event.messages.filter(m => !recentMessages.includes(m));
      
      if (availableMessages.length > 0) {
        selectedMessage = availableMessages[Math.floor(Math.random() * availableMessages.length)];
      } else {
        selectedMessage = event.messages[Math.floor(Math.random() * event.messages.length)];
      }
    }

    // 10. Select Reaction (Repetition Prevention)
    const reactionToPlay = this.selectReaction(event.emotion, event.alternatives);

    // 11. Delay Execution Check
    if (event.delayMs && event.delayMs > 0) {
      const delayTimeout = setTimeout(() => {
        this.activeDelays.delete(delayTimeout);
        this.play(reactionToPlay, event, selectedMessage);
      }, event.delayMs);
      this.activeDelays.add(delayTimeout);
    } else {
      this.play(reactionToPlay, event, selectedMessage);
    }
  }

  public handleTap(): void {
    this.resetIdleTimer();
    
    const totalWeight = TAP_REACTION_POOL.reduce((sum, item) => sum + item.weight, 0);
    let selectedReaction = 'bonk' as MascotReaction;
    
    // Look back at recent history to avoid repeating the exact emotion on tap
    const recentTapEmotions = this.history.slice(-3).map(h => h.emotion);

    for (let attempt = 0; attempt < 5; attempt++) {
      let randomVal = Math.random() * totalWeight;
      for (const item of TAP_REACTION_POOL) {
        if (randomVal < item.weight) {
          selectedReaction = item.emotion;
          break;
        }
        randomVal -= item.weight;
      }
      
      if (!recentTapEmotions.includes(selectedReaction)) {
        break; 
      }
    }

    this.triggerReaction({
      ...MASCOT_EVENT_MAP['mascot:tapped'],
      emotion: selectedReaction
    });
  }

  public resetIdleTimer(): void {
    this.lastActivityTime = Date.now();
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

  public getHistory(): ReactionHistoryEntry[] {
    return this.history;
  }

  // --- Internal Logic ---

  private selectReaction(primary: MascotReaction, alternatives?: MascotReaction[]): MascotReaction {
    if (!alternatives || alternatives.length === 0) {
      return primary;
    }

    const recentEmotions = this.history.slice(-3).map(h => h.emotion);

    // If primary was played recently, try an alternative
    if (recentEmotions.includes(primary)) {
      const availableAlts = alternatives.filter(alt => !recentEmotions.includes(alt));
      if (availableAlts.length > 0) {
        return availableAlts[Math.floor(Math.random() * availableAlts.length)];
      }
    }

    return primary;
  }

  private play(reaction: MascotReaction, event: MascotTriggerEvent, message?: string) {
    const now = Date.now();
    
    this.history.push({
      emotion: reaction,
      message,
      category: event.category,
      timestamp: now
    });
    
    if (this.history.length > 15) this.history.shift(); // keep history bounded to 15
    
    this.categoryLastPlayed[event.category] = now;
    
    const estimatedDuration = 3500; 
    
    this.activeReaction = {
      event,
      expiresAt: now + estimatedDuration
    };

    // Notify listeners
    this.listeners.forEach(listener => listener(reaction, message));
    
    // Reset activity
    this.lastActivityTime = Date.now();

    // 12. Chained Event handling
    if (this.pendingChain) {
      clearTimeout(this.pendingChain);
      this.pendingChain = null;
    }
    if (event.chainedEvent) {
      this.pendingChain = setTimeout(() => {
        this.triggerEvent(event.chainedEvent as EventKey);
      }, estimatedDuration + 200); // Trigger slightly after this reaction expires
    }
  }

  private startIdleChecker() {
    if (this.idleCheckInterval) clearInterval(this.idleCheckInterval);
    
    this.idleCheckInterval = setInterval(() => {
      if (this.activeReaction && Date.now() < this.activeReaction.expiresAt) return;
      
      const idleSeconds = (Date.now() - this.lastActivityTime) / 1000;
      let nextIdleReaction: MascotReaction | null = null;

      if (idleSeconds > this.config.idleIntervals.sleeping[0]) {
         nextIdleReaction = 'sleeping';
      } else if (idleSeconds > this.config.idleIntervals.yawning[0]) {
         nextIdleReaction = 'yawning';
      } else if (idleSeconds > this.config.idleIntervals.tired[0]) {
         nextIdleReaction = 'tired';
      }

      if (nextIdleReaction && nextIdleReaction !== this.idleReaction) {
         const states = ['tired', 'yawning', 'sleeping'];
         const currIdx = this.idleReaction ? states.indexOf(this.idleReaction) : -1;
         const nextIdx = states.indexOf(nextIdleReaction);
         
         if (nextIdx > currIdx) {
            this.idleReaction = nextIdleReaction;
            this.listeners.forEach(listener => listener(nextIdleReaction));
         }
      }
    }, 5000);
  }
}

export const mascotEmotionController = new MascotEmotionController();
