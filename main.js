let quizData = {};
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

document.getElementById('setQuestionNum').addEventListener('click', function() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    if (numQuestions < 1 || numQuestions > 30) {
        alert('1以上30以下の問題数を指定してください。');
        return;
    }
    startTime = new Date(); // クイズの開始時間を記録
    correctAnswers = 0; // 正解数のリセット
    displaySubjectButtons(numQuestions);
});

document.getElementById('retryMistakes').addEventListener('click', function() {
    startQuiz(mistakeQuestions);
});

function displaySubjectButtons(numQuestions) {
    const subjects = ['geography', 'history', 'math', 'elements', 'earthscience', 'idioms', 'kanji', 'english', 'vivid_words'];
    const subjectButtons = document.getElementById('subjectButtons');
    subjectButtons.innerHTML = ''; // ボタンをリセット

    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.textContent = subject.charAt(0).toUpperCase() + subject.slice(1);
        button.addEventListener('click', () => loadQuestions(subject, numQuestions));
        subjectButtons.appendChild(button);
    });

    subjectButtons.style.display = 'block'; // ボタンを表示
}

function loadQuestions(subject, numQuestions) {
    fetch(`json/${subject}.json`)
        .then(response => response.json())
        .then(data => {
            quizData[subject] = data;
            startQuiz(selectRandomQuestions(numQuestions, data));
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
        });
}

function selectRandomQuestions(numQuestions, data) {
    const selectedQuestions = [];
    const usedIndices = new Set();
    while (selectedQuestions.length < numQuestions) {
        const randomIndex = Math.floor(Math.random() * data.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedQuestions.push(data[randomIndex]);
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
            <button onclick="checkAnswer('${JSON.stringify(questionItem.answer)}')">解答</button>
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

    if (Array.isArray(correctAnswer)) {
        if (correctAnswer.includes(answerInput)) {
            feedback.textContent = '⭕';
            feedback.classList.add('correct');
            correctAnswers++; // 正解数をカウント
            correctSound.play();
        } else {
            feedback.textContent = '❌';
            feedback.classList.add('incorrect');
            incorrectSound.play();

            const correctAnswerElement = document.createElement('div');
            correctAnswerElement.classList.add('correct-answer');
            correctAnswerElement.textContent = `正しい答え: ${correctAnswer.join(' / ')}`;
            document.querySelector('.question').appendChild(correctAnswerElement);

            mistakeQuestions.push(currentQuestions[currentIndex]);
        }
    } else {
        if (answerInput === correctAnswer) {
            feedback.textContent = '⭕';
            feedback.classList.add('correct');
            correctAnswers++; // 正解数をカウント
            correctSound.play();
        } else {
            feedback.textContent = '❌';
            feedback.classList.add('incorrect');
            incorrectSound.play();

            const correctAnswerElement = document.createElement('div');
            correctAnswerElement.classList.add('correct-answer');
            correctAnswerElement.textContent = `正しい答え: ${correctAnswer}`;
            document.querySelector('.question').appendChild(correctAnswerElement);

            mistakeQuestions.push(currentQuestions[currentIndex]);
        }
    }

    document.querySelector('.question').appendChild(feedback);
    currentIndex++;
    setTimeout(renderQuestion, 2000);
}

function finishQuiz() {
    endTime = new Date(); // クイズの終了時間を記録
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
    } else {
        resetQuiz();
    }
}

function calculateTimeTaken(start, end) {
    const timeDiff = end - start; // ミリ秒単位の差を取得
    const minutes = Math.floor(timeDiff / 1000 / 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    return `${minutes}分${seconds}秒`;
}

function resetQuiz() {
    document.getElementById('numQuestions').value = '1';
    document.getElementById('retryMistakes').style.display = 'none';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('quizContainer').innerHTML = '';
}
