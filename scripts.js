// This checks the URL for ?scene=name
const urlParams = new URLSearchParams(window.location.search);
const scene = urlParams.get('scene') || 'gaming-chat';

// Hide all scenes
document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));

// Show the one we want
const activeScene = document.getElementById(scene);
if (activeScene) {
    activeScene.classList.add('active');
}