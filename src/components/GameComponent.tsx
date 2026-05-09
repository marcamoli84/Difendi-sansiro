import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GameComponent: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 720,
      height: 1280,
      parent: gameContainerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    let bullets: Phaser.Physics.Arcade.Group;
    let enemies: Phaser.Physics.Arcade.Group;
    let score = 0;
    let scoreText: Phaser.GameObjects.Text;
    let castleHP = 100;
    let hpText: Phaser.GameObjects.Text;
    let isGameOver = false;

    function preload(this: Phaser.Scene) {
      this.load.image(
        'bg',
        'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1280&h=1920'
      );

      this.load.image(
        'stadium',
        'https://labs.phaser.io/assets/sprites/space-baddie.png'
      );

      this.load.image(
        'enemy',
        'https://labs.phaser.io/assets/sprites/ufo.png'
      );

      this.load.image(
        'bullet',
        'https://labs.phaser.io/assets/sprites/bullets/bullet7.png'
      );

      this.load.image('flare', 'https://labs.phaser.io/assets/particles/red.png');
      this.load.image('blue-flare', 'https://labs.phaser.io/assets/particles/blue.png');
    }

    let emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    let blueEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    function create(this: Phaser.Scene) {
      // BACKGROUND
      const bg = this.add.image(360, 640, 'bg')
        .setDisplaySize(720, 1280)
        .setAlpha(0.6);
      
      this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.4);

      // Particles
      emitter = this.add.particles(0, 0, 'flare', {
        speed: { min: -100, max: 100 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 400,
        emitting: false
      });

      blueEmitter = this.add.particles(0, 0, 'blue-flare', {
        speed: { min: -100, max: 100 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 400,
        emitting: false
      });

      // UI
      this.add.text(360, 60, 'DIFENDI SAN SIRO', {
        fontSize: '48px',
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8
      }).setOrigin(0.5);

      scoreText = this.add.text(360, 130, 'SCORE: 0', {
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      hpText = this.add.text(360, 180, 'SAN SIRO HP: 100', {
        fontSize: '32px',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // STADIO (PLAYER POS AT BOTTOM)
      const player = this.physics.add.sprite(360, 1150, 'stadium');
      player.setScale(3);
      player.setTint(0xff0000);
      player.setImmovable(true);

      bullets = this.physics.add.group();
      enemies = this.physics.add.group();

      // START OVERLAY
      const startOverlay = this.add.rectangle(360, 640, 720, 1280, 0x000000, 0.8).setDepth(100);
      const startText = this.add.text(360, 640, 'INIZIA DIFESA', {
        fontSize: '64px',
        color: '#ffffff',
        backgroundColor: '#ff0000',
        padding: { x: 40, y: 20 },
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });

      const subText = this.add.text(360, 750, 'Tocca per abbattere gli intrusi', {
        fontSize: '24px',
        color: '#aaaaaa'
      }).setOrigin(0.5).setDepth(101);

      this.physics.pause();

      startText.on('pointerdown', () => {
        startOverlay.destroy();
        startText.destroy();
        subText.destroy();
        this.physics.resume();
        
        // SPAWN ENEMIES FROM TOP
        this.time.addEvent({
          delay: 1200,
          callback: () => spawnEnemy(this),
          callbackScope: this,
          loop: true,
        });
      });

      // SHOOT
      this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!startOverlay.active) shoot(this, pointer);
      }, this);

      // COLLISION
      this.physics.add.overlap(bullets, enemies, (b, e) => {
        hitEnemy(this, b as Phaser.GameObjects.GameObject, e as Phaser.GameObjects.GameObject);
      }, undefined, this);
      
      this.physics.add.overlap(player, enemies, (p, e) => {
        enemyReachedGoal(e as Phaser.GameObjects.GameObject, this);
      }, undefined, this);
    }

    function update(this: Phaser.Scene) {
      if (isGameOver) return;

      enemies.getChildren().forEach((enemy: any) => {
        if (enemy.y > 1280) {
          enemyReachedGoal(enemy, this);
        }
      });
    }

    function shoot(scene: Phaser.Scene, pointer: Phaser.Input.Pointer) {
      if (isGameOver) return;

      const bullet = bullets.create(360, 1100, 'bullet');
      bullet.setScale(3); // Ancora più grande visivamente
      bullet.setTint(0xffff00);
      
      // Aumentiamo la hitbox del proiettile per facilitare la mira su mobile
      const body = bullet.body as Phaser.Physics.Arcade.Body;
      body.setCircle(15); // Hitbox circolare generosa
      
      scene.physics.moveTo(bullet, pointer.x, pointer.y, 1700); // Più veloce
      
      scene.time.delayedCall(1500, () => {
        if (bullet.active) bullet.destroy();
      });
    }

    function spawnEnemy(scene: Phaser.Scene) {
      if (isGameOver) return;

      const x = Phaser.Math.Between(50, 670);
      const enemy = enemies.create(x, -50, 'enemy');
      enemy.setScale(2.2);
      
      // STILE NERAZZURRO
      if (Math.random() > 0.5) {
        enemy.setTint(0x0000ff); // Blu
      } else {
        enemy.setTint(0x111111); // Nero più profondo
      }
      
      const difficultyMultiplier = 1 + (score / 10000); // Difficoltà quasi piatta all'inizio
      const speed = Phaser.Math.Between(120, 280) * difficultyMultiplier; 
      enemy.setVelocityY(speed);
    }

    function hitEnemy(scene: Phaser.Scene, bullet: Phaser.GameObjects.GameObject, enemy: Phaser.GameObjects.GameObject) {
      const x = (enemy as any).x;
      const y = (enemy as any).y;
      
      bullet.destroy();
      enemy.destroy();

      score += 20; // Più punti!
      scoreText.setText('SCORE: ' + score);
      
      blueEmitter.emitParticleAt(x, y, 20);
      scene.cameras.main.shake(150, 0.01); // Feedback più forte
    }

    function enemyReachedGoal(enemy: Phaser.GameObjects.GameObject, scene: Phaser.Scene) {
      enemy.destroy();
      castleHP -= 5; // Molto meno danno (San Siro resiste di più)

      hpText.setText('SAN SIRO HP: ' + castleHP);
      scene.cameras.main.flash(200, 255, 0, 0);

      if (castleHP <= 0) {
        gameOver(scene);
      }
    }

    function gameOver(scene: Phaser.Scene) {
      isGameOver = true;
      scene.physics.pause();
      
      const screenCenterX = 360;
      const screenCenterY = 640;

      scene.add.rectangle(360, 640, 720, 1280, 0x000000, 0.8);

      scene.add.text(screenCenterX, screenCenterY - 100, 'CAMPIONATO\nFINITO', {
        fontSize: '72px',
        color: '#ff0000',
        fontStyle: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      scene.add.text(screenCenterX, screenCenterY + 100, `SCORE: ${score}`, {
        fontSize: '56px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      const restartBtn = scene.add.text(screenCenterX, screenCenterY + 250, 'GIOCA ANCORA', {
        fontSize: '42px',
        color: '#ffff00',
        backgroundColor: '#333333',
        padding: { x: 30, y: 15 }
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => window.location.reload());
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div 
      id="game-container" 
      ref={gameContainerRef} 
      className="w-full h-full max-w-[540px] aspect-[9/16] flex items-center justify-center bg-black overflow-hidden shadow-2xl border-4 border-red-600 rounded-3xl"
    />
  );
};

export default GameComponent;
