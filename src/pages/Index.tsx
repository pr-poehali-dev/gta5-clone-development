import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Game3D from '@/components/Game3D';

interface GameState {
  health: number;
  armor: number;
  money: number;
  wanted: number;
  position: { x: number; y: number; z?: number };
  mission: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  active: boolean;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
    health: 100,
    armor: 50,
    money: 5420,
    wanted: 0,
    position: { x: 0, y: 2, z: 0 },
    mission: 'Свободное передвижение',
  });

  const [time, setTime] = useState(new Date());
  const [showMissionDialog, setShowMissionDialog] = useState(false);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  const missions: Mission[] = [
    {
      id: '1',
      title: 'Первое знакомство',
      description: 'Познакомься с городом. Дойди до центрального банка.',
      reward: 500,
      active: false,
    },
    {
      id: '2',
      title: 'Быстрая доставка',
      description: 'Доставь пакет в автосалон за 2 минуты.',
      reward: 1000,
      active: false,
    },
    {
      id: '3',
      title: 'Городской патруль',
      description: 'Посети все ключевые точки города.',
      reward: 2000,
      active: false,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        setShowMissionDialog(!showMissionDialog);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showMissionDialog]);

  const handleGameStateChange = (state: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...state }));
  };

  const startMission = (mission: Mission) => {
    setCurrentMission(mission);
    setGameState((prev) => ({
      ...prev,
      mission: mission.title,
    }));
    setShowMissionDialog(false);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <Game3D onGameStateChange={handleGameStateChange} />

      <div className="absolute top-6 left-6 space-y-3 z-10">
        <Card className="bg-black/90 border-primary/30 p-4 backdrop-blur-md">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Icon name="Heart" className="text-red-500" size={20} />
              <div className="flex-1">
                <Progress value={gameState.health} className="h-2" />
              </div>
              <span className="text-sm font-bold text-red-500 neon-glow">
                {gameState.health}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Icon name="Shield" className="text-blue-400" size={20} />
              <div className="flex-1">
                <Progress value={gameState.armor} className="h-2" />
              </div>
              <span className="text-sm font-bold text-blue-400 neon-glow">
                {gameState.armor}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-black/90 border-primary/30 p-4 backdrop-blur-md">
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
                    className={i < gameState.wanted ? 'text-orange-500' : 'text-muted'}
                    size={16}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <Card className="bg-black/90 border-primary/30 p-3 backdrop-blur-md">
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

      <div className="absolute top-1/2 right-6 -translate-y-1/2 z-10">
        <Card className="bg-black/90 border-primary/30 p-3 backdrop-blur-md">
          <div className="w-32 h-32 relative border-2 border-primary/30 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-muted/20">
              <div
                className="absolute w-2 h-2 bg-primary rounded-full shadow-lg"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px 2px rgba(14, 165, 233, 0.8)',
                }}
              />
              <div className="absolute inset-0 border border-primary/20">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-primary/20" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-primary/20" />
              </div>
            </div>
          </div>
          <div className="text-[10px] text-center mt-2 text-muted-foreground">
            X: {gameState.position.x} Z: {gameState.position.z || 0}
          </div>
        </Card>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <Card className="bg-black/90 border-primary/30 p-4 backdrop-blur-md min-w-[400px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="Target" className="text-primary" size={24} />
              <div>
                <div className="text-xs text-muted-foreground">Текущая миссия</div>
                <div className="text-sm font-bold text-primary neon-glow">
                  {gameState.mission}
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/50 hover:bg-primary/20"
              onClick={() => setShowMissionDialog(!showMissionDialog)}
            >
              <Icon name="List" size={16} className="mr-2" />
              Миссии (M)
            </Button>
          </div>
        </Card>
      </div>

      {showMissionDialog && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
          <Card className="bg-black/95 border-primary/30 p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-primary neon-glow">Доступные миссии</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMissionDialog(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>

            <div className="space-y-4">
              {missions.map((mission) => (
                <Card
                  key={mission.id}
                  className="bg-muted/10 border-primary/20 p-4 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => startMission(mission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="MapPin" className="text-secondary" size={20} />
                        <h3 className="text-lg font-bold text-foreground">{mission.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {mission.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Icon name="DollarSign" size={14} className="mr-1" />
                          {mission.reward}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/80">
                      Начать
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>
      )}

      <div className="absolute bottom-6 left-6 z-10">
        <Card className="bg-black/90 border-primary/30 p-4 backdrop-blur-md">
          <div className="text-xs space-y-1 text-muted-foreground">
            <div className="text-primary font-bold mb-2 neon-glow">Управление</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">WASD</Badge>
              <span>Движение</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">SPACE</Badge>
              <span>Прыжок</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">Q/E</Badge>
              <span>Поворот камеры</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">SCROLL</Badge>
              <span>Зум камеры</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] border-primary/50">M</Badge>
              <span>Меню миссий</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
        <Card className="bg-black/90 border-primary/30 p-3 backdrop-blur-md hover:bg-primary/20 transition-all cursor-pointer">
          <Icon name="Crosshair" className="text-secondary" size={24} />
        </Card>
        <Card className="bg-black/90 border-primary/30 p-3 backdrop-blur-md hover:bg-primary/20 transition-all cursor-pointer">
          <Icon name="Car" className="text-primary" size={24} />
        </Card>
        <Card className="bg-black/90 border-primary/30 p-3 backdrop-blur-md hover:bg-primary/20 transition-all cursor-pointer">
          <Icon name="Settings" className="text-accent" size={24} />
        </Card>
      </div>
    </div>
  );
};

export default Index;
