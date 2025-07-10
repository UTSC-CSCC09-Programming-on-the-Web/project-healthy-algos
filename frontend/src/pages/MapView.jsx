import { useEffect, useRef } from 'react'
import kaplay from 'kaplay'
import '../styles/Map.css'

import { GAME_CONFIG } from '../config/gameConfig'
import { AssetLoader } from '../systems/AssetLoader'
import { MovementSystem } from '../systems/MovementSystem'
import { InputSystem } from '../systems/InputSystem'
import { CollisionSystem } from '../systems/CollisionSystem'
import { CameraSystem } from '../systems/CameraSystem'

import { Player } from '../entities/Player'
import { AIAgent } from '../entities/AIAgent'

export default function MapView() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    const k = kaplay({
      canvas: canvasRef.current,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      background: GAME_CONFIG.BACKGROUND_COLOR
    })

    gameRef.current = k

    const assetLoader = new AssetLoader(k)
    const movementSystem = new MovementSystem()
    const inputSystem = new InputSystem(k)
    const collisionSystem = new CollisionSystem()
    const cameraSystem = new CameraSystem(k)

    assetLoader.loadAllAssets()

    k.onLoad(() => {
      k.scene("main", () => {
        k.add([
          k.sprite("map_background"),
          k.pos(0, 0),
          k.scale(GAME_CONFIG.MAP_SCALE),
        ])
        const player = new Player(k)
        player.createSprites()

        const aiAgents = [];
        const agentNames = ['Agent_A', 'Agent_B', 'Agent_C', 'Agent_D'];
        
        const playerStartX = player.position.x;
        const playerStartY = player.position.y;
        
        agentNames.forEach((name, index) => {
          const angle = (index / agentNames.length) * 2 * Math.PI;
          const distance = 100; 
          const startX = playerStartX + Math.cos(angle) * distance;
          const startY = playerStartY + Math.sin(angle) * distance;
          
          const agent = new AIAgent(k, name, startX, startY);
          agent.createSprites();
          aiAgents.push(agent);
        });

        // Camera follows player
        cameraSystem.setTarget(player.getMainSprite())

        k.onUpdate(() => {
          const { moveX, moveY } = inputSystem.getMovementInput()

          if (moveX !== 0 || moveY !== 0) {
            player.switchToWalk()
          } else {
            player.switchToIdle()
          }
          
          // Update camera target after animation switch
          cameraSystem.setTarget(player.getMainSprite())
          movementSystem.moveCharacter(player, moveX, moveY)
          collisionSystem.constrainToMapBounds(player)
          cameraSystem.update()

          // Update AI agents
          aiAgents.forEach(agent => {
            const decision = agent.update();
            if (decision) {
              movementSystem.moveCharacter(agent, decision.moveX, decision.moveY);
              collisionSystem.constrainToMapBounds(agent);
              
              if (decision.moveX !== 0 || decision.moveY !== 0) {
                agent.switchToWalk();
              } else {
                agent.switchToIdle();
              }
            }
          });
        })
      })
      k.go("main")
    })

    return () => {
      if (gameRef.current) {
        gameRef.current.quit()
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div className="map">
      <canvas ref={canvasRef}></canvas>
    </div>
  )
}
