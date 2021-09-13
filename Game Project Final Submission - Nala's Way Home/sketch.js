/*
---Game Project Final Submission - Nala's Way Home---
My game is inspired by our dog Nala that my partner and I rescued from North Macedonia just before starting this degree. 

I have added a starting splash screen that only appears while the play is in the starting position and has full lives and a score of 0.
This includes a description of the game as well as controls. This allowed me to learn how to load different fonts and images into 
a p5.js sketch.

To prevent players from wandering off to the left of the game I included a feature called "end of the world". 
If the player goes too far left they are dragged into a canyon and lose a life. There is also a warning sign telling them to turn back.
I felt this was more interesting than an invisible wall they couldn't get past.

I've added game over and game completion banners that slide onto the screen from the top.

As well as the sound for jumping I've added sounds for when she eats a bone, when one of the robot cats get Nala, and when the 
player is out of lives. I've also added background music to set the ambience of being in the wild, as well as a song when the player 
wins. This was one thing I struggled with as the argument needed to be in the right place otherwise the draw loop would play it every 
frame and stack the sound until it broke the game.

I've also added an extra enemy type to make the game a little more difficult.

I hope you enjoy playing Nala's Way Home and manage to get her home safely.

*/

// ---------------------
// Global Variables
// ---------------------

//-Basics-//
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

//-Movement-//
var isLeft;
var isRight;
var isFalling;
var isPlummeting;

//-Scenery and Drawn Items-//
var clouds;
var mountains1_x;
var mountains2_x;
var trees;
var canyons;
var collectables;
var sign;
var dogHouse;
var platforms;
var enemies;

//-Game Engine-//
var game_score;
var lives;
var lifeCounter;
var banner;
var largeHead;


//-Media-//
var jumpSound;
var signFont;
var gameFont;
var controlFont;
var biteSound;
var whineSound;
var splashScreen;
var catSound;
var backgroundSound;
var completionSound;

// ---------------------
// Preload
// ---------------------

function preload()
{
    //sounds
    soundFormats('mp3','wav');
    
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(1.0);

    biteSound = loadSound('assets/bite.wav');
    biteSound.setVolume(0.9);

    whineSound = loadSound('assets/NalaWhine.mp3');
    whineSound.setVolume(0.9);

    catSound = loadSound('assets/RobotCat.wav');
    catSound.setVolume(1.0);

    backgroundSound = loadSound('assets/background.wav');
    backgroundSound.setVolume(0.3);

    completionSound = loadSound('assets/dog remix.mp3');
    completionSound.setVolume(0.3);

    //fonts
    gameFont = loadFont('assets/PatrickHand-Regular.ttf');

    signFont = loadFont('assets/RockSalt-Regular.ttf');

    controlFont = loadFont('assets/Urbanist-Light.ttf')
    
    //images
    splashScreen = loadImage('assets/StartingSplashScreen.png');

}

// ---------------------
// Built In Functions - Setup and Draw
// ---------------------
function setup()
{
    createCanvas(1024, 576);
	floorPos_y = height * 3/4;
    lives = 3;

    //call Start Game function
    startGame();

    //looping Background Music
    touchStarted();
    backgroundSound.loop();
}

function draw()
{
    //-Scenery-//
    //draw blue sky
	background(100, 155, 255); 
    
    //draw ground
	noStroke();
	fill(0,180,0);
	rect(0, floorPos_y, width, height/4);
    
    push();
    translate(scrollPos,0);

	//draw clouds.
    drawClouds();

	//draw mountains.
    drawMountains();
    
	//draw trees.
    drawTrees();

	//draw canyons.
    for(var i = 0; i < canyons.length; i++)
    {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);
    }

    //draw platforms
    for(var i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }

	//draw collectable items.
    for(var i = 0; i < collectables.length; i++)
    {
        if(!collectables[i].isFound)
        {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }
    }
    
    //draw end of the world sign
    drawSign();

    //draw enemies
    for(var i = 0; i < enemies.length; i++)
    {
        enemies[i].draw();
        var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

        if(isContact)
        {
            if(lives > -1)
            {
                catSound.play();
                startGame();
                lives -= 1;
                break;
            }
        }
    }

    //draw finish point
    drawDogHouse();

    //draw starting splash screen
    drawSplashScreen(width/2, height/2 - 190);

    //Check if player is out of lives
    checkPlayerDie();
    
    pop();

    //life counter
    drawLifeCounter();

    //initiate game over screen
    if(lives < 0)
    {
        drawDeathBanner();
        return;
    }
    
    //initiate game complete screen
    if(dogHouse.isReached)
    {
        drawCompletionBanner();
        return;
    }

	//draw game character.
	drawGameChar();
    
    //draw score counter
    fill(255);
    noStroke();
    textSize(20);
    textFont(gameFont);
    textAlign(LEFT);
    text("Score: " + game_score, 20, 20);

	//logic to make the game character move and the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5;
		}
	}

	//logic to make the game character rise and fall.
    if(gameChar_y < floorPos_y + 20)
        {
            var isContact = false;
            for(var i = 0; i < platforms.length; i++)
            {
                if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
                {
                    isContact = true;
                    isFalling = false;
                    break;
                }
            }

            if(isContact == false)
            {
                gameChar_y += 2;
                isFalling = true;
            }
        }
    else
        {
            isFalling = false;
        }
    
    //check if player has completed the game.
    if(dogHouse.isReached == false)
    {
        checkdogHouse();
    }

    //check if the player has reached the end of the world
    if(gameChar_world_x <= -400)
    {
        gameChar_x -= 3;
        scrollPos += 2;
        sign.change = true;
    }
    
	//update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

//-Keys Pressed-//
function keyPressed(){

    if(keyCode == 37)
        {
            isLeft = true;
        }
    if(keyCode == 39)
        {
            isRight = true;
        }
    if(keyCode == 32)
        {
            if(!isFalling && !isPlummeting && gameChar_y <= floorPos_y + 20)
            {
                gameChar_y -= 100;
                jumpSound.play();
            }

            if(lives < 0)
            {
                startGame();
                lives = 3;
                whineSound.stop();
            }
        }
}

//-Keys Released-//
function keyReleased()
{

    if(keyCode == 37)
        {
            isLeft = false;
        }
    if(keyCode == 39)
        {
            isRight = false;
        }
    if(keyCode == 32)
        {
            isFalling = false;
        }

}

// ---------------------
// Start Game Function
// ---------------------
function startGame()
{
    //-Game Mechanics-//
    //character starting position
    gameChar_x = width/2;
	gameChar_y = floorPos_y + 10;

	//variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	//boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
    
    //-Initialise arrays of scenery objects-//
    //clouds
    clouds = [
        {x_pos: -750, y_pos: 70, speed: 0.2},
        {x_pos: -420, y_pos: 100, speed: 0.1},
        {x_pos: -120, y_pos: 70, speed: 0.1},
        {x_pos: 120, y_pos: 80, speed: 0.2},
        {x_pos: 600, y_pos: 130, speed: 0.1},
        {x_pos: 800, y_pos: 80, speed: 0.2},
        {x_pos: 1250, y_pos: 100, speed: 0.1},
        {x_pos: 1650, y_pos: 70, speed: 0.2},
        {x_pos: 1850, y_pos: 120, speed: 0.15},
        {x_pos: 2150, y_pos: 110, speed: 0.1},
        {x_pos: 2580, y_pos: 90, speed: 0.2},
        {x_pos: 2800, y_pos: 100, speed: 0.1},
    ];
    
    //mountains
    mountains1_x = [630, 0, 1200, 2670, 2450];
    mountains2_x = [740, 110, 1000, 1410, 2790];
    
    //trees
    trees = [
        {x_pos: 200, y_pos: floorPos_y + 1},
        {x_pos: 0, y_pos: floorPos_y + 1},
        {x_pos: 100, y_pos: floorPos_y + 8},
        {x_pos: 400, y_pos: floorPos_y + 5},
        {x_pos:1000, y_pos: floorPos_y + 5},
        {x_pos:1590, y_pos: floorPos_y},
        {x_pos:1640, y_pos: floorPos_y + 5},
        {x_pos:1430, y_pos: floorPos_y + 8},
        {x_pos:1890, y_pos: floorPos_y + 3},
        {x_pos:1700, y_pos: floorPos_y + 7},
        {x_pos:1530, y_pos: floorPos_y + 13},
        {x_pos:1800, y_pos: floorPos_y + 8},
        {x_pos:1750, y_pos: floorPos_y + 12}
    ];
    
    //canyons
    canyons = [
        {x_pos: -1100, width: -650},
        {x_pos: 230, width: 340}, 
        {x_pos: 600, width: 720}, 
        {x_pos: 1200, width: 1310},
        {x_pos: 1950, width: 2350}
    ];
    
    //collectables
    collectables = [
        {x_pos: -300, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false},
        {x_pos: -20, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 262, y_pos: floorPos_y - 101, size: 10, shadowDist: 30, isFound: false},
        {x_pos: 640, y_pos: floorPos_y - 82, size: 10, shadowDist: 200, isFound: false},
        {x_pos: 940, y_pos: floorPos_y + 2, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 1000, y_pos: floorPos_y - 230, size: 10, shadowDist: 29, isFound: false},
        {x_pos: 1120, y_pos: floorPos_y - 230, size: 10, shadowDist: 29, isFound: false},
        {x_pos: 1120, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 1580, y_pos: floorPos_y + 2, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 1230, y_pos: floorPos_y - 30, size: 10, shadowDist: 200, isFound: false},
        {x_pos: 2030, y_pos: floorPos_y - 165, size: 10, shadowDist: 24, isFound: false},
        {x_pos: 2230, y_pos: floorPos_y - 165, size: 10, shadowDist: 24, isFound: false},
        {x_pos: 2700, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 2750, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false},
        {x_pos: 2800, y_pos: floorPos_y - 5, size: 10, shadowDist: 20, isFound: false}
    ];

    //end of the world sign
    sign = 
        {
            xpos: -200,
            ypos: floorPos_y - 85,
            change: false,
        }

    //platforms
    platforms = [];
    platforms.push(createPlatforms(-50, floorPos_y - 68, 110));
    platforms.push(createPlatforms(200, floorPos_y - 68, 150));
    platforms.push(createPlatforms(750, floorPos_y - 68, 110));
    platforms.push(createPlatforms(830, floorPos_y - 138, 100));
    platforms.push(createPlatforms(930, floorPos_y - 198, 300));
    platforms.push(createPlatforms(1940, floorPos_y - 65, 110));
    platforms.push(createPlatforms(2250, floorPos_y - 65, 110));
    platforms.push(createPlatforms(1990, floorPos_y - 138, 300));
    platforms.push(createPlatforms(1950, floorPos_y - 220, 110));
    platforms.push(createPlatforms(2230, floorPos_y - 220, 110));

    //enemies
    enemies = [];
    enemies.push(new Enemy(100, floorPos_y - 40, 100, "ginger"));
    enemies.push(new Enemy(895, floorPos_y - 40, 200, "ginger"));
    enemies.push(new Enemy(940, floorPos_y - 262, 270, "ginger"));
    enemies.push(new Enemy(2060, floorPos_y - 200, 140, "black"));
    enemies.push(new Enemy(2410, floorPos_y - 40, 200, "black"));
    
    //-Initialise Game Engine and Checks-//
    
    //score
    game_score = 0;
    
    //finish point
    dogHouse = {isReached: false, x_pos: 2900};
    
    //life counter
    lifeCounter = {x_pos: 1005, y_pos: 28};

    //death and completion banners
    banner = [{x_pos: 330, y_pos: 1},
              {x_pos: 300, y_pos: 1}
             ];
    
    //dog head for death banner
    largeHead = {x_pos: 680, y_pos: 1};
    
}

// ---------------------
// Game Engine Functions
// ---------------------

//-A fix I found to an issue with Google Chrome preventing sounds being played until the user has interacted with the tab.-//
function touchStarted()
{
  getAudioContext().resume();
}

//-Function for Start Splash Screen.-//
function drawSplashScreen(center_pos_x, center_pos_y)
{
    if(gameChar_world_x == 512 && game_score == 0 && lives == 3)
    {
        //wooden Sign
        image(splashScreen, center_pos_x - 250, center_pos_y - 110);

        //button Shadows
        noStroke();
        fill(160, 1500);
        rect(center_pos_x + 123, center_pos_y + 152, 35, 35, 5);
        rect(center_pos_x + 123, center_pos_y + 202, 35, 35, 5);

        fill(160);
        rect(center_pos_x + 168, center_pos_y + 202, 35, 35, 5);
        rect(center_pos_x + 78, center_pos_y + 202, 35, 35, 5);
        rect(center_pos_x - 134, center_pos_y + 202, 180, 35, 5);

        //buttons
        fill(245, 150);
        rect(center_pos_x + 125,  center_pos_y + 150, 35, 35, 5);
        rect(center_pos_x + 125, center_pos_y + 200, 35, 35, 5);

        fill(245);
        rect(center_pos_x + 170, center_pos_y + 200, 35, 35, 5);
        rect(center_pos_x + 80, center_pos_y + 200, 35, 35, 5);
        rect(center_pos_x - 132, center_pos_y + 200, 180, 35, 5);

        //title
        fill(255);
        textSize(70);
        textFont(gameFont);
        textAlign(CENTER);
        text("Nala's Way Home", center_pos_x, center_pos_y);

        //description
        textSize(22);
        text("Collect bones, avoid the robot cats, and get Nala home safely.", center_pos_x - 200, center_pos_y + 40, 400);

        textSize(35);
        text("Controls:", center_pos_x - 150, center_pos_y + 170);

        fill(0);
        text("Move to start!", center_pos_x, center_pos_y + 115);

        //controls
        fill(0);
        noStroke();
        textFont(controlFont);
        textSize(25);
        text("Jump", center_pos_x - 45, center_pos_y + 225);

        triangle(center_pos_x + 195, center_pos_y + 217, 
                center_pos_x + 181, center_pos_y + 211, 
                center_pos_x + 181, center_pos_y + 223);
        triangle(center_pos_x + 90, center_pos_y + 217, 
                center_pos_x + 104, center_pos_y + 211, 
                center_pos_x + 104, center_pos_y + 223);

    }
}

//-Function to see if the character has fallen off the screen and will lose a life.-//
function checkPlayerDie()
{
    if(gameChar_y >= height)
    {
        lives -= 1;
        if(lives >= 0)
        {
            startGame();
        }
    }
}

//-Function to draw the number of lives in the top right hand corner.-//
function drawLifeCounter()
{
    for(var i=0; i < lives; i ++)
    {
        fill(210, 105, 30);
        stroke(255);
        ellipse(lifeCounter.x_pos - i * 30, lifeCounter.y_pos, 18, 16);
        ellipse(lifeCounter.x_pos + 8 - i * 30, lifeCounter.y_pos - 12, 7, 10);
        ellipse(lifeCounter.x_pos - i * 30, lifeCounter.y_pos - 15, 7, 10);
        ellipse(lifeCounter.x_pos - 8 - i * 30, lifeCounter.y_pos - 12, 7, 10);
        noStroke();
    }
}

//-Function to produce a banner when the player is out of lives.-//
function drawDeathBanner()
{
    //animation for the banner to slide on screen
    if(banner[0].y_pos < height/2)
    {
        banner[0].y_pos *= 1.2;
        largeHead.y_pos *= 1.2;
        if(banner[0].y_pos > height/2)
        {
            banner[0].y_pos = height/2;
        }
        if(largeHead.y_pos > height/2.12)
        {
            largeHead.y_pos = height/2.12;
            whineSound.play();
        }
    }

    //banner
    fill(0);
    rect(banner[0].x_pos, banner[0].y_pos - 110, 420, 120, 8);
    noFill();
    stroke(0);
    rect(banner[0].x_pos - 5, banner[0].y_pos - 115, 430, 130, 10);
    noStroke();
    fill(255, 0, 0);

    //text
    textSize(50);
    textFont(gameFont);
    textAlign(CENTER);
    text("Game Over", width/2, banner[0].y_pos - 50);
    textSize(25);
    textFont(controlFont);
    text("Press Space to try again", width/2, banner[0].y_pos - 20);

    //head
	fill(210, 105, 30);
    rect(largeHead.x_pos, largeHead.y_pos - 63, 40, 63, 8);

    //snout
    fill(95);
    rect(largeHead.x_pos + 5, largeHead.y_pos - 41, 30, 20, 10);

    //ears
    triangle(largeHead.x_pos + 2, largeHead.y_pos - 46, 
            largeHead.x_pos - 10, largeHead.y_pos - 66, 
            largeHead.x_pos + 15, largeHead.y_pos - 66);
    triangle(largeHead.x_pos + 38, largeHead.y_pos - 46, 
            largeHead.x_pos + 25, largeHead.y_pos - 66, 
            largeHead.x_pos + 50, largeHead.y_pos - 66);

    //nose
    fill(20);
    triangle(largeHead.x_pos + 20, largeHead.y_pos - 28, 
            largeHead.x_pos + 12, largeHead.y_pos - 38, 
            largeHead.x_pos + 28, largeHead.y_pos - 38);

    //eyes
    fill(165, 42, 42);
    ellipse(largeHead.x_pos + 11, largeHead.y_pos - 48, 12, 10);
    ellipse(largeHead.x_pos + 29, largeHead.y_pos - 48, 12, 10);

    fill(0);
    ellipse(largeHead.x_pos + 11, largeHead.y_pos - 48, 6);
    ellipse(largeHead.x_pos + 29, largeHead.y_pos - 48, 6);
        
    fill(224, 255, 255);
    ellipse(largeHead.x_pos + 31, largeHead.y_pos - 43, 2, 6);
    ellipse(largeHead.x_pos + 32, largeHead.y_pos - 36, 2, 6);
}

//-Function to produce a banner when the player reaches the finish point.-//
function drawCompletionBanner()
{
    backgroundSound.stop();

    //animation for the banner to slide on screen
    if(banner[1].y_pos < height/2)
    {
        banner[1].y_pos *= 1.2;

        if(banner[1].y_pos > height/2)
        {
            banner[1].y_pos = height/2;
            completionSound.play();
        }
    }

    //banner
    fill(255, 215, 0);
    rect(banner[1].x_pos + 5, banner[1].y_pos - 110, 420, 105, 8);
    noFill();
    stroke(255, 215, 0);
    rect(banner[1].x_pos, banner[1].y_pos - 115, 430, 115, 10);
    noStroke();

    //text
    fill(0);
    textSize(50);
    textFont(gameFont);
    textAlign(CENTER);
    text("You did it!", width/2, banner[1].y_pos - 55);
    textSize(25);
    text("Nala is now safe and sound.", width/2, banner[1].y_pos - 20);
}

//-Function to draw the game character.-//
function drawGameChar()
{
	if(isLeft && isFalling)
	{
        //right paws
        fill(242, 230, 215);
        rect(gameChar_x - 29, gameChar_y - 14, 7, 3, 2);
        rect(gameChar_x + 22, gameChar_y - 12, 3, 7, 2);

        //right legs
        fill(190, 100, 25);
        quad(gameChar_x - 19, gameChar_y - 19, 
             gameChar_x - 9, gameChar_y - 19, 
             gameChar_x - 11, gameChar_y - 11, 
             gameChar_x - 16, gameChar_y - 11);
        quad(gameChar_x - 16, gameChar_y - 14, 
             gameChar_x - 11, gameChar_y - 11, 
             gameChar_x - 24, gameChar_y - 11, 
             gameChar_x - 24, gameChar_y - 14);

        quad(gameChar_x + 8, gameChar_y - 18, 
             gameChar_x + 19, gameChar_y - 18, 
             gameChar_x + 18, gameChar_y - 9, 
             gameChar_x + 14, gameChar_y - 9);
        quad(gameChar_x + 14, gameChar_y - 9, 
             gameChar_x + 14, gameChar_y - 12, 
             gameChar_x + 23, gameChar_y - 12, 
             gameChar_x + 23, gameChar_y - 9);

        //tail
        fill(195, 105, 30);
        beginShape();
        vertex(gameChar_x + 14, gameChar_y - 24);
        bezierVertex(gameChar_x + 16, gameChar_y - 27, 
                     gameChar_x + 21, gameChar_y - 32, 
                     gameChar_x + 22, gameChar_y - 37);
        bezierVertex(gameChar_x + 23.5, gameChar_y - 36, 
                     gameChar_x + 24, gameChar_y - 35, 
                     gameChar_x + 24.5, gameChar_y - 34);
        vertex(gameChar_x + 19, gameChar_y - 20);
        endShape();

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 20, gameChar_y - 26, 42, 10, 10);
        
        //back
        fill(95);
        rect(gameChar_x - 19, gameChar_y - 26, 35, 5, 10);
        triangle(gameChar_x - 7, gameChar_y - 28, 
                 gameChar_x - 7, gameChar_y - 26, 
                 gameChar_x - 2, gameChar_y - 26);
        
        //belly
        fill(250, 235, 215);
        rect(gameChar_x - 20, gameChar_y - 26, 5, 12, 15);
        quad(gameChar_x - 17, gameChar_y - 14, 
             gameChar_x - 15, gameChar_y - 18, 
             gameChar_x + 12, gameChar_y - 16, 
             gameChar_x + 11, gameChar_y - 15);

        //left paws
        fill(250, 235, 215);
        rect(gameChar_x - 28, gameChar_y - 13, 7, 3, 2);
        rect(gameChar_x + 23, gameChar_y - 11, 3, 7, 2);

        //left legs
        fill(210, 105, 30);
        quad(gameChar_x - 18, gameChar_y - 18, 
             gameChar_x - 8, gameChar_y - 18, 
             gameChar_x - 10, gameChar_y - 10, 
             gameChar_x - 15, gameChar_y - 10);
        quad(gameChar_x - 15, gameChar_y - 13, 
             gameChar_x - 10, gameChar_y - 10, 
             gameChar_x - 23, gameChar_y - 10, 
             gameChar_x - 23, gameChar_y - 13);

        quad(gameChar_x + 9, gameChar_y - 19, 
             gameChar_x + 20, gameChar_y - 19, 
             gameChar_x + 19, gameChar_y - 10, 
             gameChar_x + 15, gameChar_y - 8);
        quad(gameChar_x + 15, gameChar_y - 8, 
             gameChar_x + 15, gameChar_y - 11, 
             gameChar_x + 24, gameChar_y - 11, 
             gameChar_x + 24, gameChar_y - 8);

        //head
        fill(210, 105, 30);
        rect(gameChar_x - 19, gameChar_y - 38, 12, 22, 4);

        fill(95);
        rect(gameChar_x - 25, gameChar_y - 31, 10, 3, 5);
        rect(gameChar_x - 24, gameChar_y - 30.5, 9, 4, 5);

        //ears
        triangle(gameChar_x - 12.5, gameChar_y - 33, 
                 gameChar_x - 16, gameChar_y - 39, 
                 gameChar_x - 9, gameChar_y - 38);

        //nose
        fill(20);
        triangle(gameChar_x - 25, gameChar_y - 29, 
                 gameChar_x - 23, gameChar_y - 31, 
                 gameChar_x - 25, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x - 18, gameChar_y - 33, 3, 3);

        fill(0);
        ellipse(gameChar_x - 18.5, gameChar_y - 33.5, 2);

	}
	else if(isRight && isFalling)
	{
        //left paws
        fill(242, 230, 215);
        rect(gameChar_x + 24, gameChar_y - 14, 7, 3, 2);
        rect(gameChar_x - 23, gameChar_y - 12, 3, 7, 2);

        //left legs
        fill(190, 100, 25);
        quad(gameChar_x + 21, gameChar_y - 19, 
             gameChar_x + 11, gameChar_y - 19, 
             gameChar_x + 13, gameChar_y - 11, 
             gameChar_x + 18, gameChar_y - 11);
        quad(gameChar_x + 18, gameChar_y - 14, 
             gameChar_x + 13, gameChar_y - 11, 
             gameChar_x + 26, gameChar_y - 11, 
             gameChar_x + 26, gameChar_y - 14);

        quad(gameChar_x - 6, gameChar_y - 18, 
             gameChar_x - 17, gameChar_y - 18, 
             gameChar_x - 16, gameChar_y - 9, 
             gameChar_x - 12, gameChar_y - 9);
        quad(gameChar_x - 12, gameChar_y - 9, 
             gameChar_x - 12, gameChar_y - 12, 
             gameChar_x - 21, gameChar_y - 12, 
             gameChar_x - 21, gameChar_y - 9);

        //tail
        fill(195, 105, 30);
        beginShape();
        vertex(gameChar_x - 13, gameChar_y - 24);
        bezierVertex(gameChar_x - 15, gameChar_y - 27, 
                     gameChar_x - 20, gameChar_y - 32, 
                     gameChar_x - 21, gameChar_y - 37);
        bezierVertex(gameChar_x - 22.5, gameChar_y - 36, 
                     gameChar_x - 23, gameChar_y - 35, 
                     gameChar_x - 23.5, gameChar_y - 34);
        vertex(gameChar_x - 18, gameChar_y - 20);
        endShape();

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 20, gameChar_y - 26, 42, 10, 10);
        triangle(gameChar_x + 9, gameChar_y - 28, 
                 gameChar_x + 9, gameChar_y - 26, 
                 gameChar_x + 4, gameChar_y - 26);
        
        //back
        fill(95);
        triangle(gameChar_x + 9, gameChar_y - 28, 
                 gameChar_x + 9, gameChar_y - 26, 
                 gameChar_x + 4, gameChar_y - 26);
        rect(gameChar_x - 14, gameChar_y - 26, 35, 5, 10);
        
        //belly
        fill(250, 235, 215);
        rect(gameChar_x + 17, gameChar_y - 26, 5, 12, 15);
        quad(gameChar_x + 19, gameChar_y - 14, 
             gameChar_x + 17, gameChar_y - 18, 
             gameChar_x - 10, gameChar_y - 16, 
             gameChar_x - 9, gameChar_y - 15);

        //right paws
        fill(250, 235, 215);
        rect(gameChar_x - 24, gameChar_y - 11, 3, 7, 2);
        rect(gameChar_x + 23, gameChar_y - 13, 7, 3, 2);

        //right legs
        fill(210, 105, 30);
        quad(gameChar_x + 20, gameChar_y - 18, 
             gameChar_x + 10, gameChar_y - 18, 
             gameChar_x + 12, gameChar_y - 10, 
             gameChar_x + 17, gameChar_y - 10);
        quad(gameChar_x + 17, gameChar_y - 13, 
             gameChar_x + 12, gameChar_y - 10, 
             gameChar_x + 25, gameChar_y - 10, 
             gameChar_x + 25, gameChar_y - 13);

        quad(gameChar_x - 7, gameChar_y - 19, 
             gameChar_x - 18, gameChar_y - 19, 
             gameChar_x - 17, gameChar_y - 10, 
             gameChar_x - 13, gameChar_y - 8);
        quad(gameChar_x - 13, gameChar_y - 8, 
             gameChar_x - 13, gameChar_y - 11, 
             gameChar_x - 22, gameChar_y - 11, 
             gameChar_x - 22, gameChar_y - 8);

        //head
        fill(210, 105, 30);
        rect(gameChar_x + 9, gameChar_y - 38, 12, 22, 4);

        fill(95);
        rect(gameChar_x + 17, gameChar_y - 31, 10, 3, 5);
        rect(gameChar_x + 17, gameChar_y - 30.5, 9, 4, 5);

        //ears
        triangle(gameChar_x + 14.5, gameChar_y - 33, 
                 gameChar_x + 18, gameChar_y - 39, 
                 gameChar_x + 11, gameChar_y - 38);

        //nose
        fill(20);
        triangle(gameChar_x + 27, gameChar_y - 29, 
                 gameChar_x + 25, gameChar_y - 31, 
                 gameChar_x + 27, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x + 20, gameChar_y - 33, 3, 3);

        fill(0);
        ellipse(gameChar_x + 20.5, gameChar_y - 33.5, 2);

	}
	else if(isLeft)
	{
        //right paws
        fill(250, 235, 215);
        rect(gameChar_x - 14, gameChar_y - 3, 7, 3, 2);
        rect(gameChar_x + 22, gameChar_y - 12, 3, 7, 2);

        //right legs
        fill(190, 100, 25);
        quad(gameChar_x - 17, gameChar_y - 18, 
             gameChar_x - 7, gameChar_y - 18, 
             gameChar_x - 6, gameChar_y - 10, 
             gameChar_x - 10, gameChar_y - 10);
        quad(gameChar_x - 6, gameChar_y - 10, 
             gameChar_x - 10, gameChar_y - 10, 
             gameChar_x - 10, gameChar_y - 2, 
             gameChar_x - 7, gameChar_y - 2);

        quad(gameChar_x + 8, gameChar_y - 18, 
             gameChar_x + 19, gameChar_y - 18, 
             gameChar_x + 18, gameChar_y - 9, 
             gameChar_x + 14, gameChar_y - 9);
        quad(gameChar_x + 14, gameChar_y - 9, 
             gameChar_x + 14, gameChar_y - 12, 
             gameChar_x + 23, gameChar_y - 12, 
             gameChar_x + 23, gameChar_y - 8);

        //tail
        fill(195, 105, 30);
        beginShape();
        vertex(gameChar_x + 14, gameChar_y - 24);
        bezierVertex(gameChar_x + 16, gameChar_y - 27, 
                     gameChar_x + 21, gameChar_y - 32, 
                     gameChar_x + 22, gameChar_y - 37);
        bezierVertex(gameChar_x + 23.5, gameChar_y - 36, 
                     gameChar_x + 24, gameChar_y - 35, 
                     gameChar_x + 24.5, gameChar_y - 34);
        vertex(gameChar_x + 19, gameChar_y - 20);
        endShape();

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 20, gameChar_y - 26, 42, 10, 10);

        //belly
        fill(250, 235, 215);
        rect(gameChar_x - 20, gameChar_y - 26, 5, 12, 15);
        quad(gameChar_x - 17, gameChar_y - 14, 
             gameChar_x - 15, gameChar_y - 18, 
             gameChar_x + 12, gameChar_y - 16, 
             gameChar_x + 11, gameChar_y - 15);

        //left paws
        fill(250, 235, 215);
        rect(gameChar_x - 23, gameChar_y - 6, 7, 3, 2);
        rect(gameChar_x + 12, gameChar_y - 3, 7, 3, 2);

        //left legs
        fill(210, 105, 30);
        quad(gameChar_x - 18, gameChar_y - 18, 
             gameChar_x - 8, gameChar_y - 18, 
             gameChar_x - 7, gameChar_y - 10, 
             gameChar_x - 12, gameChar_y - 10);
        quad(gameChar_x - 12, gameChar_y - 10, 
             gameChar_x - 7, gameChar_y - 10, 
             gameChar_x - 16, gameChar_y - 5, 
             gameChar_x - 20, gameChar_y - 6);

        quad(gameChar_x + 10, gameChar_y - 18, 
             gameChar_x + 21, gameChar_y - 18, 
             gameChar_x + 20, gameChar_y - 9, 
             gameChar_x + 16, gameChar_y - 9);
        quad(gameChar_x + 16, gameChar_y - 9, 
             gameChar_x + 20, gameChar_y - 9, 
             gameChar_x + 19, gameChar_y - 2, 
             gameChar_x + 15, gameChar_y - 2);
        
        //back
        fill(95);
        rect(gameChar_x - 19, gameChar_y - 26, 35, 5, 10);
        triangle(gameChar_x - 7, gameChar_y - 28, 
                 gameChar_x - 7, gameChar_y - 26, 
                 gameChar_x - 2, gameChar_y - 26);

        //head
        fill(210, 105, 30);
        rect(gameChar_x - 19, gameChar_y - 38, 12, 22, 4);

        fill(95);
        rect(gameChar_x - 25, gameChar_y - 31, 10, 3, 5);
        rect(gameChar_x - 24, gameChar_y - 30.5, 9, 4, 5);

        //ears
        triangle(gameChar_x - 12.5, gameChar_y - 33, 
                 gameChar_x - 16, gameChar_y - 39, 
                 gameChar_x - 9, gameChar_y - 38);

        //nose
        fill(20);
        triangle(gameChar_x - 25, gameChar_y - 29, 
                 gameChar_x - 23, gameChar_y - 31, 
                 gameChar_x - 25, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x - 18, gameChar_y - 33, 3, 3);

        fill(0);
        ellipse(gameChar_x - 18.5, gameChar_y - 33, 2);

	}
	else if(isRight)
	{
        //left paws
        fill(250, 235, 215);
        rect(gameChar_x + 9, gameChar_y - 3, 7, 3, 2);
        rect(gameChar_x - 23, gameChar_y - 12, 3, 7, 2);

        //left legs
        fill(190, 100, 25);
        quad(gameChar_x + 19, gameChar_y - 18, 
             gameChar_x + 9, gameChar_y - 18, 
             gameChar_x + 8, gameChar_y - 10, 
             gameChar_x + 12, gameChar_y - 10);
        quad(gameChar_x + 8, gameChar_y - 10, 
             gameChar_x + 12, gameChar_y - 10, 
             gameChar_x + 12, gameChar_y - 2, 
             gameChar_x + 9, gameChar_y - 2);

        quad(gameChar_x - 6, gameChar_y - 18, 
             gameChar_x - 17, gameChar_y - 18, 
             gameChar_x - 16, gameChar_y - 9, 
             gameChar_x - 12, gameChar_y - 9);
        quad(gameChar_x - 12, gameChar_y - 9, 
             gameChar_x - 12, gameChar_y - 12, 
             gameChar_x - 21, gameChar_y - 12, 
             gameChar_x - 21, gameChar_y - 8);

        //tail
        fill(195, 105, 30);
        beginShape();
        vertex(gameChar_x - 13, gameChar_y - 24);
        bezierVertex(gameChar_x - 15, gameChar_y - 27, 
                     gameChar_x - 20, gameChar_y - 32, 
                     gameChar_x - 21, gameChar_y - 37);
        bezierVertex(gameChar_x - 22.5, gameChar_y - 36, 
                     gameChar_x - 23, gameChar_y - 35, 
                     gameChar_x - 23.5, gameChar_y - 34);
        vertex(gameChar_x - 18, gameChar_y - 20);
        endShape();

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 20, gameChar_y - 26, 42, 10, 10);
        
        //back
        fill(95);
        triangle(gameChar_x + 9, gameChar_y - 28, 
                 gameChar_x + 9, gameChar_y - 26, 
                 gameChar_x + 4, gameChar_y - 26);
        rect(gameChar_x - 14, gameChar_y - 26, 35, 5, 10);
        
        //belly
        fill(250, 235, 215);
        rect(gameChar_x + 17, gameChar_y - 26, 5, 12, 15);
        quad(gameChar_x + 19, gameChar_y - 14, 
             gameChar_x + 17, gameChar_y - 18, 
             gameChar_x - 10, gameChar_y - 16, 
             gameChar_x - 9, gameChar_y - 15);

        //right paws
        fill(250, 235, 215);
        rect(gameChar_x + 18, gameChar_y - 6, 7, 3, 2);
        rect(gameChar_x - 17, gameChar_y - 3, 7, 3, 2);

        //right legs
        fill(210, 105, 30);
        quad(gameChar_x + 20, gameChar_y - 18, 
             gameChar_x + 10, gameChar_y - 18, 
             gameChar_x + 9, gameChar_y - 10, 
             gameChar_x + 14, gameChar_y - 10);
        quad(gameChar_x + 14, gameChar_y - 10, 
             gameChar_x + 9, gameChar_y - 10, 
             gameChar_x + 18, gameChar_y - 5, 
             gameChar_x + 22, gameChar_y - 6);

        quad(gameChar_x - 8, gameChar_y - 18, 
             gameChar_x - 19, gameChar_y - 18, 
             gameChar_x - 18, gameChar_y - 9, 
             gameChar_x - 14, gameChar_y - 9);
        quad(gameChar_x - 14, gameChar_y - 9, 
             gameChar_x - 18, gameChar_y - 9, 
             gameChar_x - 17, gameChar_y - 2, 
             gameChar_x - 13, gameChar_y - 2);

        //head
        fill(210, 105, 30);
        rect(gameChar_x + 9, gameChar_y - 38, 12, 22, 4);

        fill(95);
        rect(gameChar_x + 17, gameChar_y - 31, 10, 3, 5);
        rect(gameChar_x + 17, gameChar_y - 30.5, 9, 4, 5);

        //ears
        triangle(gameChar_x + 14.5, gameChar_y - 33, 
                 gameChar_x + 18, gameChar_y - 39, 
                 gameChar_x + 11, gameChar_y - 38);

        //nose
        fill(20);
        triangle(gameChar_x + 27, gameChar_y - 29, 
                 gameChar_x + 25, gameChar_y - 31, 
                 gameChar_x + 27, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x + 20, gameChar_y - 33, 3, 3);

        fill(0);
        ellipse(gameChar_x + 20.5, gameChar_y - 33, 2);
	}
	else if(isFalling || isPlummeting)
	{
        //back paws
        fill(250, 235, 215);
        rect(gameChar_x - 9, gameChar_y - 1, 5, 7, 2);
        rect(gameChar_x + 4, gameChar_y - 1, 5, 7, 2);

        //back legs
        fill(190, 100, 25);
        rect(gameChar_x - 9, gameChar_y - 17, 5, 17, 1);
        rect(gameChar_x + 4, gameChar_y - 17, 5, 17, 1);

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 11, gameChar_y - 28, 22, 22, 10);

        //head
        noStroke();
        fill(210, 105, 30);
        rect(gameChar_x - 6, gameChar_y - 40, 12, 20, 4);

        fill(95);
        rect(gameChar_x - 3.5, gameChar_y - 32, 7, 5, 5);

        //ears
        triangle(gameChar_x - 6, gameChar_y - 36, 
                 gameChar_x - 9, gameChar_y - 41, 
                 gameChar_x - 2, gameChar_y - 41);
        triangle(gameChar_x + 6, gameChar_y - 36, 
                 gameChar_x + 9, gameChar_y - 41, 
                 gameChar_x + 2, gameChar_y - 41);
        //nose
        fill(20);
        triangle(gameChar_x, gameChar_y - 28, 
                 gameChar_x - 2, gameChar_y - 31, 
                 gameChar_x + 2, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x - 3, gameChar_y - 35, 4, 3);
        ellipse(gameChar_x + 3, gameChar_y - 35, 4, 3);

        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 35.7, 2);
        ellipse(gameChar_x + 3, gameChar_y - 35.7, 2);

        //belly
        fill(250, 235, 215);
        strokeWeight(0.5);
        stroke(210, 105, 30);
        ellipse(gameChar_x, gameChar_y - 16, 14, 18);

        //front legs
        noStroke();
        fill(210, 105, 30);
        rect(gameChar_x - 11, gameChar_y - 23, 5, 19, 10);
        rect(gameChar_x + 6, gameChar_y - 23, 5, 19, 10);

        //front paws
        fill(250, 235, 215);
        ellipse(gameChar_x - 8.5, gameChar_y - 3, 3, 4);
        rect(gameChar_x - 11.5, gameChar_y - 6, 6, 3, 3);

        rect(gameChar_x + 5.5, gameChar_y - 6, 6, 3, 3);
        ellipse(gameChar_x + 8.5, gameChar_y - 3, 3, 4);

	}
	else
	{
        //back legs
        fill(190, 100, 25);
        rect(gameChar_x - 9, gameChar_y - 17, 5, 12, 10);
        rect(gameChar_x + 4, gameChar_y - 17, 5, 12, 10);

        //tail
        beginShape();
        vertex(gameChar_x, gameChar_y - 24);
        bezierVertex(gameChar_x + 3, gameChar_y - 27, 
                     gameChar_x + 8, gameChar_y - 32, 
                     gameChar_x + 9, gameChar_y - 37);
        bezierVertex(gameChar_x + 10.5, gameChar_y - 36, 
                     gameChar_x + 11, gameChar_y - 35, 
                     gameChar_x + 11.5, gameChar_y - 34);
        vertex(gameChar_x + 2, gameChar_y - 20);
        endShape();

        //back paws
        fill(240, 235, 215);
        ellipse(gameChar_x - 4, gameChar_y - 5, 3, 3);
        ellipse(gameChar_x - 6, gameChar_y - 4.5, 4, 4);

        ellipse(gameChar_x + 4, gameChar_y - 5, 3, 3);
        ellipse(gameChar_x + 6, gameChar_y - 4.5, 4, 4);

        //body
        fill(210, 105, 30);
        rect(gameChar_x - 11, gameChar_y - 31, 22, 17, 10);
        
        //head
        rect(gameChar_x - 6, gameChar_y - 40, 12, 20, 4);
        
        //belly
        fill(250, 235, 215);
        strokeWeight(0.5);
        stroke(210, 105, 30);
        ellipse(gameChar_x, gameChar_y - 20, 14, 12);

        //front legs
        noStroke();
        fill(210, 105, 30);
        rect(gameChar_x - 11, gameChar_y - 21, 5, 21, 1);
        rect(gameChar_x + 6, gameChar_y - 21, 5, 21, 1);

        //front paws
        fill(250, 235, 215);
        rect(gameChar_x - 11.5, gameChar_y - 2, 6, 3, 3);
        ellipse(gameChar_x - 8.5, gameChar_y + 0.5, 3, 4);

        rect(gameChar_x + 5.5, gameChar_y - 2, 6, 3, 3);
        ellipse(gameChar_x + 8.5, gameChar_y + 0.5, 3, 4);

        //Snout
        fill(95);
        rect(gameChar_x - 3.5, gameChar_y - 32, 7, 5, 5);

        //ears
        triangle(gameChar_x - 6, gameChar_y - 36, 
                 gameChar_x - 9, gameChar_y - 41, 
                 gameChar_x - 2, gameChar_y - 41);
        triangle(gameChar_x + 6, gameChar_y - 36, 
                 gameChar_x + 9, gameChar_y - 41, 
                 gameChar_x + 2, gameChar_y - 41);

        //nose
        fill(20);
        triangle(gameChar_x, gameChar_y - 28, 
                 gameChar_x - 2, gameChar_y - 31, 
                 gameChar_x + 2, gameChar_y - 31);

        //eyes
        fill(165, 42, 42);
        ellipse(gameChar_x - 3, gameChar_y - 35, 4, 3);
        ellipse(gameChar_x + 3, gameChar_y - 35, 4, 3);

        fill(0);
        ellipse(gameChar_x - 3, gameChar_y - 35, 2);
        ellipse(gameChar_x + 3, gameChar_y - 35, 2);
    }
}

// ---------------------------
// Scenery Drawing functions
// ---------------------------

//-Function to draw cloud objects.-//
function drawClouds()
{
    for(var i = 0; i < clouds.length; i++)
    {   
        //cloud shadow
        fill(180);
        rect(clouds[i].x_pos - 2, clouds[i].y_pos + 1, 101, 29, 30);
        
        fill(255);
        //cloud base
        rect(clouds[i].x_pos, clouds[i].y_pos, 100, 28, 30);
        //cloud fluff
        ellipse(clouds[i].x_pos + 40, clouds[i].y_pos - 5, 50, 45);
        ellipse(clouds[i].x_pos + 70, clouds[i].y_pos - 2, 28, 22);
        
        clouds[i].x_pos += clouds[i].speed;
    }
}

//-Function to draw mountain objects.-//
function drawMountains()
{
    //mountain Style 1
    for(var i = 0; i < mountains1_x.length; i++)
    {
        //light mountain face
        fill(180);
        triangle(mountains1_x[i], floorPos_y - 282, 
                 mountains1_x[i] - 70, floorPos_y, 
                 mountains1_x[i] + 170, floorPos_y);
        
        //shadow mountain face
        fill(130);
        triangle(mountains1_x[i], floorPos_y - 282, 
                 mountains1_x[i] - 170, floorPos_y, 
                 mountains1_x[i] - 70, floorPos_y);
        triangle(mountains1_x[i] - 10, floorPos_y - 182, 
                 mountains1_x[i] - 10, floorPos_y - 262, 
                 mountains1_x[i] - 40, floorPos_y - 142);
        
        //light face ice
        fill(204, 255, 255);
        triangle(mountains1_x[i], floorPos_y - 282, 
                 mountains1_x[i] - 7, floorPos_y - 252, 
                 mountains1_x[i] + 18, floorPos_y - 252);
        triangle(mountains1_x[i], floorPos_y - 237, 
                 mountains1_x[i] - 7, floorPos_y - 252, 
                 mountains1_x[i] + 2, floorPos_y - 257);
        triangle(mountains1_x[i], floorPos_y - 257, 
                 mountains1_x[i] + 12, floorPos_y - 252, 
                 mountains1_x[i] + 10, floorPos_y - 227);
        triangle(mountains1_x[i], floorPos_y - 262, 
                 mountains1_x[i] + 18, floorPos_y - 252, 
                 mountains1_x[i] + 29, floorPos_y - 232);
        
        //shadow face ice
        fill(164, 205, 205);
        triangle(mountains1_x[i], floorPos_y - 282, 
                 mountains1_x[i] - 9, floorPos_y - 243, 
                 mountains1_x[i] - 12, floorPos_y - 262);
        triangle(mountains1_x[i] - 12, floorPos_y - 262, 
                 mountains1_x[i] - 5, floorPos_y - 262, 
                 mountains1_x[i] - 17, floorPos_y - 243);
    }
    
    //mountain Style 2
    for(var i = 0; i < mountains2_x.length; i++)
    {
        //centre face
        fill(140);
        triangle(mountains2_x[i], floorPos_y - 172, 
                 mountains2_x[i] - 80, floorPos_y, 
                 mountains2_x[i] + 70, floorPos_y);
        
        //right Face
        fill(160);
        triangle(mountains2_x[i], floorPos_y - 172, 
                 mountains2_x[i] + 70, floorPos_y, 
                 mountains2_x[i] + 150, floorPos_y);
        triangle(mountains2_x[i] + 70, floorPos_y, 
                 mountains2_x[i] + 40, floorPos_y - 22, 
                 mountains2_x[i] + 70, floorPos_y - 82);
        triangle(mountains2_x[i] + 80, floorPos_y, 
                 mountains2_x[i] + 200, floorPos_y, 
                 mountains2_x[i] + 60, floorPos_y - 92);
    
        fill(140);
        triangle(mountains2_x[i] + 40, floorPos_y - 52, 
                 mountains2_x[i] + 40, floorPos_y - 102, 
                 mountains2_x[i], floorPos_y - 162);
        
        //left Face
        fill(110);
        triangle(mountains2_x[i], floorPos_y - 172, 
                 mountains2_x[i] - 80, floorPos_y, 
                 mountains2_x[i] - 180, floorPos_y);
        triangle(mountains2_x[i] - 80, floorPos_y, 
                 mountains2_x[i] - 50, floorPos_y - 32, 
                 mountains2_x[i] - 70, floorPos_y - 97);
        triangle(mountains2_x[i] - 70, floorPos_y - 37, 
                 mountains2_x[i] - 20, floorPos_y - 82, 
                 mountains2_x[i] - 40, floorPos_y - 132);
        triangle(mountains2_x[i] - 40, floorPos_y - 82, 
                 mountains2_x[i] - 10, floorPos_y - 132, 
                 mountains2_x[i] - 10, floorPos_y - 162);
    }
}

//-Function to draw trees objects.-//
function drawTrees()
{
    for(var i = 0; i < trees.length; i++)
    {
        //back leaves
        fill(0, 100, 0);
        ellipse(trees[i].x_pos, trees[i].y_pos - 102, 50, 20);
        ellipse(trees[i].x_pos - 32, trees[i].y_pos - 102, 25, 20);
        ellipse(trees[i].x_pos + 2, trees[i].y_pos - 66, 10, 15);
        
        //tree trunk
        fill(153, 76, 0);
        rect(trees[i].x_pos - 22, trees[i].y_pos - 105, 15, 105);
        triangle(trees[i].x_pos - 42, trees[i].y_pos, 
                 trees[i].x_pos + 8, trees[i].y_pos, 
                 trees[i].x_pos - 20, trees[i].y_pos - 4);
        triangle(trees[i].x_pos - 18, trees[i].y_pos - 93, 
                 trees[i].x_pos - 42, trees[i].y_pos - 99, 
                 trees[i].x_pos + 8, trees[i].y_pos - 99);
        triangle(trees[i].x_pos - 10, trees[i].y_pos - 62, 
                 trees[i].x_pos - 10, trees[i].y_pos - 58, 
                 trees[i].x_pos + 8, trees[i].y_pos - 65);
        
        //front lighter leaves 
        fill(34, 139, 34);
        ellipse(trees[i].x_pos - 52, trees[i].y_pos - 122, 60, 50);
        ellipse(trees[i].x_pos + 18, trees[i].y_pos - 122, 80, 50);
        ellipse(trees[i].x_pos - 20, trees[i].y_pos - 149, 50, 100);
        ellipse(trees[i].x_pos + 8, trees[i].y_pos - 63, 15, 10);
        
        //front darker leaves 
        fill(0, 100, 0);
        ellipse(trees[i].x_pos + 8, trees[i].y_pos - 132, 60, 50);
        ellipse(trees[i].x_pos - 47, trees[i].y_pos - 149, 30, 20);
    }
}

//-Function to draw canyon objects-//
function drawCanyon(t_canyon)
{
    //background
    fill(99, 59, 19);
    quad(t_canyon.x_pos, floorPos_y, 
         t_canyon.x_pos - 30, height, 
         t_canyon.width - 30, height, 
         t_canyon.width, floorPos_y);
        
    //hole level 1
    fill(79, 49, 19);
    quad(t_canyon.x_pos - 5, floorPos_y + 115, 
         t_canyon.x_pos - 30, height, 
         t_canyon.width - 30, height, 
         t_canyon.width - 20, floorPos_y + 115);
        
    //hole level 2
    fill(69, 49, 19);;
    quad(t_canyon.x_pos + 5, floorPos_y + 120, 
         t_canyon.x_pos - 20, height, 
         t_canyon.width - 40, height, 
         t_canyon.width - 30, floorPos_y + 120);
        
    //hole level 3
    fill(49, 49, 19);;
    quad(t_canyon.x_pos + 15, floorPos_y + 120, 
         t_canyon.x_pos - 10, height, 
         t_canyon.width - 50, height, 
         t_canyon.width - 40, floorPos_y + 120);
        
    //hole level 4
    fill(39, 49, 19);;
    quad(t_canyon.x_pos + 25, floorPos_y + 120, 
         t_canyon.x_pos, height, 
         t_canyon.width - 60, height, 
         t_canyon.width - 50, floorPos_y + 120);
    
    //hole level 5
    fill(19, 49, 19);;
    quad(t_canyon.x_pos + 35, floorPos_y + 120, 
         t_canyon.x_pos + 10, height, 
         t_canyon.width - 70, height, 
         t_canyon.width - 60, floorPos_y + 120);

    //canyon left sides
    fill(129, 79, 19);
    beginShape();
        vertex(t_canyon.x_pos - 30, height);
        vertex(t_canyon.x_pos - 5, height - 30);
        vertex(t_canyon.x_pos, floorPos_y);
        vertex(t_canyon.x_pos - 40, floorPos_y + 38);
        vertex(t_canyon.x_pos - 30, height - 45);
        vertex(t_canyon.x_pos - 35, height - 20);
    endShape();
        
    //canyon right side
    beginShape();
        vertex(t_canyon.width - 30, height);
        vertex(t_canyon.width - 20, height);
        vertex(t_canyon.width + 10, 460);
        vertex(t_canyon.width + 3, floorPos_y + 13);
        vertex(t_canyon.width, floorPos_y);
    endShape();
        
    //canyon left ledge
    fill(195, 131, 76);
    quad(t_canyon.width, floorPos_y + 48, 
         t_canyon.width - 2, floorPos_y + 28, 
         t_canyon.width - 15, floorPos_y + 18, 
         t_canyon.width - 12, floorPos_y + 33);
        
    //canyon right ledge
    quad(t_canyon.x_pos - 30, floorPos_y + 58, 
         t_canyon.x_pos - 15, floorPos_y + 63, 
         t_canyon.x_pos + 20, floorPos_y + 33, 
         t_canyon.x_pos - 20, floorPos_y + 38);
    //canyon ledge shadow
    fill(143, 97, 56);
    quad(t_canyon.width, floorPos_y + 50, 
         t_canyon.width - 8, floorPos_y + 28, 
         t_canyon.width - 15, floorPos_y + 18, 
         t_canyon.width - 12, floorPos_y + 33);
    triangle(t_canyon.x_pos - 30, floorPos_y + 58, 
         t_canyon.x_pos - 15, floorPos_y + 63, 
         t_canyon.x_pos + 20, floorPos_y + 33);
}

//-Function to check if character is over a canyon.-//
function checkCanyon(t_canyon)
{
    if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.width - 15 && gameChar_y >= floorPos_y)
    {
        isPlummeting = true;
        isFalling = true;
        isLeft = false;
        isRight = false;
    }
    else
    {
        isPlummeting = false;
    }
    
    if(isPlummeting)
    {
        gameChar_y += 5;
    }
}


// ----------------------------------
// Collectable items draw and check functions
// ----------------------------------

//-Function to draw collectable objects.-//
function drawCollectable(t_collectable)
{
    //bone
    fill(50, 150);
    ellipse(t_collectable.x_pos + 15, 
            t_collectable.y_pos + t_collectable.shadowDist, 40, 5);
    fill(250, 250, 210);
    rect(t_collectable.x_pos, t_collectable.y_pos, 
         t_collectable.size * 3, 
         t_collectable.size);
    ellipse(t_collectable.x_pos, 
            t_collectable.y_pos, 
            t_collectable.size);
    ellipse(t_collectable.x_pos, 
            t_collectable.y_pos + 10, 
            t_collectable.size);
    ellipse(t_collectable.x_pos + 30, 
            t_collectable.y_pos, 
            t_collectable.size);
    ellipse(t_collectable.x_pos + 30, 
            t_collectable.y_pos + 10, 
            t_collectable.size);

}

//-Function to check if character has collected an item.-//
function checkCollectable(t_collectable)
{
    if(dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, t_collectable.y_pos + t_collectable.size) < 40 || 
       dist(gameChar_world_x, gameChar_y, t_collectable.x_pos + t_collectable.size * 4, t_collectable.y_pos + t_collectable.size) < 40)
    {
        t_collectable.isFound = true;
        biteSound.play();
        game_score += 1;
    }
}

// ----------------------------------
// Platform and Enemy functions
// ----------------------------------

//-Function to draw platforms-//
function createPlatforms(x, y, length)
{
    var p = {
                x: x,
                y: y,
                length: length,
                draw: function()
                {   
                    //front
                    fill(0, 150, 0);
                    rect(this.x, this.y, this.length, 10);

                    //side
                    fill(0, 130, 0);
                    quad(this.x + this.length, this.y, 
                        this.x + this.length, this.y + 10, 
                        this.x + this.length + 5,this.y + 3,
                        this.x + this.length + 5, this.y - 6);
                    
                    //top
                    stroke(0, 150, 0);
                    fill(0,180,0);
                    quad(this.x, this.y, 
                        this.x + this.length, this.y, 
                        this.x + this.length + 5, this.y - 6, 
                        this.x + 10, this.y - 6);
                    
                    //dark base
                    noStroke();
                    fill(129, 79, 19);
                    triangle(this.x + (this.length/4), this.y + 10, this.x + (this.length/2), this.y + 25, this.x + (this.length/1.35), this.y + 10);
                    
                    //light base
                    fill(175, 111, 76);
                    triangle(this.x, this.y + 10, this.x + (this.length/4), this.y + 20, this.x + (this.length/2), this.y + 10);
                    triangle(this.x + (this.length/2), this.y + 10, this.x + (this.length/1.35), this.y + 20, this.x + this.length, this.y + 10);
                },
                //check if character is on top of the platform
                checkContact: function(gc_x, gc_y)
                {
                    if(gc_x > this.x && gc_x < this.x + this.length)
                    {
                        var d = this.y - gc_y;
                        if(d >= -2 && d < 1)
                        {
                            return true;
                        }
                }
                return false;
                }
            }

    return p;
}

//-Function to draw enemies.-//
function Enemy(x, y, range, colour)
{
    this.x = x;
    this.y = y;
    this.range = range;
    this.currentX = x;
    this.colour = colour;
    this.isBackwards = false;

    //movement speed based on colour
    if(this.colour == "ginger")
    {
        this.inc = 1;
    }

    if(this.colour == "black")
    {
        this.inc = 3;
    }

    this.update = function()
    {
        this.currentX += this.inc;

        if(this.currentX >= this.x + this.range)
        {
            if(this.colour == "ginger")
            {
                if(this.range > 250)
                {
                    this.inc = -2;
                }
                else
                {
                    this.inc = -1;
                }
            }

            if(this.colour == "black")
            {
                this.inc = -3;
            }

            this.isBackwards = true;
        }
        else if(this.currentX <= this.x)
        {
            if(this.colour == "ginger")
            {
                this.inc = 1;
            }

            if(this.colour == "black")
            {
                this.inc = 3;
            }

            this.isBackwards = false;
        }
    }

    this.draw = function()
    {
        //enemy movement
        this.update();

        //rear elements for enemies walking backwards.
        if(this.isBackwards)
        {
            //colour
            if(this.colour == "ginger")
            {
                fill(240, 90, 0);
            }

            if(this.colour == "black")
            {
                fill(30);
            }

            //arm
            rect(this.currentX - 12, this.y + 22, 22, 5, 2);
            
            //leg
            rect(this.currentX + 4, this.y + 40, 5, 22, 2);
                        
            //face
            ellipse(this.currentX + 1, this.y + 13, 8);

            //tail
            beginShape();
            vertex(this.currentX + 15, this.y + 35);
            bezierVertex(this.currentX + 20, this.y + 35, this.currentX + 22, this.y + 32, this.currentX + 24, this.y + 30);
            bezierVertex(this.currentX + 25, this.y + 28, this.currentX + 26, this.y + 25, this.currentX + 26, this.y + 20);
            bezierVertex(this.currentX + 27, this.y + 19, this.currentX + 27, this.y + 18, this.currentX + 28, this.y + 19);
            bezierVertex(this.currentX + 29, this.y + 22, this.currentX + 28.5, this.y + 25, this.currentX + 27.5, this.y + 28);
            bezierVertex(this.currentX + 26, this.y + 34, this.currentX + 23, this.y + 36, this.currentX + 20, this.y + 39);
            vertex(this.currentX + 15, this.y + 41);
            endShape();
        }
        //rear elements for enemies walking forwards.
        else
        {
            //colour
            if(this.colour == "ginger")
            {
                fill(240, 90, 0);
            }

            if(this.colour == "black")
            {
                fill(30);
            }

            //arm
            rect(this.currentX + 5, this.y + 22, 22, 5, 2);

            //leg
            rect(this.currentX + 7, this.y + 40, 5, 22, 2);
            
            //face
            ellipse(this.currentX + 14, this.y + 13, 8);

            //tail
            beginShape();
            vertex(this.currentX, this.y + 35);
            bezierVertex(this.currentX - 5, this.y + 35, this.currentX - 7, this.y + 32, this.currentX - 9, this.y + 30);
            bezierVertex(this.currentX - 10, this.y + 28, this.currentX - 11, this.y + 25, this.currentX - 11, this.y + 20);
            bezierVertex(this.currentX - 12, this.y + 19, this.currentX - 12, this.y + 18, this.currentX - 13, this.y + 19);
            bezierVertex(this.currentX - 14, this.y + 22, this.currentX - 13.5, this.y + 25, this.currentX - 12.5, this.y + 28);
            bezierVertex(this.currentX - 11, this.y + 34, this.currentX - 8, this.y + 36, this.currentX - 5, this.y + 39);
            vertex(this.currentX, this.y + 41);
            endShape();
        }

        //main body of enemies
        //colour
        if(this.colour == "ginger")
        {
            fill(250, 100, 0);
        }

        if(this.colour == "black")
        {
            fill(50);
        }

        //head
        rect(this.currentX, this.y, 15, 20, 5);

        //body
        rect(this.currentX - 2, this.y + 18, 19, 25, 5);

        //antenna
        noFill();
        strokeWeight(0.5);
        stroke(0);
        beginShape();
        vertex(this.currentX + 7.5, this.y - 11);
        vertex(this.currentX + 7.5, this.y - 7);
        vertex(this.currentX + 8.5, this.y - 6);
        vertex(this.currentX + 6.5, this.y - 5);
        vertex(this.currentX + 7.5, this.y - 4);
        endShape();

        noStroke();

        fill(255,255,0);
        ellipse(this.currentX + 7.5, this.y - 11, 4);

        //front elements for enemies walking backwards.
        if(this.isBackwards)
        {
            //belly
            fill(250, 250, 200);
            rect(this.currentX - 2, this.y + 22, 5, 19, 2);
            
            //markings
            triangle(this.currentX + 8, this.y + 13, 
                    this.currentX + 15, this.y + 14, 
                    this.currentX + 15, this.y + 12);
            triangle(this.currentX + 9, this.y + 7, 
                    this.currentX + 15, this.y + 6, 
                    this.currentX + 15, this.y + 8);

            triangle(this.currentX + 8, this.y + 27, 
                    this.currentX + 17, this.y + 25, 
                    this.currentX + 17, this.y + 29);
            triangle(this.currentX + 8, this.y + 35, 
                    this.currentX + 17, this.y + 33, 
                    this.currentX + 17, this.y + 37);

            triangle(this.currentX + 6, this.y, 
                    this.currentX + 5, this.y, 
                    this.currentX + 5, this.y - 6);
            //colour
            if(this.colour == "ginger")
            {
            fill(255, 110, 0);
            }

            if(this.colour == "black")
            {
                fill(60);
            }

            //face
            ellipse(this.currentX + 2, this.y + 14, 8);

            //ear
            triangle(this.currentX + 13, this.y + 1, 
                    this.currentX + 5, this.y, 
                    this.currentX + 5, this.y - 8);
            
            //leg
            rect(this.currentX + 7, this.y + 38, 5, 26, 2);

            //arm
            rect(this.currentX - 10, this.y + 23, 22, 5, 2);

            //whiskers
            strokeWeight(0.5);
            stroke(255);
            line(this.currentX, this.y + 13.5, this.currentX + 4, this.y + 12);
            line(this.currentX, this.y + 14, this.currentX + 5, this.y + 14);
            line(this.currentX, this.y + 14.5, this.currentX + 4, this.y + 16);
            noStroke();

            //eye
            fill(50, 200, 50);
            ellipse(this.currentX + 2, this.y + 6, 6, 7);
            
            //pupil
            fill(0);
            ellipse(this.currentX + 2, this.y + 6, 2, 5);

            //nose
            fill(255, 192, 203);
            triangle(this.currentX + 2, this.y + 10, 
                    this.currentX - 1, this.y + 9, 
                    this.currentX - 2, this.y + 12);
        }
        //front elements for enemies walking forwards.
        else
        {
            //belly
            fill(250, 250, 200);
            rect(this.currentX + 12, this.y + 22, 5, 19, 2);

            //markings
            triangle(this.currentX + 7, this.y + 13, 
                    this.currentX, this.y + 14, 
                    this.currentX, this.y + 12);
            triangle(this.currentX + 6, this.y + 7, 
                    this.currentX, this.y + 6, 
                    this.currentX, this.y + 8);

            triangle(this.currentX + 7, this.y + 27, 
                    this.currentX - 2, this.y + 25, 
                    this.currentX - 2, this.y + 29);
            triangle(this.currentX + 7, this.y + 35, 
                    this.currentX - 2, this.y + 33, 
                    this.currentX - 2, this.y + 37);
            
            triangle(this.currentX + 9, this.y, 
                    this.currentX + 10, this.y, 
                    this.currentX + 10, this.y - 6);

            //colour
            if(this.colour == "ginger")
            {
            fill(255, 110, 0);
            }

            if(this.colour == "black")
            {
                fill(60);
            }

            //face
            ellipse(this.currentX + 13, this.y + 14, 8);

            triangle(this.currentX + 2, this.y + 1, 
                this.currentX + 10, this.y, 
                this.currentX + 10, this.y - 8);

            //leg
            rect(this.currentX + 4, this.y + 38, 5, 26, 2);

            //arm
            rect(this.currentX + 3, this.y + 23, 22, 5, 2);

            //whiskers
            strokeWeight(0.5);
            stroke(255);
            line(this.currentX + 15, this.y + 13.5, this.currentX + 11, this.y + 12);
            line(this.currentX + 15, this.y + 14, this.currentX + 10, this.y + 14);
            line(this.currentX + 15, this.y + 14.5, this.currentX + 11, this.y + 16);

            //ear
            noStroke();
            fill(250, 100, 0);
            
            //eye
            fill(50, 200, 50);
            ellipse(this.currentX + 13, this.y + 6, 6, 7);
            
            //pupil
            fill(0);
            ellipse(this.currentX + 13, this.y + 6, 2, 5);

            //nose
            fill(255, 192, 203);
            triangle(this.currentX + 13, this.y + 10, 
                    this.currentX + 16, this.y + 9, 
                    this.currentX + 17, this.y + 12);
        }
        
    }
    //check if character comes into contact with the enemy
    this.checkContact = function(gc_x, gc_y)
    {
        //variables for top and bottom halves of enemies
        var d = dist(gc_x, gc_y, this.currentX, this.y);
        var bottomD = dist(gc_x, gc_y, this.currentX, this.y + 40);

        if(d < 30)
        {
            return true;
        }

        if(bottomD < 30)
        {
            return true;
        }

        return false;
    }
}

//-Function to draw end of the world sign.-//
function drawSign()
{
    fill(165, 42, 42);
    rect(sign.xpos, sign.ypos, 5, 90);
    fill(195, 72, 42);
    rect(sign.xpos - 25, sign.ypos + 5, 55, 40);
    fill(150, 0, 0);
    textFont(signFont);
    textSize(15);
    textAlign(CENTER);
    if(sign.change == true)
    {
        fill(255);
        text("Told", sign.xpos + 3, sign.ypos + 23)
        text("You!", sign.xpos + 3, sign.ypos + 37)
    }
    else
    {
        text("Turn", sign.xpos + 3, sign.ypos + 23)
        text("Back!", sign.xpos + 3, sign.ypos + 37)
    }

}

//-Function to draw the finish point.-/
function drawDogHouse()
{
    push();
    strokeWeight(5);
    stroke(200, 200, 0);
    //flag pole
    line(dogHouse.x_pos + 20, floorPos_y, dogHouse.x_pos + 20, floorPos_y - 90);
    
    //flag and checks
    noStroke();
    fill(255, 0, 0);
    if(dogHouse.isReached)
    {
        rect(dogHouse.x_pos + 20, floorPos_y - 90, 20, 10);
    }
    else
    {
        rect(dogHouse.x_pos + 20, floorPos_y - 10, 20, 10);
    }
    
    //rear roof
    fill(244, 164, 96);
    triangle(dogHouse.x_pos + 10, floorPos_y - 65,
         dogHouse.x_pos + 20, floorPos_y - 60,
         dogHouse.x_pos - 5, floorPos_y - 60)
    
    //walls
    fill(145, 72, 42);
    rect(dogHouse.x_pos, floorPos_y - 60, 70, 60);
    rect(dogHouse.x_pos + 20, floorPos_y - 45, 70, 60);
    quad(dogHouse.x_pos, floorPos_y - 55,
         dogHouse.x_pos + 20, floorPos_y - 45,
         dogHouse.x_pos + 20, floorPos_y + 15,
         dogHouse.x_pos, floorPos_y);
    
    //door
    fill(60);
    quad(dogHouse.x_pos + 5, floorPos_y + 3,
         dogHouse.x_pos + 15, floorPos_y + 11,
         dogHouse.x_pos + 15, floorPos_y - 35,
         dogHouse.x_pos + 5, floorPos_y - 43)
    
    //front roof
    fill(244, 164, 96);
    quad(dogHouse.x_pos + 10, floorPos_y - 65,
         dogHouse.x_pos + 80, floorPos_y - 65,
         dogHouse.x_pos + 95, floorPos_y - 40,
         dogHouse.x_pos + 25, floorPos_y - 40);

    
    pop();
}

//-Function to check if the character has reached the finish point.-//
function checkdogHouse()
{
    var d = abs(gameChar_world_x - dogHouse.x_pos);
    
    if(d < 15)
    {
        dogHouse.isReached = true;
    }
}

