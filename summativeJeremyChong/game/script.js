/*
  Jeremy Chong
  01/25/2022
  Game Script
  The following code constructs the entire game as well as the JQuery for it.
*/

//Game keys
let upKey, downKey, rightKey, leftKey, enterKey; 
//Arrow keys used in game screen
//Enter key is used in start and transition screen

//Game images (all used in main game, in the preload, create and update methods)
let player; 
let skull;
let car1, car2, car3, car4;
let truck;
let water;
let snake;
let bird;

//Phaser groups (all used in main game, in the create and update methods)
let doors;
let mailboxes;
let fenceObstacles;
let homeResidents;
let car1Group;
let car2Group;
let car3Group;
let car4Group;
let truckGroup;
let platformsLeft;
let platformsRight;

//Game variables
let name = ""; //Used for jQuery board
let level = 1; //Used in game and transition scene
let score = 0; //Used in all screens except start scene
let accumScore = 0; //Used in game screen
let lives = 5; //Used in game and end screen
let gameTime = 0; //Used in game and end screen
let timeReduce = 0; //Used in game and transition
let notMoving = true; //Used in game and movement function
let randomEventOccurred = false; //Used in game (in create and update)
let snakeDx = 1; //Used in game and transition
let randomDelay = 0; //Used in game (in create and update)
let reset = false; //Used in game and end scene
let nameEntered = false; //Used in game update and btnSubmit click function

//Arrays
let clearTimes = []; //Used for jQuery board
let homeObjectLocations = [ //Used in game
  {x: 75},
  {x: 225},
  {x: 375},
  {x: 525}
];
let fenceLocations = [ //Used in game
  {x: 3},
  {x: 150},
  {x: 300},
  {x: 450},
  {x: 600}
];
let carInfo = [ //Used in game
  {x: 650, y: 750, speed: -5, delay: 1500}, //A negative value for speed means it is going to the left
  {x: -40, y: 690, speed: 5, delay: 2000},
  {x: 650, y: 630, speed: -6, delay: 7000},
  {x: -40, y: 570, speed: 3, delay: 2000},
  {x: 650, y: 510, speed: -1, delay: 6000}
];
let platformInfo = [ //Used in game
  {x: 650, y: 398, speed: -2},
  {x: 650, y: 278, speed: -2},
  {x: 650, y: 158, speed: -2},
  {x: -40, y: 338, speed: 2},
  {x: -40, y: 218, speed: 2}
];

//Text
let txtLives; //Used in game
let txtScore; //Used in game and end screen
let txtTimer; //Used in game and end screen
let txtLevel; //Used in transition
let txtTitle; //Used in start, transition and end screen
let txtHeading; //Used in start, transition and end screen
let txtPoints; //Used in game
let txtDeath; //Used in game
let txtPlayAgain; //Used in end scene

//Sounds (all used in game scene)
let step;
let fall;
let ding;

/********          ******\
      STRING FUNCTIONS
\********         *******/
function capitalizeFirstChar(string) {
  let firstLetter = string[0].toUpperCase();
  let otherLetters = string.substring(1);
  let newString = firstLetter.concat(otherLetters);
  return newString;
} //end of capitalizeFirstChar function

function shortenName(string) {
  let newString = "";
  if (string.length > 10) {
    newString = string.substring(0, 10);
  }
  else {
    newString = string;
  }
  return newString;
} //end of shortenName function

/********          ******\
      BUBBLE SORT
\********         *******/
function bubbleSort(array) {
  let temp = 0;
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - 1; j++) {
      if (array[j] > array[j + 1]) {
        temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
  }
  return array;
} //End of bubbleSort

$(document).ready(function(event){

  $("#btnSubmit").click(function(){
    name = $("#txtName").val();
    if (name == "") {
      alert("Enter a valid name!");
    }
    else {
      nameEntered = true;
      name = capitalizeFirstChar(name);
      name = shortenName(name);
      $("#lblName").text(name + "'s");
      $("#startup").css("display", "none"); //Gets rid of the screen
    }
  }); //END OF btnSubmit click function

  /* ***** START OF START SCREEN ***** */
  class startScene extends Phaser.Scene {
    constructor (config) {
      super (config);
    }
    preload() {
      
    }
    create() {
      txtTitle = this.add.text(75, 300, "The\nMailman", {fontFamily: "VT323, monospace", fontSize: 100, textAlign: "center"});
      txtHeading = this.add.text(75, 550, "Click Enter to Start Playing", {fontFamily: "VT323, monospace", fontSize: 32});

      enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      this.tweens.add({
        targets: txtHeading,
        alpha: 0,
        duration: 950,
        repeat: -1,
        yoyo: true, //Yoyo will reverse the animation once it is complete
        ease: 'Power2'
      });

      //Resetting the game variables
      if (reset) {
        lives = 5;
        timeReduce = 0;
        score = 0;
        if (level > 1) {
          for (let i = 0; i < 5; i++) {
            if (i % 2 == 0) {
              carInfo[i].speed += (level * 0.2);
            }
            else {
              carInfo[i].speed -= (level * 0.2);
            }
            if (i < 3) {
              platformInfo[i].speed += (level * 0.1);
            }
            else {
              platformInfo[i].speed -= (level * 0.1);
            }
            carInfo[i].delay += (level * 20);
          }
        }
        for (let j = 1; j <= 5; j++) {
          $("#lblTime" + j).text("0:00");
        }
        level = 1;
      }
    }
    update() {
      if (enterKey.isDown && nameEntered) { //Ensures game is not played while name is not entered
        if (reset) { //If the game was played again, "wake up" the game scene
          game.scene.run("game");
        }
        game.scene.switch("start", "game");
      }
    }
  }
  /* ***** END OF START SCREEN ***** */

  /* ***** START OF MAIN GAME ***** */
  class mainGame extends Phaser.Scene {
    constructor (config) {
      super (config);
    }
    preload() { 
      //tilesets, the resources that make up the map
      this.load.image("tileset1", "assets/tilesets/outdoors.png");
      this.load.image("tileset2", "assets/tilesets/Serene_Village_16x16.png");

      //Loading in the tilemap
      this.load.tilemapTiledJSON("map", "assets/tilemaps/tilemap.json");

      //Sprites
      this.load.spritesheet("mailman", "assets/images/mailman.gif", {frameWidth: 30, frameHeight: 32});
      this.load.spritesheet("doorHome", "assets/images/door.png", {frameWidth: 16, frameHeight: 16});
      this.load.spritesheet("mailboxHome", "assets/images/mailbox.png", {frameWidth: 120, frameHeight: 50});
      this.load.spritesheet("invisibleBlock", "assets/images/invisibleObstacle.png", {frameWidth: 20, frameHeight: 10});
      this.load.spritesheet("snakeImg", "assets/images/snake.png", {frameWidth: 15.9, frameHeight: 15});
      this.load.spritesheet("birdImg", "assets/images/bird.png", {frameWidth: 16, frameHeight: 16});

      //images
      this.load.image("skullImage", "assets/images/skull.png");
      this.load.image("person", "assets/images/person.png");
      this.load.image("car1Img", "assets/images/car1.png");
      this.load.image("car2Img", "assets/images/car2.png");
      this.load.image("car3Img", "assets/images/car3.png");
      this.load.image("car4Img", "assets/images/car4.png");
      this.load.image("truckImg", "assets/images/truck.png"); 
      this.load.image("logImg", "assets/images/log.png"); 

      //Sounds
      this.load.audio('step',['assets/effects/blip.wav']);  
      this.load.audio('fall',['assets/effects/death.wav']);
      this.load.audio('ding',['assets/effects/sendMail.wav']);   
    }
    create() { 

      //Setting up the tilemap
      const MAP = this.make.tilemap({key: "map"});

      //The images used within the map, the param is name of set in Tiled and phaser ID
      const TILE_1 = MAP.addTilesetImage("roadTerrain", "tileset1");
      const TILE_2 = MAP.addTilesetImage("natureTerrain", "tileset2");

      //Creates the layers for the map, the param are name of layer in Tiled, the tilesheet, x, y
      const GRASS_LAYER = MAP.createLayer("grass", TILE_2, 0, 0).setScale(600/320); //Each layer is scaled up to the width of the screen divided by the width of the tilemap
      const ROAD_LAYER = MAP.createLayer("road", TILE_1, 0, 0).setScale(600/320);
      const WATER_LAYER = MAP.createLayer("water", TILE_2, 0, 0).setScale(600/320);
      const FENCE_LAYER = MAP.createLayer("fence", TILE_2, 0, 0).setScale(600/320);
      const HOME_LAYER = MAP.createLayer("homes", TILE_2, 0, 0).setScale(600/320);

      //Adjusting game variables for new level
      gameTime = 150 - timeReduce;
      randomDelay = 15000 + Math.round(Math.random()*10000); //Delay from 15 to 25 seconds
      accumScore = 0; 

      //Sprites
      player = this.physics.add.sprite(300, 810, "mailman").setScale(1.6).setFrame(8).setDepth(1).setBodySize(10); //Sets the frame to be the once with the back facing the user
      //setDepth makes it so that the player renders in front of other objects.
      //setBodySize adjusts the hitbox
      if (level >= 3) {
        snake = this.physics.add.sprite(0, 450, "snakeImg").setScale(2.5);
      }
      if (level >= 4) {
        bird = this.physics.add.sprite(-40, 50, "birdImg").setScale(2.5).setDepth(3);
      }

      //images
      skull = this.physics.add.image(player.x, player.y, "skullImage").setScale(0.09).setVisible(false).setDepth(3);
      water = this.physics.add.image(300, 275, "invisibleBlock").setScale(27).setBodySize(22);
      
      //Creating groups
      doors = this.physics.add.group();
      mailboxes = this.physics.add.group();
      fenceObstacles = this.physics.add.group();
      homeResidents = this.physics.add.group();
      car1Group = this.physics.add.group({ //Creating the config within the method
        defaultKey: "car1Img", //Image name
        maxSize: 10, //Max number of images in the group
        visible: false, 
        active: false
      });
      car2Group = this.physics.add.group({
        defaultKey: "car2Img",
        maxSize: 10,
        visible: false,
        active: false
      });
      car3Group = this.physics.add.group({
        defaultKey: "car3Img",
        maxSize: 10,
        visible: false,
        active: false
      });
      car4Group = this.physics.add.group({
        defaultKey: "car4Img",
        maxSize: 10,
        visible: false,
        active: false
      });
      truckGroup = this.physics.add.group({
        defaultKey: "truckImg",
        maxSize: 10,
        visible: false,
        active: false
      });
      platformsLeft = this.physics.add.group({
        defaultKey: "logImg",
        maxSize: 20,
        visible: false,
        active: false
      });
      platformsRight = this.physics.add.group({
        defaultKey: "logImg",
        maxSize: 15,
        visible: false,
        active: false
      });

      //Animations
      this.anims.create({ //Creating the config within the method
        key: "openDoor",
        frames: this.anims.generateFrameNumbers("doorHome", {start: 0, end: 3}),
        frameRate: 8,
        repeat: 0 //No repeat
      });
      this.anims.create({
        key: "closeDoor",
        frames: this.anims.generateFrameNumbers("doorHome", {start: 3, end: 0}),
        frameRate: 8,
        repeat: 0
      });
      this.anims.create({
        key: "moveSnake",
        frames: this.anims.generateFrameNumbers("snakeImg", {start: 0, end: 3}),
        frameRate: 8,
        repeat: -1
      });
      this.anims.create({
        key: "flyBird",
        frames: this.anims.generateFrameNumbers("birdImg", {start: 0, end: 2}),
        frameRate: 8,
        repeat: -1
      });
      
      if (level >= 3) {
        snake.anims.play("moveSnake");
      }
      if (level >= 4) {
        bird.anims.play("flyBird");
      }

      //Creating the text
      txtLives = this.add.text(15, 850, "Lives: " + lives, {fontFamily: "VT323", fontSize: 40});
      txtTimer = this.add.text(430, 850, "Time: " + this.timeConverter(gameTime), {fontFamily: "VT323", fontSize: 40});
      txtScore = this.add.text(215, 850, "Score: " + score, {fontFamily: "VT323", fontSize: 40});
      txtPoints = this.add.text(300, 300, "+250", {fontFamily: "VT323", fontSize: 25, color: "yellow"}).setVisible(false);
      txtDeath = this.add.text(300, 300, "-50", {fontFamily: "VT323", fontSize: 25, color: "red"}).setVisible(false).setDepth(4);

      //Movement keys
      upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);

      //Sounds
      step = this.sound.add('step');
      fall = this.sound.add('fall');
      ding = this.sound.add('ding', {volume: 0.4});
      //Volume adjusts the volume for the sound

      //Count down for timer
      this.time.addEvent({
        delay: 2000, 
        repeat: gameTime - 1,
        callback: () => { //callback is the function to be executed after delay
          gameTime--;
          txtTimer.text = "Time: " + this.timeConverter(gameTime);
        }
      });

      //Loop for car obstacles
      this.time.addEvent({
        delay: carInfo[0].delay, 
        loop: true,
        callback: () => { //Gets the first inactive member of group or creates a new one
          car1Group.get(carInfo[0].x, carInfo[0].y).setActive(true).setVisible(true).setScale(1.5);
        }
      });
      this.time.addEvent({
        delay: carInfo[1].delay, 
        loop: true,
        callback: () => {
          car2Group.get(carInfo[1].x, carInfo[1].y).setActive(true).setVisible(true).setScale(1.5);
        }
      });
      this.time.addEvent({
        delay: carInfo[2].delay, 
        loop: true,
        callback: () => {
          car3Group.get(carInfo[2].x, carInfo[2].y).setActive(true).setVisible(true).setScale(1.5);
        }
      });
      this.time.addEvent({
        delay: carInfo[3].delay, 
        loop: true,
        callback: () => {
          car4Group.get(carInfo[3].x, carInfo[3].y).setActive(true).setVisible(true).setScale(1.5);
        }
      });
      this.time.addEvent({
        delay: carInfo[4].delay, 
        loop: true,
        callback: () => {
          truckGroup.get(carInfo[4].x, carInfo[4].y).setActive(true).setVisible(true).setScale(1.5);
        }
      });

      //Loop for floating platforms (Logs)
      this.time.addEvent({
        delay: 1200, 
        loop: true,
        callback: () => {
          let randomNum = Math.round(Math.random()*2);
          platformsLeft.get(platformInfo[randomNum].x, platformInfo[randomNum].y).setActive(true).setVisible(true).setScale(0.35);
        }
      });
      this.time.addEvent({
        delay: 1500, 
        loop: true,
        callback: () => {
          let randomNum = 3 + Math.round(Math.random()*1);
          platformsRight.get(platformInfo[randomNum].x, platformInfo[randomNum].y).setActive(true).setVisible(true).setScale(0.35);
        }
      });

      //Random timed events
      if (level >= 4) {
        this.time.addEvent({
          delay: randomDelay, 
          loop: true,
          callback: () => {randomEventOccurred = true;}
        });  
      }

      //Creating the doors
      for (let i = 0; i < 4; i++) {
        let door = this.physics.add.sprite(homeObjectLocations[i].x, 74, "doorHome").setScale(600/320); //Placing the doors in the appropriate places
        doors.add(door);
      }
      //Creating the mailboxes
      for (let i = 0; i < 4; i++) {
        let mailbox = mailboxes.create(homeObjectLocations[i].x, 100, "mailboxHome").setScale(0.7);
      }
      //Creating the residents of the home
      for (let i = 0; i < 4; i++) {
        let resident = homeResidents.create(homeObjectLocations[i].x, 74, "person").setScale(1.3).setDepth(2).setAlpha(0);//setAlpha makes the opacity 0
      }
      //Creating fence obstacles
      for (let i = 0; i < 5; i++) {
        let fenceBox = fenceObstacles.create(fenceLocations[i].x, 100, "invisibleBlock").setScale(3);
      }

      //Creating collisions
      this.physics.add.collider(player, fenceObstacles, this.death);
      //Third parameter for this method is a function to be executed when the objects collide
      this.physics.add.collider(player, car1Group, this.death);
      this.physics.add.collider(player, car2Group, this.death);
      this.physics.add.collider(player, car3Group, this.death);
      this.physics.add.collider(player, car4Group, this.death);
      this.physics.add.collider(player, truckGroup, this.death);
      this.physics.add.collider(player, snake, this.death);

    }
    update() { //Game loop where all game logic resides

      if (player.x > 600 || player.x < 0) { //If player goes off screen
        this.death();
      }
      
      //Obstacle and platform movement
      car1Group.incX(carInfo[0].speed); //incX adds to the x value to every member of group
      car2Group.incX(carInfo[1].speed);
      car3Group.incX(carInfo[2].speed);
      car4Group.incX(carInfo[3].speed);
      truckGroup.incX(carInfo[4].speed);

      platformsLeft.incX(platformInfo[0].speed);
      platformsRight.incX(platformInfo[3].speed);

      //Reusing the vehicles that have gone off screen
      car1Group.getChildren().forEach(car => { //Goes through every member of the group 
        if (car.active && car.x < -50) {
          car1Group.killAndHide(car);
        }
      });
      car2Group.getChildren().forEach(car => {
        if (car.active && car.x > 645) {
          car2Group.killAndHide(car);
        }
      });
      car3Group.getChildren().forEach(car => {
        if (car.active && car.x < -50) {
          car3Group.killAndHide(car);
        }
      });
      car4Group.getChildren().forEach(car => {
        if (car.active && car.x > 645) {
          car4Group.killAndHide(car);
        }
      });
      truckGroup.getChildren().forEach(truck => {
        if (truck.active && truck.x < -50) {
          truckGroup.killAndHide(truck);
        }
      });

      //Reusing the log platforms
      platformsLeft.getChildren().forEach(log => {
        if (log.active && log.x < -50) {
          platformsLeft.killAndHide(log);
        }
      });
      platformsRight.getChildren().forEach(log => {
        if (log.active && log.x > 645) {
          platformsRight.killAndHide(log);
        }
      });

      //Movement for the player
      if (notMoving) { 
        if (upKey.isDown) {
          this.movePlayer("up");
        }
        else if (downKey.isDown) {
          if (player.y < 810) { //Ensures player does not go over the text
            this.movePlayer("down");
          }
        }
        else if (rightKey.isDown) {
          this.movePlayer("right");           
        }
        else if (leftKey.isDown) {
          this.movePlayer("left");        
        }
      }

      //Moves player along with platform
      if (this.physics.overlap(player, platformsLeft)) {
        player.x += platformInfo[0].speed;
      }
      if (this.physics.overlap(player, platformsRight)) {
        player.x += platformInfo[3].speed;
      }
      
      //When player is not on any platforms and is on the water
      if (this.physics.overlap(player, water) && !((this.physics.overlap(player, platformsLeft)) || (this.physics.overlap(player, platformsRight)))) {
        this.death();
      }

      //When the player reaches to a home and has not hit any obstacles
      if (this.physics.overlap(player, mailboxes) && !(this.physics.overlap(player, fenceObstacles))) {
        this.claimHome();
      } 

      //Snake movement
      if (level >= 3) {
        if (snake.x < 0) {
          snakeDx *= -1;
          snake.flipX = false;
        }
        else if (snake.x > 600) {
          snakeDx *= -1;
          snake.flipX = true;
        }
        snake.x += snakeDx;
      }

      //The bird "stealing" the mail
      if (randomEventOccurred) {
        this.stealMail();
      }
      
      if (level >= 4) {
        if (bird.x > 640) {
          bird.setVelocityX(0);
        }
      }
      
      //The user will get extra lives every time they get 600 points
      if (accumScore >= 750) {
        this.extraLives();
      }

      //Sends player to next level if mail has been successfully sent to all homes
      if (this.isFinishedLevel()) {
        score += 500;
        lives++;
        this.displayClearTime(150 - timeReduce, gameTime);
        if (level > 1) {
          game.scene.run("transition"); //Wakes up a scene that is sleeping
        }
        game.scene.switch("game", "transition"); //Sleeps one scene and moves on to another
      }

      //Game over
      if (lives == 0) {
        if (reset) {
          game.scene.run("end");
        }
        game.scene.switch("game", "end");
      }
      if (gameTime == 0) {
        if (reset) {
          game.scene.run("end");
        }
        setTimeout(() => {
          game.scene.switch("game", "end");
        }, 1000);
      }
    } //end of preload

    /********                     ******\
          FUNCTIONS WITHOUT PARAMETERS
    \********                     *******/
    claimHome() {
      let currentIndex = this.findClosestHome(player.x); //Finds the index of the closest home
      let claimedDoor = doors.getChildren()[currentIndex]; // Gets the Nth home from the left 
      let currentHome = mailboxes.getChildren()[currentIndex];
      if (currentHome.name != "claimed") {
        claimedDoor.anims.play("openDoor");
        this.tweens.add({ //Fading in animation is played
          targets: homeResidents.getChildren()[currentIndex],
          alpha: 1,
          delay: 600,
          duration: 1200,
          ease: 'Power2'
        });
        currentHome.name = "claimed";
        score += 250;
        accumScore += 250;
        txtPoints.setPosition(player.x, player.y);
        txtPoints.setVisible(true);
        txtScore.text = "Score: " + score;
        player.setPosition(300, 810);
        ding.play();
        setTimeout(() => {txtPoints.setVisible(false)},1000);
      }
      else {
        this.death();
      }
    } //end of claimHome

    stealMail() {
      let randomIndex = Math.round(Math.random()*3);
      let randomHouse = mailboxes.getChildren()[randomIndex];
      let randomDoor = doors.getChildren()[randomIndex];
      bird.setPosition(-40, 50);
      bird.setVelocityX(120);
      if (randomHouse.name == "claimed") {
        randomHouse.name = "";
        this.tweens.add({ //Fading out animation is played
          targets: homeResidents.getChildren()[randomIndex],
          alpha: 0,
          delay: 600,
          duration: 1200,
          ease: 'Power2', 
          onComplete: () => {
            randomDoor.anims.play("closeDoor");
          }
        });
      }
      randomEventOccurred = false;
    } //end of stealMail

    death() {
      let deathPosX = player.x;
      let deathPosY = player.y;
      if (lives > 0) {
        if (player.x > 600) { //If the player goes off screen and skull will appear closest to their death location.
          deathPosX -= 40; 
        }
        else if (player. x < 0) {
          deathPosX += 40;
        }
        if (score >= 50) {
          score -= 50;
          accumScore -= 50;
          txtDeath.setPosition(deathPosX, deathPosY);
          txtDeath.setVisible(true);
        }
        fall.play();
        skull.setPosition(deathPosX, deathPosY);
        skull.setVisible(true);
        lives--;
        txtLives.text = "Lives: " + lives;
        txtScore.text = "Score: " + score;
        player.setPosition(300, 810); //Resets the player's position on death
        setTimeout(() => {
          txtDeath.setVisible(false);
          skull.setVisible(false);
        }, 1500); //The skull will disappear after 1.5 seconds
      }
    } //End of death function

    extraLives() {
      accumScore -= 750;
      lives++;
      txtLives.text = "Lives: " + lives;
    } //End of extraLives function

    /********                     ******\
          FUNCTIONS WITH PARAMETERS
    \********                     *******/
    movePlayer(direction) {
      if (direction == "left") {
        player.x -= 30;
        player.setFrame(16);
      }
      else if (direction == "right") {
        player.x += 30;    
        player.setFrame(24);
      }
      else if (direction == "up") {
        player.y -= 60;
        player.setFrame(8);
        score += 5;
        accumScore += 5;
      }
      else if (direction == "down") {
        player.y += 60;
        player.setFrame(0);
      }
      txtScore.text = "Score: " + score;
      step.play();
      notMoving = false;
      setTimeout(() => {notMoving = true;}, 140); 
    } //End of movePlayer function

    displayClearTime(originalTime, finishedTime) {
      let elapsedTime = originalTime - finishedTime;
      let displayTime = 0;
      clearTimes.push(elapsedTime);
      clearTimes = bubbleSort(clearTimes);
      for(let i = 0; i < clearTimes.length; i++) {
        if (i < 5) {
          displayTime = this.timeConverter(clearTimes[i]);
          $("#lblTime" + (i + 1)).text(displayTime);
        }
        else {
          break;
        }
      }
    } //End of displayClearTime function

    /********                                   ******\
          FUNCTIONS WITHOUT PARAMETERS & RETURN VALUE
    \********                                  *******/
    isFinishedLevel() {
      for(let i = 0; i < 4; i++) { //Checks if all homes have been claimed
        if (mailboxes.getChildren()[i].name != "claimed") {
          return false;
        }
      }
      return true; 
    } //End of isFinishedLevel function 

    /********                                   ******\
          FUNCTIONS WITH PARAMETERS & RETURN VALUE
    \********                                  *******/
    timeConverter(currentTime) {
      let minutes = Math.floor(currentTime/60); //Rounds the seconds down to the nearest minute
      let seconds = currentTime % 60; //Gets the remaining seconds
      let newTime = 0;
      if (seconds < 10) { //Ensures that there are two digits
        seconds = "0" + seconds;
      }
      newTime = minutes + ":" + seconds;
      return newTime;
    } //End of timeConverter function

    findClosestHome(currentX) {
      let closest = 0;
      let difference = 0;
      let lowestDifference = 1000; //A large number that can be replaced easily
      let distanceFromHomes = [];
      for (let i = 0; i < 4; i++) { //Makes an array of the distances from the player to all of the homes.
        difference = Math.abs(homeObjectLocations[i].x - currentX);
        distanceFromHomes.push(difference);
      }
      for (let j = 0; j < 4; j++) {
        if (distanceFromHomes[j] < lowestDifference) { //Checks which home is the closest to player
          lowestDifference = distanceFromHomes[j];
          closest = j;
        }
      }
      return closest;
    } //End of findClosestHome function

  }
  /* ***** END OF MAIN GAME ***** */

  /* ***** START OF TRANSITION SCREEN ***** */
  class transitionScene extends Phaser.Scene {
    constructor (config) {
      super (config);
    }
    preload() { 
  
    }
    create() { 
      //Increasing the difficulty
      level++;
      timeReduce = level * 5;
      for (let i = 0; i < 5; i++) {
        if (carInfo[i].speed < 0) { 
          carInfo[i].speed -= 0.2;
          platformInfo[i].speed -= 0.1;
        }
        else {
          carInfo[i].speed += 0.2;
          platformInfo[i].speed += 0.1;
        }
        carInfo[i].delay -= 20;
      }
      if (level > 3) {
        snakeDx += 0.3;
      }

      txtTitle = this.add.text(140, 250, "Moving on to...", {fontFamily: "VT323", fontSize: 35});
      txtLevel = this.add.text(135, 300, "Level: " + level, {fontFamily: "VT323", fontSize: 100});
      txtHeading = this.add.text(105, 500, "Click enter to continue", {fontFamily: "VT323", fontSize: 45});

      enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      this.tweens.add({
        targets: txtHeading,
        alpha: 0,
        duration: 1000,
        repeat: -1,
        yoyo: true,
        ease: 'Power2'
      });

    }
    update() {
      if (enterKey.isDown) {
        game.scene.run("game");
        game.scene.switch("transition", "game");
      }
    }

  }
  /* ***** END OF TRANSITION SCREEN ***** */

  /* ***** START OF END SCREEN ***** */
  class endScene extends Phaser.Scene {
    constructor (config) {
      super (config);
    }
    preload() {
      
    }
    create() {
      txtTitle = this.add.text(130, 300, "Game Over", {fontFamily: "VT323", fontSize: 100});
      if (lives == 0) {
        txtHeading = this.add.text(155, 500, "You ran out of lives!", {fontFamily: "VT323", fontSize: 35});
      }
      else {
        txtHeading = this.add.text(155, 500, "You ran out of time!", {fontFamily: "VT323", fontSize: 35});      
      }
      txtScore = this.add.text(165, 550, "Your score was: " + score, {fontFamily: "VT323", fontSize: 35});
      txtTimer = this.add.text(100, 600, "Your fastest time was: " + $("#lblTime1").text(), {fontFamily: "VT323", fontSize: 35});

      enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

      txtPlayAgain = this.add.text(50, 750, "Press the Enter key to play again!", {fontFamily: "VT323", fontSize: 35});

      this.tweens.add({
        targets: txtPlayAgain,
        alpha: 0,
        duration: 1000,
        repeat: -1,
        yoyo: true,
        ease: 'Power2'
      });

    }

    update() {
      if (enterKey.isDown) {
        reset = true;
        game.scene.run("start");
        game.scene.switch("end", "start");
      }
    }

  } 
  /* ***** END OF END SCREEN ***** */

  var config = {
    type: Phaser.AUTO,
    parent: "phaser-game",
    width: 600,
    height: 900,
    physics: {
      default: "arcade",
      arcade: {
        debug: false
      }
    }
  } // End of config

  var game = new Phaser.Game(config);
  game.scene.add("start", startScene); 
  game.scene.add("game", mainGame); //Add new scenes/screens here
  game.scene.add("transition", transitionScene); 
  game.scene.add("end", endScene);
  game.scene.start("start"); //Screen to start with

}); //END OF DOC READY FUNCTION