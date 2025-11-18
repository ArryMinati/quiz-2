# How to Test and Fix Featured Contests

## Quick Test Steps

### 1. Open the Test Page
Open `test-featured.html` in your browser to:
- Check if the system is working
- Create sample quizzes
- Toggle featured status
- See what data is in localStorage

### 2. Test the Featured System

**Step A: Create Test Data**
1. Open `test-featured.html`
2. Click "Create 3 Sample Quizzes"
3. This creates quizzes with featured property

**Step B: Verify Featured Toggle**
1. Click "Set Featured" on any quiz
2. Watch it appear in "Featured Quizzes Only" section
3. Click "Unfeature" to remove it

**Step C: Check Main Site**
1. Open `index.html` in browser
2. Scroll to "Featured Contests" section
3. You should see the featured quizzes from Step B
4. Open browser console (F12) to see debug logs

### 3. Test Teacher Dashboard

**Step A: Login as Teacher**
1. Open `index.html`
2. Click "Login" → "Teacher Login"
3. Enter any name/email, click "Send OTP"
4. Check browser console for OTP code
5. Enter OTP and click "Verify & Login"

**Step B: Create a Real Quiz**
1. Fill in quiz title, description, duration
2. Click "Add Question" and create questions
3. Click "Create Quiz"
4. Note the PIN shown in the alert

**Step C: Set as Featured**
1. Click "Manage Quizzes" in sidebar
2. Find your quiz
3. Click "Set Featured" button
4. Button should turn gold and show "⭐ Featured"
5. Gold star badge appears on card

**Step D: Verify on Homepage**
1. Open `index.html` in a new tab (or refresh)
2. Scroll to "Featured Contests"
3. Your quiz should appear there!

## Troubleshooting

### Featured Contests Not Showing?

**Check 1: Console Logs**
- Open browser console (F12 → Console tab)
- Refresh page
- Look for these messages:
  - "Total quizzes: X"
  - "Featured quizzes: X"

**Check 2: localStorage**
- In console, type: `localStorage.getItem('quizzes')`
- Look for `"featured":true` in the output
- If no quizzes exist, create one via teacher dashboard

**Check 3: Featured Property**
- Old quizzes may not have `featured` property
- Solution: Click "Set Featured" on existing quizzes
- Or clear storage and create new quizzes

### Toggle Button Not Working?

**Check 1: JavaScript Errors**
- Open console (F12)
- Click "Set Featured" button
- Look for any red error messages

**Check 2: Function Exists**
- In console, type: `typeof toggleFeatured`
- Should say "function", not "undefined"

**Check 3: Quiz ID**
- Right-click "Set Featured" button → Inspect
- Check the onclick attribute has a valid quiz ID

## Common Issues & Fixes

### Issue: Empty Featured Section
**Cause:** No quizzes marked as featured
**Fix:** Go to teacher dashboard → Manage Quizzes → Click "Set Featured"

### Issue: Old Quizzes Don't Have Featured Button
**Cause:** Created before featured system was added
**Fix:** 
1. Open browser console
2. Run this code:
```javascript
let quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
quizzes = quizzes.map(q => ({...q, featured: q.featured || false}));
localStorage.setItem('quizzes', JSON.stringify(quizzes));
location.reload();
```

### Issue: Featured Status Not Saving
**Cause:** localStorage not updating
**Fix:**
1. Clear browser cache
2. Try in incognito/private mode
3. Check browser localStorage is enabled

## File Locations

- **Main Page:** `index.html` (line 162-169: Featured Contests section)
- **Teacher Dashboard:** `teacher-dashboard.html`
- **Homepage Script:** `script.js` (line 292+: loadFeaturedContests)
- **Dashboard Script:** `teacher-dashboard.js` (line 378+: toggleFeatured)
- **Styles:** `styles.css` (line 335+: featured-contests, line 1251+: quiz-card.featured)
- **Test Page:** `test-featured.html` (diagnostic tool)

## Expected Behavior

### Teacher Dashboard
- ✅ "Set Featured" button on each quiz card
- ✅ Button turns gold when featured
- ✅ Star badge (⭐) appears on featured cards
- ✅ Gold border on featured quiz cards
- ✅ Toast message confirms toggle

### Homepage
- ✅ "Featured Contests" section visible
- ✅ Only featured quizzes displayed
- ✅ Shows: title, description, stats
- ✅ "Join Quiz" button on each card
- ✅ Empty message when no featured quizzes

### Console Logs (when working correctly)
```
Total quizzes: 3
Featured quizzes: 2
Toggled featured status: Math Quiz - Featured: true
```
