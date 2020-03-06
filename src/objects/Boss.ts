import * as Phaser from 'phaser';

import Sequencer, { Trigger } from '../helpers/Sequencer';
import { Bullet } from './Bullet';

export type BossUpdater = {
  hp: {
    boss: number,
    leftEngineHP: number,
    rightEngineHP: number,
  },
  update: () => void
};

const explosionAmount = 10000;

export default function createBoss(scene: Phaser.Scene): BossUpdater {
  const bodies = scene.cache.json.get('bodies');

  const hp = {
    boss: 21500,
    leftEngineHP: 1000,
    rightEngineHP: 1000,
  };

  let leftEngineDestroyed: boolean = false;
  let rightEngineDestroyed: boolean = false;

  const bossSprite: Phaser.Physics.Matter.Sprite = scene.matter.add.sprite(
    0, 0,
    'sceneatlas', 'boss.png',
    {
      shape: bodies.boss,
      render: { sprite: { xOffset: -0.019, yOffset: -0.03 } }, // not sure why things are misaligned
    } as Phaser.Types.Physics.Matter.MatterBodyConfig,
  );

  function bodyHit(bullet: Bullet): void {
    bullet.createBulletExplosion();
    bullet.destroy();
    hp.boss -= 1;
  }

  function leftEngineHit(bullet: Bullet): void {
    if (hp.leftEngineHP === 0 && !leftEngineDestroyed) {
      leftEngineDestroyed = true;
      hp.boss -= explosionAmount;
      bullet.destroy();
    } else if (hp.leftEngineHP > 0) {
      hp.leftEngineHP -= 1;
      bullet.createBulletExplosion();
      bullet.destroy();
    }
  }

  function rightEngineHit(bullet: Bullet): void {
    if (hp.rightEngineHP === 0 && !rightEngineDestroyed) {
      rightEngineDestroyed = true;
      hp.boss -= explosionAmount;
      bullet.destroy();
    } else if (hp.rightEngineHP > 0) {
      hp.rightEngineHP -= 1;
      bullet.createBulletExplosion();
      bullet.destroy();
    }
  }

  function handleCollision(_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
    let bulletBody;
    let bossBody;

    if (bodyA.parent.label === 'playerBullet' && bodyB.parent.label === 'boss') {
      bulletBody = bodyA;
      bossBody = bodyB;
    }
    if (bodyA.parent.label === 'boss' && bodyB.parent.label === 'playerBullet') {
      bulletBody = bodyB;
      bossBody = bodyA;
    }

    if (bulletBody && bossBody) {
      switch(bossBody.label) {
        case 'bossLeftEngine':
          leftEngineHit(bulletBody.gameObject);
          break;
        case 'bossRightEngine':
          rightEngineHit(bulletBody.gameObject);
          break;
        default:
          bodyHit(bulletBody.gameObject);
          break;
      }
    }
  }

  scene.matter.world.on('collisionstart', function (event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    event.pairs.forEach((pair) => {
      handleCollision(event, pair.bodyA, pair.bodyB);
    });
  });

  const sequencer: Sequencer = new Sequencer([
    {
      init: () => {
        scene.tweens.add({
          targets: bossSprite,
          y: 140,
          delay: 3000,
          ease: 'Power0',
          duration: 8000,
          repeat: 0,
          onComplete: () => {
            scene.tweens.add({
              targets: bossSprite,
              y: { from: 140, to: 120 },
              ease: 'Power0',
              duration: 6000,
              yoyo: true,
              repeat: -1,
            });
          },
        });
        scene.tweens.add({
          targets: bossSprite,
          x: { from: scene.sys.canvas.width / 2 + 20, to: scene.sys.canvas.width / 2 - 20 },
          ease: 'Power0',
          duration: 5000,
          yoyo: true,
          repeat: -1,
        });
      },
      remove: () => {
        scene.tweens.add({
          targets: bossSprite,
          x: { from: scene.sys.canvas.width / 2 - 10, to: scene.sys.canvas.width / 2 + 10 },
          ease: 'Power0',
          duration: 150,
          yoyo: true,
          repeat: 10,
          onComplete: () => {
            const shipExplosion = scene.add.sprite(bossSprite.x, bossSprite.y, 'sceneatlas', 'bossShipExplosion/Explo__000.png');
            shipExplosion.setScale(1.2, 1.2);
            shipExplosion.setAlpha(1.0);
            shipExplosion.anims.play('shipExplosion');
            shipExplosion.on('animationcomplete', () => {
              shipExplosion.destroy();
            });

            bossSprite.setActive(false);
          },
        });
      },
      shouldRemove: (): boolean => {
        return hp.boss <= 0;
      },
      shouldActivate: (): boolean => true,
    } as Trigger,
  ]);

  return {
    hp,
    update: () => {
      sequencer.update();
    }
  };
}
