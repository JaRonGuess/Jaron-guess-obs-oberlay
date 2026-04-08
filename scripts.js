document.addEventListener('DOMContentLoaded', () => {
    // --- Part 1: Generate Floating Question Marks ---
    const backgroundWrapper = document.getElementById('background-wrapper');

    if (backgroundWrapper) {
        // Create multiple question marks (e.g., 40 for good coverage)
        for (let i = 0; i < 40; i++) {
            const questionMark = document.createElement('span');
            questionMark.textContent = '?';
            questionMark.className = 'question-mark';

            // Set random position (left/top) across the screen
            questionMark.style.left = `${Math.random() * 100}%`;
            questionMark.style.top = `${Math.random() * 100}%`;

            // Optional: Randomize initial transparency slightly for visual depth
            questionMark.style.opacity = `${0.3 + Math.random() * 0.5}`;

            backgroundWrapper.appendChild(questionMark);
        }
    }

    // --- Part 2: Switch Scenes (Already exists, just cleaned up) ---
    // This checks the URL for ?scene=name, defaulting to 'gaming-chat'
    const urlParams = new URLSearchParams(window.location.search);
    const scene = urlParams.get('scene') || 'gaming-chat';

    // Hide all scenes
    document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));

    // Show the one we want
    const activeScene = document.getElementById(scene);
    if (activeScene) {
        activeScene.classList.add('active');
    }
});