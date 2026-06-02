const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = { x: canvas.width/2 - 25, y: canvas.height - 60, width: 50, height: 50, speed: 7.5 };
let score = 0;
let lives = 3;
let gameRunning = true;
let items = [];
let particles = []; // YENİ: Patlama efektleri için array
let environmentLeaves = []; // YENİ: Arka plan detayları
let baseSpeed = 1.8;
let speedCounter = 0;

// YENİ: Gelişmiş Atık Kategorileri
const ITEMS_DATA = [
    { type: 'plastic', symbol: '🥤', color: '#3399ff', isGood: true, label: 'PLASTİK' },
    { type: 'paper', symbol: '📦', color: '#ffcc66', isGood: true, label: 'KAĞIT' },
    { type: 'glass', symbol: '🍾', color: '#33cc99', isGood: true, label: 'CAM' },
    { type: 'toxic', symbol: '⚡', color: '#ff4d4d', isGood: false, label: 'TOKSİK' },
    { type: 'battery', symbol: '🔋', color: '#9933ff', isGood: false, label: 'BATARYA' }
];

// YENİ: Dinamik Hedef Sistemi (Combo için)
const GOOD_TYPES = ['PLASTİK', 'KAĞIT', 'CAM'];
let currentTarget = GOOD_TYPES[Math.floor(Math.random() * GOOD_TYPES.length)];

// Arka plan efektini doldur
for(let i=0; i<15; i++) {
    environmentLeaves.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 3 + 1, speed: Math.random() * 0.5 + 0.2 });
}

document.getElementById('restartButton').addEventListener('click', () => restartGame());

let left = false, right = false;
document.addEventListener('keydown', (e) => { if(e.key === 'ArrowLeft') left = true; if(e.key === 'ArrowRight') right = true; });
document.addEventListener('keyup', (e) => { if(e.key === 'ArrowLeft') left = false; if(e.key === 'ArrowRight') right = false; });

const btnLeft = document.getElementById('btnLeft');
const btnRight = document.getElementById('btnRight');
if(btnLeft && btnRight) {
    btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); left = true; });
    btnLeft.addEventListener('touchend', () => left = false);
    btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); right = true; });
    btnRight.addEventListener('touchend', () => right = false);
}

function spawnItem() {
    const rawData = ITEMS_DATA[Math.floor(Math.random() * ITEMS_DATA.length)];
    items.push({
        x: Math.random() * (canvas.width - 40),
        y: -30,
        width: 35,
        height: 35,
        ...rawData
    });
}

// YENİ: Parçacık Efekti Fonksiyonu
function createParticles(x, y, color) {
    for(let i=0; i<8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            alpha: 1,
            color: color
        });
    }
}

function collide(r1, r2) {
    return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
}

function update() {
    if(!gameRunning) return;
    if(left && player.x > 0) player.x -= player.speed;
    if(right && player.x < canvas.width - player.width) player.x += player.speed;

    // Arka plan kayması
    for(let leaf of environmentLeaves) {
        leaf.y += leaf.speed;
        if(leaf.y > canvas.height) leaf.y = -5;
    }

    // Parçacık güncelleme
    for(let i=0; i<particles.length; i++) {
        let p = particles[i];
        p.x += p.vx; p.y += p.vy; p.alpha -= 0.04;
        if(p.alpha <= 0) { particles.splice(i,1); i--; }
    }

    for(let i=0; i<items.length; i++) {
        const item = items[i];
        item.y += baseSpeed;
        if(collide(player, item)) {
            createParticles(item.x + 17, item.y + 17, item.color);
            if(item.isGood) {
                // COMBO KONTROLÜ: Eğer düşen çöp o anki hedefle eşleşiyorsa 2 katı puan!
                if(item.label === currentTarget) {
                    score += 20; 
                } else {
                    score += 10;
                }
                document.getElementById('scoreValue').innerText = score;
                // Hedefi rastgele değiştir
                if(Math.random() < 0.4) currentTarget = GOOD_TYPES[Math.floor(Math.random() * GOOD_TYPES.length)];
            } else {
                lives--;
                document.getElementById('livesValue').innerText = "❤️".repeat(lives) || "⚠️";
                if(lives <= 0) { gameRunning = false; alert('Game Over! Dünya kirliliğe yenik düştü. Skorun: ' + score); return; }
            }
            items.splice(i,1); i--;
        } else if(item.y > canvas.height) {
            if(item.isGood) { // İyi çöpü kaçırırsan ufak ceza
                score = Math.max(0, score - 2);
                document.getElementById('scoreValue').innerText = score;
            }
            items.splice(i,1); i--;
        }
    }
    speedCounter++;
    if(speedCounter > 120 && baseSpeed < 5.5) { baseSpeed += 0.1; speedCounter = 0; }
    if(score >= 200) { gameRunning = false; alert('🎉 TEBRİKLER! 🎉 Doğa koruyucusu oldun ve kazandın!'); }
    if(Math.random() < 0.025) spawnItem();
}

function draw() {
    // Arka plan düz yeşil yerine derinlikli doğa yeşili
    ctx.fillStyle = '#1e3f20';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Arka plan yaprak süzülmeleri
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for(let leaf of environmentLeaves) {
        ctx.beginPath();
        ctx.arc(leaf.x, leaf.y, leaf.size, 0, Math.PI * 2);
        ctx.fill();
    }

    // Toprak zemin
    ctx.fillStyle = '#4d804e';
    ctx.fillRect(0, canvas.height-20, canvas.width, 20);
    
    // Oyuncu karakteri
    ctx.fillStyle = '#ffcc66';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#552200';
    ctx.fillRect(player.x+10, player.y+12, 8, 8);
    ctx.fillRect(player.x+32, player.y+12, 8, 8);

    // Atıklar
    for(let item of items) {
        ctx.save();
        ctx.translate(item.x + item.width/2, item.y + item.height/2);
        ctx.rotate(Date.now() * 0.004);
        ctx.fillStyle = item.color;
        // Kenarlıkları yuvarlatılmış şık kutular
        ctx.fillRect(-item.width/2, -item.height/2, item.width, item.height);
        ctx.font = "22px 'Segoe UI Emoji'";
        ctx.fillStyle = 'black';
        ctx.fillText(item.symbol, -14, 8);
        ctx.restore();
    }

    // Parçacıkları Çiz
    for(let p of particles) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
    }

    // Arayüz Yazıları (UI Enhancement)
    ctx.font = "bold 15px monospace";
    ctx.fillStyle = '#aaffaa';
    ctx.fillText("HEDEF KUTU (2X PUAN): " + currentTarget, 15, 30);
    
    ctx.font = "12px monospace";
    ctx.fillStyle = 'white';
    ctx.fillText("Skor: " + score, 15, 55);
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
function restartGame() { 
    gameRunning = true; score = 0; lives = 3; baseSpeed = 1.8; items = []; particles = [];
    player.x = canvas.width/2 - 25; 
    currentTarget = GOOD_TYPES[Math.floor(Math.random() * GOOD_TYPES.length)];
    document.getElementById('scoreValue').innerText = "0"; 
    document.getElementById('livesValue').innerText = "❤️❤️❤️";
}

restartGame();
gameLoop();
