// Teacher Dashboard JavaScript

// Initialize
let currentTeacher = null;
let quizzes = [];
let currentQuestionIndex = null;
let currentQuestions = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  migrateOldQuizzes();
  loadQuizzes();
  generateNewPin();
});

function checkAuth() {
  const teacher = localStorage.getItem('currentTeacher');
  if (!teacher) {
    window.location.href = 'index.html';
    return;
  }
  currentTeacher = JSON.parse(teacher);
  document.getElementById('teacherName').textContent = `Welcome, ${currentTeacher.name}`;
}

function logout() {
  localStorage.removeItem('currentTeacher');
  window.location.href = 'index.html';
}

// Migrate old quizzes to include featured property
function migrateOldQuizzes() {
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  let updated = false;
  
  const migratedQuizzes = quizzes.map(quiz => {
    if (quiz.featured === undefined) {
      updated = true;
      return { ...quiz, featured: false };
    }
    return quiz;
  });
  
  if (updated) {
    localStorage.setItem('quizzes', JSON.stringify(migratedQuizzes));
  }
}

// Generate random 4-digit PIN
function generatePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateNewPin() {
  const pin = generatePin();
  document.getElementById('generatedPin').textContent = pin;
  return pin;
}

// Show/Hide sections
function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  
  if (section === 'create') {
    document.getElementById('createSection').classList.add('active');
    document.querySelectorAll('.sidebar-item')[0].classList.add('active');
  } else if (section === 'manage') {
    document.getElementById('manageSection').classList.add('active');
    document.querySelectorAll('.sidebar-item')[1].classList.add('active');
    loadQuizzes(); // Reload fresh data from localStorage
    displayQuizzes();
  }
}

// Question Modal
function openQuestionModal(index = null) {
  currentQuestionIndex = index;
  const modal = document.getElementById('questionModal');
  
  if (index !== null) {
    // Edit existing question
    const question = currentQuestions[index];
    document.getElementById('questionText').value = question.text;
    document.getElementById('questionType').value = question.type;
    document.getElementById('questionPoints').value = question.points;
    updateQuestionOptions();
    // Populate options based on type
    if (question.options) {
      const inputs = document.querySelectorAll('#optionsContainer input[type="text"]');
      question.options.forEach((opt, i) => {
        if (inputs[i]) inputs[i].value = opt;
      });
      if (question.type === 'mcq' || question.type === 'multiple') {
        const correctInputs = question.type === 'mcq' 
          ? document.querySelectorAll('#optionsContainer input[type="radio"]')
          : document.querySelectorAll('#optionsContainer input[type="checkbox"]');
        question.correctAnswers.forEach(idx => {
          if (correctInputs[idx]) correctInputs[idx].checked = true;
        });
      }
    }
  } else {
    // New question
    document.getElementById('questionText').value = '';
    document.getElementById('questionType').value = 'mcq';
    document.getElementById('questionPoints').value = 1;
    updateQuestionOptions();
  }
  
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeQuestionModal() {
  const modal = document.getElementById('questionModal');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  currentQuestionIndex = null;
}

function updateQuestionOptions() {
  const type = document.getElementById('questionType').value;
  const container = document.getElementById('optionsContainer');
  
  container.innerHTML = '';
  
  if (type === 'mcq' || type === 'multiple') {
    container.innerHTML = `
      <div class="field">
        <label>Options (Mark the correct answer${type === 'multiple' ? 's' : ''})</label>
        <div class="options-list">
          ${[1, 2, 3, 4].map(i => `
            <div class="option-item">
              <input type="${type === 'mcq' ? 'radio' : 'checkbox'}" name="correct" id="correct${i}" />
              <input type="text" placeholder="Option ${i}" id="option${i}" />
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (type === 'true-false') {
    container.innerHTML = `
      <div class="field">
        <label>Correct Answer</label>
        <div class="tf-options">
          <label class="radio-label">
            <input type="radio" name="tfAnswer" value="true" checked /> True
          </label>
          <label class="radio-label">
            <input type="radio" name="tfAnswer" value="false" /> False
          </label>
        </div>
      </div>
    `;
  } else if (type === 'short') {
    container.innerHTML = `
      <div class="field">
        <label>Sample Answer (for reference)</label>
        <textarea id="sampleAnswer" placeholder="Expected answer or keywords" rows="2"></textarea>
      </div>
    `;
  }
}

function saveQuestion() {
  const text = document.getElementById('questionText').value.trim();
  const type = document.getElementById('questionType').value;
  const points = parseInt(document.getElementById('questionPoints').value);
  
  if (!text) {
    showToast('Please enter a question');
    return;
  }
  
  const question = { text, type, points };
  
  if (type === 'mcq' || type === 'multiple') {
    const options = [];
    const correctAnswers = [];
    
    for (let i = 1; i <= 4; i++) {
      const optText = document.getElementById(`option${i}`).value.trim();
      if (optText) {
        options.push(optText);
        if (document.getElementById(`correct${i}`).checked) {
          correctAnswers.push(options.length - 1);
        }
      }
    }
    
    if (options.length < 2) {
      showToast('Please provide at least 2 options');
      return;
    }
    
    if (correctAnswers.length === 0) {
      showToast('Please mark at least one correct answer');
      return;
    }
    
    question.options = options;
    question.correctAnswers = correctAnswers;
  } else if (type === 'true-false') {
    const tfAnswer = document.querySelector('input[name="tfAnswer"]:checked').value;
    question.correctAnswer = tfAnswer === 'true';
  } else if (type === 'short') {
    const sampleAnswer = document.getElementById('sampleAnswer').value.trim();
    question.sampleAnswer = sampleAnswer;
  }
  
  if (currentQuestionIndex !== null) {
    currentQuestions[currentQuestionIndex] = question;
    showToast('Question updated');
  } else {
    currentQuestions.push(question);
    showToast('Question added');
  }
  
  closeQuestionModal();
  displayQuestions();
}

function addQuestion() {
  openQuestionModal();
}

function displayQuestions() {
  const container = document.getElementById('questionsList');
  
  if (currentQuestions.length === 0) {
    container.innerHTML = '<div class="no-questions">No questions added yet. Click "Add Question" to start.</div>';
    return;
  }
  
  container.innerHTML = currentQuestions.map((q, index) => `
    <div class="question-card">
      <div class="question-header">
        <span class="question-number">Q${index + 1}</span>
        <span class="question-type-badge">${getTypeLabel(q.type)}</span>
        <span class="question-points">${q.points} pt${q.points > 1 ? 's' : ''}</span>
      </div>
      <div class="question-text">${q.text}</div>
      ${q.options ? `
        <div class="question-options">
          ${q.options.map((opt, i) => `
            <div class="option ${q.correctAnswers.includes(i) ? 'correct' : ''}">
              ${opt} ${q.correctAnswers.includes(i) ? '✓' : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="question-actions">
        <button class="btn-small" onclick="openQuestionModal(${index})">Edit</button>
        <button class="btn-small danger" onclick="deleteQuestion(${index})">Delete</button>
      </div>
    </div>
  `).join('');
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

function deleteQuestion(index) {
  if (confirm('Are you sure you want to delete this question?')) {
    currentQuestions.splice(index, 1);
    displayQuestions();
    showToast('Question deleted');
  }
}

function createQuiz() {
  const title = document.getElementById('quizTitle').value.trim();
  const description = document.getElementById('quizDescription').value.trim();
  const duration = parseInt(document.getElementById('quizDuration').value);
  const pin = document.getElementById('generatedPin').textContent;
  
  if (!title) {
    showToast('Please enter a quiz title');
    return;
  }
  
  if (currentQuestions.length === 0) {
    showToast('Please add at least one question');
    return;
  }
  
  const quiz = {
    id: Date.now().toString(),
    title,
    description,
    duration,
    pin,
    questions: currentQuestions,
    createdBy: currentTeacher.email,
    createdAt: new Date().toISOString(),
    attempts: [],
    featured: false
  };
  
  // Save to localStorage
  const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  existingQuizzes.push(quiz);
  localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));
  
  showToast('Quiz created successfully! PIN: ' + pin);
  
  // Show detailed info
  alert(`Quiz Created Successfully!\n\nTitle: ${title}\nPIN: ${pin}\nQuestions: ${currentQuestions.length}\nDuration: ${duration} minutes\n\nShare this PIN with your students.`);
  
  resetForm();
  quizzes = existingQuizzes;
}

function resetForm() {
  document.getElementById('quizTitle').value = '';
  document.getElementById('quizDescription').value = '';
  document.getElementById('quizDuration').value = 30;
  currentQuestions = [];
  displayQuestions();
  generateNewPin();
}

function loadQuizzes() {
  quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
}

function displayQuizzes() {
  const container = document.getElementById('quizzesList');
  
  if (quizzes.length === 0) {
    container.innerHTML = '<div class="no-quizzes">No quizzes created yet. Create your first quiz!</div>';
    return;
  }
  
  container.innerHTML = quizzes.map(quiz => `
    <div class="quiz-card ${quiz.featured ? 'featured' : ''}">
      <div class="quiz-card-header">
        <h3>${quiz.title}</h3>
        <span class="quiz-pin">PIN: ${quiz.pin}</span>
      </div>
      <div class="quiz-card-body">
        ${quiz.description ? `<p>${quiz.description}</p>` : ''}
        <div class="quiz-meta-info">
          <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
            👤 Created by: ${quiz.createdBy || 'Unknown'}
          </div>
        </div>
        <div class="quiz-stats">
          <span><img class="icon" src="https://cdn-icons-png.flaticon.com/512/2965/2965358.png" alt="">${quiz.questions.length} Questions</span>
          <span><img class="icon" src="https://cdn-icons-png.flaticon.com/512/2838/2838779.png" alt="">${quiz.duration} mins</span>
          <span><img class="icon" src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="">${quiz.attempts.length} Attempts</span>
        </div>
      </div>
      <div class="quiz-card-actions">
        <button class="btn-small ${quiz.featured ? 'featured-btn' : ''}" onclick="toggleFeatured('${quiz.id}')">
          ${quiz.featured ? '⭐ Featured' : 'Set Featured'}
        </button>
        <button class="btn-small" onclick="viewQuizDetails('${quiz.id}')">View Details</button>
        <button class="btn-small" onclick="copyPin('${quiz.pin}')">Copy PIN</button>
        <button class="btn-small danger" onclick="deleteQuiz('${quiz.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function viewQuizDetails(quizId) {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return;
  
  let details = `Quiz: ${quiz.title}\n`;
  details += `PIN: ${quiz.pin}\n`;
  details += `Duration: ${quiz.duration} minutes\n`;
  details += `Questions: ${quiz.questions.length}\n`;
  details += `Total Points: ${quiz.questions.reduce((sum, q) => sum + q.points, 0)}\n`;
  details += `\nAttempts: ${quiz.attempts.length}\n`;
  
  if (quiz.attempts.length > 0) {
    const avgScore = quiz.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / quiz.attempts.length;
    details += `Average Score: ${avgScore.toFixed(1)}%`;
  }
  
  alert(details);
}

function copyPin(pin) {
  navigator.clipboard.writeText(pin).then(() => {
    showToast('PIN copied to clipboard!');
  }).catch(() => {
    showToast('PIN: ' + pin);
  });
}

function toggleFeatured(quizId) {
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return;
  
  quiz.featured = !quiz.featured;
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
  displayQuizzes();
  showToast(quiz.featured ? 'Quiz set as featured!' : 'Removed from featured');
}

function deleteQuiz(quizId) {
  if (!confirm('Are you sure you want to delete this quiz?')) return;
  
  quizzes = quizzes.filter(q => q.id !== quizId);
  localStorage.setItem('quizzes', JSON.stringify(quizzes));
  displayQuizzes();
  showToast('Quiz deleted');
}

// Toast helper
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}
