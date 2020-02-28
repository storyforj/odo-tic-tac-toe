import * as Phaser from 'phaser';

import Sequencer, { Trigger } from '../helpers/Sequencer';
import { Bullet } from './Bullet';

export type BossUpdater = {
  update: () => void
};

const explosionAmount = 10000;

export default function createBoss(scene: Phaser.Scene, collisionCategory: number): BossUpdater {
  const bossPolygons = scene.cache.json.get('bossPolygons');

  let hp: number = 21500;
  let leftEngineHP: number = 1000;
  let leftEngineDestroyed: boolean = false;
  let rightEngineHP: number = 1000;
  let rightEngineDestroyed: boolean = false;

  const bossSprite: Phaser.Physics.Matter.Sprite = scene.matter.add.sprite(
    0, 0,
    'boss', undefined,
    { shape: bossPolygons.bossPolygon } as Phaser.Types.Physics.Matter.MatterBodyConfig,
  );
  // @ts-ignore
  bossSprite.label = 'boss'
  bossSprite.setCollisionCategory(collisionCategory);
  bossSprite.setScale(0.4, 0.4);

  function bodyHit(bullet: Bullet): void {
    bullet.destroy();
    hp -= 1;
    console.log('body', hp);
  }

  function leftEngineHit(bullet: Bullet): void {
    bullet.destroy();
    if (leftEngineHP === 0 && !leftEngineDestroyed) {
      leftEngineDestroyed = true;
      hp -= explosionAmount;
      console.log('left engine boom', hp);
    } else if (leftEngineHP > 0) {
      leftEngineHP -= 1;
      console.log('left', leftEngineHP);
    }
  }

  function rightEngineHit(bullet: Bullet): void {
    bullet.destroy();
    if (rightEngineHP === 0 && !rightEngineDestroyed) {
      rightEngineDestroyed = true;
      hp -= explosionAmount;
      console.log('right engine boom', hp);
    } else if (rightEngineHP > 0) {
      rightEngineHP -= 1;
      console.log('right', rightEngineHP);
    }
  }

  scene.matter.world.on('collisionstart', function (_event, bodyA, bodyB) {
    let bulletBody;
    let bossBody;

    if (bodyA.gameObject.label === 'bullet' && bodyB.gameObject.label === 'boss') {
      bulletBody = bodyA;
      bossBody = bodyB;
    }
    if (bodyA.gameObject.label === 'boss' && bodyB.gameObject.label === 'bullet') {
      bulletBody = bodyB;
      bossBody = bodyA;
    }

    if (bulletBody && bossBody) {
      switch(bossBody.label) {
        case 'leftEngine':
          leftEngineHit(bulletBody.gameObject);
          break;
        case 'rightEngine':
          rightEngineHit(bulletBody.gameObject);
          break;
        default:
          bodyHit(bulletBody.gameObject);
          break;
      }
    }
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
            bossSprite.destroy();
          },
        });
      },
      shouldRemove: (): boolean => {
        return hp <= 0;
      },
      shouldActivate: (): boolean => true,
    } as Trigger,
  ]);

  return {
    update: () => {
      sequencer.update();
    }
  };
}
