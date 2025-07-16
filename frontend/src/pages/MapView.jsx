import { useEffect, useRef, useState } from 'react'
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
import { aiService } from '../services/aiService'
import { chatService } from '../services/chatService'
import ChatWindow from '../components/ChatWindow'

export default function MapView() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const aiAgentsRef = useRef([])
  const [chatOpen, setChatOpen] = useState(false)
  const [currentChatAgent, setCurrentChatAgent] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    // Initialize both AI and chat services
    Promise.all([
      aiService.initialize(),
      chatService.initialize()
    ]).then(() => {
      console.log('Both AI and Chat services initialized');
    }).catch(error => {
      console.error('Failed to initialize services:', error);
    });

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

    // Initialize AI Service
    const initializeAI = async () => {
      try {
        await aiService.initialize();
        console.log('AI Service initialized successfully');
      } catch (error) {
        console.warn('AI Service initialization failed, using fallback behavior:', error);
      }
    };

    initializeAI();

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

        // Store reference for cleanup
        aiAgentsRef.current = aiAgents;

        // Camera follows player
        cameraSystem.setTarget(player.getMainSprite())

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
            
            // If clicked close to agent and player is nearby
            if (clickDistance <= 100 && agent.isClickableForChat(playerPos)) {
              startChatWithAgent(agent);
            }
          });
        });

        k.onUpdate(() => {
          // Don't move if chat is open
          const { moveX, moveY } = chatOpen ? { moveX: 0, moveY: 0 } : inputSystem.getMovementInput()
          cameraSystem.setTarget(player.getMainSprite())
          // MovementSystem handles both movement and animations
          movementSystem.moveCharacter(player, moveX, moveY)
          collisionSystem.constrainToMapBounds(player)
          cameraSystem.update()

          // Current state for AI
          const playerPosition = player.getPosition();
          const mapBounds = {
            width: GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.MAP_SCALE,
            height: GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.MAP_SCALE
          };

          aiAgents.forEach(agent => {
            const decision = agent.update(playerPosition, mapBounds);
            if (decision) {
              movementSystem.moveCharacter(agent, decision.moveX, decision.moveY);
              collisionSystem.constrainToMapBounds(agent);
            }
          });
        })
      })
      k.go("main")
    })

    return () => {
      // Cleanup AI agents
      aiAgentsRef.current.forEach(agent => {
        if (agent.destroy) {
          agent.destroy();
        }
      });
      
      // Cleanup services
      aiService.disconnect();
      chatService.disconnect();
      
      if (gameRef.current) {
        gameRef.current.quit()
        gameRef.current = null
      }
    }
  }, [])

  const startChatWithAgent = (agent) => {
    setCurrentChatAgent(agent);
    setChatMessages([]);
    setChatOpen(true);
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
    const userMessage = {
      sender: 'player',
      content: message,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    chatService.sendMessage(currentChatAgent.name, message);
  };

  const endChat = () => {
    if (currentChatAgent) {
      currentChatAgent.endChat();
      chatService.endChatSession(currentChatAgent.name);
    }
    
    setChatOpen(false);
    setCurrentChatAgent(null);
    setChatMessages([]);
    setIsTyping(false);
  };

  return (
    <div className="map">
      <canvas ref={canvasRef}></canvas>
      
      <ChatWindow
        isOpen={chatOpen}
        agentName={currentChatAgent?.name || ''}
        onClose={endChat}
        onSendMessage={handleSendMessage}
        messages={chatMessages}
        isTyping={isTyping}
      />
    </div>
  )
}
