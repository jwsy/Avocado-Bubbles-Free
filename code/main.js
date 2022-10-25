import kaboom from "kaboom";
import { Howl } from "howler";

k = kaboom({
  "fullscreen": true, "startScene": "main",
  "background": [125, 182, 235,]
});

// load assets
loadPedit("fire", "sprites/fire.pedit");
loadPedit("avocado", "sprites/avocado.pedit");
loadSound("avocado-o", "sounds/avocado-o.mp3");
// loadSound("o", "sounds/o.mp3");
loadSound("o", "sounds/pop.mp3");
loadSound("fire", "sounds/fire.mp3");
loadSound("J2edited", "sounds/J2edited.mp3");

const avocadoOSound = new Howl({
  src: ['sounds/avocado-o.mp3'],
  html5: true,
  format: ['mp3']
});

let startTime = -1;
let turbos = 0;
const TURBOMAX = 2;

const music = play("J2edited", {
  volume: 0.6,
  loop: true
});

scene("game", () => {
  // initialize context
  const PLAYER_SPEED = 200;
  let showStats = false;

  music.play();

  layers([
    "bg",
    "obj",
    "ui",
  ], "obj");

  // // implement touch
  let el = document.getElementsByTagName("canvas")[0];
  el.addEventListener("touchstart", handleTouchMouseStartMove, false);
  el.addEventListener("touchmove", handleTouchMouseStartMove, false);
  let epochTime = Date.now();
  startTime = Date.now();

  function findPos(obj) {
    var curleft = 0,
      curtop = 0;

    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);

      return { x: curleft - document.body.scrollLeft, y: curtop - document.body.scrollTop };
    }
  }

  function handleTouchMouseStartMove(evt) {
    evt.preventDefault();
    var el = document.getElementsByTagName("canvas")[0];
    clientRec = el.getBoundingClientRect();
    x = evt.targetTouches[0].pageX;
    y = evt.targetTouches[0].pageY;
    // console.log("hTMSM : ", clientRec, x, y);
    var curTime = Date.now();
    if (curTime - epochTime > 100) {
      epochTime = curTime
    }
    handleTTouch(x, y);
  }

  const avocado = add([
    sprite("avocado"),
    pos(width() / 2, height() / 2),
    origin("center"),
    "avocado",
    {
      isOFaced: false,
      lastOFaceTime: time(),
      dir: null,
      stopPoint: pos(width() / 2, height() / 2),
      dScale: 2
    },
    area(),
  ]);

  onClick('avocado', () => { play('avocado-o'); });
  onTouchStart((id, pos) => {
    console.log(`touched ${pos}, avocado ${avocado.pos}`);
    // console.log(`avocado tx pos ${pos.x - avocado.pos.x}`);
    // console.log(`avocado ty pos ${pos.y - avocado.pos.y}`);
    console.log(`avocado dist pos ${pos.dist(avocado.pos)}`);
    if (pos.dist(avocado.pos) < 150) {
      play('avocado-o');
    }
  });

  onUpdate("avocado", (r) => {
    if (r.isOFaced) {
      r.frame = 1;
      r.scale = vec2(avocado.dScale + Math.sin(2.5 * (time() - r.lastOFaceTime)) * 2.8);
      // console.log(time() - r.lastOFaceTime)
      var ct = time();
      if (ct - r.lastOFaceTime > 1.3) {
        r.frame = 0;
        r.lastOFaceTime = ct;
        r.isOFaced = false;
      }
    }
    else {
      r.scale = vec2(avocado.dScale + Math.sin(time()) * .1);
    }

    if (avocado.dir
      && avocado.pos.x > 0
      && avocado.pos.x < width()
      && avocado.pos.y > 0
      && avocado.pos.y < height()
      && Math.abs(avocado.pos.x - avocado.dir.pos.x) > 10
      && Math.abs(avocado.pos.y - avocado.dir.pos.y) > 10
    ) {
      let angleDeg = avocado.pos.angle(avocado.dir.pos) + 180;
      // console.log("moveAvocadoPos : avocado.pos = " + avocado.pos.x + "," + avocado.pos.y);
      // console.log("moveAvocadoPos : avocado.pos.angle(avocado.dir.pos) = " + angleDeg);
      let movX = Math.cos(angleDeg * Math.PI / 180) * PLAYER_SPEED;
      let movY = Math.sin(angleDeg * Math.PI / 180) * PLAYER_SPEED;
      avocado.move(movX, movY);
    }
    // else {
    //   avocado.move(0,0);
    // }
  });

  onKeyPress('s', () => {
    console.log('Toggle stats');
    showStats = !showStats;
    get('debugText').for
    Each((e) => { e.hidden = showStats; });
  });

  onKeyPress('t', () => {
    if (turbos > TURBOMAX) {
      add([
        pos(width() / 2, height() / 10),
        text("MAXIUMUM\nTURBO\nENGAGED", 32),
        origin("top")
      ]);
    }
    else {
      add([
        pos(width() / 2, height() / 10),
        text("\nTURBO\nENGAGED", 32),
        origin("top")
      ]);
      loop(.75, spawnEnemy);
      turbos++;
    }

  })

  function movePlayerLeft() {
    if (avocado.pos.x > 0) {
      avocado.dir = null;
      avocado.move(-PLAYER_SPEED, 0);
    }
  };

  function movePlayerRight() {
    if (avocado.pos.x < width()) {
      avocado.dir = null;
      avocado.move(PLAYER_SPEED, 0);
    }
  };

  function movePlayerUp() {
    if (avocado.pos.y > 0) {
      avocado.dir = null;
      avocado.move(0, -PLAYER_SPEED);
    }
  };

  function movePlayerDown() {
    if (avocado.pos.y < height()) {
      avocado.dir = null;
      avocado.move(0, PLAYER_SPEED);
    }
  };

  onKeyDown("left", movePlayerLeft);
  onKeyDown("right", movePlayerRight);
  onKeyDown("up", movePlayerUp);
  onKeyDown("down", movePlayerDown);

  function spawnEnemy() {
    let insertPos = pos(rand(10, width() - 10), rand(10, height() - 10));

    let enemySprite = "fire";
    // play('fire', { volume: 0.4 });

    return add([
      sprite(enemySprite),
      insertPos,
      "enemy",
      enemySprite,
      area()
    ]);
  }

  onUpdate("enemy", (e) => {
    // console.log(e);
    e.scale = vec2(.7 + 0.1 * Math.sin(time()));
  });

  onCollide("avocado", "enemy", (b, e) => {
    // console.log(JSON.stringify(e) );
    if (e.is("rainbowpoop")) {
      score.value += 10;
      shake(12);
    }
    else {
      score.value += 1;
      shake(b.dScale * 3);
    }
    destroy(e);
    addKaboom(e.pos);
    if (b.dScale < 4) {
      b.dScale = b.dScale + 0.1;
    } else if (score.value < 50) {
      score.value += 0;
    } else {
      go("end");
    }
    b.isOFaced = true;
    b.lastOFaceTime = time();
    score.text = score.value;
    play('o');
    spawnEnemy();
    spawnEnemy();
    spawnEnemy();
  });

  const score = add([
    pos(12, 12),
    text(0, {
      size: 36,
      font: "sinko",
    }),
    // all objects defaults origin to center, we want score text to be top left
    // plain objects becomes fields of score
    { value: 0 },
  ]);

  // display fps
  const fpsText = add([
    pos(width() * 0.6, 12),
    text("fps", { font: "sinko" }),
    { value: 0, },
    "debugText"
  ]);

  function updateFps() {
    fpsText.value = parseFloat(debug.fps()).toFixed(3);
    fpsText.text = "fps: " + fpsText.value;
  };
  loop(0.5, updateFps);

  const aPosText = add([pos(width() * 0.5, 24 * 2), text("apos: " + JSON.stringify(avocado.pos), {
    font: "sinko"
    , size: 24
  }), { value: 0 }, "debugText"]);

  // display mpos
  const mousePosText = add([pos(width() * 0.5, 24 * 3), text("mpos: no mouse detected", {
    font: "sinko",
    size: 24
  }), { value: 0 }, "debugText"]);

  function updateMousePosText() {
    mp = mousePos();
    // console.log("updateMousePosText.mp: ", JSON.stringify(mp));
    mousePosText.text = "mpos: " + JSON.stringify(mp);
    aPosText.text = "apos: " + JSON.stringify(avocado.pos);
    var curTime = Date.now();
    if (curTime - epochTime > 100) {
      epochTime = curTime
      // spawnBullet(player.pos);
    }
    console.log("updateMousePosText => " + JSON.stringify([mp.x, mp.y]));
    // avocado.moveTo(mp.x, mp.y);
    avocado.dir = pos(mp.x, mp.y);
    avocado.stopPoint = pos(mp.x, mp.y);
  };

  // display tpos
  const touchPosText = add([pos(width() * 0.5, 24 * 4), text("tpos: no touch detected", {
    font: "sinko",
    size: 24
  }), { value: 0 }, "debugText"]);

  function handleTTouch(x, y) {
    touchPosText.text = "tpos: " + JSON.stringify({ "x": Math.ceil(x), "y": Math.ceil(y), });
    aPosText.text = "apos: " + JSON.stringify(avocado.pos);
    console.log("handleTTouch : touchPosText.text", touchPosText.text);
    // console.log("avocado.pos", avocado.pos);
    avocado.dir = pos(x, y);
    avocado.stopPoint = pos(x, y);
  };

  onMouseDown(updateMousePosText);

  get('debugText').forEach((e) => { e.hidden = true; });
  // spawn an enemy every period
  loop(.8, spawnEnemy);
  // play('avocado-o');  
});

scene("main", () => {
  const bg = add([
    pos(width() / 2, height() / 10),
    text("avocado-bubbles\nby replit@jwsy \n\npop 55 BUBBLES\n\nClick me to start", 32),
    origin("top"),
  ]);

  const musics = add([
    pos(width() / 2, height()),
    text("Music @B-Diggs-1\n\"Just Two\"\non Soundcloud", {
      size: 32,
      font: "apl386o"
    }),
    origin("bot"),
    layer("ui"),
    area()
  ]);

  const startGame = () => {
    console.log("main => game");
    // for some strange reason I need to play a sound with Howler ONCE
    avocadoOSound.play();
    go("game");
  };

  const avocado = add([
    sprite("avocado"),
    pos(width() / 2, height() * 3 / 4),
    origin("center"),
    "avocado",
    scale(2),
    {
      isOFaced: false,
      lastOFaceTime: time()
    },
    area(),
  ]);

  onTouchStart((id, pos) => {
    console.log(`touched ${pos}, avocado ${avocado.pos}`);
    // console.log(`avocado tx pos ${pos.x - avocado.pos.x}`);
    // console.log(`avocado ty pos ${pos.y - avocado.pos.y}`);
    console.log(`avocado dist pos ${pos.dist(avocado.pos)}`);
    if (pos.dist(avocado.pos) < 150) {
      startGame();
    }
    if (pos.dist(musics.pos) < 150) {
      console.log('musics from scene start')
      window.location.assign('https://soundcloud.com/b-diggs-1/just-two')
    }
  });

  onKeyDown("space", startGame);
  onClick('avocado', startGame);

});

scene("end", () => {

  layers([
    "obj",
    "ui",
  ], "obj");

  turbos = 0;

  let totalTime = Date.now() - startTime;

  const bg = add([
    pos(width() / 2, height() / 10),
    text("thank you!\n" + totalTime / 1000 + "s\n55 BUBBLES popped!\n\nby replit@jwsy\n\nclick me to play again", 32),
    origin("top"),
    layer("ui")
  ]);

  const musics = add([
    pos(width() / 2, height()),
    text("Music @B-Diggs-1\n\"Just Two\"\non Soundcloud", {
      size: 32,
      font: "apl386o"
    }),
    origin("bot"),
    layer("obj"),
    "musics",
    area()
  ]);


  const startGame = () => {
    console.log("end => game");
    // for some strange reason I need to play a sound with Howler ONCE
    avocadoOSound.play();
    go("game");
  };

  const avocado = add([
    sprite("avocado"),
    pos(width() / 2, height() * 2 / 3),
    origin("center"),
    "avocado",
    layer("obj"),
    scale(12),
    {
      isOFaced: false,
      lastOFaceTime: time()
    },
    area()
  ]);

  onTouchStart((id, pos) => {
    console.log(`touched ${pos}, avocado ${avocado.pos}`)
    // console.log(`avocado tx pos ${pos.x - avocado.pos.x}`);
    // console.log(`avocado ty pos ${pos.y - avocado.pos.y}`);
    console.log(`avocado dist pos ${pos.dist(avocado.pos)}`)
    if (pos.dist(avocado.pos) < 250) {
      console.log('startGame from scene end')
      startGame()
    }
    if (pos.dist(musics.pos) < 150) {
      console.log('musics from scene end')
      window.location.assign('https://soundcloud.com/b-diggs-1/just-two')
    }
  });

  onClick("musics", () => {
    
  })
  onKeyDown("space", startGame);
  onClick('avocado', startGame);

});

go("main");
