import * as Phaser from 'phaser';

import Sequencer, { Trigger } from '../helpers/Sequencer';
import { Bullet } from './Bullet';
import { Vector } from 'matter';

export type BossUpdater = {
  update: () => void
};

const explosionAmount = 10000;

export default function createBoss(scene: Phaser.Scene, collisionCategory: number): BossUpdater {
  const bodies = scene.cache.json.get('bodies');

  let hp: number = 21500;
  let leftEngineHP: number = 1000;
  let leftEngineDestroyed: boolean = false;
  let rightEngineHP: number = 1000;
  let rightEngineDestroyed: boolean = false;

  const bossSprite: Phaser.Physics.Matter.Sprite = scene.matter.add.sprite(
    0, 0,
    'sceneatlas', 'boss.png',
    {
      shape: bodies.boss,
      render: { sprite: { xOffset: -0.019, yOffset: -0.03 } }, // not sure why things are misaligned
    } as Phaser.Types.Physics.Matter.MatterBodyConfig,
  );
  bossSprite.setCollisionCategory(collisionCategory);

  const bulletExplosionFrameNames = scene.anims.generateFrameNames('sceneatlas', {
    start: 0, end: 5, zeroPad: 4,
    prefix: 'playerBulletExplosion/explo_', suffix: '.png'
  });
  scene.anims.create({
    key: 'bulletExplosion',
    frames: bulletExplosionFrameNames,
    frameRate: 60,
    repeat: 0,
    hideOnComplete: true,
  });

  function createBulletExplosion(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    // @ts-ignore
    const collision: Vector = event.pairs[0].activeContacts[0].vertex ?? null;
    const bulletExplosion = scene.add.sprite(collision.x, collision.y, 'sceneatlas', 'playerBulletExplosion/explo_0000.png');
    bulletExplosion.setScale(0.5, 0.5);
    bulletExplosion.anims.play('bulletExplosion');
    bulletExplosion.on('animationcomplete', () => {
      bulletExplosion.destroy();
    });
  }

  function bodyHit(event: Phaser.Physics.Matter.Events.CollisionStartEvent, bullet: Bullet): void {
    bullet.destroy();
    hp -= 1;
    createBulletExplosion(event);
  }

  function leftEngineHit(event: Phaser.Physics.Matter.Events.CollisionStartEvent, bullet: Bullet): void {
    bullet.destroy();
    if (leftEngineHP === 0 && !leftEngineDestroyed) {
      leftEngineDestroyed = true;
      hp -= explosionAmount;
    } else if (leftEngineHP > 0) {
      leftEngineHP -= 1;
      createBulletExplosion(event);
    }
  }

  function rightEngineHit(event: Phaser.Physics.Matter.Events.CollisionStartEvent, bullet: Bullet): void {
    bullet.destroy();
    if (rightEngineHP === 0 && !rightEngineDestroyed) {
      rightEngineDestroyed = true;
      hp -= explosionAmount;
    } else if (rightEngineHP > 0) {
      rightEngineHP -= 1;
      createBulletExplosion(event);
    }
  }

  scene.matter.world.on('collisionstart', function (event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
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
          leftEngineHit(event, bulletBody.gameObject);
          break;
        case 'bossRightEngine':
          rightEngineHit(event, bulletBody.gameObject);
          break;
        default:
          bodyHit(event, bulletBody.gameObject);
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
