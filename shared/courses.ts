export const COURSE_LEVELS = ["Undergraduate", "Graduate", "PhD"] as const;

export const UCSB_COURSES = [
  // Computer Science
  "CMPSC 8 - Introduction to Computer Science",
  "CMPSC 16 - Problem Solving with Computers I",
  "CMPSC 24 - Problem Solving with Computers II",
  "CMPSC 32 - Object Oriented Design",
  "CMPSC 40 - Foundations of Computer Science",
  "CMPSC 48 - Computer Science Project",
  "CMPSC 56 - Advanced Applications Programming",
  "CMPSC 64 - Computer Organization and Logic Design",
  "CMPSC 130A - Data Structures and Algorithms I",
  "CMPSC 130B - Data Structures and Algorithms II",
  "CMPSC 138 - Automata and Formal Languages",
  "CMPSC 148 - Computer Network Fundamentals",
  "CMPSC 154 - Formal Languages and Computability",
  "CMPSC 156 - Advanced Applications Programming",
  "CMPSC 160 - Translation of Programming Languages",
  "CMPSC 162 - Programming Languages",
  "CMPSC 165A - Artificial Intelligence",
  "CMPSC 165B - Machine Learning",
  "CMPSC 174A - Fundamentals of Database Systems",
  "CMPSC 176A - Introduction to Computer Communication Networks",
  "CMPSC 180 - Software Engineering",
  "CMPSC 189A - Senior Capstone Project",
  "CMPSC 189B - Senior Capstone Project",
  "CMPSC 190A - Mobile Application Development",
  
  // Mathematics
  "MATH 2A - Single Variable Calculus Early Transcendentals",
  "MATH 2B - Single Variable Calculus Early Transcendentals",
  "MATH 3A - Calculus with Applications",
  "MATH 3B - Calculus with Applications",
  "MATH 3C - Vector Calculus",
  "MATH 4A - Linear Algebra",
  "MATH 4B - Differential Equations",
  "MATH 5A - Introduction to Data Science I",
  "MATH 5B - Introduction to Data Science II",
  "MATH 6A - Vector Calculus I",
  "MATH 6B - Vector Calculus II",
  "MATH 8 - Transition to Higher Mathematics",
  "MATH 34A - Differential Equations with Linear Algebra",
  "MATH 34B - Differential Equations with Linear Algebra",
  "MATH 108A - Introduction to Abstract Algebra",
  "MATH 108B - Introduction to Abstract Algebra",
  "MATH 117 - Methods of Analysis",
  "MATH 118A - Real Analysis",
  "MATH 118B - Real Analysis",
  "MATH 122A - Introduction to Complex Analysis",
  "MATH 137A - Introduction to Topology",
  
  // Physics
  "PHYS 1 - Basic Physics",
  "PHYS 2 - Basic Physics",
  "PHYS 3 - Basic Physics",
  "PHYS 4 - Basic Physics",
  "PHYS 6A - Physics for Scientists and Engineers",
  "PHYS 6B - Physics for Scientists and Engineers",
  "PHYS 6C - Physics for Scientists and Engineers",
  "PHYS 20 - Computational Physics",
  "PHYS 115A - Classical Mechanics I",
  "PHYS 115B - Classical Mechanics II",
  "PHYS 115C - Classical Mechanics III",
  "PHYS 119A - Quantum Mechanics I",
  "PHYS 119B - Quantum Mechanics II",
  "PHYS 127A - Electromagnetic Theory I",
  "PHYS 127B - Electromagnetic Theory II",
  "PHYS 6AL - Physics Laboratory for Scientists and Engineers",
  "PHYS 6BL - Physics Laboratory for Scientists and Engineers",
  "PHYS 6CL - Physics Laboratory for Scientists and Engineers",
  
  // Chemistry
  "CHEM 1A - General Chemistry",
  "CHEM 1B - General Chemistry",
  "CHEM 1C - General Chemistry",
  "CHEM 6A - Organic Chemistry",
  "CHEM 6B - Organic Chemistry",
  "CHEM 6C - Organic Chemistry",
  "CHEM 109A - Physical Chemistry",
  "CHEM 109B - Physical Chemistry",
  "CHEM 109C - Physical Chemistry",
  "CHEM 113A - Inorganic Chemistry",
  "CHEM 142A - Biochemistry",
  "CHEM 142B - Biochemistry",
  "CHEM 1AL - General Chemistry Laboratory",
  "CHEM 1BL - General Chemistry Laboratory",
  "CHEM 1CL - General Chemistry Laboratory",
  "CHEM 6AL - Organic Chemistry Laboratory",
  "CHEM 6BL - Organic Chemistry Laboratory",
  
  // Biology
  "BIOL 1 - Introductory Biology",
  "BIOL 2 - Introductory Biology",
  "BIOL 3 - Introductory Biology",
  "EEMB 2 - Introduction to Evolution and Ecology",
  "EEMB 3 - Introduction to Evolution and Ecology",
  "MCDB 1A - Molecular, Cellular, and Developmental Biology",
  "MCDB 1B - Molecular, Cellular, and Developmental Biology",
  "MCDB 101A - Biochemistry",
  "MCDB 108A - Genetics",
  "MCDB 111 - Cell Biology",
  
  // Economics
  "ECON 1 - Principles of Microeconomics",
  "ECON 2 - Principles of Macroeconomics",
  "ECON 3A - Financial Accounting",
  "ECON 3B - Managerial Accounting",
  "ECON 10A - Intermediate Microeconomic Theory",
  "ECON 10B - Intermediate Macroeconomic Theory",
  "ECON 100A - Microeconomic Theory",
  "ECON 100B - Macroeconomic Theory",
  "ECON 134A - Corporate Finance",
  "ECON 136A - Financial Markets",
  "ECON 140A - Econometrics",
  "ECON 140B - Econometrics",
  
  // Statistics
  "PSTAT 5A - Understanding Data",
  "PSTAT 5E - Introduction to Probability and Statistics",
  "PSTAT 5LS - Introduction to Probability and Statistics for Life Sciences",
  "PSTAT 8 - Transition to Data Science, Probability and Statistics",
  "PSTAT 10 - Principles of Data Science with R",
  "PSTAT 109 - Statistics for Economics and Finance",
  "PSTAT 115 - Introduction to Bayesian Data Analysis",
  "PSTAT 120A - Probability and Statistics",
  "PSTAT 120B - Probability and Statistics",
  "PSTAT 120C - Probability and Statistics",
  "PSTAT 126 - Regression Analysis",
  "PSTAT 131 - Statistical Machine Learning",
  "PSTAT 134 - Statistical Data Science",
  "PSTAT 160A - Applied Stochastic Processes",
  "PSTAT 171 - Stochastic Processes",
  
  // Engineering
  "ECE 1A - Linear Circuits I",
  "ECE 2A - Circuits and Systems",
  "ECE 10A - Fundamentals of Electrical Engineering",
  "ECE 10B - Fundamentals of Electrical Engineering",
  "ECE 15A - Fundamentals of Logic Design",
  "ECE 15B - Fundamentals of Logic Design",
  "ME 10 - Introduction to Mechanical Engineering",
  "ME 14 - Introduction to Statics and Strength of Materials",
  "ME 15 - Dynamics",
  "ME 103 - Thermodynamics",
  
  // Writing
  "WRIT 1 - Introduction to Writing",
  "WRIT 2 - Academic Writing",
  "WRIT 50 - Writing in the Disciplines",
  "WRIT 105E - Writing for Engineering",
  "WRIT 105F - Writing for Film and Media Studies",
  
  // General Education
  "COMM 1 - Public Speaking",
  "COMM 87 - Introduction to Communication Research",
  "COMM 88 - Data Communication and Literacy",
  "COMM 89 - Introduction to Media Studies",
  "COMM 106I - Intercultural Communication",
  "PHIL 1 - Introduction to Philosophy",
  "PHIL 4 - Introduction to Ethics",
  "PHIL 6 - Introduction to Logic",
  "PHIL 7 - Introduction to Philosophy of Mind",
  "PHIL 21 - Critical Thinking",
  "HIST 2A - Western Civilization",
  "HIST 2B - Western Civilization",
  "HIST 2C - Western Civilization",
  "HIST 4A - Western Civilization",
  "HIST 4B - Western Civilization",
  "HIST 4C - Western Civilization",
  "ART 1A - Introduction to Visual Culture",
  "ARTHI 6A - Introduction to Art History",
  "ARTHI 6B - Introduction to Art History",
  "ARTHI 6C - Introduction to Art History",
  "ARTST 1 - Studio Art Fundamentals",
  "ARTST 10 - Introduction to Drawing",
  "MUS 1 - Fundamentals of Music",
  "MUS 2 - Introduction to Music Theory",
  "MUS 11 - Introduction to Western Music",
  "MUS 15 - Music Fundamentals",
  "THTR 5 - Introduction to Acting",
  "THTR 10 - Introduction to Theater",
  "DANCE 45 - Dance Appreciation",
  
  // Social Sciences (GE Area D)
  "ANTH 2 - Introductory Cultural Anthropology",
  "ANTH 3 - Introductory Archaeology",
  "ANTH 5 - Introduction to Biological Anthropology",
  "POL S 12 - Introduction to Comparative Politics",
  "POL S 15 - Introduction to International Relations",
  "SOC 1 - Introduction to Sociology",
  "SOC 2 - Social Problems",
  "GEOG 3A - Geography of the Physical Environment",
  "GEOG 3B - Geography of the Physical Environment",
  "GEOG 5 - People, Place, and Environment",
  "PSY 1 - Introduction to Psychology",
  "LING 3 - Introduction to Linguistics",
  
  // Science GE (Area B)
  "ASTRO 1 - Introduction to the Solar System",
  "ASTRO 2 - Introduction to Stars and Galaxies",
  "ASTRO 4 - Black Holes",
  "EARTH 4 - Geology and the Environment",
  "EARTH 20 - Earthquakes and Volcanoes",
  
  // Culture & Thought (GE Area E)
  "RG ST 1 - World Religions",
  "RG ST 2 - Introduction to the Study of Religion",
  "CLASS 40 - Classical Mythology",
  
  // Ethnicity (GE Area G)
  "BL ST 4 - Introduction to Black Studies",
  "CH ST 1 - Introduction to Chicana/o Studies",
  "AS AM 1 - Introduction to Asian American Studies",
  "AS AM 5 - Introduction to Asian American History",
  
  // English
  "ENGL 10 - Introduction to Literary Study",
  "ENGL 20 - Introduction to Shakespeare",
  "ENGL 22 - Literature for Children",
  
  // Environmental Studies
  "ENV S 1 - Introduction to Environmental Studies",
  "ENV S 2 - Introduction to Environmental Science",
  "ENV S 3 - Introduction to Environmental Studies",
];

export function searchCourses(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return UCSB_COURSES;
  }
  
  const lowerQuery = query.toLowerCase();
  return UCSB_COURSES.filter(course => 
    course.toLowerCase().includes(lowerQuery)
  );
}



// High-demand courses for cold start tutor recruitment
export const HIGH_DEMAND_COURSES = [
  // Priority courses for founding tutors
  "ECON 10A - Intermediate Microeconomic Theory",
  "CHEM 109A - Organic Chemistry",
  "CHEM 1A - General Chemistry",
  "MATH 3A - Calculus with Applications",
  "CMPSC 8 - Introduction to Computer Science",
  "CMPSC 16 - Problem Solving with Computers I",
];

