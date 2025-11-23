// Student Dashboard JavaScript

let currentStudent = null;
let allQuizzes = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadQuizzes();
});

function checkAuth() {
  const student = localStorage.getItem('currentStudent');
  if (!student) {
    window.location.href = 'index.html';
    return;
  }
  currentStudent = JSON.parse(student);
  document.getElementById('studentName').textContent = `Welcome, ${currentStudent.name}`;
}

function logout() {
  localStorage.removeItem('currentStudent');
  window.location.href = 'index.html';
}

function loadQuizzes() {
  allQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
}

// Show/Hide sections
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  
  if (section === 'take-quiz') {
    document.getElementById('takeQuizSection').classList.add('active');
    document.querySelectorAll('.sidebar-item')[0].classList.add('active');
  } else if (section === 'my-results') {
    document.getElementById('myResultsSection').classList.add('active');
    document.querySelectorAll('.sidebar-item')[1].classList.add('active');
    displayStudentResults();
  }
}

// Start quiz by PIN
function startQuizByPin() {
  const pin = document.getElementById('quizPin').value.trim();
  
  if (!pin) {
    showToast('Please enter a quiz PIN');
    return;
  }
  
  const quiz = allQuizzes.find(q => q.pin === pin);
  
  if (!quiz) {
    showToast('Invalid quiz PIN');
    return;
  }
  
  // Save quiz pin and redirect to quiz attempt page
  localStorage.setItem('currentQuizPin', pin);
  window.location.href = 'quiz-attempt.html';
}

// Display student's quiz results
function displayStudentResults() {
  const container = document.getElementById('resultsContainer');
  
  // Find all quizzes where this student has attempted
  const studentAttempts = [];
  
  allQuizzes.forEach(quiz => {
    if (quiz.attempts && quiz.attempts.length > 0) {
      const myAttempts = quiz.attempts.filter(attempt => 
        attempt.studentEmail === currentStudent.email
      );
      
      myAttempts.forEach(attempt => {
        studentAttempts.push({
          quiz: quiz,
          attempt: attempt
        });
      });
    }
  });
  
  if (studentAttempts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <img class="empty-icon" src="https://cdn-icons-png.flaticon.com/512/2942/2942156.png" alt="">
        <h3>No Quiz Attempts Yet</h3>
        <p>Take a quiz to see your results here</p>
        <button class="btn primary" onclick="showSection('take-quiz')">Take a Quiz</button>
      </div>
    `;
    return;
  }
  
  // Sort by completion date (most recent first)
  studentAttempts.sort((a, b) => 
    new Date(b.attempt.completedAt) - new Date(a.attempt.completedAt)
  );
  
  let html = '<div class="student-results-grid">';
  
  studentAttempts.forEach((item, index) => {
    const quiz = item.quiz;
    const attempt = item.attempt;
    const date = new Date(attempt.completedAt);
    const scoreClass = attempt.score >= 70 ? 'pass' : attempt.score >= 50 ? 'average' : 'fail';
    const correctCount = attempt.results ? attempt.results.filter(r => r.isCorrect === true).length : 0;
    const totalQuestions = attempt.results ? attempt.results.length : quiz.questions.length;
    
    html += `
      <div class="result-card">
        <div class="result-header">
          <h3>${quiz.title}</h3>
          <div class="result-date">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</div>
        </div>
        
        <div class="result-score-display">
          <div class="score-circle ${scoreClass}">
            <div class="score-number">${attempt.score.toFixed(1)}%</div>
            <div class="score-label">Score</div>
          </div>
          <div class="result-stats-grid">
            <div class="stat-box">
              <div class="stat-number">${correctCount}/${totalQuestions}</div>
              <div class="stat-label">Correct Answers</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">${attempt.earnedPoints}/${attempt.totalPoints}</div>
              <div class="stat-label">Points Earned</div>
            </div>
          </div>
        </div>
        
        <button class="btn ghost" onclick="toggleResultDetails(${index})" id="toggle-btn-${index}">
          View Detailed Results ▼
        </button>
        
        <div class="result-details" id="result-details-${index}" style="display: none;">
          <h4>📝 Question-by-Question Results</h4>
          ${attempt.results ? attempt.results.map((result, qIndex) => {
            const isCorrect = result.isCorrect === true;
            const needsReview = result.isCorrect === null;
            const isWrong = result.isCorrect === false;
            
            return `
              <div class="question-result ${isCorrect ? 'correct' : needsReview ? 'review' : 'incorrect'}">
                <div class="question-result-header">
                  <span class="question-number">Q${qIndex + 1}</span>
                  <span class="question-status-badge">
                    ${isCorrect ? '✓ Correct' : needsReview ? '⚠ Needs Review' : '✗ Incorrect'}
                  </span>
                  <span class="question-points">${isCorrect ? result.points : 0}/${result.points} pts</span>
                </div>
                <div class="question-text">${result.question}</div>
                <div class="answer-comparison">
                  <div class="student-answer">
                    <strong>Your Answer:</strong>
                    <div class="answer-value ${isCorrect ? 'correct-answer' : 'wrong-answer'}">
                      ${formatAnswer(result.studentAnswer, result.type)}
                    </div>
                  </div>
                  ${!isCorrect && !needsReview ? `
                    <div class="correct-answer-display">
                      <strong>Correct Answer:</strong>
                      <div class="answer-value correct-answer">
                        ${formatAnswer(result.correctAnswer, result.type)}
                      </div>
                    </div>
                  ` : ''}
                  ${needsReview ? `
                    <div class="review-note">
                      <strong>⚠️ Your answer is being reviewed by the teacher</strong>
                    </div>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('') : '<p>No detailed results available</p>'}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

function toggleResultDetails(index) {
  const details = document.getElementById(`result-details-${index}`);
  const btn = document.getElementById(`toggle-btn-${index}`);
  
  if (details.style.display === 'none') {
    details.style.display = 'block';
    btn.innerHTML = 'Hide Detailed Results ▲';
  } else {
    details.style.display = 'none';
    btn.innerHTML = 'View Detailed Results ▼';
  }
}

function formatAnswer(answer, type) {
  if (answer === undefined || answer === null) {
    return '<em style="color: #9ca3af;">No answer provided</em>';
  }
  
  if (type === 'multiple' && Array.isArray(answer)) {
    return answer.join(', ') || '<em style="color: #9ca3af;">No answer</em>';
  }
  
  if (type === 'true-false') {
    return answer === 'true' ? 'True' : answer === 'false' ? 'False' : answer;
  }
  
  return answer || '<em style="color: #9ca3af;">No answer provided</em>';
}

// Toast helper
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
