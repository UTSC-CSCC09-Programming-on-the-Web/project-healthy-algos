import { useEffect, useRef } from 'react'
import kaplay from 'kaplay'
import '../styles/Map.css'

const MOVE_SPEED = 200
const MAP_WIDTH = 720  
const MAP_HEIGHT = 560 
const SCALE = 3      

export default function MapView() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)

  useEffect(() => {
    const k = kaplay({
      canvas: canvasRef.current,
      width: 800,
      height: 600,
      background: [135, 206, 235]
    })

    gameRef.current = k

    k.loadSprite("map_background", "/assets/Sunnyside/Maps/map.png")

    k.loadSprite("player_base", "/assets/Sunnyside/Characters/Human/IDLE/base_idle_strip9.png", {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    })

    k.loadSprite("player_hair", "/assets/Sunnyside/Characters/Human/IDLE/shorthair_idle_strip9.png", {
      sliceX: 9, 
      sliceY: 1, 
      anims: {
        idle: {
          from: 0,
          to: 8,
          speed: 8,
          loop: true
        }
      }
    })

    k.onLoad(() => {
      k.scene("main", () => {
        k.add([
          k.sprite("map_background"),
          k.pos(0, 0),
          k.scale(SCALE),
        ])

        const playerBase = k.add([
          k.sprite("player_base"),
          k.pos((MAP_WIDTH * SCALE) / 2, (MAP_HEIGHT * SCALE) / 2), 
          k.anchor("center"),
          k.scale(SCALE),
          k.area({ width: 12, height: 16, offset: k.vec2(-5, 0) }),
        ])

        const playerHair = k.add([
          k.sprite("player_hair"),
          k.pos((MAP_WIDTH * SCALE) / 2, (MAP_HEIGHT * SCALE) / 2), 
          k.anchor("center"),
          k.scale(SCALE), 
        ])

        playerBase.play("idle")
        playerHair.play("idle")

        k.onUpdate(() => {
          let moveX = 0
          let moveY = 0

          if (k.isKeyDown("left") || k.isKeyDown("a")) moveX -= 1
          if (k.isKeyDown("right") || k.isKeyDown("d")) moveX += 1
          if (k.isKeyDown("up") || k.isKeyDown("w")) moveY -= 1
          if (k.isKeyDown("down") || k.isKeyDown("s")) moveY += 1
          
          // Normalize diagonal movement to maintain consistent speed
          if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707 // 1/√2 ≈ 0.707
            moveY *= 0.707
          }
          if (moveX !== 0 || moveY !== 0) {
            playerBase.move(moveX * MOVE_SPEED, moveY * MOVE_SPEED)
            playerHair.move(moveX * MOVE_SPEED, moveY * MOVE_SPEED)
          }

          // Calculate sprite boundaries
          const collisionWidth = 12 / 2 
          const collisionHeight = 16 / 2 

          // Ensure player stays within map boundaries
          const scaledMapWidth = MAP_WIDTH * SCALE
          const scaledMapHeight = MAP_HEIGHT * SCALE
          
          if (playerBase.pos.x - collisionWidth < 0) {
            playerBase.pos.x = collisionWidth
            playerHair.pos.x = collisionWidth
          }
          if (playerBase.pos.x + collisionWidth > scaledMapWidth) {
            playerBase.pos.x = scaledMapWidth - collisionWidth
            playerHair.pos.x = scaledMapWidth - collisionWidth
          }
          if (playerBase.pos.y - collisionHeight < 0) {
            playerBase.pos.y = collisionHeight
            playerHair.pos.y = collisionHeight
          }
          if (playerBase.pos.y + collisionHeight > scaledMapHeight) {
            playerBase.pos.y = scaledMapHeight - collisionHeight
            playerHair.pos.y = scaledMapHeight - collisionHeight
          }

          k.setCamPos(playerBase.pos)
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