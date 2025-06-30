import { useEffect, useRef } from 'react'
import kaplay from 'kaplay'
import '../styles/Map.css'

const MOVE_SPEED = 200

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
        const playerBase = k.add([
          k.sprite("player_base"),
          k.pos(400, 300),
          k.anchor("center"),
          k.scale(2), 
        ])

        const playerHair = k.add([
          k.sprite("player_hair"),
          k.pos(400, 300),
          k.anchor("center"),
          k.scale(2), 
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
          if (playerBase.pos.x < 0) {
            playerBase.pos.x = 0
            playerHair.pos.x = 0
          }
          if (playerBase.pos.x > 800) {
            playerBase.pos.x = 800
            playerHair.pos.x = 800
          }
          if (playerBase.pos.y < 0) {
            playerBase.pos.y = 0
            playerHair.pos.y = 0
          }
          if (playerBase.pos.y > 600) {
            playerBase.pos.y = 600
            playerHair.pos.y = 600
          }
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