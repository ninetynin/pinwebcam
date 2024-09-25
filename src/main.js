const { appWindow } = window.__TAURI__.window;
const { invoke } = window.__TAURI__;

document
    .getElementById('titlebar-minimize')
    .addEventListener('click', () => appWindow.minimize());
document
    .getElementById('titlebar-maximize')
    .addEventListener('click', () => appWindow.toggleMaximize());
document
    .getElementById('titlebar-close')
    .addEventListener('click', () => appWindow.close());

const alwaysOnTopButton = document.getElementById('always-on-top');
const flipButton = document.getElementById('flip-button');
let videoFlipped = false;

async function updateAlwaysOnTopStatus() {
    try {
        const isAlwaysOnTop = await invoke('get_always_on_top_status');
        alwaysOnTopButton.textContent = `Always on Top: ${isAlwaysOnTop ? 'On' : 'Off'}`;
        alwaysOnTopButton.classList.toggle('active', isAlwaysOnTop);
    } catch (error) {
        console.error('Failed to get always on top status:', error);
    }
}

alwaysOnTopButton.addEventListener('click', async () => {
    try {
        await invoke('toggle_always_on_top');
        updateAlwaysOnTopStatus();
    } catch (error) {
        console.error('Failed to toggle always on top:', error);
    }
});

flipButton.addEventListener('click', () => {
    const video = document.getElementById('vid');
    videoFlipped = !videoFlipped;
    video.style.transform = videoFlipped ? 'scaleX(-1)' : 'scaleX(1)';
});

function hideTitleBar() {
    const titlebar = document.getElementById('titlebar');
    titlebar.classList.add('hidden');
}

function showTitleBar() {
    const titlebar = document.getElementById('titlebar');
    titlebar.classList.remove('hidden');
}

appWindow.onFocusChanged(({ focused }) => {
    if (focused) {
        showTitleBar();
    } else {
        hideTitleBar();
    }
});

document.addEventListener('mousemove', () => {
    showTitleBar();
});

updateAlwaysOnTopStatus();

document.addEventListener("DOMContentLoaded", () => {
    let video = document.getElementById("vid");
    let mediaDevices = navigator.mediaDevices;
    
    mediaDevices
        .getUserMedia({
            video: true,
            audio: false
        })
        .then((stream) => {
            video.srcObject = stream;
            video.addEventListener("loadedmetadata", () => {
                video.play();
            });
        })
        .catch((error) => {
            alert("Error accessing webcam: " + error.message);
        });
});
