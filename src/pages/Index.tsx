import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface GameState {
  health: number;
  armor: number;
  money: number;
  wanted: number;
  position: { x: number; y: number };
  mission: string;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    armor: 50,
    money: 5420,
    wanted: 0,
    position: { x: 50, y: 50 },
    mission: 'Свободное передвижение',
  });

  const [time, setTime] = useState(new Date());
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      setIsMoving(true);
      setGameState(prev => {
        const speed = 2;
        let newX = prev.position.x;
        let newY = prev.position.y;

        switch(e.key) {
          case 'w':
          case 'W':
          case 'ArrowUp':
            newY = Math.max(0, prev.position.y - speed);
            break;
          case 's':
          case 'S':
          case 'ArrowDown':
            newY = Math.min(100, prev.position.y + speed);
            break;
          case 'a':
          case 'A':
          case 'ArrowLeft':
            newX = Math.max(0, prev.position.x - speed);
            break;
          case 'd':
          case 'D':
          case 'ArrowRight':
            newX = Math.min(100, prev.position.x + speed);
            break;
        }

        return { ...prev, position: { x: newX, y: newY } };
      });

      setTimeout(() => setIsMoving(false), 100);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const locations = [
    { name: 'Центральный Банк', x: 25, y: 30, icon: 'Building2' },
    { name: 'Полицейский участок', x: 70, y: 25, icon: 'Shield' },
    { name: 'Больница', x: 45, y: 60, icon: 'Heart' },
    { name: 'Оружейный магазин', x: 80, y: 70, icon: 'Zap' },
    { name: 'Автосалон', x: 15, y: 75, icon: 'Car' },
    { name: 'Район миссий', x: 60, y: 85, icon: 'Target' },
  ];

  return (
    <div className="w-screen h-screen game-gradient relative overflow-hidden">
      <div className="scan-line absolute inset-0 pointer-events-none" />

      <div className="absolute top-6 left-6 space-y-3 z-10">
        <Card className="bg-black/80 border-primary/30 p-4 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Icon name="Heart" className="text-destructive" size={20} />
              <div className="flex-1">
                <Progress value={gameState.health} className="h-2" />
              </div>
              <span className="text-sm font-bold text-destructive neon-glow">
                {gameState.health}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Icon name="Shield" className="text-accent" size={20} />
              <div className="flex-1">
                <Progress value={gameState.armor} className="h-2" />
              </div>
              <span className="text-sm font-bold text-accent neon-glow">
                {gameState.armor}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-black/80 border-primary/30 p-4 backdrop-blur-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Icon name="DollarSign" className="text-green-400" size={20} />
              <span className="text-lg font-bold text-green-400 neon-glow">
                ${gameState.money.toLocaleString()}
              </span>
            </div>

            {gameState.wanted > 0 && (
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Icon
                    key={i}
                    name="Star"
                    className={i < gameState.wanted ? 'text-secondary' : 'text-muted'}
                    size={16}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <Card className="bg-black/80 border-primary/30 p-3 backdrop-blur-sm">
          <div className="text-right">
            <div className="text-primary font-bold text-sm neon-glow">
              {time.toLocaleTimeString('ru-RU')}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {time.toLocaleDateString('ru-RU')}
            </div>
          </div>
        </Card>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-4xl aspect-square mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border-2 border-primary/20 overflow-hidden">
            <div 
              className="absolute w-4 h-4 bg-primary rounded-full shadow-lg transition-all duration-100"
              style={{
                left: `${gameState.position.x}%`,
                top: `${gameState.position.y}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: isMoving 
                  ? '0 0 20px 5px rgba(14, 165, 233, 0.8)' 
                  : '0 0 10px 2px rgba(14, 165, 233, 0.5)'
              }}
            />

            {locations.map((loc, i) => (
              <div
                key={i}
                className="absolute group cursor-pointer"
                style={{
                  left: `${loc.x}%`,
                  top: `${loc.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-secondary/30 border-2 border-secondary rounded-full flex items-center justify-center group-hover:bg-secondary/50 transition-all group-hover:scale-110">
                    <Icon name={loc.icon as any} className="text-secondary" size={16} />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <Badge className="bg-black/90 text-xs border-secondary">
                      {loc.name}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <Card className="absolute -bottom-20 left-0 right-0 bg-black/80 border-primary/30 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="MapPin" className="text-primary" size={20} />
                <div>
                  <div className="text-xs text-muted-foreground">Текущая миссия</div>
                  <div className="text-sm font-bold text-primary neon-glow">
                    {gameState.mission}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Icon name="Navigation" size={14} />
                  <span>X: {Math.round(gameState.position.x)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Icon name="Navigation" size={14} />
                  <span>Y: {Math.round(gameState.position.y)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-10">
        <Card className="bg-black/80 border-primary/30 p-4 backdrop-blur-sm">
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">WASD</Badge>
              <span>Движение</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">SPACE</Badge>
              <span>Взаимодействие</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">E</Badge>
              <span>Действие</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
        <Card className="bg-black/80 border-primary/30 p-3 backdrop-blur-sm">
          <Icon name="Crosshair" className="text-secondary" size={24} />
        </Card>
        <Card className="bg-black/80 border-primary/30 p-3 backdrop-blur-sm">
          <Icon name="Radio" className="text-primary" size={24} />
        </Card>
        <Card className="bg-black/80 border-primary/30 p-3 backdrop-blur-sm">
          <Icon name="Menu" className="text-accent" size={24} />
        </Card>
      </div>
    </div>
  );
};

export default Index;
