// Quick quiz start
function startQuiz() {
  const quizCode = document.getElementById('quizCode').value.trim();
  if (!quizCode) {
    alert('Please enter a quiz password.');
    return;
  }
  // placeholder behavior - normally you'd verify with backend
  alert('Starting quiz with code: ' + quizCode);
  // Example redirect: window.location.href = '/quiz.html?code=' + encodeURIComponent(quizCode);
}

// Toggle login dropdown menu
function toggleLoginMenu() {
  const dropdown = document.getElementById('loginDropdown');
  dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('loginDropdown');
  const loginBtn = document.querySelector('.login-btn');
  if (dropdown && !dropdown.contains(e.target) && !loginBtn.contains(e.target)) {
    dropdown.classList.remove('show');
  }
});

// Redirect to login (simulated)
function redirectLogin(userType) {
  if (userType === 'teacher') {
    openTeacherLogin();
  } else if (userType === 'student') {
    openStudentLogin(event);
  }
}

// Contact form submission
document.addEventListener('DOMContentLoaded', () => {
  // Load featured contests on homepage
  loadFeaturedContests();
  
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();
      if (!name || !email || !message) {
        alert('Please fill all fields.');
        return;
      }
      // replace with actual API call later
      alert(`Thanks ${name}! Your message has been sent.`);
      contactForm.reset();
    });
  }

  // Smooth scrolling for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      e.preventDefault();
      const t = document.querySelector(this.getAttribute('href'));
      if (t) t.scrollIntoView({behavior:'smooth', block: 'start'});
    });
  });
});

(function() {
  'use strict';
  const targets = [/older logos/i, /new logos/i];

  function removeMatching() {
    // Search through likely heading and container elements
    const candidates = document.querySelectorAll('h1,h2,h3,h4,h5,legend,span,div,li');
    candidates.forEach(el => {
      const text = (el.textContent || '').trim();
      if (!text) return;
      for (const re of targets) {
        if (re.test(text)) {
          // Find a reasonable container to remove (section, article, div.card, li, etc.)
          const container = el.closest('section, article, .card, .pack-item, .pack-section, li, .collection, .row') || el.parentElement;
          if (container && container.parentElement) {
            container.remove();
            console.log('[hide-fa-slab] Removed element containing text:', text);
          } else {
            el.remove();
            console.log('[hide-fa-slab] Removed small element containing text:', text);
          }
          break;
        }
      }
    });
  }

  // Run once and observe for dynamic loading
  function tryRemoveSafely() {
    try {
      removeMatching();
    } catch (e) {
      console.error('[hide-fa-slab] error while removing:', e);
    }
  }

  window.addEventListener('load', tryRemoveSafely);
  setTimeout(tryRemoveSafely, 1200);

  const mo = new MutationObserver(() => tryRemoveSafely());
  mo.observe(document.documentElement, { childList: true, subtree: true });

})();
// Toast helper
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2500);
}

// Start Quiz
function startQuiz(){
  const quizCode = document.getElementById("quizCode").value.trim();
  if(!quizCode){ showToast("Enter quiz password"); return; }
  alert("Quiz starting with password: " + quizCode);
}

// Modal Elements
const modalBackdrop = document.getElementById("studentModalBackdrop");
const modalBackdropTeacher = document.getElementById("teacherModalBackdrop");

let _currentOtp = null;
let _currentTeacherOtp = null;

// Open Modal
function openStudentLogin(e){
  if(e) e.preventDefault();
  // Close login dropdown if open
  const dropdown = document.getElementById('loginDropdown');
  if(dropdown) dropdown.classList.remove('show');
  
  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden","false");
  document.getElementById("stuName").focus();
}

function openTeacherLogin(e) {
  if(e) e.preventDefault();
  // Close login dropdown if open
  const dropdown = document.getElementById('loginDropdown');
  if(dropdown) dropdown.classList.remove('show');
  
  modalBackdropTeacher.classList.add("open");
  modalBackdropTeacher.setAttribute("aria-hidden","false");
  document.getElementById("tcName").focus();
}

function closeTeacherLogin(){
  modalBackdropTeacher.classList.remove("open");
  modalBackdropTeacher.setAttribute("aria-hidden","true");
  _currentTeacherOtp = null;
  document.getElementById("tcName").value = "";
  document.getElementById("tcEmail").value = "";
  document.getElementById("tcOtpInput").value = "";
}

// Close Modal
function closeStudentLogin(){
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden","true");
  _currentOtp = null;
  document.getElementById("stuName").value = "";
  document.getElementById("stuEmail").value = "";
  document.getElementById("stuQuizPin").value = "";
  document.getElementById("otpInput").value = "";
}

// Generate demo OTP
function generateOtp(){ return Math.floor(100000 + Math.random()*900000).toString(); }

function maskEmail(email){
  const parts = email.split('@');
  if(parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const masked = name.length <= 2 ? name.charAt(0) + "*" : name.substring(0,2) + "***";
  return masked + "@" + domain;
}

// Send OTP
function sendOtp(){
  const email = document.getElementById("stuEmail").value.trim();
  const name = document.getElementById("stuName").value.trim();
  if(!name || !email) return showToast("Enter name & email first");

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Invalid email");

  _currentOtp = generateOtp();
  console.log("[demo OTP]", _currentOtp);
  showToast("OTP sent to " + maskEmail(email));
  document.getElementById("otpInput").focus();
}

// Verify OTP for Student
function verifyAndProceed(){
  const entered = document.getElementById("otpInput").value.trim();
  const name = document.getElementById("stuName").value.trim();
  const email = document.getElementById("stuEmail").value.trim();
  const quizPin = document.getElementById("stuQuizPin").value.trim();

  if(!name || !email || !quizPin) return showToast("Enter all fields");
  if(!_currentOtp) return showToast("Send OTP first");
  if(entered.length < 6) return showToast("Enter full OTP");
  if(quizPin.length !== 4) return showToast("Enter valid 4-digit PIN");

  if(entered === _currentOtp){
    // Verify quiz PIN
    const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const quiz = quizzes.find(q => q.pin === quizPin);
    
    if(!quiz) {
      showToast("Invalid quiz PIN");
      return;
    }
    
    // Store student info and redirect to quiz
    const student = { name, email };
    localStorage.setItem('currentStudent', JSON.stringify(student));
    localStorage.setItem('currentQuizPin', quizPin);
    
    closeStudentLogin();
    showToast("Verified — joining quiz...");
    setTimeout(() => {
      window.location.href = 'quiz-attempt.html';
    }, 500);
  } else showToast("Incorrect OTP");
}

// Teacher OTP Functions
function sendTeacherOtp(){
  const email = document.getElementById("tcEmail").value.trim();
  const name = document.getElementById("tcName").value.trim();
  if(!name || !email) return showToast("Enter name & email first");

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Invalid email");

  _currentTeacherOtp = generateOtp();
  console.log("[demo Teacher OTP]", _currentTeacherOtp);
  showToast("OTP sent to " + maskEmail(email));
  document.getElementById("tcOtpInput").focus();
}

function verifyTeacherAndProceed(){
  const entered = document.getElementById("tcOtpInput").value.trim();
  const name = document.getElementById("tcName").value.trim();
  const email = document.getElementById("tcEmail").value.trim();

  if(!name || !email) return showToast("Enter all fields");
  if(!_currentTeacherOtp) return showToast("Send OTP first");
  if(entered.length < 6) return showToast("Enter full OTP");

  if(entered === _currentTeacherOtp){
    // Store teacher info
    const teacher = { name, email };
    localStorage.setItem('currentTeacher', JSON.stringify(teacher));
    
    closeTeacherLogin();
    showToast("Verified — redirecting...");
    setTimeout(() => {
      window.location.href = 'teacher-dashboard.html';
    }, 500);
  } else showToast("Incorrect OTP");
}

// Backdrop click closes modal
modalBackdrop.addEventListener("click", e => {
  if(e.target === modalBackdrop) closeStudentLogin();
});

modalBackdropTeacher.addEventListener("click", e => {
  if(e.target === modalBackdropTeacher) closeTeacherLogin();
});

// ESC key closes modal
window.addEventListener("keydown", e => {
  if(e.key === "Escape") {
    if(modalBackdrop.classList.contains("open")) closeStudentLogin();
    if(modalBackdropTeacher.classList.contains("open")) closeTeacherLogin();
  }
});

// Load Featured Contests
function loadFeaturedContests() {
  const container = document.getElementById('featuredQuizzesList');
  if (!container) return;
  
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  const featuredQuizzes = quizzes.filter(q => q.featured === true);
  
  if (featuredQuizzes.length === 0) {
    container.innerHTML = '<div class="no-contests">No featured contests yet. Teachers can set quizzes as featured!</div>';
    return;
  }
  
  container.innerHTML = featuredQuizzes.map(quiz => `
    <div class="contest-card" onclick="viewContestDetails('${quiz.id}')">
      <div class="contest-card-header">
        <h3>${quiz.title}</h3>
      </div>
      <div class="contest-card-body">
        ${quiz.description ? `<p>${quiz.description}</p>` : '<p>Click to view details and join this quiz.</p>'}
        <div class="contest-meta">
          <span class="meta-item">
            <img class="icon" src="https://cdn-icons-png.flaticon.com/512/2965/2965358.png" alt="">
            ${quiz.questions.length} Questions
          </span>
          <span class="meta-item">
            <img class="icon" src="https://cdn-icons-png.flaticon.com/512/2838/2838779.png" alt="">
            ${quiz.duration} mins
          </span>
          <span class="meta-item">
            <img class="icon" src="https://cdn-icons-png.flaticon.com/512/1077/1077114.png" alt="">
            ${quiz.attempts ? quiz.attempts.length : 0} Attempts
          </span>
        </div>
      </div>
      <div class="contest-card-footer">
        <button class="contest-btn primary" onclick="joinContest(event, '${quiz.pin}')">
          <img class="icon" src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="">
          Join Quiz
        </button>
      </div>
    </div>
  `).join('');
}

function viewContestDetails(quizId) {
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  const quiz = quizzes.find(q => q.id === quizId);
  
  if (!quiz) return;
  
  let details = `📚 ${quiz.title}\n\n`;
  if (quiz.description) details += `${quiz.description}\n\n`;
  details += `📌 PIN: ${quiz.pin}\n`;
  details += `⏱️ Duration: ${quiz.duration} minutes\n`;
  details += `❓ Questions: ${quiz.questions.length}\n`;
  details += `📊 Total Points: ${quiz.questions.reduce((sum, q) => sum + q.points, 0)}\n`;
  details += `👥 Attempts: ${quiz.attempts ? quiz.attempts.length : 0}\n\n`;
  details += `Click "Join Quiz" to start!`;
  
  alert(details);
}

function joinContest(event, pin) {
  event.stopPropagation();
  // Open student login without pre-filling PIN
  openStudentLogin(event);
}