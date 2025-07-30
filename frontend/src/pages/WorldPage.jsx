import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import kaplay from 'kaplay';

import '../styles/Map.css';
import { GAME_CONFIG } from '../config/gameConfig';
import { AssetLoader } from '../systems/AssetLoader';
import { MovementSystem } from '../systems/MovementSystem';
import { InputSystem } from '../systems/InputSystem';
import { CollisionSystem } from '../systems/CollisionSystem';
import { MapMask } from '../systems/MapMask';
import { CameraSystem } from '../systems/CameraSystem';
import { HelpOverlay } from '../systems/HelpOverlay';
import { Player } from '../entities/Player';
import { AIAgent } from '../entities/AIAgent';
import { aiService } from '../services/aiService';
import { chatService } from '../services/chatService';
import ChatWindow from '../components/ChatWindow';
import { createTree, createHouse, createPlant, createRock } from '../systems/ObjectGenerator';
import { generateWorldObjects } from '../systems/WorldGenerator';

export default function WorldPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const chatOpenRef = useRef(false);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChatAgent, setCurrentChatAgent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    fetch(`${API_BASE}/api/world`, {
      credentials: 'include',
    })
      .then((res) => {
        /*
        if (res.status === 402) {
          navigate('/subscribe');
        } else if (res.status === 401) {
          navigate('/login');
        } else {
          return res.json();
        }*/
       return res.json();
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

    const initGame = async () => {
      // Initialize both AI and chat services
      try {
        await Promise.all([
          aiService.initialize(),
          chatService.initialize()
        ]);
        console.log('Both AI and Chat services initialized');
      } catch (error) {
        console.error('Failed to initialize services:', error);
      }

      const k = kaplay({
        canvas: canvasRef.current,
        width: GAME_CONFIG.CANVAS_WIDTH,
        height: GAME_CONFIG.CANVAS_HEIGHT,
        background: GAME_CONFIG.BACKGROUND_COLOR,
      });

    gameRef.current = k;

    // Make canvas focusable and focused
    if (canvasRef.current) {
      canvasRef.current.tabIndex = 0;
      canvasRef.current.style.outline = 'none'; // Remove focus outline
      canvasRef.current.focus();
    }

      const assetLoader = new AssetLoader(k);
      const movementSystem = new MovementSystem();
      const inputSystem = new InputSystem(k);
      const collisionSystem = new CollisionSystem();
      const cameraSystem = new CameraSystem(k);
      const mapMask = new MapMask(GAME_CONFIG.ASSETS.MAP_MASK, GAME_CONFIG.MAP_SCALE);
      await mapMask.load();
      const helpOverlay = new HelpOverlay(k);

      assetLoader.loadAllAssets();

      k.onLoad(() => {
        k.scene('main', () => {

          const { trees, rocks, houses, plants } = generateWorldObjects(k, mapMask);

          k.add([
            k.sprite('map_background'),
            k.pos(0, 0),
            k.scale(GAME_CONFIG.MAP_SCALE),
          ]);

          const player = new Player(k);
          player.createSprites();

          cameraSystem.setTarget(player.getMainSprite());

          const aiAgents = [];
          const agentNames = ['Agent_A', 'Agent_B', 'Agent_C', 'Agent_D'];

          const playerStartX = 1000;
          const playerStartY = 1000;
          player.setPosition(playerStartX, playerStartY);

          agentNames.forEach((name, index) => {
            const angle = (index / agentNames.length) * 2 * Math.PI;
            const distance = 120
            const startX = playerStartX + Math.cos(angle) * distance;
            const startY = playerStartY + Math.sin(angle) * distance;

            const agent = new AIAgent(k, name, startX, startY);
            agent.createSprites();
            aiAgents.push(agent);
          });

        // Handle clicks on AI agents for chat
        k.onClick(() => {
          const screenMousePos = k.mousePos();
          const worldMousePos = k.toWorld(screenMousePos);
          const playerPos = player.getPosition();
          
          // Check if clicked on any AI agent
          aiAgents.forEach((agent, index) => {
            const agentPos = agent.getPosition();
            const clickDistance = Math.sqrt(
              Math.pow(worldMousePos.x - agentPos.x, 2) + 
              Math.pow(worldMousePos.y - agentPos.y, 2)
            );
            
            // If clicked close to agent (can chat from any distance)
            if (clickDistance <= 30) {
              startChatWithAgent(agent);
            }
          });
        });

        k.onMousePress(() => {
          if (canvasRef.current && !chatOpenRef.current) {
            canvasRef.current.focus();
          }
        });

        k.onUpdate(() => {
          // Use ref to get current chat state
          const { moveX, moveY } = chatOpenRef.current ? { moveX: 0, moveY: 0 } : inputSystem.getMovementInput();

          if (!chatOpenRef.current) {
            const actionKey = inputSystem.getActionKeyPressed();
            
            // Help overlay
            if (actionKey && actionKey.action === "HELP") {
              helpOverlay.toggle();
            }
            
            if (actionKey && actionKey.action !== "HELP" && !helpOverlay.isHelpVisible()) {
              const actionMethod = `perform${actionKey.action.charAt(0).toUpperCase() + actionKey.action.slice(1).toLowerCase()}`;
              if (typeof player[actionMethod] === 'function') {
                player[actionMethod]();
              }
            }
          }

            cameraSystem.setTarget(player.getMainSprite());
            movementSystem.moveCharacter(player, moveX, moveY, mapMask);
            cameraSystem.update();

            const playerPosition = player.getPosition();
            const mapBounds = {
              width: GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.MAP_SCALE,
              height: GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.MAP_SCALE
            };

            aiAgents.forEach(agent => {
              const decision = agent.update(playerPosition, mapBounds);
              if (decision) {
                movementSystem.moveCharacter(agent, decision.moveX, decision.moveY, mapMask);
              }
            });

            const collidables = [...trees, ...rocks, ...houses];
            collisionSystem.resolveCharacterObjectCollision(player, collidables);
            aiAgents.forEach(agent => {
              collisionSystem.resolveCharacterObjectCollision(agent, collidables);
            });

            [...collidables].forEach(e => e.z = e.pos.y);
          });
        });

        k.go('main');
      });
    };

    initGame();

    return () => {
      aiService.disconnect();
      chatService.disconnect();

      if (gameRef.current) {
        gameRef.current.quit();
        gameRef.current = null;
      }
    };
  }, [loading]);


  const startChatWithAgent = (agent) => {
    setCurrentChatAgent(agent);
    setChatMessages([]);
    setChatOpen(true);
    chatOpenRef.current = true; 
    agent.startChat();
    
    // Start chat session with backend
    const success = chatService.startChatSession(
      agent.name, 
      agent.name, 
      (message) => {
        setChatMessages(prev => [...prev, message]);
        setIsTyping(false);
      }
    );
    
    if (!success) {
      console.error('Failed to start chat session');
      endChat();
    }
  };

  const handleSendMessage = (message) => {
    if (!currentChatAgent) return;
    
    // Add user message immediately
    const userMessage = {
      sender: 'player',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Send to backend
    chatService.sendMessage(currentChatAgent.name, message);
  };

  const endChat = () => {
    if (currentChatAgent) {
      currentChatAgent.endChat();
      chatService.endChatSession(currentChatAgent.name);
    }
    
    setChatOpen(false);
    chatOpenRef.current = false; 
    setCurrentChatAgent(null);
    setChatMessages([]);
    setIsTyping(false);
    
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.focus();
        const keyEvent = new KeyboardEvent('keyup', {
          bubbles: true,
          cancelable: true
        });
        canvasRef.current.dispatchEvent(keyEvent);
      }
    }, 50);
  };

  return loading ? <p>Loading...</p> : (
    <div className="map">
      <canvas ref={canvasRef}></canvas>
      <div className="help-indicator">
        Press H for Help
      </div>
      
      <ChatWindow
        isOpen={chatOpen}
        agentName={currentChatAgent?.name || ''}
        onClose={endChat}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isTyping={isTyping}
        canvasRef={canvasRef}
      />
    </div>
  );
}
