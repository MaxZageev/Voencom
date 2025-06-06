// script.js


import { scenes } from './scenes.js';

// script.js



const allEndings = {
  ending_pro_it: '🧰 Айтишник в армии',
  ending_psy_art: '🌀 Псих-арт хаос',
  ending_digital_ghost_good: '👻 Цифровой призрак',
  ending_digital_ghost_bad: '📉 Обнаружен',
  ending_true_end: '💤 Истинный конец'
};

window.addEventListener('DOMContentLoaded', () => {
  const bgMusic = document.getElementById('bg-music');
  const clickSound = document.getElementById('click-sound');
  const startButton = document.querySelector('.start-button');
  const sceneContainer = document.getElementById('scene-container');
  const endingsButton = document.querySelector('.endings-button');
  const startScreen = document.getElementById('start-screen');

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

  function markEndingAsSeen(key) {
    const seen = JSON.parse(localStorage.getItem('seenEndings')) || {};
    if (!seen[key]) {
      seen[key] = true;
      localStorage.setItem('seenEndings', JSON.stringify(seen));
    }
  }

  endingsButton.addEventListener('click', () => {
    const seen = JSON.parse(localStorage.getItem('seenEndings')) || {};
    let html = '<h2>📘 Открытые концовки:</h2><ul>';
    for (const key in allEndings) {
      const status = seen[key] ? '✅' : '⬜';
      html += `<li>${status} <strong>${allEndings[key]}</strong></li>`;
    }
    html += '</ul>';
    showPopup(html);
  });

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

function renderChoices(container, choices) {
  container.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = choice.text;
    btn.onclick = () => renderScene(choice.next);
    container.appendChild(btn);
  });
}

function renderScene(sceneKey) {
  const container = document.getElementById('scene-container');
  const scene = scenes[sceneKey];
  if (!scene) {
    console.error('Сцена не найдена:', sceneKey);
    return;
  }
  if (Object.keys(allEndings).includes(sceneKey)) {
    markEndingAsSeen(sceneKey);
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
      if (scene.choices && Array.isArray(scene.choices)) {
        renderChoices(choicesContainer, scene.choices);
      }
    });
    container.style.opacity = 1;
  }, 300);
}


// Загружаем сцены из внешнего файла, если нужно, или добавим scenes = {...} здесь вручную