/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import StateMachine from 'javascript-state-machine';

class Hero extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'world-dino-sheet', 5);
       // this.setScale(1.5,1.5);
        scene.add.existing(this);
        scene.physics.add.existing(this);
       //  this.setOrigin(.5,1);
        
       // this.anims.play('hero-running');
        this.body.setCollideWorldBounds(true);
        this.body.setSize(27, 26);
        
       // this.body.setOffset(6, 5);
        this.body.setMaxVelocity(400, 400);
       // this.body.setDragX(750);
        this.setFlipX(true);
        //this.body.setDragY(750);
        this.w_key = scene.w_key;
        this.d_key = scene.d_key;
        this.a_key = scene.a_key;
        this.space_key = scene.space_key;
        this.input = {};
        this.setUpMovement()
       // this.setupAnimations();
    }
    setUpMovement(){
        this.moveState = new StateMachine({
            init: 'standing',
            transitions: [
              { name: 'jump', from: 'standing', to: 'jumping' },
              { name: 'flip', from: ['jumping'], to: 'flipping' },
              { name: 'fall', from: 'standing', to: 'falling' },
              { name: 'touchdown', from: ['jumping', 'flipping', 'falling'], to: 'standing'}, 
               { name: 'die', from: ['jumping', 'flipping', 'falling', 'standing'],  to: 'dead' },
            ],
            methods: {
              onEnterState: (lifecycle) => {
               // console.log(lifecycle);
              },
              onJump: () => {
                this.body.setVelocityY(-300);
              },
              onFlip: () => {
                this.body.setVelocityY(-150);
                //this.body.flip
              },
              onDie: () => {
                this.body.setVelocity(0, 0);
                this.body.setAcceleration(0);
              },
            },
          });
          

          this.movePredicates = {
            jump: () => {
              return this.input.didPressJump;
            },
            flip: () => {
              return this.input.didPressJump;
            },
            fall: () => {
              return !this.body.onFloor();
            },
            touchdown: () => {
              return this.body.onFloor();
            },
          };
    }

    kill() {
      if (this.moveState.can('die')) {
        this.moveState.die();        
        this.emit('died');
      }
    }
  
    isDead() {
      return this.moveState.is('dead');
    }

    slowDownDino(){
      this.body.setAcceleration(-100);
    }

    speedUpDino(){
      this.body.setAcceleration(-250);
    }

    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        
    this.input.didPressJump = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.w_key);

        if (!this.isDead() && this.a_key.isDown) {
           //  this.body.setVelocityX(-250);
            this.body.setAccelerationX(-250);
            this.setFlipX(false);
            this.body.offset.x = 8;
        } else if (!this.isDead() && this.d_key.isDown) {
            // this.body.setVelocityX(250);
            this.body.setAccelerationX(250);
            this.setFlipX(true);
           // this.body.offset.x = 12;
        } else {
            this.body.setVelocityX(0);
            this.body.setAccelerationX(0);
        }
      /*  if (this.moveState.is('jumping') || this.moveState.is('flipping')) {
          if (!this.w_key.isDown && this.body.velocity.y < -700) {
            this.body.setVelocityY(-700);
            }
        }*/
        
        for (const t of this.moveState.transitions()) {
            if (t in this.movePredicates && this.movePredicates[t]()) {
              this.moveState[t]();
              break;
            }
          }

     
    }

}

export default Hero;