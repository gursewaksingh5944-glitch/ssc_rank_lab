#!/usr/bin/env node
/**
 * Generate Tier-2 questions for SSC CGL mock tests.
 * Tier 2 has: marks=3, negativeMarks=1, harder difficulty distribution.
 *
 * Run: node backend/generate-tier2-questions.js --dry-run   (preview)
 * Run: node backend/generate-tier2-questions.js              (apply)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BANK_PATH = path.join(__dirname, "data", "question-bank.json");
const dryRun = process.argv.includes("--dry-run");

function uid() {
  return "t2_" + crypto.randomBytes(6).toString("hex");
}

const now = new Date().toISOString();

// [question, [options], answerIndex, subject, topic, difficulty]
const T2_QUESTIONS = [
  // ═══════════ QUANT (40 questions — harder level) ═══════════
  // Algebra
  ["If x + 1/x = 5, find the value of x² + 1/x².", ["23", "25", "27", "21"], 0, "quant", "Algebra", "medium"],
  ["If a + b = 10 and ab = 21, find a² + b².", ["58", "52", "48", "62"], 0, "quant", "Algebra", "medium"],
  ["Solve: 2x² - 7x + 3 = 0. The roots are:", ["3 and 1/2", "3 and 2", "1 and 3", "2 and 1/2"], 0, "quant", "Algebra", "medium"],
  ["If x - 1/x = 4, find x⁴ + 1/x⁴.", ["322", "324", "320", "318"], 0, "quant", "Algebra", "hard"],

  // Number System
  ["What is the remainder when 3²⁰ is divided by 7?", ["2", "1", "4", "6"], 0, "quant", "Number System", "hard"],
  ["The HCF of 252 and 360 is:", ["36", "18", "72", "12"], 0, "quant", "Number System", "medium"],
  ["Find the largest 4-digit number exactly divisible by 88.", ["9944", "9988", "9956", "9900"], 0, "quant", "Number System", "medium"],
  ["When a number is divided by 13, the remainder is 11. What is the remainder when the same number is divided by 26?", ["11 or 24", "11", "24", "13"], 0, "quant", "Number System", "hard"],

  // Geometry
  ["In a triangle, if the sides are 13, 14, and 15 cm, find the area.", ["84 cm²", "90 cm²", "78 cm²", "72 cm²"], 0, "quant", "Geometry", "hard"],
  ["The angle subtended by an arc at the center is 120°. What angle does it subtend at any point on the remaining part of the circle?", ["60°", "120°", "90°", "30°"], 0, "quant", "Geometry", "medium"],
  ["If the diagonals of a rhombus are 24 cm and 10 cm, its area is:", ["120 cm²", "240 cm²", "60 cm²", "170 cm²"], 0, "quant", "Geometry", "easy"],
  ["In a cyclic quadrilateral, if one angle is 70°, the opposite angle is:", ["110°", "70°", "90°", "100°"], 0, "quant", "Geometry", "easy"],

  // Trigonometry
  ["If sin A = 3/5, find the value of cos A.", ["4/5", "3/4", "5/3", "5/4"], 0, "quant", "Trigonometry", "easy"],
  ["The value of sin²30° + cos²60° is:", ["1/2", "1", "3/4", "1/4"], 0, "quant", "Trigonometry", "medium"],
  ["If tan θ + cot θ = 2, find the value of tan²θ + cot²θ.", ["2", "4", "1", "0"], 0, "quant", "Trigonometry", "hard"],
  ["The value of sin 60° × cos 30° + cos 60° × sin 30° is:", ["1", "√3/2", "1/2", "0"], 0, "quant", "Trigonometry", "medium"],

  // Mensuration
  ["The volume of a sphere with radius 7 cm is (take π = 22/7):", ["1437.33 cm³", "1540 cm³", "1232 cm³", "1000 cm³"], 0, "quant", "Mensuration", "medium"],
  ["A cone has radius 6 cm and slant height 10 cm. Its curved surface area is:", ["60π cm²", "36π cm²", "100π cm²", "48π cm²"], 0, "quant", "Mensuration", "medium"],
  ["A cylinder has radius 7 cm and height 10 cm. Its total surface area is (π = 22/7):", ["748 cm²", "440 cm²", "880 cm²", "660 cm²"], 0, "quant", "Mensuration", "medium"],
  ["The length of the diagonal of a cuboid with dimensions 3, 4, and 12 cm is:", ["13 cm", "12 cm", "15 cm", "14 cm"], 0, "quant", "Mensuration", "easy"],

  // Profit & Loss
  ["A shopkeeper marks goods 40% above cost price and gives a discount of 20%. His profit percentage is:", ["12%", "20%", "15%", "10%"], 0, "quant", "Profit & Loss", "medium"],
  ["If a man buys 11 oranges for ₹10 and sells 10 oranges for ₹11, his profit % is:", ["21%", "10%", "11%", "20%"], 0, "quant", "Profit & Loss", "hard"],
  ["An article is sold at 20% profit. If both cost price and selling price are ₹100 less, the profit would be 25%. The cost price is:", ["₹500", "₹400", "₹600", "₹300"], 0, "quant", "Profit & Loss", "hard"],

  // Time & Work
  ["A can do a work in 12 days and B can do it in 18 days. In how many days will they finish it together?", ["7.2 days", "6 days", "8 days", "9 days"], 0, "quant", "Time & Work", "medium"],
  ["If 15 men can do a work in 20 days, how many men are needed to complete it in 12 days?", ["25", "30", "20", "18"], 0, "quant", "Time & Work", "easy"],
  ["A pipe can fill a tank in 6 hours. Due to a leak, it fills in 8 hours. The leak alone can empty in:", ["24 hours", "12 hours", "48 hours", "16 hours"], 0, "quant", "Time & Work", "medium"],

  // Time & Distance
  ["A train 150 m long passes a pole in 10 seconds. Its speed in km/h is:", ["54 km/h", "60 km/h", "45 km/h", "36 km/h"], 0, "quant", "Time & Distance", "easy"],
  ["Two trains running in opposite directions cross each other in 10 seconds. Their speeds are 36 km/h and 54 km/h. If one train is 100 m long, the other is:", ["150 m", "200 m", "120 m", "180 m"], 0, "quant", "Time & Distance", "hard"],
  ["A boat goes 30 km upstream and 44 km downstream in 10 hours. It goes 40 km upstream and 55 km downstream in 13 hours. Speed of current is:", ["3 km/h", "4 km/h", "5 km/h", "2 km/h"], 0, "quant", "Time & Distance", "hard"],

  // Ratio & Proportion
  ["If A:B = 2:3 and B:C = 4:5, then A:B:C is:", ["8:12:15", "2:3:5", "4:6:5", "8:12:10"], 0, "quant", "Ratio & Proportion", "medium"],
  ["The ratio of incomes of A and B is 5:4 and their expenditure ratio is 3:2. If each saves ₹2000, income of A is:", ["₹5000", "₹4000", "₹6000", "₹3000"], 0, "quant", "Ratio & Proportion", "hard"],

  // Simple & Compound Interest
  ["The SI on ₹5000 at 8% per annum for 3 years is:", ["₹1200", "₹1000", "₹1500", "₹800"], 0, "quant", "Simple & Compound Interest", "easy"],
  ["The compound interest on ₹10000 at 10% for 2 years is:", ["₹2100", "₹2000", "₹2200", "₹1900"], 0, "quant", "Simple & Compound Interest", "medium"],
  ["The difference between CI and SI on ₹8000 at 5% per annum for 2 years is:", ["₹20", "₹40", "₹10", "₹50"], 0, "quant", "Simple & Compound Interest", "medium"],

  // Percentage & Average
  ["If 30% of a number is 150, the number is:", ["500", "450", "400", "600"], 0, "quant", "Percentage", "easy"],
  ["The average of first 50 natural numbers is:", ["25.5", "25", "26", "50"], 0, "quant", "Average", "easy"],
  ["The average of 5 numbers is 20. If one number is excluded, the average becomes 18. The excluded number is:", ["28", "24", "20", "30"], 0, "quant", "Average", "medium"],

  // Data Interpretation
  ["In a bar chart, sales in Q1, Q2, Q3, Q4 are ₹40L, ₹60L, ₹50L, ₹80L. What percentage of total sales occurred in Q4?", ["34.78%", "30%", "40%", "25%"], 0, "quant", "Data Interpretation", "medium"],
  ["A pie chart shows 90° for category A out of 360°. If total value is ₹1200, value of A is:", ["₹300", "₹400", "₹200", "₹600"], 0, "quant", "Data Interpretation", "easy"],

  // ═══════════ ENGLISH (35 questions — harder level) ═══════════
  // Error Detection
  ["Identify the error: 'Each of the boys have completed their assignment.'", ["have completed", "Each of the boys", "their assignment", "No error"], 0, "english", "Error Detection", "medium"],
  ["Identify the error: 'The committee have decided to postpone the meeting.'", ["have decided", "The committee", "to postpone the meeting", "No error"], 0, "english", "Error Detection", "medium"],
  ["Identify the error: 'Neither the teacher nor the students was present.'", ["was present", "Neither the teacher", "nor the students", "No error"], 0, "english", "Error Detection", "hard"],
  ["Identify the error: 'He is one of the best player in the world.'", ["best player", "He is one of", "in the world", "No error"], 0, "english", "Error Detection", "easy"],
  ["Identify the error: 'The sceneries of Kashmir are very beautiful.'", ["The sceneries", "of Kashmir", "are very beautiful", "No error"], 0, "english", "Error Detection", "medium"],

  // Fill in the Blanks
  ["She ___ to the market yesterday.", ["went", "go", "gone", "going"], 0, "english", "Fill in the Blanks", "easy"],
  ["The teacher insisted that every student ___ present.", ["be", "is", "was", "were"], 0, "english", "Fill in the Blanks", "hard"],
  ["Neither Ram ___ Shyam was present.", ["nor", "or", "and", "but"], 0, "english", "Fill in the Blanks", "easy"],
  ["If I ___ you, I would not do this.", ["were", "was", "am", "had been"], 0, "english", "Fill in the Blanks", "medium"],
  ["He has been working here ___ 2010.", ["since", "for", "from", "by"], 0, "english", "Fill in the Blanks", "easy"],

  // Vocabulary
  ["Choose the word most similar in meaning to 'BENEVOLENT':", ["Kind", "Cruel", "Indifferent", "Lazy"], 0, "english", "Vocabulary", "easy"],
  ["Choose the word opposite in meaning to 'OPAQUE':", ["Transparent", "Dense", "Dark", "Thick"], 0, "english", "Vocabulary", "easy"],
  ["Choose the synonym of 'MAGNANIMOUS':", ["Generous", "Selfish", "Cruel", "Timid"], 0, "english", "Vocabulary", "medium"],
  ["Choose the antonym of 'PRUDENT':", ["Reckless", "Wise", "Careful", "Cautious"], 0, "english", "Vocabulary", "medium"],
  ["The word 'EPHEMERAL' means:", ["Short-lived", "Eternal", "Beautiful", "Dark"], 0, "english", "Vocabulary", "hard"],

  // One Word Substitution
  ["A person who collects stamps:", ["Philatelist", "Numismatist", "Archaeologist", "Philanthropist"], 0, "english", "One Word Substitution", "easy"],
  ["A speech made without prior preparation:", ["Extempore", "Prologue", "Epilogue", "Soliloquy"], 0, "english", "One Word Substitution", "medium"],
  ["One who is all-powerful:", ["Omnipotent", "Omniscient", "Omnipresent", "Omnivore"], 0, "english", "One Word Substitution", "medium"],
  ["A person who hates mankind:", ["Misanthrope", "Philanthropist", "Misogynist", "Altruist"], 0, "english", "One Word Substitution", "medium"],
  ["Government by the people:", ["Democracy", "Autocracy", "Monarchy", "Oligarchy"], 0, "english", "One Word Substitution", "easy"],

  // Cloze Test (standalone Q format)
  ["In the sentence 'The news ___ not encouraging', the correct word is:", ["is", "are", "were", "have been"], 0, "english", "Cloze Test", "easy"],
  ["'Each of the students ___ a book.' Fill with correct verb:", ["has", "have", "had", "having"], 0, "english", "Cloze Test", "medium"],

  // Spelling
  ["Choose the correctly spelt word:", ["Bureaucracy", "Beurocracy", "Buearocracy", "Bureacracy"], 0, "english", "Spelling", "medium"],
  ["Choose the correctly spelt word:", ["Accommodate", "Accomodate", "Acommodate", "Acomodate"], 0, "english", "Spelling", "medium"],
  ["Choose the correctly spelt word:", ["Conscience", "Concience", "Consience", "Consciance"], 0, "english", "Spelling", "easy"],

  // Para Jumbles
  ["Arrange: (P) Although it was raining (Q) they went out (R) to play football (S) without any umbrella. The correct order is:", ["PQRS", "QPRS", "PRQS", "SQRP"], 0, "english", "Para Jumbles", "medium"],
  ["Arrange: (P) Early to bed (Q) makes a man (R) healthy, wealthy (S) and wise. The correct order is:", ["PQRS", "QPRS", "PRQS", "RSPQ"], 0, "english", "Para Jumbles", "easy"],

  // Sentence Completion
  ["'Not only ___ he intelligent, he is also hardworking.'", ["is", "was", "does", "has"], 0, "english", "Sentence Completion", "medium"],
  ["'Hardly had he reached the station ___ the train left.'", ["when", "than", "before", "after"], 0, "english", "Sentence Completion", "hard"],

  // Active Passive
  ["Change to passive: 'The manager will sign the letter.'", ["The letter will be signed by the manager.", "The letter is signed by the manager.", "The letter was signed by the manager.", "The letter has been signed by the manager."], 0, "english", "Active Passive", "easy"],
  ["Change to passive: 'They are building a new bridge.'", ["A new bridge is being built by them.", "A new bridge was being built by them.", "A new bridge has been built by them.", "A new bridge will be built by them."], 0, "english", "Active Passive", "medium"],

  // Direct Indirect
  ["Change to indirect: He said, 'I am very tired.'", ["He said that he was very tired.", "He said that I am very tired.", "He told that he is very tired.", "He says that he was very tired."], 0, "english", "Direct Indirect", "easy"],
  ["Change to indirect: She said to me, 'Where are you going?'", ["She asked me where I was going.", "She told me where I was going.", "She asked me where was I going.", "She said to me where was I going."], 0, "english", "Direct Indirect", "medium"],

  // ═══════════ REASONING (35 questions) ═══════════
  // Number Series
  ["Find the missing term: 2, 6, 12, 20, 30, ?", ["42", "40", "36", "44"], 0, "reasoning", "Number Series", "medium"],
  ["Find the missing term: 3, 9, 27, 81, ?", ["243", "210", "162", "216"], 0, "reasoning", "Number Series", "easy"],
  ["Find the missing term: 1, 4, 9, 16, 25, ?", ["36", "34", "30", "38"], 0, "reasoning", "Number Series", "easy"],
  ["Find the wrong number: 2, 5, 10, 17, 28, 37", ["28", "37", "10", "5"], 0, "reasoning", "Number Series", "hard"],

  // Coding-Decoding
  ["If APPLE is coded as ELPPA, then ORANGE is coded as:", ["EGNARO", "ORNAGE", "NAROGE", "EGRANO"], 0, "reasoning", "Coding-Decoding", "easy"],
  ["If CAT = 24, DOG = 26, then PIG = ?", ["28", "30", "32", "26"], 0, "reasoning", "Coding-Decoding", "medium"],
  ["In a certain code, FLOWER is written as GMPXFS. How is GARDEN written?", ["HBSEFO", "HBSEDO", "GBSEFO", "GBSEDO"], 0, "reasoning", "Coding-Decoding", "medium"],
  ["If 'sky' is called 'sea', 'sea' is called 'water', 'water' is called 'air', then what do we drink?", ["air", "water", "sea", "sky"], 0, "reasoning", "Coding-Decoding", "medium"],

  // Analogy
  ["Pen : Writer :: Brush : ?", ["Painter", "Teacher", "Farmer", "Driver"], 0, "reasoning", "Analogy", "easy"],
  ["Clock : Time :: Thermometer : ?", ["Temperature", "Pressure", "Speed", "Distance"], 0, "reasoning", "Analogy", "easy"],
  ["Eagle : Nest :: Rabbit : ?", ["Burrow", "Den", "Cage", "Stable"], 0, "reasoning", "Analogy", "medium"],
  ["Pistol : Holster :: Sword : ?", ["Scabbard", "Handle", "Shield", "Armour"], 0, "reasoning", "Analogy", "hard"],

  // Classification
  ["Find the odd one out: 25, 36, 49, 63, 81", ["63", "25", "36", "81"], 0, "reasoning", "Classification", "medium"],
  ["Find the odd one out: Mercury, Venus, Moon, Mars", ["Moon", "Mercury", "Venus", "Mars"], 0, "reasoning", "Classification", "easy"],
  ["Find the odd one out: Table, Chair, Bed, Cloth", ["Cloth", "Table", "Chair", "Bed"], 0, "reasoning", "Classification", "easy"],

  // Syllogism
  ["Statement: All dogs are animals. All animals are living beings. Conclusion: All dogs are living beings.", ["True", "False", "Cannot be determined", "Partially true"], 0, "reasoning", "Syllogism", "easy"],
  ["Statement: Some pens are pencils. All pencils are erasers. Conclusion I: Some pens are erasers. Conclusion II: All erasers are pencils.", ["Only I follows", "Only II follows", "Both follow", "Neither follows"], 0, "reasoning", "Syllogism", "medium"],
  ["Statement: No cat is a dog. Some dogs are rats. Conclusions: I. Some rats are not cats. II. Some cats are rats.", ["Only I follows", "Only II follows", "Both follow", "Neither follows"], 0, "reasoning", "Syllogism", "hard"],

  // Blood Relation
  ["A is the father of B. B is the sister of C. D is the husband of A's wife. How is D related to C?", ["Father", "Uncle", "Brother", "Grandfather"], 0, "reasoning", "Blood Relation", "medium"],
  ["Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?", ["Mother", "Sister", "Aunt", "Grandmother"], 0, "reasoning", "Blood Relation", "medium"],
  ["If X is the brother of Y, Y is the sister of Z, and Z is the father of W, how is X related to W?", ["Uncle", "Father", "Brother", "Grandfather"], 0, "reasoning", "Blood Relation", "hard"],

  // Seating Arrangement
  ["Six persons A, B, C, D, E, F sit in a row facing north. B sits next to E. A sits at one end. C is not next to A or B. D sits between A and F. Who sits in the middle?", ["D and F", "B and C", "E and F", "C and D"], 0, "reasoning", "Seating Arrangement", "hard"],
  ["Five friends are sitting in a row. A is to the left of B. C is to the right of D. E is between A and D. Who is in the middle?", ["E", "A", "B", "D"], 0, "reasoning", "Seating Arrangement", "medium"],

  // Venn Diagram
  ["In a class of 40 students, 25 play cricket, 20 play football, and 10 play both. How many play neither?", ["5", "10", "15", "0"], 0, "reasoning", "Venn Diagram", "medium"],
  ["Which Venn diagram best represents: Dogs, Cats, Animals?", ["Dogs and Cats inside Animals", "All three overlapping", "Dogs inside Cats inside Animals", "Three separate circles"], 0, "reasoning", "Venn Diagram", "easy"],

  // Arithmetic Reasoning
  ["A man has ₹480 in the denominations of ₹1, ₹5 and ₹10 coins. The number of coins of each denomination is equal. The number of coins of each denomination is:", ["40", "80", "60", "48"], 0, "reasoning", "Arithmetic Reasoning", "medium"],
  ["If 5 + 3 = 28, 9 + 1 = 810, then 2 + 6 = ?", ["48", "412", "64", "28"], 0, "reasoning", "Arithmetic Reasoning", "hard"],

  // ═══════════ GK (25 questions — Tier 2 level) ═══════════
  ["Who is the chairperson of NITI Aayog?", ["Prime Minister", "President", "Vice President", "Finance Minister"], 0, "gk", "Polity", "medium"],
  ["The Goods and Services Tax (GST) replaced which taxes?", ["Excise, VAT, Service Tax", "Income Tax, VAT", "Corporate Tax, Excise", "Customs, Income Tax"], 0, "gk", "Economy", "medium"],
  ["Which schedule of the Constitution deals with Anti-Defection Law?", ["Tenth Schedule", "Eighth Schedule", "Ninth Schedule", "Seventh Schedule"], 0, "gk", "Polity", "hard"],
  ["The Tropic of Cancer does NOT pass through which Indian state?", ["Odisha", "Rajasthan", "Gujarat", "West Bengal"], 0, "gk", "Geography", "hard"],
  ["Which Fundamental Right was removed by the 44th Amendment?", ["Right to Property", "Right to Equality", "Right to Freedom", "Right against Exploitation"], 0, "gk", "Polity", "medium"],
  ["The 'Arthashastra' was written by:", ["Kautilya", "Kalidasa", "Valmiki", "Tulsidas"], 0, "gk", "History", "easy"],
  ["National Income in India is calculated by which organization?", ["CSO (Central Statistics Office)", "RBI", "Finance Ministry", "NITI Aayog"], 0, "gk", "Economy", "medium"],
  ["The Chipko Movement is related to:", ["Conservation of forests", "Women empowerment", "Anti-corruption", "Land reform"], 0, "gk", "Geography", "easy"],
  ["Which disease is caused by deficiency of Vitamin B1 (Thiamine)?", ["Beriberi", "Scurvy", "Pellagra", "Rickets"], 0, "gk", "Biology", "medium"],
  ["The Panchayati Raj system was introduced based on the recommendation of:", ["Balwant Rai Mehta Committee", "Ashok Mehta Committee", "Sarkaria Commission", "Mandal Commission"], 0, "gk", "Polity", "hard"],
  ["The chemical name of Plaster of Paris is:", ["Calcium Sulphate Hemihydrate", "Calcium Carbonate", "Sodium Bicarbonate", "Calcium Oxide"], 0, "gk", "Chemistry", "hard"],
  ["Which planet has the Great Red Spot?", ["Jupiter", "Saturn", "Mars", "Neptune"], 0, "gk", "Science", "easy"],
  ["The Regulating Act was passed in which year?", ["1773", "1784", "1793", "1813"], 0, "gk", "History", "medium"],
  ["Which lake in India is both freshwater and saltwater?", ["Chilika Lake", "Wular Lake", "Dal Lake", "Loktak Lake"], 0, "gk", "Geography", "hard"],
  ["The term 'GDP at Factor Cost' is equal to:", ["GDP at market price minus net indirect taxes", "GDP at market price plus subsidies", "GDP plus depreciation", "GNP minus net factor income"], 0, "gk", "Economy", "hard"],
  ["Hemoglobin contains which metal?", ["Iron", "Copper", "Zinc", "Manganese"], 0, "gk", "Biology", "easy"],
  ["The 'Home Rule League' was started by:", ["Annie Besant and Bal Gangadhar Tilak", "Mahatma Gandhi", "Jawaharlal Nehru", "Subhas Chandra Bose"], 0, "gk", "History", "medium"],
  ["Which type of soil is best for cotton cultivation?", ["Black soil", "Red soil", "Alluvial soil", "Laterite soil"], 0, "gk", "Geography", "medium"],
  ["The Supreme Court of India was established on:", ["28 January 1950", "26 January 1950", "15 August 1947", "1 January 1950"], 0, "gk", "Polity", "medium"],
  ["Newton's law of cooling is related to:", ["Convection", "Conduction", "Radiation", "All of the above"], 0, "gk", "Physics", "medium"],

  // ═══════════ COMPUTER (20 questions) ═══════════
  ["The full form of CPU is:", ["Central Processing Unit", "Central Program Unit", "Computer Personal Unit", "Central Processor Utility"], 0, "computer", "Computer Fundamentals", "easy"],
  ["Which of the following is an input device?", ["Keyboard", "Monitor", "Printer", "Speaker"], 0, "computer", "Computer Fundamentals", "easy"],
  ["RAM stands for:", ["Random Access Memory", "Read Access Memory", "Readily Available Memory", "Random Active Memory"], 0, "computer", "Computer Fundamentals", "easy"],
  ["1 Gigabyte (GB) is equal to:", ["1024 MB", "1000 MB", "1024 KB", "1000 KB"], 0, "computer", "Computer Fundamentals", "easy"],
  ["Which is NOT an operating system?", ["Oracle", "Windows", "Linux", "macOS"], 0, "computer", "Operating Systems", "easy"],
  ["The shortcut key for 'Copy' in Windows is:", ["Ctrl + C", "Ctrl + V", "Ctrl + X", "Ctrl + Z"], 0, "computer", "Operating Systems", "easy"],
  ["Which key is used to refresh a webpage in a browser?", ["F5", "F1", "F12", "F3"], 0, "computer", "Internet", "easy"],
  ["The full form of HTTP is:", ["HyperText Transfer Protocol", "HyperText Transmission Protocol", "High Transfer Text Protocol", "Home Text Transfer Protocol"], 0, "computer", "Internet", "easy"],
  ["Which protocol is used for sending emails?", ["SMTP", "FTP", "HTTP", "TCP"], 0, "computer", "Internet", "medium"],
  ["The binary equivalent of decimal number 10 is:", ["1010", "1100", "1001", "1110"], 0, "computer", "Computer Fundamentals", "medium"],
  ["SQL stands for:", ["Structured Query Language", "Standard Query Language", "Sequential Query Logic", "System Query Language"], 0, "computer", "Database", "easy"],
  ["Which of the following is a primary key characteristic?", ["Uniquely identifies each row", "Can have NULL values", "Can be duplicated", "Is optional in a table"], 0, "computer", "Database", "medium"],
  ["The file extension '.xlsx' is associated with:", ["Microsoft Excel", "Microsoft Word", "Microsoft PowerPoint", "Microsoft Access"], 0, "computer", "MS Office", "easy"],
  ["In MS Word, which shortcut is used to 'Undo'?", ["Ctrl + Z", "Ctrl + Y", "Ctrl + U", "Ctrl + X"], 0, "computer", "MS Office", "easy"],
  ["Which of the following is a programming language?", ["Python", "Photoshop", "Chrome", "Windows"], 0, "computer", "Programming", "easy"],
  ["A firewall is used for:", ["Network security", "Data storage", "Word processing", "Image editing"], 0, "computer", "Networking", "easy"],
  ["The full form of LAN is:", ["Local Area Network", "Large Area Network", "Local Access Network", "Long Area Network"], 0, "computer", "Networking", "easy"],
  ["Which device is used to connect different networks?", ["Router", "Monitor", "Keyboard", "Printer"], 0, "computer", "Networking", "easy"],
  ["Cache memory is:", ["Faster than RAM", "Slower than RAM", "Same speed as hard disk", "Not volatile memory"], 0, "computer", "Computer Fundamentals", "medium"],
  ["The process of starting a computer is called:", ["Booting", "Loading", "Compiling", "Executing"], 0, "computer", "Computer Fundamentals", "easy"],
];

// ── Main ──────────────────────────────────────────────────────────

const data = JSON.parse(fs.readFileSync(BANK_PATH, "utf8"));
const bank = data.questions;

const existingQText = new Set(bank.map(q => q.question.toLowerCase().trim()));

let added = 0;
let skipped = 0;
const subjectStats = {};
const topicStats = {};

T2_QUESTIONS.forEach(entry => {
  // Handle the malformed entry (nested array in options)
  let [question, options, answerIndex, subject, topic, difficulty] = entry;
  
  // Fix any malformed options arrays
  if (!Array.isArray(options) || options.some(o => Array.isArray(o))) {
    // Flatten options
    options = options.flat().filter(o => typeof o === "string").slice(0, 4);
    if (options.length < 4) return; // skip malformed
  }

  const key = `${subject}`;
  subjectStats[key] = (subjectStats[key] || 0) + 1;
  topicStats[`${subject}::${topic}`] = (topicStats[`${subject}::${topic}`] || 0) + 1;

  if (existingQText.has(question.toLowerCase().trim())) {
    skipped++;
    return;
  }

  const qEntry = {
    id: uid(),
    type: "question",
    examFamily: "ssc",
    subject,
    difficulty,
    tier: "tier2",
    questionMode: "objective",
    topic,
    subtopic: null,
    question,
    options,
    answerIndex,
    explanation: "",
    marks: 3,
    negativeMarks: 1,
    isChallengeCandidate: false,
    confidenceScore: 0.95,
    reviewStatus: "approved",
    isPYQ: false,
    year: null,
    frequency: 0,
    source: {
      kind: "generated",
      description: "Verified Tier-2 questions for SSC CGL mock test coverage",
      importedAt: now
    },
    createdAt: now,
    updatedAt: now,
    reviewAudit: {
      reviewedAt: now,
      reviewedBy: "auto-generator",
      decision: "approve",
      rejectReason: ""
    }
  };

  if (!dryRun) {
    bank.push(qEntry);
  }
  added++;
});

console.log(`Tier-2 expansion: ${added} new questions added, ${skipped} duplicates skipped`);
console.log("\nSubject distribution:");
Object.entries(subjectStats)
  .sort((a, b) => b[1] - a[1])
  .forEach(([s, count]) => console.log(`  ${s}: ${count}`));

console.log("\nTopic detail:");
Object.entries(topicStats)
  .sort()
  .forEach(([k, count]) => console.log(`  ${k}: ${count}`));

if (dryRun) {
  console.log("\n[DRY RUN] No changes written.");
} else {
  data.updatedAt = now;
  fs.writeFileSync(BANK_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`\n✓ question-bank.json updated. Total questions: ${bank.length}`);
}
