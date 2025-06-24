let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

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
    subjectButtons.style.display = 'block';  // 念のため表示ON

    const subjects = [
        { id: 'douonigigo', name: '同音異義語・同訓異字', jsonFile: 'json/1.json' },
        { id: 'history', name: '歴史', jsonFile: 'json/2.json' },
        { id: 'koumin', name: '公民', jsonFile: 'json/3.json' },
        { id: 'word', name: '英単語', jsonFile: 'json/4.json' }
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
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        quizData = data;
        document.getElementById('maxQuestions').textContent = quizData.length;
        document.getElementById('numQuestions').max = quizData.length;
      })
      .catch(e => { console.error(e); alert('データ取得失敗'); });
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
    const ret=[], used=new Set();
    while (ret.length < n) {
        const i = Math.floor(Math.random()*quizData.length);
        if (!used.has(i)){ used.add(i); ret.push(quizData[i]); }
    }
    return ret;
}

function startQuiz(questions) {
    currentQuestions = questions;
    mistakeQuestions = [];
    currentIndex = 0;
    document.getElementById('quizContainer').innerHTML = '';
    ['retryMistakes','resetQuiz','stats'].forEach(id=>
      document.getElementById(id).style.display='none'
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
          <p>${currentIndex+1}. ${qi.question}</p>
          <input type="text" class="answer-input" id="answerInput">
          <button id="answerButton" onclick="checkAnswer('${qi.answer}')">解答</button>
        `;
        c.appendChild(div);
    } else finishQuiz();
}

function checkAnswer(correctAnswer) {
    const btn = document.getElementById('answerButton');
    if (btn) btn.disabled=true;

    const ai = document.getElementById('answerInput');
    const answerInput = ai.value;
    const feedback = document.createElement('div');
    feedback.className='feedback';

    const arr = correctAnswer.split(',').map(a => normalize(a));
    const inp = normalize(answerInput);

    if (arr.includes(inp)) {
        feedback.textContent='⭕'; feedback.classList.add('correct');
        correctAnswers++;
        document.getElementById('correctSound')?.play();
    } else {
        feedback.textContent='❌'; feedback.classList.add('incorrect');
        document.getElementById('incorrectSound')?.play();
        const ca = document.createElement('div');
        ca.className='correct-answer';
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
    const diff = Math.floor((endTime-startTime)/1000);
    const timeTaken = `${Math.floor(diff/60)}分${diff%60}秒`;

    const qc = document.getElementById('quizContainer');
    qc.innerHTML = '<p>クイズが終了しました。</p>';

    const stats = document.getElementById('stats');
    stats.style.display='block';
    stats.innerHTML = `
      <p>正答率: ${correctAnswers}/${currentQuestions.length}</p>
      <p>時間: ${timeTaken}</p>
    `;

    if (mistakeQuestions.length) {
        const btn = document.getElementById('retryMistakes');
        btn.style.display='inline-block';
        btn.onclick = () => {
            correctAnswers=0;
            startTime=new Date();
            startQuiz(mistakeQuestions);
        };
    } else {
        document.getElementById('resetQuiz').style.display='inline-block';
    }
}

function calculateTimeTaken(s,e){
    const diff=(e-s)/1000|0;
    return `${Math.floor(diff/60)}分${diff%60}秒`;
}

function resetQuiz() {
    location.reload();
}
