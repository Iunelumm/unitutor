# UniTutor TODO

## 🔴 Critical Fixes (Before Launch)

- [x] Prevent self-booking: Filter out own tutor profile in FindTutors
- [x] Backend validation: Prevent studentId === tutorId in session creation
- [x] Prevent self-rating: Block users from rating themselves
- [ ] Fix timezone: Convert all times to Pacific Time (PT/PST) display
- [x] Auto-scroll chat: Make chat window scroll to latest message automatically

## 🎯 Cold Start - Tutor Recruitment Beta

- [ ] Add FocusCourses list (9 high-demand courses)
- [ ] Highlight focus courses in tutor profile course selection with ⭐
- [ ] Add homepage banner promoting focus courses
- [ ] Disable student registration completely
- [ ] Show "student registration closed" message when students try to sign up
- [ ] Add tutor welcome banner after login
- [ ] Add access code gating: "BETA-TUTOR-2025" required for tutor signup
- [ ] Display tutor count on homepage: "📚 {N} UCSB tutors have joined"
- [ ] Update all homepage text to reflect tutor-only beta mode

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

