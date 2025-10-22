const fs = require('fs');

const pages = {
  'TutorProfile.tsx': `export default function TutorProfile() {
  return <div className="p-8"><h1>Tutor Profile - Similar to Student Profile but with all fields required including bio</h1></div>;
}`,

  'TutorDashboard.tsx': `export default function TutorDashboard() {
  return <div className="p-8"><h1>Tutor Dashboard - Shows pending requests, sessions, and credit points</h1></div>;
}`,

  'FindTutors.tsx': `export default function FindTutors() {
  return <div className="p-8"><h1>Find Tutors - Search tutors by course, view ratings and book sessions</h1></div>;
}`,

  'Sessions.tsx': `export default function Sessions() {
  return <div className="p-8"><h1>Sessions - List all sessions with filters and actions</h1></div>;
}`,

  'SessionDetail.tsx': `export default function SessionDetail() {
  return <div className="p-8"><h1>Session Detail - View session details, chat, confirm, rate</h1></div>;
}`,

  'Support.tsx': `export default function Support() {
  return <div className="p-8"><h1>Support - FAQ and ticket system</h1></div>;
}`,

  'AdminDashboard.tsx': `export default function AdminDashboard() {
  return <div className="p-8"><h1>Admin Dashboard - View all sessions, disputes, tickets, analytics</h1></div>;
}`
};

for (const [filename, content] of Object.entries(pages)) {
  fs.writeFileSync(filename, content);
  console.log(`Created ${filename}`);
}
