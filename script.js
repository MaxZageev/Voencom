import { scenes } from './scenes.js';
// хуй
window.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bg-music');
  const clickSound = document.getElementById('click-sound');
  const startButton = document.querySelector('.start-button');
  const endingsButton = document.querySelector('.endings-button');
  const startScreen = document.getElementById('start-screen');
  const sceneContainer = document.getElementById('scene-container');

  function showPopup(htmlContent) {
    const modal = document.getElementById('popup-modal');
    const content = document.getElementById('popup-content');
    content.innerHTML = htmlContent;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn';
    closeBtn.textContent = 'Закрыть';
    closeBtn.addEventListener('click', closePopup);
    content.appendChild(document.createElement('br'));
    content.appendChild(document.createElement('br'));
    content.appendChild(closeBtn);

    modal.classList.add('show');
  }

  function closePopup() {
    document.getElementById('popup-modal').classList.remove('show');
  }
  window.closePopup = closePopup;

  function markEndingAsSeen(sceneKey) {
    const scene = scenes[sceneKey];
    if (scene?.isEnding) {
      const seen = JSON.parse(localStorage.getItem('seenEndings')) || {};
      if (!seen[sceneKey]) {
        seen[sceneKey] = true;
        localStorage.setItem('seenEndings', JSON.stringify(seen));
      }
    }
  }

  function getAllEndingScenes() {
    return Object.entries(scenes)
      .filter(([_, scene]) => scene.isEnding)
      .map(([key]) => key);
  }

  function showEndingsPopup() {
    const seen = JSON.parse(localStorage.getItem('seenEndings')) || {};
    const allEndings = getAllEndingScenes();
    let html = '<h2>📘 Открытые концовки:</h2><ul>';
    for (const key of allEndings) {
      const status = seen[key] ? '✅' : '⬜';
      html += `<li>${status} <strong>${key}</strong></li>`;
    }
    html += '</ul>';
    showPopup(html);
  }

  endingsButton.addEventListener('click', showEndingsPopup);

  bgMusic.volume = 0.1;
  bgMusic.play().catch(e => console.log("Музыка не запустилась автоматически:", e));

  startButton.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play();
    setTimeout(() => {
      startScreen.classList.add('fade-out');
      sceneContainer.style.display = 'block';
      sceneContainer.classList.add('fade-in');
      renderScene('intro');
    }, 500);
  });

  window.showStartScreen = function () {
    sceneContainer.classList.remove('fade-in');
    sceneContainer.style.display = 'none';

    startScreen.classList.remove('fade-out');
    startScreen.style.opacity = '1';
    startScreen.style.display = 'flex';
  };

  function renderScene(sceneKey) {
    if (sceneKey === 'restart_game') {
      showStartScreen();
      return;
    }

    const scene = scenes[sceneKey];
    if (!scene) return;

    sceneContainer.innerHTML = '';

    const sceneDiv = document.createElement('div');
    sceneDiv.className = 'scene';
    sceneDiv.style.backgroundImage = `url('${scene.bg}')`;
if (scene.glitch) {
  sceneDiv.classList.add('scene--glitch');
}
    const textDiv = document.createElement('div');
    textDiv.className = 'scene__text';
    sceneDiv.appendChild(textDiv);

    const choicesDiv = document.createElement('div');
    choicesDiv.className = 'scene__choices';

    scene.choices.forEach(choice => {
      const button = document.createElement('button');
      button.className = 'btn';
      button.textContent = choice.text;
      button.addEventListener('click', () => {
        clickSound.currentTime = 0;
        clickSound.play();
        markEndingAsSeen(sceneKey);
        renderScene(choice.next);
      });
      choicesDiv.appendChild(button);
    });

    sceneDiv.appendChild(choicesDiv);
    sceneContainer.appendChild(sceneDiv);

    typeText(textDiv, scene.text);
  }
});

let typing = false;
let skipTyping = false;

function typeText(element, text, speed = 25, callback) {
  element.innerHTML = '';
  let i = 0;
  typing = true;
  skipTyping = false;
  const interval = setInterval(() => {
    if (skipTyping) {
      clearInterval(interval);
      element.innerHTML = text.replace(/\n/g, '<br>');
      element.scrollTop = element.scrollHeight; // scroll to bottom
      typing = false;
      callback && callback();
      return;
    }
    if (i < text.length) {
      element.innerHTML += text[i] === '\n' ? '<br>' : text[i];
      element.scrollTop = element.scrollHeight; // scroll to bottom
      i++;
    } else {
      clearInterval(interval);
      typing = false;
      callback && callback();
    }
  }, speed);
  element.onclick = () => {
    if (typing) {
      skipTyping = true;
    }
  };
}