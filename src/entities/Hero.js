/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import StateMachine from 'javascript-state-machine';

class Hero extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'world-dino-sheet', 5);
    // set scaling
    // this.setScale(1.5,1.5);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // incase we want to change starting point
    //this.setOrigin(.1,.1)  ;

    this.body.setCollideWorldBounds(true);
    /* size of the box which collides with physics engine
      setsize(length,height) 
    */
    this.body.setSize(5, 32);

    this.body.setMaxVelocity(400, 400);
    // this.body.setDragX(750);
    // actual image is facing left , make it face right
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
  setUpMovement() {
    this.moveState = new StateMachine({
      init: 'standing',
      transitions: [
        { name: 'jump', from: ['movingLeft', 'movingRight', 'standing', 'stop'], to: 'jumping' },
        { name: 'left', from: ['movingRight', 'standing', 'jumping', 'stop'], to: 'movingLeft' },
        { name: 'right', from: ['movingLeft', 'standing', 'jumping', 'stop'], to: 'movingRight' },
        { name: 'die', from: ['stop', 'jumping', 'movingRight', 'movingLeft', 'standing'], to: 'dead' },
        { name: 'stop', from: ['jumping', 'movingRight', 'movingLeft', 'standing'], to: 'stop' }
      ],
      methods: {
        onEnterState: (lifecycle) => {
          console.log(lifecycle);
        },
        // use accelaration for a harder game
        onJump: () => {
          this.body.setVelocityY(-300);
          //this.body.setAccelerationY(10);
        },
        onLeft: () => {
          this.body.setVelocityX(-250);
          //this.body.setAccelerationX(-250);
          this.setFlipX(false);
          this.body.offset.x = 8;
        },
        onRight: () => {
          this.body.setVelocityX(250);
          //this.body.setAccelerationX(250);
          this.setFlipX(true);

        },
        onDie: () => {
          this.body.setVelocity(0);
          this.body.setAcceleration(0);
        },
        onStop: () => {
          //   console.log('stand');
          this.body.setVelocity(0, 0);
          this.body.setAccelerationY(0);
        },
      },
    });


    this.movePredicates = {
      jump: () => {
        return this.input.didPressJump;
      },
      left: () => {
        return this.input.moveLeft;
      },
      right: () => {
        return this.input.moveRight;
      },
      stop: () => {
        return !(this.input.moveRight || this.input.moveLeft || this.input.didPressJump);
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

  slowDownDino() {
    this.body.setAcceleration(-100);
  }

  speedUpDino() {
    this.body.setAcceleration(-250);
  }


  preUpdate(time, delta) {
    super.preUpdate(time, delta);


    //this.input.didPressJump = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.w_key);
    this.input.didPressJump = !this.isDead() &&this.w_key.isDown;

    // this.input.moveLeft = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.a_key.isDown);
    this.input.moveLeft = !this.isDead() && this.a_key.isDown;
    //this.input.moveRight = !this.isDead() && Phaser.Input.Keyboard.JustDown(this.d_key.isDown);
    this.input.moveRight = !this.isDead() && this.d_key.isDown;

    for (const t of this.moveState.transitions()) {
      if (t in this.movePredicates && this.movePredicates[t]()) {
        this.moveState[t]();
        break;
      }
    }


  }

}

export default Hero;