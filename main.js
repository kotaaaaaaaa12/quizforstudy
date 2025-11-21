let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

let phModeActivated = false;
let phModeDeactivated = false;

let originalStylesheetHref = 'style.css';
let originalFaviconHref = 'favicon.ico';
const originalTitle = 'ランダムクイズ';
const originalH1 = 'ランダムクイズ';

function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[，、。・･]/g, ',')
    .replace(/[\uff0c\uff0e\uff65]/g, ',')
    .replace(/\s+/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  displaySubjectButtons();
});

function displaySubjectButtons() {
  const subjectButtons = document.getElementById('subjectButtons');
  subjectButtons.style.display = 'block';

  const subjects = [
    { id: 'douonigigo', name: '同音異義語', jsonFile: 'json/1.json' },
    { id: 'douonigigo', name: '同訓異字', jsonFile: 'json/2.json' }
  ];

  subjects.forEach(subject => {
    const button = document.createElement('button');
    button.id = subject.id;
    button.textContent = subject.name;
    button.addEventListener('click', () => {
      fetchQuestions(subject.jsonFile);
      subjectButtons.style.display = 'none';
      document.getElementById('questionCountSection').style.display = 'block';
      document.getElementById('selectMessage').style.display = 'none';
    });
    subjectButtons.appendChild(button);
  });
}

function fetchQuestions(jsonFile) {
  fetch(jsonFile)
    .then(r => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(data => {
      quizData = data;
      document.getElementById('maxQuestions').textContent = quizData.length;
      document.getElementById('numQuestions').max = quizData.length;
    })
    .catch(e => {
      console.error(e);
      alert('データ取得失敗');
    });
}

document.getElementById('startQuiz').addEventListener('click', () => {
  const numQuestions = +document.getElementById('numQuestions').value;
  if (numQuestions < 1 || numQuestions > quizData.length) {
    alert(`問題数は1〜${quizData.length}で指定してください`);
    return;
  }
  startTime = new Date();
  correctAnswers = 0;
  document.getElementById('questionCountSection').style.display = 'none';
  startQuiz(selectRandomQuestions(numQuestions));
});

function selectRandomQuestions(n) {
  const ret = [], used = new Set();
  while (ret.length < n) {
    const i = Math.floor(Math.random() * quizData.length);
    if (!used.has(i)) {
      used.add(i);
      ret.push(quizData[i]);
    }
  }
  return ret;
}

function startQuiz(questions) {
  currentQuestions = questions;
  mistakeQuestions = [];
  currentIndex = 0;
  document.getElementById('quizContainer').innerHTML = '';
  ['retryMistakes', 'resetQuiz', 'stats'].forEach(id =>
    document.getElementById(id).style.display = 'none'
  );
  renderQuestion();
}

function renderQuestion() {
  const c = document.getElementById('quizContainer');
  c.innerHTML = '';

  if (currentIndex < currentQuestions.length) {
    const qi = currentQuestions[currentIndex];
    const div = document.createElement('div');
    div.className = 'question';
    div.innerHTML = `
      <p>${currentIndex + 1}. ${qi.question}</p>
      <input type="text" class="answer-input" id="answerInput">
      <button id="answerButton" onclick="checkAnswer('${qi.answer}')">解答</button>
    `;
    c.appendChild(div);
  } else finishQuiz();
}

function checkAnswer(correctAnswer) {
  const ai = document.getElementById('answerInput');
  const answerInput = ai.value;
  const inp = normalize(answerInput);

  if (inp === 'pornhub') {
    if (!phModeActivated) {
      const audio = new Audio('ph/intro.mp3');
      audio.play().catch(e => console.warn('音声再生できなかった:', e));
      activatePornhubTheme();
    }
    return;
  }

  if (inp === 'unpornhub') {
    if (phModeActivated && !phModeDeactivated) {
      deactivatePornhubTheme();
      playPornhubReverseAudio();
    }
    return;
  }

  const btn = document.getElementById('answerButton');
  if (btn) btn.disabled = true;

  const feedback = document.createElement('div');
  feedback.className = 'feedback';

  const arr = correctAnswer.split(',').map(a => normalize(a));

  if (arr.includes(inp)) {
    feedback.textContent = '⭕';
    feedback.classList.add('correct');
    correctAnswers++;
    document.getElementById('correctSound')?.play();
  } else {
    feedback.textContent = '❌';
    feedback.classList.add('incorrect');
    document.getElementById('incorrectSound')?.play();
    const ca = document.createElement('div');
    ca.className = 'correct-answer';
    ca.textContent = `正しい答え: ${correctAnswer.replace(/,/g, ' or ')}`;
    document.querySelector('.question').appendChild(ca);
    mistakeQuestions.push(currentQuestions[currentIndex]);
  }

  document.querySelector('.question').appendChild(feedback);
  currentIndex++;
  setTimeout(renderQuestion, 2000);
}

function finishQuiz() {
  endTime = new Date();
  const diff = Math.floor((endTime - startTime) / 1000);
  const timeTaken = `${Math.floor(diff / 60)}分${diff % 60}秒`;

  const qc = document.getElementById('quizContainer');
  qc.innerHTML = '<p>クイズが終了しました。</p>';

  const stats = document.getElementById('stats');
  stats.style.display = 'block';
  stats.innerHTML = `
    <p>正答率: ${correctAnswers}/${currentQuestions.length}</p>
    <p>時間: ${timeTaken}</p>
  `;

  if (mistakeQuestions.length) {
    const btn = document.getElementById('retryMistakes');
    btn.style.display = 'inline-block';
    btn.onclick = () => {
      correctAnswers = 0;
      startTime = new Date();
      startQuiz(mistakeQuestions);
    };
  } else {
    document.getElementById('resetQuiz').style.display = 'inline-block';
  }
}

function resetQuiz() {
  location.reload();
}

function activatePornhubTheme() {
  phModeActivated = true;

  const link = document.querySelector('link[rel="stylesheet"]');
  if (link) {
    originalStylesheetHref = link.href;
    link.href = 'ph/style.css';
  }

  let fav = document.querySelector('link[rel="icon"]');
  if (fav) {
    originalFaviconHref = fav.href;
    fav.href = 'ph/favicon.ico';
  } else {
    fav = document.createElement('link');
    fav.rel = 'icon';
    fav.href = 'ph/favicon.ico';
    document.head.appendChild(fav);
  }

  document.title = '無料エロ動画とアダルトビデオ - ポルノ、XXX、ポルノサイト | Pornhub';

  const h1 = document.querySelector('h1');
  if (h1) {
    h1.innerHTML = '<span>Porn</span><span class="orange">hub</span>';
  }
}

function deactivatePornhubTheme() {
  phModeDeactivated = true;

  const link = document.querySelector('link[rel="stylesheet"]');
  if (link && originalStylesheetHref) {
    link.href = originalStylesheetHref;
  }

  let fav = document.querySelector('link[rel="icon"]');
  if (fav && originalFaviconHref) {
    fav.href = originalFaviconHref;
  }

  document.title = originalTitle;

  const h1 = document.querySelector('h1');
  if (h1) {
    h1.textContent = originalH1;
  }
}

function playPornhubReverseAudio() {
  fetch('ph/intro.mp3')
    .then(res => res.arrayBuffer())
    .then(buf => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx.resume().then(() => {
        return ctx.decodeAudioData(buf);
      }).then(buffer => {
        for (let i = 0; i < buffer.numberOfChannels; i++) {
          buffer.getChannelData(i).reverse();
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      });
    })
    .catch(e => console.error('逆再生失敗:', e));
}
