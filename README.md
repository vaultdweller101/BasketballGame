# Buzzer Beater: A Lightweight Basketball Game

Buzzer Beater is a free-roam basketball game where players can move freely around
the court and shoot a basketball at the rim. This project utilizes Three.js for
scene setup, object rendering, realistic lighting, and texture application. The movement of the
ball will be physics based using some of the kinematic equations for projectile motion. Gravity
and collision detection will be used on the ball and how it interacts with the rim/back board to
enhance realism. GLTFLoader integrates detailed models such as the backboard, hoop, and
court surroundings, and first-person controls allow for an immersive player experience. These
elements combine to create a well rounded interactive 3D basketball game displaying real life
mechanics and movements.

## Setup

```shell
npm install
```

## Run project

```shell
npx vite
```

## How to play

You use your mouse to look around and aim the ball. Press space to launch the ball.
If the ball goes through the hoop, you score points based on how far you are from the hoop, 
just like real basketball! 

You can also jump by pressing left shift, and move around by pressing AWSD keys.

## What our game looks like

![image-0](docs/Demo1.gif)