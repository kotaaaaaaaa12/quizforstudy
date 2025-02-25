// クイズデータを格納する配列
let quizData = [];
let currentQuestions = []; // 出題中の問題リスト
let mistakeQuestions = []; // 間違えた問題リスト
let currentIndex = 0; // 現在の問題のインデックス
let correctAnswers = 0; // 正解数
let startTime, endTime; // クイズの開始・終了時間

// ページが読み込まれたら、テーマ選択ボタンを表示
document.addEventListener('DOMContentLoaded', () => {
    displaySubjectButtons();
});

// テーマ選択ボタンを作成・表示
function displaySubjectButtons() {
    const subjectButtons = document.getElementById('subjectButtons');
    const subjectTitle = document.querySelector('#subjectSelection h2'); // 「テーマを選択してください」の見出し

    // テーマのリスト
    const subjects = [
        { id: 'yojijyukugo', name: '四字熟語', jsonFile: 'json/1.json' },
        { id: 'douonigigo', name: '同音異義語、同訓異字', jsonFile: 'json/2.json' }
    ];

    // 各テーマに対応するボタンを作成
    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.id = subject.id;
        button.textContent = subject.name;
        button.addEventListener('click', () => {
            fetchQuestions(subject.jsonFile); // 選択したテーマの問題を取得
            subjectButtons.style.display = 'none'; // ボタンを非表示
            subjectTitle.style.display = 'none'; // 見出しも非表示
            document.getElementById('questionCountSection').style.display = 'block'; // 出題数の入力欄を表示
        });
        subjectButtons.appendChild(button);
    });
}

// JSONファイルから問題を取得
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

// クイズ開始ボタンのクリックイベント
document.getElementById('startQuiz').addEventListener('click', () => {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const maxQuestions = quizData.length;

    // 問題数が1未満の場合、警告を表示
    if (numQuestions < 1) {
        alert('問題数は1以上にしてください。');
        return;
    }

    // 指定した問題数が最大数を超えていた場合、警告を表示
    if (numQuestions > maxQuestions) {
        alert(`問題数は最大${maxQuestions}です。`);
        return;
    }

    startTime = new Date(); // クイズ開始時間を記録
    correctAnswers = 0;
    document.getElementById('questionCountSection').style.display = 'none'; // 出題数の選択画面を非表示
    startQuiz(selectRandomQuestions(numQuestions)); // ランダムに選ばれた問題でクイズ開始
});

// 指定した数の問題をランダムに選択
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

// クイズを開始
function startQuiz(questions) {
    currentQuestions = questions;
    mistakeQuestions = [];
    currentIndex = 0;
    document.getElementById('quizContainer').innerHTML = ''; // クイズ画面をクリア
    document.getElementById('retryMistakes').style.display = 'none'; // 間違えた問題の再挑戦ボタンを非表示
    document.getElementById('resetQuiz').style.display = 'none'; // 最初に戻るボタンを非表示
    document.getElementById('stats').style.display = 'none'; // 結果表示を非表示
    renderQuestion();
}

// 現在の問題を表示
function renderQuestion() {
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = ''; // 既存の問題をクリア

    if (currentIndex < currentQuestions.length) {
        const questionItem = currentQuestions[currentIndex];
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p>${currentIndex + 1}. ${questionItem.question}</p>
            <input type="text" class="answer-input" id="answerInput">
            <button id="answerButton">解答</button>
        `;
        quizContainer.appendChild(questionElement);

        // 解答ボタンのクリックイベント（ボタンを1回しか押せないようにする）
        document.getElementById('answerButton').addEventListener('click', function () {
            this.disabled = true; // ボタンを無効化
            checkAnswer(questionItem.answer);
        });
    } else {
        finishQuiz();
    }
}

// 解答をチェック
function checkAnswer(correctAnswer) {
    const answerInput = document.getElementById('answerInput').value.trim();
    const feedback = document.createElement('div');
    feedback.classList.add('feedback');

    const correctSound = document.getElementById('correctSound');
    const incorrectSound = document.getElementById('incorrectSound');

    // 正解をカンマ区切りで複数設定可能にする
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

        // 正解を表示
        const correctAnswerElement = document.createElement('div');
        correctAnswerElement.classList.add('correct-answer');
        correctAnswerElement.textContent = `正しい答え: ${correctAnswersArray.join(' または ')}`;
        document.querySelector('.question').appendChild(correctAnswerElement);

        mistakeQuestions.push(currentQuestions[currentIndex]);
    }

    document.querySelector('.question').appendChild(feedback);
    currentIndex++;
    setTimeout(renderQuestion, 2000); // 2秒後に次の問題を表示
}

// クイズ終了処理
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

// クイズの所要時間を計算
function calculateTimeTaken(start, end) {
    const timeDiff = end - start;
    const minutes = Math.floor(timeDiff / 1000 / 60);
    const seconds = Math.floor((timeDiff / 1000) % 60);
    return `${minutes}分${seconds}秒`;
}

// クイズをリセット
function resetQuiz() {
    location.reload();
}
