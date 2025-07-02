// WorldPage.jsx (Merged with MapView)
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kaplay from 'kaplay';

import '../styles/Map.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { AssetLoader } from '../systems/AssetLoader';
import { MovementSystem } from '../systems/MovementSystem';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { CameraSystem } from '../systems/CameraSystem';
import { Player } from '../entities/Player';

export default function WorldPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/world', {
      credentials: 'include',
    })
      .then((res) => {
        if (res.status === 402) {
          navigate('/subscribe');
        } else if (res.status === 401) {
          navigate('/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) {
          setContent(data.message);
          setLoading(false);
        }
      });
  }, [navigate]);

  useEffect(() => {
    if (loading) return;

    const k = kaplay({
      canvas: canvasRef.current,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      background: GAME_CONFIG.BACKGROUND_COLOR,
    });

    gameRef.current = k;

    const assetLoader = new AssetLoader(k);
    const movementSystem = new MovementSystem();
    const inputSystem = new InputSystem(k);
    const collisionSystem = new CollisionSystem();
    const cameraSystem = new CameraSystem(k);

    assetLoader.loadAllAssets();

    k.onLoad(() => {
      k.scene('main', () => {
        k.add([
          k.sprite('map_background'),
          k.pos(0, 0),
          k.scale(GAME_CONFIG.MAP_SCALE),
        ]);
        const player = new Player(k);
        player.createSprites();

        cameraSystem.setTarget(player.getMainSprite());

        k.onUpdate(() => {
          const { moveX, moveY } = inputSystem.getMovementInput();

          if (moveX !== 0 || moveY !== 0) {
            player.switchToWalk();
          } else {
            player.switchToIdle();
          }

          cameraSystem.setTarget(player.getMainSprite());
          movementSystem.moveCharacter(player, moveX, moveY);
          collisionSystem.constrainToMapBounds(player);
          cameraSystem.update();
        });
      });

      k.go('main');
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.quit();
        gameRef.current = null;
      }
    };
  }, [loading]);

  return loading ? <p>Loading...</p> : <div className="map"><canvas ref={canvasRef}></canvas></div>;
}
