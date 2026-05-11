const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: canvas.width/2 - 25, y: canvas.height - 60, width: 50, height: 50, speed: 7 };
let score = 0;
let gameRunning = true;
let items = [];
let baseSpeed = 2.5;
let speedCounter = 0;

const GOOD = 'good';
const BAD = 'bad';

document.getElementById('restartButton').addEventListener('click', () => restartGame());

let left = false, right = false;
document.addEventListener('keydown', (e) => { if(e.key === 'ArrowLeft') left = true; if(e.key === 'ArrowRight') right = true; });
document.addEventListener('keyup', (e) => { if(e.key === 'ArrowLeft') left = false; if(e.key === 'ArrowRight') right = false; });

function spawnItem() {
    const type = Math.random() < 0.6 ? GOOD : BAD;
    items.push({
        x: Math.random() * (canvas.width - 40),
        y: -30,
        width: 35,
        height: 35,
        type: type,
        color: type === GOOD ? '#aaffaa' : '#ffaaaa',
        symbol: type === GOOD ? '♻️' : '⚡'
    });
}

function collide(r1, r2) {
    return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
}

function update() {
    if(!gameRunning) return;
    if(left && player.x > 0) player.x -= player.speed;
    if(right && player.x < canvas.width - player.width) player.x += player.speed;

    for(let i=0; i<items.length; i++) {
        const item = items[i];
        item.y += baseSpeed;
        if(collide(player, item)) {
            if(item.type === GOOD) {
                score += 10;
                document.getElementById('scoreValue').innerText = score;
            } else {
                score -= 5;
                document.getElementById('scoreValue').innerText = score;
                if(score < 0) { gameRunning = false; alert('Game Over! You collected toxic waste. Restart.'); return; }
            }
            items.splice(i,1); i--;
        } else if(item.y > canvas.height) {
            items.splice(i,1); i--;
        }
    }
    speedCounter++;
    if(speedCounter > 30 && baseSpeed < 7) { baseSpeed += 0.2; speedCounter = 0; }
    if(score >= 100) { gameRunning = false; alert('🎉 YOU WIN! 🎉 Waste Warrior saves the Earth! Restart to play again.'); }
    if(Math.random() < 0.03) spawnItem();
}

function draw() {
    ctx.fillStyle = '#2c5e2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#5a9e4a';
    ctx.fillRect(0, canvas.height-20, canvas.width, 20);
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#552200';
    ctx.fillRect(player.x+10, player.y+12, 8, 8);
    ctx.fillRect(player.x+32, player.y+12, 8, 8);

    for(let item of items) {
        ctx.save();
        ctx.translate(item.x + item.width/2, item.y + item.height/2);
        ctx.rotate(Date.now() * 0.005);
        ctx.fillStyle = item.color;
        ctx.fillRect(-item.width/2, -item.height/2, item.width, item.height);
        ctx.font = "24px 'Segoe UI Emoji'";
        ctx.fillStyle = 'black';
        ctx.fillText(item.symbol, -15, 10);
        ctx.restore();
    }
    ctx.font = "bold 20px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText("Score: "+score, 15, 35);
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
function restartGame() { gameRunning = true; score = 0; baseSpeed = 2.5; items = []; player.x = canvas.width/2 - 25; document.getElementById('scoreValue').innerText = "0"; }

restartGame();
gameLoop();