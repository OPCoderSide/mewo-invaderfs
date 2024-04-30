/*

  🚀 Hello Explorer!

  Here are official guides from the creators of p5.play and p5.js

  https://p5play.org/learn/sprite.html
  https://p5play.org/learn/index.html

  https://p5js.org/reference

  Experiment, explore, and have Fun!

  This template provides an example of tile-based map creation, camera following, spritesheets, etc.

  Created with no ☕ & 💖 by the Skyline Computer Science Club [LE|RZ]

  If you have any questions, reach out to Lance Ruiz and the other mentors on the Skyline CSC Discord.

*/

let cat, sheet_terrain, jumpSound, shipSets, powerUps, sparkle, slime, blackHole, star

let shipMaxSpeed = 13

let regBullet

let dirX = 0, dirY = 0

let playerShip

let enemyAtkrate = 10

const acceleration = 0.3
let scrollingStars = 100

let spAtkSpd = 0
let spAtkSpdSprite
let seconds = 10;
let spawntimer = 60
let diffculty = 2 // increases the number of types of enemies that can spawn 2+1 right now
let planetspace = 300

const timers = {
  spawnPlanet: new Timer(1000),
  spawnKamikaze: new Timer(1000),
}

const planetImages = []

function preload() {
  // tests
  jumpSound = loadSound('./assets/jump.mp3')
  sheet_terrain = loadImage('./assets/terrain.png')

  // ships
  shipSets = loadImage('./assets/SpaceShooterAssets/ships.png')

  //power ups
  powerUps = loadImage('./assets/SpaceShooterAssets/testpowerups.png')

  // backgrounds
  sparkle = loadImage('./assets/SpaceShooterAssets/background.png')
  slime = loadImage('./assets/grad.png')

  stars = loadImage('./assets/stars.png')
  
  // planets
  planetImages.push(loadImage('./assets/planets/blackHole.gif'))
  planetImages.push(loadImage('./assets/planets/star.gif'))
  planetImages.push(loadImage('./assets/planets/gasGiant.gif'))
  planetImages.push(loadImage('./assets/planets/earth.gif'))
}



const SCREEN_RESOLUTION = 300

const WALL_THICC = 10

const SHIP_SIZE = 6

const POWERUP_SIZE = 10

let sparkleAni1, sparkleAni2

const shipHeight = 8.12



function setup() {
  new Canvas(3 * SCREEN_RESOLUTION, 4 * SCREEN_RESOLUTION - 50, 'fullscreen')
  frameRate(60)

  // playerShip
  playerShip = new Sprite(400, 400, SHIP_SIZE, SHIP_SIZE - 1)
  playerShip.rotationLock = true
  playerShip.drag = 3
  playerShip.debug = true // hitbox 
  playerShip.layer = 255

  // playerShip skin
  playerShip.spriteSheet = shipSets
  playerShip.addAni({w: 8, h: shipHeight, row: 4, col: 1})
  playerShip.scale = 8

  // Planets
  g_planet = new Group()
  g_planet.collider = 'none'
  g_planet.diameter = 10
  g_planet.layer = 1
  g_planet.vel.y = 0.1 + shipMaxSpeed/20 // should adjust it when the die it really slows

  // Starts
  g_stars = new Group()
  g_stars.d = 10
  g_stars.collider = 'none'
  g_stars.color = 'white'
  g_stars.layer = 1
  g_stars.x = () => random(0, canvas.w)
  g_stars.y = () => random(0, canvas.h)
  
  for (let i = 0; i < 10; i++) {
    const star = new g_stars.Sprite()
    star.opacity = Math.random() + 0.5
  }

  //sparkles

  star = new Group()
  star.diameter = 10
  star.collider = 'none'
  star.x = () => random(0, canvas.w)
  star.y = () => random(0, canvas.h)

  // top
  sparkleAni1 = new Sprite((3*SCREEN_RESOLUTION)/4, (4*SCREEN_RESOLUTION-50)/2)
  sparkleAni1.rotationLock = true
  sparkleAni1.collider = 'none'
  sparkleAni1.spriteSheet = sparkle
  sparkleAni1.addAni({w: 126, h: 258, row: 1, col: 1})
  sparkleAni1.scale = 0

  sparkleAni2 = new Sprite((3*SCREEN_RESOLUTION), (4*SCREEN_RESOLUTION-50)/2)
  sparkleAni2.rotationLock = true
  sparkleAni2.collider = 'none'
  sparkleAni2.spriteSheet = sparkle
  sparkleAni2.addAni({w: 134, h: 258, row: 1, col: 1})
  sparkleAni2.scale = 0

  // bottom
  sparkleAni3 = new Sprite((3*SCREEN_RESOLUTION)/4, (4*SCREEN_RESOLUTION-50))
  sparkleAni3.rotationLock = true
  sparkleAni3.collider = 'none'
  sparkleAni3.spriteSheet = sparkle
  sparkleAni3.addAni({w: 126, h: 258, row: 1, col: 1})
  sparkleAni3.scale = 0

  sparkleAni4 = new Sprite((3*SCREEN_RESOLUTION), (4*SCREEN_RESOLUTION-50))
  sparkleAni4.rotationLock = true
  sparkleAni4.collider = 'none'
  sparkleAni4.spriteSheet = sparkle
  sparkleAni4.addAni({w: 134, h: 258, row: 1, col: 1})
  sparkleAni4.scale = 0

  // power ups
  spAtkSpdSprite = new Sprite(600, 200, POWERUP_SIZE, POWERUP_SIZE, 'n')
  spAtkSpdSprite.spriteSheet = powerUps
  spAtkSpdSprite.addAni({w: 12, h: 14, row: 6, col: 1})
  spAtkSpdSprite.scale = 2
  spAtkSpdSprite.debug = true
  playerShip.overlaps(spAtkSpdSprite, collectAtkSpd)

  // wall left
  wallLeft = new Sprite(0, canvas.h/2, WALL_THICC, canvas.h, 'static')
  wallLeft.color = 'red'
  wallLeft.opacity = .1

  // wall rights
  wallRight = new Sprite(width, canvas.h/2, WALL_THICC, canvas.h, 'static')
  wallRight.color = 'red'
  wallRight.opacity = .1

  // wall bot
  wallBot = new Sprite(canvas.w/2, canvas.h, canvas.w, WALL_THICC, 'static')
  wallBot.color = 'black'
  wallBot.opacity = 0

  g_genericBullet = new Group()
  g_genericBullet.diameter = 8

  // bullets 
  g_playerBullet = new g_genericBullet.Group()
  // g_playerBullet.diameter = 8
  g_playerBullet.color = 'yellow' // yellow> orange> red
  g_playerBullet.d = 10 
  g_playerBullet.vel.y = -10
  g_playerBullet.collider = 'none'

  // enemy bullets 
  g_enemybullet = new g_genericBullet.Group()
  g_enemybullet.diameter = 25
  g_enemybullet.color = 'green' // yellow> orange> red
  // g_enemybullet.speed = 10 
  g_enemybullet.vel.y = 10

  g_genericShip = new Group()
  g_genericShip.collider = 'none'

  // kamikaze bots
  g_shipKam = new g_genericShip.Group()
  g_shipKam.diameter = 50
  g_shipKam.speed = 4
  g_shipKam.color = 'green'

  // Shooter bot (horizontal movement)
  g_shipShooter = new g_genericShip.Group()
  g_shipShooter.diameter = 35
  g_shipShooter.color = 'purple'
  g_shipShooter.moveReq = false
  g_shipShooter.atkRate = enemyAtkrate
  g_shipShooter.shoot = false

  // // defence electron
  // electron = new Sprite(playerShip.x-100, playerShip.y-100, 10);
    // electron.vel.y = 1


}

let atkRate = 50
let boost = 1
let count = 0

// Attack speed special ability
function collectAtkSpd(playerShip, spAtkSpdSprite) {
  spAtkSpdSprite.remove()
  
  spAtkSpd = 30
  
  sleep(10000).then(function() {
    spAtkSpd = 0
  }) 

}




// our important logic variables for draw


// Spawn enemies () 
function spawnkam() {
  if (timers.spawnKamikaze.tick()){
    if(floor(random(diffculty)) == 0){
      new g_shipKam.Sprite(random((3)*SCREEN_RESOLUTION,0),random(SCREEN_RESOLUTION-50,0))
    }
    if(floor(random(diffculty)) == 1){
      new g_shipShooter.Sprite(random((3)*SCREEN_RESOLUTION,0),random((1/2)*SCREEN_RESOLUTION-50,0))
    }
  }
}

// if we have diffren areas we can put in a range
function spawnplanet(){
  if (timers.spawnPlanet.tick()) {
    const planet = new g_planet.Sprite(random(3 * SCREEN_RESOLUTION, 0), -200)
    planet.rotation = random(0, 180)
    let scaler = random(1,2) - 0.5
    planet.scale = scaler
    planet.opacity = scaler/10
    planet.image = planetImages[floor(random(planetImages.length))]
  } 
}

/*
  draw()
  
  Code that runs repeatedly, and is how the game updates and runs logic overtime.
  Manipulate / compare variables, read user input, and draw to the canvas here.
  
  ⚠️ Remember that drawing will layer things on top of each other, draw in-order!
*/

let topscreen = 300 // note use maxs
// let nextFrameDebounce = 0
// let flipped = false

function draw() {
  // try removing this line and see what happens!
  spawnplanet()
  for(const planet of g_planet){
    if(planet.y == canvas.h){
      planet.remove()
      console.log("planet removed")
    }
  }

  count = count + 0.5

  // sky blue background, a draw function
  background('black')

  // space planets shit
  //black hole
  //image(blackHole, 500, count - 900, 600, 600)

  // moew moew
  //image(stars, 24, count - 300, 300, 300)

  // slime
  tint(55, 255, 0)
  image(slime, 0, canvas.h-canvas.h/4, 0, canvas.h/4)
  noTint()



  // // electron shield
  // electron.attractTo(playerShip, 2)

  // Enemy Spawn
  spawnkam()
  for (const kship of g_shipKam){
      kship.moveTo(playerShip)

      let kshipsToRemove = []

      for (const bullet of g_playerBullet){
          if (kship.overlaps(bullet)){
            kshipsToRemove.push(kship)
            bullet.remove()
          }
          else if (kship.overlaps(playerShip)){
            kshipsToRemove.push(kship)
            // HP DMG TO playerShip
          }
      }

      for (const kship of kshipsToRemove) {
        kship.remove()
      }
  }
  // we can proably make this in one for loop
  for (const ship of g_shipShooter){

    // Bot Movement
    if (ship.moveReq == false) {
      ship.moveReq = true
      ship.moveTo(random(0, 3*SCREEN_RESOLUTION), ship.y, 2).then(() => {
        ship.moveReq = false
      })
    }

    ship.atkRate -= 1  // use the timer function here 
    if(ship.atkRate == 0){
      ship.atkRate = enemyAtkrate + 30
      const eprojectile = new g_enemybullet.Sprite()
      eprojectile.x = ship.x - 4
      eprojectile.y = ship.y + 30
    }

    // collect ships that are due to be removed from the game
    // we cannot do this immediately as we need to keep the ships in the group array
    let shipsToRemove = []

    for (const bullet of g_playerBullet){
        if (ship.overlaps(bullet)){
          shipsToRemove.push(ship)
          bullet.remove()
        }
        else if (ship.collides(playerShip)){
          shipsToRemove.push(ship)
          // HP DMG TO ship
        }
    }

    for (let ship of shipsToRemove) {
      ship.remove()
    }
  }


  // power ups w
  // if (wallBot.collides(bullet[i])) {
  //   bullet[i].remove()
  // }

  // shooting bullets
  
  atkRate -= 1

  if (atkRate == 0) {
    atkRate = 41 - spAtkSpd

    // middle left
    const projectile = new g_playerBullet.Sprite()
    projectile.x = playerShip.x - 4*Math.sqrt(2)
    projectile.y = playerShip.y - 30

    // middle right
    const projectile2 = new g_playerBullet.Sprite()
    projectile2.x = playerShip.x + 4*Math.sqrt(2)
    projectile2.y = playerShip.y - 30

    // far not yet right
    const projectile3 = new g_playerBullet.Sprite()
    projectile3.color = 'orange'
    projectile3.x = playerShip.x + 12*Math.sqrt(2)
    projectile3.y = playerShip.y - 26
    projectile3.vel.x = .15

    // far not yet left
    const projectile4 = new g_playerBullet.Sprite()
    projectile4.color = 'orange'
    projectile4.x = playerShip.x - 12*Math.sqrt(2)
    projectile4.y = playerShip.y - 26
    projectile4.vel.x = -.15

    // far far right
    const projectile5 = new g_playerBullet.Sprite()
    projectile5.color = 'red'
    projectile5.x = playerShip.x + 22*Math.sqrt(2)
    projectile5.y = playerShip.y - 12
    projectile5.vel.x = .35

    // far far right
    const projectile6 = new g_playerBullet.Sprite()
    projectile6.color = 'red'
    projectile6.x = playerShip.x - 22*Math.sqrt(2)
    projectile6.y = playerShip.y - 12
    projectile6.vel.x = -.35

  }

  // sparkle animation

  // nextFrameDebounce -= 1
  scrollingStars = 350


  sparkleAni1.vel.y = scrollingStars
  sparkleAni2.vel.y = scrollingStars

  sparkleAni3.vel.y = scrollingStars
  sparkleAni4.vel.y = scrollingStars

  if (sparkleAni1.y > 8*SCREEN_RESOLUTION-50) {
    sparkleAni1.addAni({w: 126, h: 258, row: 1, col: 2})
    sparkleAni2.addAni({w: 134, h: 258, row: 1, col: 2})
    sparkleAni3.addAni({w: 126, h: 258, row: 1, col: 2})
    sparkleAni4.addAni({w: 134, h: 258, row: 1, col: 2})

    sparkleAni1.y = 0
    sparkleAni2.y = 0

  } else if (sparkleAni3.y > 8*SCREEN_RESOLUTION-50) {
    sparkleAni1.addAni({w: 126, h: 258, row: 1, col: 1})
    sparkleAni2.addAni({w: 134, h: 258, row: 1, col: 1})
    sparkleAni3.addAni({w: 126, h: 258, row: 1, col: 1})
    sparkleAni4.addAni({w: 134, h: 258, row: 1, col: 1})

    sparkleAni3.y = 0
    sparkleAni4.y = 0
          
  }


  // if (nextFrameDebounce < 0) {

  //   if (flipped) {
  //     sparkleAni1.addAni({w: 126, h: 258, row: 1, col: 2})
  //     sparkleAni2.addAni({w: 134, h: 258, row: 1, col: 2})
  //     sparkleAni3.addAni({w: 126, h: 258, row: 1, col: 2})
  //     sparkleAni4.addAni({w: 134, h: 258, row: 1, col: 2})

  //   } else {
  //     sparkleAni1.addAni({w: 126, h: 258, row: 1, col: 1})
  //     sparkleAni2.addAni({w: 134, h: 258, row: 1, col: 1})
  //     sparkleAni3.addAni({w: 126, h: 258, row: 1, col: 1})
  //     sparkleAni4.addAni({w: 134, h: 258, row: 1, col: 1})
  
  //   }
  //   flipped = !flipped
  //   nextFrameDebounce = 30
    
  // }


  // bullet no walls
  for (const bullet of g_genericBullet) {
    if (wallBot.overlaps(bullet) || wallLeft.overlaps(bullet) || wallRight.overlaps(bullet) || bullet.y < -20) {
      bullet.remove()
    }
  }

  // playerShip movement gap
  if (playerShip.y < 0) {
    playerShip.y = 10
  }
  if (wallBot.collides(playerShip)) {
    playerShip.vel.y = -10
  }

  playerShip.vel.x += dirX * acceleration * boost
  playerShip.vel.y += dirY * acceleration * boost

  if (playerShip.vel.x > shipMaxSpeed) {playerShip.vel.x = shipMaxSpeed}
  if (playerShip.vel.y > shipMaxSpeed) {playerShip.vel.y = shipMaxSpeed}
  if (playerShip.vel.x < -shipMaxSpeed) {playerShip.vel.x = -shipMaxSpeed}
  if (playerShip.vel.y < -shipMaxSpeed) {playerShip.vel.y = -shipMaxSpeed}

  dirX = 0
  dirY = 0

  if (kb.pressing('w')) { // moving up
    dirY = -1
  }

  if (kb.pressing('a')) { // moving left
    dirX = -1 

    // playerShip hit box changes
    playerShip.spriteSheet = shipSets
    playerShip.addAni({w: 8, h: shipHeight, row: 4, col: 0})
    playerShip.w = SHIP_SIZE*playerShip.scale - 12
  } else if (kb.released('a')) { 
    playerShip.addAni({w: 8, h: shipHeight, row: 4, col: 1})
    playerShip.w = SHIP_SIZE*playerShip.scale
  }

  if (kb.pressing('s')) { // moving down
    dirY = 1 
  }

  if (kb.pressing('d')) { // moving right
    dirX = 1 

    // playerShip hit box changes
    playerShip.spriteSheet = shipSets
    playerShip.addAni({w: 8, h: shipHeight, row: 4, col: 2})
    playerShip.w = SHIP_SIZE*playerShip.scale - 12
  } else if (kb.released('d')) { 
    playerShip.addAni({w: 8, h: shipHeight, row: 4, col: 1})
    playerShip.w = SHIP_SIZE*playerShip.scale
  }
  
  if (kb.pressing('shift')) { // boost
    shipMaxSpeed = 15
    boost = 2
  } else {
    shipMaxSpeed = 13
    boost = 1
  }
  // playerShip.vel.y = playerShip.vel.y/1.001
  // playerShip.vel.x = playerShip.vel.x/1.001

  // if (playerShip.vel.y < .1 || playerShip.vel.x < .1){
  //   playerShip.vel.y = 0
  //   playerShip.vel.x = 0
  // }
}


// function keyPressed() {
//   console.log('Pressed', key, keyCode)
// }