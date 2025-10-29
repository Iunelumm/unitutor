# UniTutor TODO

## 🔴 Critical Fixes (Before Launch)

- [x] Prevent self-booking: Filter out own tutor profile in FindTutors
- [x] Backend validation: Prevent studentId === tutorId in session creation
- [x] Prevent self-rating: Block users from rating themselves
- [x] Fix timezone: Convert all times to Pacific Time (PT/PST) display
- [x] Auto-scroll chat: Make chat window scroll to latest message automatically

## 🎯 Cold Start - Tutor Recruitment Beta

- [x] Add FocusCourses list (9 high-demand courses)
- [x] Highlight focus courses in tutor profile course selection with ⭐
- [x] Add homepage banner promoting focus courses
- [x] Add tutor welcome banner after login
- [x] Add access code gating: "BETA-TUTOR-2025" required for tutor signup
- [x] Display tutor count on homepage: "📚 {N} UCSB tutors have joined"
- [x] Apply Pacific Time (PT) to all time displays

## 🔒 Future Features (Post-Beta)

- [ ] Email domain restriction: Only allow @ucsb.edu emails
- [ ] Student registration reopening mechanism
- [ ] Featured tutor system (founding tutors appear first)

## ✅ Completed Features

- [x] Basic student and tutor dashboards
- [x] Profile management with availability grid
- [x] Week-based availability system
- [x] Session booking with time matching
- [x] Session lifecycle (PENDING → CONFIRMED → PENDING_RATING → CLOSED)
- [x] Dual confirmation system (both parties must confirm completion)
- [x] Rating system (public for students, private for tutors)
- [x] Chat with contact info sanitization
- [x] 12-hour cancellation policy with cancellation rating
- [x] 4-hour advance booking requirement
- [x] Dispute detection and admin resolution
- [x] Support ticket system
- [x] Admin dashboard with analytics
- [x] Admin user search and management
- [x] Admin session monitoring
- [x] Admin ticket response system



## 🚀 Deployment Migration (In Progress)

- [x] Choose Railway MySQL (no code changes needed)
- [x] Restore MySQL configuration
- [x] Set up Google OAuth credentials for production
- [x] Push code to GitHub repository
- [x] Configure Railway deployment
- [x] Set up environment variables in Railway
- [x] Initialize database schema in Railway MySQL
- [x] Deploy to production
- [x] Test OAuth login flow
- [ ] Test database operations
- [ ] Configure custom domain (optional)



## 🐛 Deployment Issues

- [x] Replace Manus OAuth with Google OAuth
- [x] Remove all Manus branding and warnings
- [x] Implement Google OAuth login flow
- [x] Update callback URL handling
- [x] Test complete authentication flow



## 🐛 Production Issues

- [ ] Fix OAuth callback error on Railway deployment
- [x] Update high-demand courses to: ECON 10A, CHEM 109A, CHEM 1A, MATH 3A, CMPSC 8, CMPSC 16
- [ ] Ensure admin dashboard is accessible (can stay on Manus platform)



## 🎯 User Role Selection & Onboarding

- [x] Add role selection during registration (Student / Tutor / Both)
- [x] Store user's selected roles in database
- [x] Only allow role switching for users who selected "Both"
- [x] Add founding tutor welcome message after tutor registration
- [x] Emphasize priority recommendation for early tutors
- [x] Hide role switch button for single-role users

