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
import { AIAgent } from '../entities/AIAgent';
import { aiService } from '../services/aiService';
import { chatService } from '../services/chatService';
import ChatWindow from '../components/ChatWindow';

export default function WorldPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChatAgent, setCurrentChatAgent] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

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

    // Initialize both AI and chat services
    Promise.all([
      aiService.initialize(),
      chatService.initialize()
    ]).then(() => {
      console.log('🎮 Both AI and Chat services initialized');
    }).catch(error => {
      console.error('❌ Failed to initialize services:', error);
    });

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

        const aiAgents = [];
        const agentNames = ['Agent_A', 'Agent_B', 'Agent_C', 'Agent_D'];
        
        const playerStartX = player.position.x;
        const playerStartY = player.position.y;
        
        agentNames.forEach((name, index) => {
          const angle = (index / agentNames.length) * 2 * Math.PI;
          const distance = 120 + Math.random() * 100;
          const startX = playerStartX + Math.cos(angle) * distance;
          const startY = playerStartY + Math.sin(angle) * distance;
          
          const agent = new AIAgent(k, name, startX, startY);
          agent.createSprites();
          aiAgents.push(agent);
        });

        // Handle clicks on AI agents for chat
        k.onClick(() => {
          const mousePos = k.mousePos();
          const playerPos = player.getPosition();
          
          // Check if clicked on any AI agent
          aiAgents.forEach(agent => {
            const agentPos = agent.getPosition();
            const clickDistance = Math.sqrt(
              Math.pow(mousePos.x - agentPos.x, 2) + 
              Math.pow(mousePos.y - agentPos.y, 2)
            );
            
            // If clicked close to agent and player is nearby
            if (clickDistance <= 30 && agent.isClickableForChat(playerPos)) {
              startChatWithAgent(agent);
            }
          });
        });

        k.onUpdate(() => {
          const { moveX, moveY } = inputSystem.getMovementInput();

          cameraSystem.setTarget(player.getMainSprite());
          movementSystem.moveCharacter(player, moveX, moveY);
          collisionSystem.constrainToMapBounds(player);
          cameraSystem.update();

          // Get current game state for AI
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
        });
      });

      k.go('main');
    });

    return () => {
      // Cleanup services
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
    
    // Tell the agent it's in chat mode
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
    setCurrentChatAgent(null);
    setChatMessages([]);
    setIsTyping(false);
  };

  return loading ? <p>Loading...</p> : (
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
  );
}
