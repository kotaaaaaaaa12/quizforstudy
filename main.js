let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

document.addEventListener('DOMContentLoaded', () => {
    displaySubjectButtons();
    setupCanvas();
});

function displaySubjectButtons() {
    const subjectButtons = document.getElementById('subjectButtons');
    const subjects = [
        { id: 'yojijyukugo', name: '四字熟語', jsonFile: 'json/1.json' },
        { id: 'douonigigo', name: '同音異義語、同訓異字', jsonFile: 'json/2.json' }
    ];

    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.id = subject.id;
        button.textContent = subject.name;
        button.addEventListener('click', () => {
            fetchQuestions(subject.jsonFile);
            subjectButtons.style.display = 'none';
            document.getElementById('questionCountSection').style.display = 'block';
        });
        subjectButtons.appendChild(button);
    });
}

function fetchQuestions(jsonFile) {
    fetch(jsonFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            quizData = data;
            document.getElementById('maxQuestions').textContent = quizData.length;
            document.getElementById('numQuestions').max = quizData.length;
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
            alert('データの取得に失敗しました。');
        });
}

document.getElementById('startQuiz').addEventListener('click', () => {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const maxQuestions = quizData.length;

    if (numQuestions < 1) {
        alert('問題数は1以上にしてください。');
        return;
    }

    if (numQuestions > maxQuestions) {
        alert(`問題数は最大${maxQuestions}です。`);
        return;
    }

    startTime = new Date();
    correctAnswers = 0;
    document.getElementById('questionCountSection').style.display = 'none';
    startQuiz(selectRandomQuestions(numQuestions));
});

function selectRandomQuestions(numQuestions) {
    const selectedQuestions = [];
    const usedIndices = new Set();
    while (selectedQuestions.length < numQuestions) {
        const randomIndex = Math.floor(Math.random() * quizData.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedQuestions.push(quizData[randomIndex]);
        }
    }
    return selectedQuestions;
}

function startQuiz(questions) {
    currentQuestions = questions;
    mistakeQuestions = [];
    currentIndex = 0;
    document.getElementById('quizContainer').innerHTML = '';
    document.getElementById('retryMistakes').style.display = 'none';
    document.getElementById('resetQuiz').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    renderQuestion();
}

function renderQuestion() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '';

    if (currentIndex < currentQuestions.length) {
        const questionItem = currentQuestions[currentIndex];
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p>${currentIndex + 1}. ${questionItem.question}</p>
            <input type="text" class="answer-input" id="answerInput">
            <button onclick="checkAnswer('${questionItem.answer}')">解答</button>
        `;
        quizContainer.appendChild(questionElement);
    } else {
        finishQuiz();
    }
}

function checkAnswer(correctAnswer) {
    const answerInput = document.getElementById('answerInput').value.trim();
    const feedback = document.createElement('div');
    feedback.classList.add('feedback');

    const correctSound = document.getElementById('correctSound');
    const incorrectSound = document.getElementById('incorrectSound');

    const correctAnswersArray = correctAnswer.split(',').map(answer => answer.trim());

    if (correctAnswersArray.includes(answerInput)) {
        feedback.textContent = '⭕';
        feedback.classList.add('correct');
        correctAnswers++;
        correctSound.play();
    } else {
        feedback.textContent = '❌';
        feedback.classList.add('incorrect');
        incorrectSound.play();

        const correctAnswerElement = document.createElement('div');
        correctAnswerElement.classList.add('correct-answer');
        correctAnswerElement.textContent = `正しい答え: ${correctAnswersArray.join(' または ')}`;
        document.querySelector('.question').appendChild(correctAnswerElement);

        mistakeQuestions.push(currentQuestions[currentIndex]);
    }

    document.querySelector('.question').appendChild(feedback);
    currentIndex++;
    setTimeout(renderQuestion, 2000);
}

function finishQuiz() {
    endTime = new Date();
    const timeTaken = calculateTimeTaken(startTime, endTime);

    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = '<p>クイズが終了しました。</p>';

    const statsContainer = document.getElementById('stats');
    statsContainer.style.display = 'block';
    statsContainer.innerHTML = `
        <p>正答率: ${correctAnswers}/${currentQuestions.length}</p>
        <p>掛かった時間: ${timeTaken}</p>
    `;

    if (mistakeQuestions.length > 0) {
        document.getElementById('retryMistakes').style.display = 'block';
        document.getElementById('retryMistakes').onclick = function() {
            correctAnswers = 0;
            startTime = new Date();
            startQuiz(mistakeQuestions);
        };
    } else {
        document.getElementById('resetQuiz').style.display = 'block';
    }
}

function calculateTimeTaken(start, end) {
    const timeDiff = end - start;
    const minutes = Math.floor(timeDiff / 1000 / 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    return `${minutes}分${seconds}秒`;
}

function resetQuiz() {
    location.reload();
    displaySubjectButtons();
}

let canvas, ctx, drawing = false;

function setupCanvas() {
    canvas = document.getElementById('drawCanvas');
    ctx = canvas.getContext('2d');
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    document.getElementById('recognizeButton').addEventListener('click', recognizeText);
}

function startDrawing(e) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
    if (!drawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
}

function stopDrawing() {
    drawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('recognizedText').textContent = '';
}

function recognizeText() {
    const recognizedText = "テスト認識結果";
    document.getElementById('recognizedText').textContent = recognizedText;

    document.getElementById('answerInput').value = recognizedText;
}
