let quizData = [];
let currentQuestions = [];
let mistakeQuestions = [];
let currentIndex = 0;
let correctAnswers = 0;
let startTime, endTime;

// 手書き認識用のCanvas
let canvas = document.getElementById('drawCanvas');
let ctx = canvas.getContext('2d');
let isDrawing = false;

// キャンバスで手書き入力を始める
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

// クリアボタンの設定
document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('recognizedText').textContent = '';  // 認識結果をクリア
});

// 手書き認識ボタン
document.getElementById('recognizeButton').addEventListener('click', () => {
    recognizeTextFromCanvas();
});

// 手書き認識
function recognizeTextFromCanvas() {
    const imgData = canvas.toDataURL();  // Canvasを画像データに変換
    fetch('https://api.ocr.space/parse/image', {  // OCR APIを使用して認識
        method: 'POST',
        headers: {
            'apikey': 'YOUR_OCR_SPACE_API_KEY'  // OCR APIキーをここに記入
        },
        body: new URLSearchParams({
            'base64Image': imgData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ParsedResults && data.ParsedResults.length > 0) {
            const recognizedText = data.ParsedResults[0].ParsedText.trim();
            document.getElementById('recognizedText').textContent = recognizedText;  // 認識された文字を表示
        } else {
            document.getElementById('recognizedText').textContent = '認識できませんでした。';
        }
    })
    .catch(error => {
        console.error('認識エラー:', error);
        document.getElementById('recognizedText').textContent = '認識中にエラーが発生しました。';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displaySubjectButtons();
});

// サブジェクトボタンを表示する
function displaySubjectButtons() {
    const subjects = ["四字熟語", "英語のフレーズ", "日本の地理"];
    const subjectButtons = document.getElementById('subjectButtons');
    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.textContent = subject;
        button.addEventListener('click', () => {
            loadQuizData(subject);
        });
        subjectButtons.appendChild(button);
    });
}

// クイズデータを読み込む
function loadQuizData(subject) {
    fetch(`data/${subject}.json`)  // サーバーにあるJSONデータを取得
        .then(response => response.json())
        .then(data => {
            quizData = data;
            document.getElementById('subjectSelection').style.display = 'none';
            document.getElementById('questionCountSection').style.display = 'block';
            document.getElementById('maxQuestions').textContent = quizData.length;
        });
}

// クイズ開始
document.getElementById('startQuiz').addEventListener('click', () => {
    const numQuestions = document.getElementById('numQuestions').value;
    currentQuestions = quizData.slice(0, numQuestions);
    startQuiz();
});

// クイズの開始
function startQuiz() {
    document.getElementById('questionCountSection').style.display = 'none';
    document.getElementById('quizContainer').style.display = 'block';
    displayQuestion();
}

// 問題を表示
function displayQuestion() {
    const question = currentQuestions[currentIndex];
    const quizContainer = document.getElementById('quizContainer');
    quizContainer.innerHTML = `
        <h3>${question.question}</h3>
        <input type="text" id="answerInput" placeholder="答えを入力してください">
        <button id="submitAnswer">回答</button>
    `;
    document.getElementById('submitAnswer').addEventListener('click', checkAnswer);
}

// 回答をチェック
function checkAnswer() {
    const answerInput = document.getElementById('answerInput');
    const correctAnswer = currentQuestions[currentIndex].answer;
    if (answerInput.value.trim() === correctAnswer) {
        correctAnswers++;
        alert('正解！');
        document.getElementById('correctSound').play();
    } else {
        alert(`不正解！ 正しい答えは ${correctAnswer} です。`);
        document.getElementById('incorrectSound').play();
    }
    currentIndex++;
    if (currentIndex < currentQuestions.length) {
        displayQuestion();
    } else {
        showStats();
    }
}

// 統計情報を表示
function showStats() {
    const stats = document.getElementById('stats');
    stats.style.display = 'block';
    stats.innerHTML = `
        <h4>クイズ終了！</h4>
        <p>正解数: ${correctAnswers} / ${currentQuestions.length}</p>
    `;
    document.getElementById('retryMistakes').style.display = 'inline-block';
}

// 間違えた問題を再挑戦
document.getElementById('retryMistakes').addEventListener('click', () => {
    mistakeQuestions = currentQuestions.filter((q, idx) => {
        return !document.getElementById(`answerInput-${idx}`).value.trim() === q.answer;
    });
    currentQuestions = mistakeQuestions;
    currentIndex = 0;
    correctAnswers = 0;
    startQuiz();
});

// リセットボタン
function resetQuiz() {
    location.reload();
}
