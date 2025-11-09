/**
 * High-demand courses for Tutor Recruitment Beta
 * These courses are prioritized during the cold start phase
 */

export const FOCUS_COURSES = [
  { code: "ECON 1", name: "Principles of Economics (Micro)" },
  { code: "ECON 5", name: "Statistics for Economics" },
  { code: "ECON 10A", name: "Intermediate Microeconomic Theory" },
  { code: "CHEM 1A", name: "General Chemistry I" },
  { code: "CHEM 1AL", name: "General Chemistry Lab" },
  { code: "CHEM 109A", name: "Organic Chemistry I" },
  { code: "PSTAT 8", name: "Transition to Data Science, Probability and Statistics" },
  { code: "PSTAT 109", name: "Statistics for Economics and Finance" },
  { code: "PSTAT 120A", name: "Probability and Statistics" },
  { code: "MATH 4A", name: "Linear Algebra with Applications" },
];

export const FOCUS_COURSE_CODES = FOCUS_COURSES.map(c => c.code);

export function isFocusCourse(courseCode: string): boolean {
  return FOCUS_COURSE_CODES.includes(courseCode);
}

export function getFocusCourseDisplay(courseCode: string): string {
  const course = FOCUS_COURSES.find(c => c.code === courseCode);
  return course ? `⭐ ${course.code} - ${course.name}` : courseCode;
}

