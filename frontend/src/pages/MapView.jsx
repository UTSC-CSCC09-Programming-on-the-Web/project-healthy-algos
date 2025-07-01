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

        // Camera follows player
        cameraSystem.setTarget(player.getMainSprite())

        k.onUpdate(() => {
          const { moveX, moveY } = inputSystem.getMovementInput()
          movementSystem.moveSprites(player.getAllSprites(), moveX, moveY)
          collisionSystem.constrainToMapBounds(player.getAllSprites())
          cameraSystem.update()
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
