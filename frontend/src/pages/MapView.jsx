import { useState, useEffect } from 'react'
import Agent from '../components/Agent'
import '../styles/Map.css'

export default function MapView() {
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 5 })

  // Handle key movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      setPlayerPos((prev) => {
        const pos = { ...prev }
        switch (e.key) {
          case 'ArrowUp':
            pos.y -= 0.5
            break
          case 'ArrowDown':
            pos.y += 0.5
            break
          case 'ArrowLeft':
            pos.x -= 0.5
            break
          case 'ArrowRight':
            pos.x += 0.5
            break
        }
        return pos
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="map">
      <Agent name="Player" x={playerPos.x} y={playerPos.y} isPlayer={true} />
    </div>
  )
}