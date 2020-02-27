import Sequencer, { Trigger } from '../helpers/Sequencer';

const textLines = [
  'WARNING!',
  'WARNING!',
  'HOSTILES DETECTED',
  'HOSTILES INCOMING',
];
const linePauseLength = 1000;
const endPauseLength = 3000;
const defaultWriteDelay = 50;

export class IntroScene extends Phaser.Scene {
  private sequencer!: Sequencer;
  private rect!: Phaser.GameObjects.Rectangle;
  private textBox!: Phaser.GameObjects.Graphics;
  private text!: Phaser.GameObjects.Text;
  private currentTextLine: number = 0;
  private currentTextChar: number = 0;
  private timeSinceLastWrite: number = 0;
  private currentWriteDelay: number = defaultWriteDelay;
  private isFinished: boolean = false;
  private triggers: Trigger[] = [
    {
      init: () => {
        this.rect = new Phaser.GameObjects.Rectangle(this, 0, 0, this.sys.canvas.width, this.sys.canvas.height, 0xff0000);
        this.rect.setOrigin(0, 0);
        this.add.existing(this.rect);
        this.tweens.add({
          targets: this.rect,
          fillAlpha: { start: 0.2, from: 0.2, to: 0.5 },
          ease: 'Cubic',
          duration: 1000,
          yoyo: true,
          repeat: -1,
        });
      },
      remove: () => {
        this.tweens.add({
          targets: this.rect,
          fillAlpha: 0,
          ease: 'Cubic',
          duration: 1000,
          yoyo: false,
          repeat: 0,
          onComplete: () => {
            this.rect.destroy();
          },
        });
      },
      shouldRemove: (): boolean => {
        return this.shouldRemoveOverlay();
      },
      shouldActivate: (): boolean => true,
    } as Trigger,
    {
      init: () => {
        const textBoxSizeHeight = 30;
        const textBoxSizeWidth = 180;
        this.textBox = this.add.graphics();
        this.textBox.lineStyle(4, 0xffffff, 1);
        //  32px radius on the corners
        this.textBox.strokeRoundedRect(
          this.sys.canvas.width / 2,
          (this.sys.canvas.height / 2) - textBoxSizeHeight / 2,
          textBoxSizeWidth,
          textBoxSizeHeight,
          8,
        );
        this.text = this.add.text(
          this.sys.canvas.width / 2 + 10,
          (this.sys.canvas.height / 2) - textBoxSizeHeight / 2 + 5,
          '',
          {
            fontFamily: 'robotomono',
            fontSize: 16,
          },
        );
      },
      remove: () => {
        this.tweens.add({
          targets: this.textBox,
          alpha: 0,
          ease: 'Cubic',
          duration: 1000,
          yoyo: false,
          repeat: 0,
          onComplete: () => {
            this.textBox.destroy();
          },
        });
        this.tweens.add({
          targets: this.text,
          alpha: 0,
          ease: 'Cubic',
          duration: 1000,
          yoyo: false,
          repeat: 0,
          onComplete: () => {
            this.text.destroy();
          },
        });
      },
      execute: (): void => {
        const hasMoreLines = textLines.length > this.currentTextLine + 1;
        const hasMoreCharsInLine = textLines[this.currentTextLine].length > this.currentTextChar;
        if (this.isFinished || Date.now() - this.timeSinceLastWrite < this.currentWriteDelay) { return; }

        this.currentWriteDelay = defaultWriteDelay;
        this.timeSinceLastWrite = Date.now();

        if (hasMoreCharsInLine) {
          this.text.setText(textLines[this.currentTextLine].substr(0, this.currentTextChar + 1));
          this.currentTextChar += 1;
          if (textLines[this.currentTextLine].length <= this.currentTextChar) {
            this.currentWriteDelay = linePauseLength;
            if (!hasMoreLines) {
              this.currentWriteDelay = endPauseLength;
              this.isFinished = true;
            }
          }
        } else if (hasMoreLines && !hasMoreCharsInLine) {
          this.currentTextChar = 0;
          this.currentTextLine += 1;

          this.text.setText(textLines[this.currentTextLine].substr(0, this.currentTextChar + 1));
        }
      },
      shouldRemove: (): boolean => {
        return this.shouldRemoveOverlay();
      },
      shouldActivate: (): boolean => true,
    } as Trigger,
  ];

  constructor() {
    super({
      key: 'IntroScene',
      active: true,
    });
  }

  preload() {
    this.load.pack('preload', 'assets/pack.json', 'preload');
  }

  create(): void {
    this.sequencer = new Sequencer(this.triggers);
  }

  update(): void {
    this.sequencer.update();
  }

  shouldRemoveOverlay(): boolean {
    const delayFinished = Date.now() - this.timeSinceLastWrite > this.currentWriteDelay;
    if (this.isFinished && delayFinished) {
      return true;
    }

    return false;
  }
}
