// ==================================================
// Link Pad — محرك الألعاب البسيطة (شاشة العرض على الكمبيوتر)
// ==================================================

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('game-status');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setStatus(text, visible = true) {
  statusEl.textContent = text;
  statusEl.classList.toggle('hidden', !visible);
}

// ---------- الاتصال بالسيرفر كـ "شاشة عرض" ----------
let ws;
function connect() {
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  ws = new WebSocket(`${protocol}://${location.host}/ws-display`);

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }

    if (data.type === 'game-select') {
      selectGame(data.game);
    } else if (data.type === 'game-input') {
      if (activeGame && activeGame.handleInput) {
        activeGame.handleInput(data);
      }
    }
  };

  ws.onclose = () => setTimeout(connect, 1500);
}
connect();

// ==================================================
// إدارة اللعبة النشطة
// ==================================================
let activeGame = null;
let lastTime = performance.now();

const GAMES = {}; // بيتسجل فيها كل لعبة بالاسم

function registerGame(name, gameFactory) {
  GAMES[name] = gameFactory;
}

function selectGame(name) {
  if (!GAMES[name]) return;
  activeGame = GAMES[name](ctx, canvas);
  setStatus('', false);
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05); // نحدد أقصى فرق زمني عشان نمنع قفزات غريبة
  lastTime = now;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activeGame) {
    activeGame.update(dt);
    activeGame.draw(ctx, canvas);
  } else {
    drawWaitingScreen();
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function drawWaitingScreen() {
  ctx.fillStyle = '#171717';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#3A3A38';
  ctx.font = 'bold 28px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🎮 Link Pad', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '16px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
  ctx.fillStyle = '#9B978D';
  ctx.fillText('في انتظار اختيار لعبة من الموبايل...', canvas.width / 2, canvas.height / 2 + 15);
}

// ==================================================
// لعبة 1: الجري والقفز (Runner)
// ==================================================
registerGame('runner', function (ctx, canvas) {
  const GROUND_RATIO = 0.75; // نسبة ارتفاع الأرض من الشاشة
  const GRAVITY = 2600;
  const JUMP_VELOCITY = -900;
  const PLAYER_SIZE = 46;
  const PLAYER_X = 120;

  let groundY = canvas.height * GROUND_RATIO;
  let playerY = groundY - PLAYER_SIZE;
  let velocityY = 0;
  let onGround = true;

  let obstacles = [];
  let speed = 420;
  let spawnTimer = 0;
  let score = 0;
  let state = 'waiting'; // waiting | playing | gameover

  function reset() {
    groundY = canvas.height * GROUND_RATIO;
    playerY = groundY - PLAYER_SIZE;
    velocityY = 0;
    onGround = true;
    obstacles = [];
    speed = 420;
    spawnTimer = 0;
    score = 0;
    state = 'playing';
  }

  function jump() {
    if (state === 'waiting') {
      reset();
      return;
    }
    if (state === 'gameover') {
      reset();
      return;
    }
    if (onGround) {
      velocityY = JUMP_VELOCITY;
      onGround = false;
    }
  }

  function spawnObstacle() {
    const h = 40 + Math.random() * 50;
    obstacles.push({ x: canvas.width + 20, w: 28 + Math.random() * 20, h });
  }

  return {
    handleInput(data) {
      if (data.action === 'jump') jump();
    },

    update(dt) {
      groundY = canvas.height * GROUND_RATIO;

      if (state !== 'playing') return;

      // فيزياء القفز
      velocityY += GRAVITY * dt;
      playerY += velocityY * dt;
      if (playerY >= groundY - PLAYER_SIZE) {
        playerY = groundY - PLAYER_SIZE;
        velocityY = 0;
        onGround = true;
      }

      // العقبات
      speed += dt * 6; // تسريع تدريجي
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnObstacle();
        spawnTimer = Math.max(0.6, 1.6 - speed / 700);
      }

      for (const ob of obstacles) ob.x -= speed * dt;
      obstacles = obstacles.filter((ob) => ob.x + ob.w > -20);

      // تصادم
      for (const ob of obstacles) {
        const obY = groundY - ob.h;
        const hit =
          PLAYER_X + PLAYER_SIZE * 0.7 > ob.x &&
          PLAYER_X + PLAYER_SIZE * 0.3 < ob.x + ob.w &&
          playerY + PLAYER_SIZE * 0.7 > obY;
        if (hit) {
          state = 'gameover';
        }
      }

      score += dt * 10;
    },

    draw(ctx, canvas) {
      // خلفية
      ctx.fillStyle = '#171717';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // الأرض
      ctx.strokeStyle = '#3A3A38';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // اللاعب
      ctx.fillStyle = '#FF4F1F';
      ctx.beginPath();
      ctx.roundRect(PLAYER_X, playerY, PLAYER_SIZE, PLAYER_SIZE, 10);
      ctx.fill();

      // العقبات
      ctx.fillStyle = '#D92D20';
      for (const ob of obstacles) {
        ctx.fillRect(ob.x, groundY - ob.h, ob.w, ob.h);
      }

      // النتيجة
      ctx.fillStyle = '#F2EFE8';
      ctx.font = 'bold 22px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`النتيجة: ${Math.floor(score)}`, canvas.width - 30, 45);

      if (state === 'waiting') {
        centerText('🏃 دوس "قفز" في الموبايل عشان تبدأ');
      } else if (state === 'gameover') {
        centerText(`💥 خسرت! النتيجة: ${Math.floor(score)} — دوس "قفز" للإعادة`);
      }

      function centerText(text) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(text, canvas.width / 2, canvas.height * 0.3);
      }
    },
  };
});

// ==================================================
// لعبة 2: متاهة الكرة (Tilt Maze)
// ==================================================
registerGame('maze', function (ctx, canvas) {
  // كل مستوى: حدود المتاهة + جدران داخلية + نقطة البداية + نقطة الهدف
  const LEVELS = [
    {
      walls: [
        { x: 0.2, y: 0.15, w: 0.6, h: 0.04 },
        { x: 0.2, y: 0.15, w: 0.04, h: 0.4 },
        { x: 0.55, y: 0.4, w: 0.3, h: 0.04 },
        { x: 0.3, y: 0.65, w: 0.5, h: 0.04 },
      ],
      start: { x: 0.28, y: 0.25 },
      goal: { x: 0.85, y: 0.85 },
    },
    {
      walls: [
        { x: 0.1, y: 0.3, w: 0.5, h: 0.04 },
        { x: 0.4, y: 0.3, w: 0.04, h: 0.4 },
        { x: 0.4, y: 0.66, w: 0.5, h: 0.04 },
        { x: 0.7, y: 0.4, w: 0.04, h: 0.3 },
      ],
      start: { x: 0.15, y: 0.15 },
      goal: { x: 0.85, y: 0.15 },
    },
  ];

  let levelIndex = 0;
  const BALL_RADIUS = 16;
  let ballX, ballY, vx, vy;
  let tiltX = 0;
  let tiltY = 0;
  let won = false;
  let winTimer = 0;

  function loadLevel(idx) {
    const level = LEVELS[idx % LEVELS.length];
    ballX = level.start.x * canvas.width;
    ballY = level.start.y * canvas.height;
    vx = 0;
    vy = 0;
    won = false;
    winTimer = 0;
  }
  loadLevel(levelIndex);

  function getWallsPx() {
    const level = LEVELS[levelIndex % LEVELS.length];
    return level.walls.map((w) => ({
      x: w.x * canvas.width,
      y: w.y * canvas.height,
      w: w.w * canvas.width,
      h: w.h * canvas.height,
    }));
  }

  function circleRectCollision(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return { hit: dx * dx + dy * dy < r * r, dx, dy };
  }

  return {
    handleInput(data) {
      if (data.axis === 'tilt-x') tiltX = data.value;
      if (data.axis === 'tilt-y') tiltY = data.value;
    },

    update(dt) {
      if (won) {
        winTimer += dt;
        if (winTimer > 1.2) {
          levelIndex += 1;
          loadLevel(levelIndex);
        }
        return;
      }

      const ACCEL = 1800;
      const FRICTION = 0.92;
      vx += tiltX * ACCEL * dt;
      vy += tiltY * ACCEL * dt; // tiltY سالب = للأمام (زي الجيروسكوب في العصا)
      vx *= FRICTION;
      vy *= FRICTION;

      ballX += vx * dt;
      ballY += vy * dt;

      // حدود الشاشة
      ballX = Math.max(BALL_RADIUS, Math.min(canvas.width - BALL_RADIUS, ballX));
      ballY = Math.max(BALL_RADIUS, Math.min(canvas.height - BALL_RADIUS, ballY));

      // تصادم الجدران (رد فعل بسيط: نلغي السرعة في اتجاه التصادم)
      for (const wall of getWallsPx()) {
        const { hit, dx, dy } = circleRectCollision(ballX, ballY, BALL_RADIUS, wall);
        if (hit) {
          if (Math.abs(dx) > Math.abs(dy)) {
            ballX += dx > 0 ? BALL_RADIUS - Math.abs(dx) : -(BALL_RADIUS - Math.abs(dx));
            vx = 0;
          } else {
            ballY += dy > 0 ? BALL_RADIUS - Math.abs(dy) : -(BALL_RADIUS - Math.abs(dy));
            vy = 0;
          }
        }
      }

      // الوصول للهدف
      const level = LEVELS[levelIndex % LEVELS.length];
      const goalX = level.goal.x * canvas.width;
      const goalY = level.goal.y * canvas.height;
      const dGoal = Math.hypot(ballX - goalX, ballY - goalY);
      if (dGoal < BALL_RADIUS + 20) {
        won = true;
      }
    },

    draw(ctx, canvas) {
      ctx.fillStyle = '#171717';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // الجدران
      ctx.fillStyle = '#3A3A38';
      for (const wall of getWallsPx()) {
        ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      }

      // الهدف
      const level = LEVELS[levelIndex % LEVELS.length];
      ctx.fillStyle = '#1F9D55';
      ctx.beginPath();
      ctx.arc(level.goal.x * canvas.width, level.goal.y * canvas.height, 20, 0, Math.PI * 2);
      ctx.fill();

      // الكرة
      ctx.fillStyle = '#FF4F1F';
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // نص المستوى
      ctx.fillStyle = '#F2EFE8';
      ctx.font = 'bold 18px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`المستوى ${(levelIndex % LEVELS.length) + 1}`, canvas.width - 30, 40);

      if (won) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 26px "IBM Plex Sans Arabic", "IBM Plex Sans", sans-serif';
        ctx.fillStyle = '#1F9D55';
        ctx.fillText('🎉 وصلت! المستوى الجاي...', canvas.width / 2, canvas.height * 0.15);
      }
    },
  };
});
