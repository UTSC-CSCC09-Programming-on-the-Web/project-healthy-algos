import { ANIMATIONS } from '../config/gameConfig';

class AnimationSystem {
  constructor() {
    this.animationQueues = new Map();
    this.currentAnimations = new Map();
  }

  queueAnimation(character, animationType, duration = 2000, onComplete = null) {
    const characterId = character.name;
    
    if (!this.animationQueues.has(characterId)) {
      this.animationQueues.set(characterId, []);
    }
    
    const animation = {
      type: animationType,
      duration,
      onComplete,
      startTime: null
    };
    
    this.animationQueues.get(characterId).push(animation);
  }

  update(characters) {
    characters.forEach(character => {
      this.updateCharacterAnimation(character);
    });
  }

  updateCharacterAnimation(character) {
    const characterId = character.name;
    const currentTime = Date.now();
    
    if (this.currentAnimations.has(characterId)) {
      const currentAnim = this.currentAnimations.get(characterId);
      
      if (currentTime - currentAnim.startTime >= currentAnim.duration) {
        // Animation finished
        if (currentAnim.onComplete) {
          currentAnim.onComplete();
        }
        
        // Return to movement-based animation (idle/walk)
        character.returnToMovementAnimation();
        this.currentAnimations.delete(characterId);
      }
    }
    
    // Start next queued animation
    if (!this.currentAnimations.has(characterId)) {
      const queue = this.animationQueues.get(characterId);
      if (queue && queue.length > 0) {
        const nextAnimation = queue.shift();
        nextAnimation.startTime = currentTime;
        character.switchToAnimation(nextAnimation.type);
        this.currentAnimations.set(characterId, nextAnimation);
      }
    }
  }

  // Check if character is currently playing an action animation
  isPlayingAction(character) {
    return this.currentAnimations.has(character.name);
  }


  // Clear all queued animations for a character
  clearAnimations(character) {
    const characterId = character.name;
    this.animationQueues.delete(characterId);
    this.currentAnimations.delete(characterId);
    character.returnToMovementAnimation();
  }

  
  // Get available action animations
  getAvailableActions() {
    return [
      ANIMATIONS.ATTACK,
      ANIMATIONS.AXE,
      ANIMATIONS.DIG,
      ANIMATIONS.HAMMERING,
      ANIMATIONS.JUMP,
      ANIMATIONS.MINING,
      ANIMATIONS.REELING,
      ANIMATIONS.WATERING
    ];
  }
}

export { AnimationSystem };
