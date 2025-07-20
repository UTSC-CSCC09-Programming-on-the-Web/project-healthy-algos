import { BaseCharacter } from './BaseCharacter';
import { ANIMATIONS } from '../config/gameConfig';

class Player extends BaseCharacter {
  constructor(kaplayContext, startX = null, startY = null) {
    super(kaplayContext, "player", startX, startY);
    this.isPlayer = true;
  }

  createSprites() {
    // Define sprite configuration for player with all animation types
    const spriteConfig = {
      idle: {
        base: "player_idle_base",
        hair: "player_idle_short_hair"
      },
      walk: {
        base: "player_walk_base", 
        hair: "player_walk_short_hair"
      },
      attack: {
        base: "player_attack_base",
        hair: "player_attack_short_hair"
      },
      axe: {
        base: "player_axe_base",
        hair: "player_axe_short_hair"
      },
      dig: {
        base: "player_dig_base",
        hair: "player_dig_short_hair"
      },
      hammering: {
        base: "player_hammering_base",
        hair: "player_hammering_short_hair"
      },
      jump: {
        base: "player_jump_base",
        hair: "player_jump_short_hair"
      },
      mining: {
        base: "player_mining_base",
        hair: "player_mining_short_hair"
      },
      reeling: {
        base: "player_reeling_base",
        hair: "player_reeling_short_hair"
      },
      watering: {
        base: "player_watering_base",
        hair: "player_watering_short_hair"
      }
    };

    return super.createSprites(spriteConfig);
  }

  // Action methods for player
  performAttack(duration = 1500) {
    return this.performAction(ANIMATIONS.ATTACK, duration);
  }

  performAxe(duration = 2000) {
    return this.performAction(ANIMATIONS.AXE, duration);
  }

  performDig(duration = 2500) {
    return this.performAction(ANIMATIONS.DIG, duration);
  }

  performHammering(duration = 3000) {
    return this.performAction(ANIMATIONS.HAMMERING, duration);
  }

  performJump(duration = 1000) {
    return this.performAction(ANIMATIONS.JUMP, duration);
  }

  performMining(duration = 2000) {
    return this.performAction(ANIMATIONS.MINING, duration);
  }

  performReeling(duration = 2500) {
    return this.performAction(ANIMATIONS.REELING, duration);
  }

  performWatering(duration = 1500) {
    return this.performAction(ANIMATIONS.WATERING, duration);
  }

  performAction(animationType, duration) {
    return new Promise((resolve) => {
      this.switchToAnimation(animationType);
      setTimeout(() => {
        this.returnToMovementAnimation();
        resolve();
      }, duration);
    });
  }
}

export { Player };
