let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

document.addEventListener('DOMContentLoaded', () => {
    displaySubjectButtons();
});

function displaySubjectButtons() {
    const subjectButtons = document.getElementById('subjectButtons');
    const subjects = [
        { id: 'kanjiButton', name: '漢字' },
        { id: 'kojiseigoButton', name: '古事成語' },
        { id: 'languageButton', name: '語感の豊かな言葉' },
        { id: 'mathButton', name: '数学' },
        { id: 'elementButton', name: '元素記号' },
        { id: 'chemicalFormulaButton', name: '化学式' },
        { id: 'chemicalReactionButton', name: '化学反応式' },
        { id: 'geologyButton', name: '地層' },
        { id: 'geographyButton', name: '地理' },
        { id: 'historyButton', name: '歴史' },
        { id: 'englishButton', name: '英単語' },
    ];

    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.id = subject.id;
        button.textContent = subject.name;
        button.addEventListener('click', () => {
            fetchQuestions(subject.id);
            subjectButtons.style.display = 'none';
            document.getElementById('questionCountSection').style.display = 'block';
        });
        subjectButtons.appendChild(button);
    });
}

function fetchQuestions(subjectId) {
    let jsonFile;
    switch (subjectId) {
        case 'kanjiButton':
            jsonFile = 'json/kanji.json';
            break;
        case 'kojiseigoButton':
            jsonFile = 'json/kojiseigo.json';
            break;
        case 'languageButton':
            jsonFile = 'json/vivid_words.json';
            break;
        case 'mathButton':
            jsonFile = 'json/math.json';
            break;
        case 'elementButton':
            jsonFile = 'json/element.json';
            break;
        case 'chemicalFormulaButton':
            jsonFile = 'json/chemical_formula.json';
            break;
        case 'chemicalReactionButton':
            jsonFile = 'json/chemical_reaction.json';
            break;
        case 'geologyButton':
            jsonFile = 'json/geology.json';
            break;
        case 'geographyButton':
            jsonFile = 'json/geography.json';
            break;
        case 'historyButton':
            jsonFile = 'json/history.json';
            break;
        case 'englishButton':
            jsonFile = 'json/english.json';
            break;
        default:
            return;
    }

    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            quizData = data;
            document.getElementById('maxQuestions').textContent = quizData.length;
            document.getElementById('numQuestions').max = quizData.length;
        })
        .catch(error => {
            console.error('エラーが発生しました:', error);
        });
}

document.getElementById('startQuiz').addEventListener('click', () => {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    if (numQuestions < 1) {
        alert('問題数は1以上にしてください。');
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

    if (answerInput === correctAnswer) {
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
        correctAnswerElement.textContent = `正しい答え: ${correctAnswer}`;
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
