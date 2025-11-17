# Featured Contests Feature Guide

## Overview
The Featured Contests system allows teachers to promote specific quizzes on the homepage, making them visible to all visitors. When a quiz is deleted, it automatically disappears from the featured section.

## How It Works

### For Teachers

#### Setting a Quiz as Featured
1. Login as a teacher
2. Navigate to **Manage Quizzes** section
3. Find the quiz you want to feature
4. Click the **"Set Featured"** button on the quiz card
5. The quiz card will show:
   - A golden border
   - A star badge (⭐) in the top-right corner
   - The button changes to **"⭐ Featured"** with a gold background

#### Removing from Featured
1. Click the **"⭐ Featured"** button again on any featured quiz
2. The quiz will be removed from featured status
3. The card returns to normal appearance

#### Deleting a Quiz
When you delete a quiz (featured or not):
- It's completely removed from the system
- If it was featured, it automatically disappears from the homepage Featured Contests section
- No manual cleanup needed!

### For Students & Visitors

#### Viewing Featured Contests
1. Visit the homepage
2. Scroll to the **"Featured Contests"** section
3. You'll see all quizzes that teachers have marked as featured
4. Each contest card shows:
   - Quiz title
   - Description (if provided)
   - Number of questions
   - Duration in minutes
   - Number of attempts
   - **"Join Quiz"** button

#### Joining a Featured Contest
1. Click the **"Join Quiz"** button on any contest card
2. You'll be prompted to login as a student
3. Enter your name, email, OTP, and the quiz PIN
4. Start the quiz!

## Technical Details

### Data Structure
Each quiz now has a `featured` property:
```javascript
{
  id: "1234567890",
  title: "Math Quiz - Chapter 5",
  featured: true,  // NEW property
  // ... other properties
}
```

### Storage
- Featured status is stored in `localStorage` with the quiz data
- Automatically syncs across teacher dashboard and homepage

### Visual Indicators
- **Teacher Dashboard**: Featured quizzes have gold borders and star badges
- **Homepage**: Only featured quizzes appear in the Featured Contests section
- **Empty State**: Shows message if no quizzes are featured yet

## Benefits

1. **Teacher Control**: Teachers decide which quizzes to promote
2. **Automatic Cleanup**: Deleted quizzes automatically removed from featured
3. **Visual Feedback**: Clear indicators show featured status
4. **Easy Toggle**: One-click to feature/unfeature quizzes
5. **Student Discovery**: Students easily find important/recommended quizzes

## Example Workflow

### Scenario: Teacher Creates Important Quiz
1. Teacher creates "Final Exam Practice" quiz
2. Teacher clicks "Set Featured" in Manage Quizzes
3. Quiz appears on homepage Featured Contests
4. Students see it and join using the displayed information
5. After exam period, teacher either:
   - Clicks "⭐ Featured" to unfeature (quiz still exists)
   - Clicks "Delete" to remove entirely (auto-removes from featured)

## Notes

- Multiple quizzes can be featured simultaneously
- Featured status persists across browser sessions
- Only featured quizzes appear in the homepage section
- Non-featured quizzes remain accessible via PIN but don't show on homepage
