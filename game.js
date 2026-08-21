const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const overlay = document.querySelector('#overlay');
const overlayTitle = document.querySelector('#overlayTitle');
const overlayText = document.querySelector('#overlayText');
const startButton = document.querySelector('#startButton');
const scoreEl = document.querySelector('#score');
const highScoreEl = document.querySelector('#highScore');
const soundButton = document.querySelector('#soundButton');

const SIZE = 20;
let snake, food, direction, pendingDirection, score, running, timer, muted = false;
let highScore = Number(localStorage.getItem('snakeHighScore') || 0);
highScoreEl.textContent = highScore;

function reset() {
  snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  direction = { x: 1, y: 0 };
  pendingDirection = direction;
  score = 0;
  scoreEl.textContent = score;
  food = spawnFood();
}

function spawnFood() {
  let point;
  do point = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
  while (snake.some(part => part.x === point.x && part.y === point.y));
  return point;
}

function setDirection(next) {
  if (!running || (next.x === -direction.x && next.y === -direction.y)) return;
  pendingDirection = next;
}

function draw() {
  const cell = canvas.width / SIZE;
  ctx.fillStyle = '#141d2c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#1e2a40';
  ctx.lineWidth = 1;
  for (let i = 1; i < SIZE; i++) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, canvas.height); ctx.moveTo(0, i * cell); ctx.lineTo(canvas.width, i * cell); ctx.stroke(); }
  ctx.fillStyle = '#ff6682';
  ctx.beginPath(); ctx.arc((food.x + .5) * cell, (food.y + .5) * cell, cell * .29, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a6f5b4';
  snake.forEach((part, index) => { ctx.fillStyle = index === 0 ? '#74e69c' : '#a6f5b4'; ctx.fillRect(part.x * cell + 3, part.y * cell + 3, cell - 6, cell - 6); });
}

function tick() {
  direction = pendingDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  const ate = head.x === food.x && head.y === food.y;
  if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE || snake.some(part => part.x === head.x && part.y === head.y)) return gameOver();
  snake.unshift(head);
  if (ate) { score++; scoreEl.textContent = score; food = spawnFood(); beep(520); } else snake.pop();
  draw();
}

function start() { clearInterval(timer); reset(); running = true; overlay.classList.add('hidden'); draw(); timer = setInterval(tick, 125); }
function gameOver() { clearInterval(timer); running = false; if (score > highScore) { highScore = score; localStorage.setItem('snakeHighScore', highScore); highScoreEl.textContent = highScore; } overlayTitle.textContent = 'Игра окончена'; overlayText.textContent = `Ваш счёт: ${score}`; startButton.textContent = 'Играть снова'; overlay.classList.remove('hidden'); beep(140); }
function beep(freq) { if (muted) return; const AudioCtx = window.AudioContext || window.webkitAudioContext; const audio = new AudioCtx(); const oscillator = audio.createOscillator(); const gain = audio.createGain(); oscillator.frequency.value = freq; gain.gain.setValueAtTime(.06, audio.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .09); oscillator.connect(gain).connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + .09); }

document.querySelectorAll('[data-direction]').forEach(button => button.addEventListener('click', () => setDirection({ up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} }[button.dataset.direction])));
document.addEventListener('keydown', event => { const key = event.key.replace('Arrow', '').toLowerCase(); const map = { w:'up', a:'left', s:'down', d:'right', up:'up', down:'down', left:'left', right:'right' }; if (map[key]) { event.preventDefault(); setDirection({ up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} }[map[key]]); } });
let startTouch;
canvas.addEventListener('touchstart', event => { startTouch = event.changedTouches[0]; }, { passive:true });
canvas.addEventListener('touchend', event => { const end = event.changedTouches[0], dx = end.clientX - startTouch.clientX, dy = end.clientY - startTouch.clientY; if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return; setDirection(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) }); }, { passive:true });
soundButton.addEventListener('click', () => { muted = !muted; soundButton.textContent = muted ? '🔇' : '🔊'; });
startButton.addEventListener('click', start);
reset(); draw();
