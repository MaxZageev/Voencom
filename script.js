import { scenes } from './scenes.js';


// script.js
window.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bg-music');
  const clickSound = document.getElementById('click-sound');
  const startButton = document.querySelector('.start-button');
  const startScreen = document.getElementById('start-screen');
  const sceneContainer = document.getElementById('scene-container');

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
      typing = false;
      callback && callback();
      return;
    }

    if (i < text.length) {
      element.innerHTML += text[i] === '\n' ? '<br>' : text[i];
      i++;
    } else {
      clearInterval(interval);
      typing = false;
      callback && callback();
    }
  }, speed);

  element.onclick = () => {
    if (typing) skipTyping = true;
  };
}

function renderChoices(choicesContainer, choices) {
  choicesContainer.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = choice.text;
    btn.onclick = () => renderScene(choice.next);
    choicesContainer.appendChild(btn);
  });
}

function renderScene(sceneKey) {
  const scene = scenes[sceneKey];
  const container = document.getElementById('scene-container');

  if (!scene) {
    console.error('Сцена не найдена:', sceneKey);
    return;
  }

  container.style.opacity = 0;

  setTimeout(() => {
    container.innerHTML = `
      <div class="scene ${sceneKey === 'scene_police_intervention' ? 'scene--glitch' : ''}" style="background-image: url('${scene.bg}')">
        <div class="scene__text"><p id="scene-text"></p></div>
        <div class="scene__choices" id="scene-choices"></div>
      </div>
    `;

    const textElement = document.getElementById('scene-text');
    const choicesContainer = document.getElementById('scene-choices');

    typeText(textElement, scene.text, 20, () => {
      if (scene.choices) renderChoices(choicesContainer, scene.choices);
    });

    container.style.opacity = 1;
  }, 300);
}

// Загружаем сцены из внешнего файла, если нужно, или добавим scenes = {...} здесь вручную