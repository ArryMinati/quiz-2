// Quiz Attempt JavaScript

let currentStudent = null;
let currentQuiz = null;
let currentQuestionIndex = 0;
let studentAnswers = [];
let timerInterval = null;
let timeRemaining = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadQuiz();
  startTimer();
  displayQuestion();
});

function checkAuth() {
  const student = localStorage.getItem('currentStudent');
  const quizPin = localStorage.getItem('currentQuizPin');
  
  if (!student || !quizPin) {
    window.location.href = 'index.html';
    return;
  }
  
  currentStudent = JSON.parse(student);
  document.getElementById('studentName').textContent = currentStudent.name;
  
  // Load quiz
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  currentQuiz = quizzes.find(q => q.pin === quizPin);
  
  if (!currentQuiz) {
    alert('Quiz not found!');
    window.location.href = 'index.html';
    return;
  }
  
  document.getElementById('quizTitle').textContent = currentQuiz.title;
  document.getElementById('totalQuestions').textContent = currentQuiz.questions.length;
  
  // Initialize answers array
  studentAnswers = new Array(currentQuiz.questions.length).fill(null);
}

function loadQuiz() {
  if (!currentQuiz) return;
  
  // Set time remaining (in seconds)
  timeRemaining = currentQuiz.duration * 60;
}

function startTimer() {
  updateTimerDisplay();
  
  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      showToast('Time is up! Submitting quiz...');
      setTimeout(() => autoSubmitQuiz(), 1000);
    } else if (timeRemaining <= 60) {
      // Warning in last minute
      document.getElementById('timer').style.color = '#e74c3c';
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById('timer').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function displayQuestion() {
  const question = currentQuiz.questions[currentQuestionIndex];
  const container = document.getElementById('questionContainer');
  
  // Update progress
  document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
  const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  // Update navigation buttons
  document.getElementById('prevBtn').disabled = currentQuestionIndex === 0;
  
  const isLastQuestion = currentQuestionIndex === currentQuiz.questions.length - 1;
  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent = isLastQuestion ? 'Submit Quiz' : 'Next Question';
  nextBtn.onclick = isLastQuestion ? openSubmitModal : nextQuestion;
  
  // Display question based on type
  let questionHTML = `
    <div class="question-card-main">
      <div class="question-header-main">
        <span class="question-number-main">Question ${currentQuestionIndex + 1}</span>
        <span class="question-type-badge">${getTypeLabel(question.type)}</span>
        <span class="question-points">${question.points} point${question.points > 1 ? 's' : ''}</span>
      </div>
      <div class="question-text-main">${question.text}</div>
      <div class="answer-section">
  `;
  
  const savedAnswer = studentAnswers[currentQuestionIndex];
  
  if (question.type === 'mcq') {
    questionHTML += '<div class="options-list-main">';
    question.options.forEach((option, index) => {
      const checked = savedAnswer === index ? 'checked' : '';
      questionHTML += `
        <label class="option-label">
          <input type="radio" name="answer" value="${index}" ${checked} onchange="saveAnswer(${index})">
          <span class="option-text">${option}</span>
        </label>
      `;
    });
    questionHTML += '</div>';
  } else if (question.type === 'multiple') {
    questionHTML += '<div class="options-list-main">';
    question.options.forEach((option, index) => {
      const checked = savedAnswer && savedAnswer.includes(index) ? 'checked' : '';
      questionHTML += `
        <label class="option-label">
          <input type="checkbox" name="answer" value="${index}" ${checked} onchange="saveMultipleAnswer()">
          <span class="option-text">${option}</span>
        </label>
      `;
    });
    questionHTML += '</div>';
  } else if (question.type === 'true-false') {
    const trueChecked = savedAnswer === true ? 'checked' : '';
    const falseChecked = savedAnswer === false ? 'checked' : '';
    questionHTML += `
      <div class="tf-options-main">
        <label class="option-label">
          <input type="radio" name="answer" value="true" ${trueChecked} onchange="saveAnswer(true)">
          <span class="option-text">True</span>
        </label>
        <label class="option-label">
          <input type="radio" name="answer" value="false" ${falseChecked} onchange="saveAnswer(false)">
          <span class="option-text">False</span>
        </label>
      </div>
    `;
  } else if (question.type === 'short') {
    const answer = savedAnswer || '';
    questionHTML += `
      <textarea class="short-answer-input" placeholder="Type your answer here..." oninput="saveAnswer(this.value)">${answer}</textarea>
    `;
  }
  
  questionHTML += `
      </div>
    </div>
  `;
  
  container.innerHTML = questionHTML;
}

function saveAnswer(answer) {
  studentAnswers[currentQuestionIndex] = answer;
}

function saveMultipleAnswer() {
  const checkboxes = document.querySelectorAll('input[name="answer"]:checked');
  const answers = Array.from(checkboxes).map(cb => parseInt(cb.value));
  studentAnswers[currentQuestionIndex] = answers.length > 0 ? answers : null;
}

function getTypeLabel(type) {
  const labels = {
    'mcq': 'Multiple Choice',
    'multiple': 'Multiple Answers',
    'true-false': 'True/False',
    'short': 'Short Answer'
  };
  return labels[type] || type;
}

function previousQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    displayQuestion();
  }
}

function nextQuestion() {
  if (currentQuestionIndex < currentQuiz.questions.length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  }
}

function openSubmitModal() {
  const answeredCount = studentAnswers.filter(a => a !== null).length;
  const unansweredCount = studentAnswers.length - answeredCount;
  
  document.getElementById('submitSummary').innerHTML = `
    <p><strong>Answered:</strong> ${answeredCount} / ${studentAnswers.length}</p>
    ${unansweredCount > 0 ? `<p style="color: #e74c3c;"><strong>Unanswered:</strong> ${unansweredCount}</p>` : ''}
  `;
  
  document.getElementById('submitModal').classList.add('open');
}

function closeSubmitModal() {
  document.getElementById('submitModal').classList.remove('open');
}

function confirmSubmit() {
  closeSubmitModal();
  submitQuiz();
}

function autoSubmitQuiz() {
  submitQuiz();
}

function submitQuiz() {
  clearInterval(timerInterval);
  
  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;
  
  const results = currentQuiz.questions.map((question, index) => {
    totalPoints += question.points;
    const studentAnswer = studentAnswers[index];
    let isCorrect = false;
    
    if (question.type === 'mcq') {
      isCorrect = studentAnswer === question.correctAnswers[0];
    } else if (question.type === 'multiple') {
      if (studentAnswer && question.correctAnswers) {
        const correct = question.correctAnswers.sort().join(',');
        const answer = studentAnswer.sort().join(',');
        isCorrect = correct === answer;
      }
    } else if (question.type === 'true-false') {
      isCorrect = studentAnswer === question.correctAnswer;
    } else if (question.type === 'short') {
      // For short answers, we'll mark as needs review
      isCorrect = null;
    }
    
    if (isCorrect) {
      earnedPoints += question.points;
    }
    
    return {
      question: question.text,
      type: question.type,
      studentAnswer,
      correctAnswer: question.correctAnswers || question.correctAnswer,
      isCorrect,
      points: question.points
    };
  });
  
  const scorePercentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  
  // Save attempt
  const attempt = {
    studentName: currentStudent.name,
    studentEmail: currentStudent.email,
    score: scorePercentage,
    earnedPoints,
    totalPoints,
    answers: studentAnswers,
    results,
    completedAt: new Date().toISOString()
  };
  
  // Update quiz in storage
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  const quizIndex = quizzes.findIndex(q => q.id === currentQuiz.id);
  if (quizIndex !== -1) {
    if (!quizzes[quizIndex].attempts) {
      quizzes[quizIndex].attempts = [];
    }
    quizzes[quizIndex].attempts.push(attempt);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }
  
  // Show results
  displayResults(scorePercentage, earnedPoints, totalPoints, results);
}

function displayResults(scorePercentage, earnedPoints, totalPoints, results) {
  const container = document.getElementById('resultsContainer');
  
  let resultsHTML = `
    <div class="results-summary">
      <h2>Your Score</h2>
      <div class="score-display">
        <div class="score-circle ${scorePercentage >= 70 ? 'pass' : 'fail'}">
          ${scorePercentage.toFixed(1)}%
        </div>
      </div>
      <p>${earnedPoints} / ${totalPoints} points</p>
    </div>
    
    <div class="results-details">
      <h3>Question Review</h3>
  `;
  
  results.forEach((result, index) => {
    const statusClass = result.isCorrect === null ? 'review' : (result.isCorrect ? 'correct' : 'incorrect');
    const statusIcon = result.isCorrect === null ? '📝' : (result.isCorrect ? '✓' : '✗');
    
    resultsHTML += `
      <div class="result-item ${statusClass}">
        <div class="result-header">
          <span class="result-number">Q${index + 1}</span>
          <span class="result-status">${statusIcon}</span>
          <span class="result-points">${result.isCorrect ? result.points : 0}/${result.points} pts</span>
        </div>
        <div class="result-question">${result.question}</div>
      </div>
    `;
  });
  
  resultsHTML += '</div>';
  
  container.innerHTML = resultsHTML;
  document.getElementById('resultsModal').classList.add('open');
}

function exitQuiz() {
  localStorage.removeItem('currentStudent');
  localStorage.removeItem('currentQuizPin');
  window.location.href = 'index.html';
}

// Toast helper
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Prevent accidental page leave
window.addEventListener('beforeunload', (e) => {
  if (timerInterval) {
    e.preventDefault();
    e.returnValue = '';
  }
});
