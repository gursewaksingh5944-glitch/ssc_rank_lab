const fs = require('fs');
const data = require('./data/question-bank.json');
const now = new Date().toISOString();

// SET 1 (30 Qs): Answer Key from image 1
// 1(b) 2(d) 3(a) 4(d) 5(a) 6(d) 7(a) 8(c) 9(d) 10(d)
// 11(a) 12(d) 13(d) 14(a) 15(d) 16(a) 17(c) 18(a) 19(b) 20(a)
// 21(c) 22(d) 23(d) 24(c) 25(b) 26(d) 27(d) 28(b) 29(c) 30(c)
const set1 = [
  { question: 'Find the area of a triangle whose base is 7 cm and corresponding height is 82 cm.', options: ['574 cm\u00B2', '287 cm\u00B2', '143 cm\u00B2', '191 cm\u00B2'], answerIndex: 1, source: 'SSC MTS 08/09/2023 (Shift-03)' },
  { question: 'Find the area of a triangle whose two sides are 4 cm and 5 cm and the angle between them is 45\u00B0.', options: ['7\u221A2 cm\u00B2', '4\u221A2 cm\u00B2', '6\u221A2 cm\u00B2', '5\u221A2 cm\u00B2'], answerIndex: 3, source: 'SSC CPO 04/10/2023 (Shift-02)' },
  { question: 'In an isosceles triangle, if the unequal side is 8 cm and equal side is 5 cm, then the area of the triangle is:', options: ['12 cm\u00B2', '25 cm\u00B2', '6 cm\u00B2', '11 cm\u00B2'], answerIndex: 0, source: 'SSC CHSL 03/08/2023 (Shift-01)' },
  { question: 'What will be the area of a plot of quadrilateral shape, one of whose diagonals is 20 m and lengths of the perpendiculars from the opposite vertices on it are 12 m and 18 m, respectively?', options: ['250 m\u00B2', '400 m\u00B2', '200 m\u00B2', '300 m\u00B2'], answerIndex: 3, source: 'SSC CPO 05/10/2023 (Shift-02)' },
  { question: 'The base of a parallelogram is twice its height. If the area of the parallelogram is 338 cm\u00B2, then find its height (in cm).', options: ['13', '11', '14', '12'], answerIndex: 0, source: 'SSC CPO 27/06/2024 (Shift-01)' },
  { question: 'The perimeter of a parallelogram is 48 cm. If the height of the parallelogram is 6 cm and the length of the adjacent side is 8 cm, find its area.', options: ['90 cm\u00B2', '80 cm\u00B2', '84 cm\u00B2', '96 cm\u00B2'], answerIndex: 3, source: 'SSC CHSL 03/08/2023 (Shift-01)' },
  { question: 'The two adjacent sides of a parallelogram are 12 cm and 5 cm respectively. If one of the diagonals is 13 cm long, then what is the area of the parallelogram?', options: ['60 cm\u00B2', '30 cm\u00B2', '75 cm\u00B2', '25 cm\u00B2'], answerIndex: 0, source: 'SSC MTS 04/05/2023 (Shift-02)' },
  { question: 'The length of a rectangular plot is three times its breadth. If the area of the rectangular plot is 2700 m\u00B2, then what is the breadth of the rectangular plot?', options: ['12 m', '28 m', '30 m', '20 m'], answerIndex: 2, tier: 'tier2', source: 'SSC CHSL TIER II 26/06/2023' },
  { question: "If the semi-perimeter and area of a rectangular field whose length and breadth are 'x' and 'y' is 12 cm and 28 cm\u00B2, respectively, then find the value of x\u2074 + x\u00B2y\u00B2 + y\u2074.", options: ['6990', '6609', '6906', '6960'], answerIndex: 3, source: 'SSC Phase XII 20/06/2024 (Shift-03)' },
  { question: 'There is a rectangular garden of 240 metres \u00D7 80 metres. A path of width 4 metre is built outside the garden along its four sides. What is the area of the path?', options: ['2826 m\u00B2', '2542 m\u00B2', '2916 m\u00B2', '2624 m\u00B2'], answerIndex: 3, source: 'SSC CHSL 10/03/2023 (Shift-04)' },
  { question: 'The area of the rhombus (in cm\u00B2) having each side equal to 13 cm and one of its diagonals equal to 24 cm is:', options: ['120', '60', '110', '130'], answerIndex: 0, source: 'SSC Phase XII 20/06/2024 (Shift-03)' },
  { question: 'Find the area of a rhombus if the perimeter of the rhombus is 52 cm, and one of its diagonals is 10 cm long.', options: ['164 cm\u00B2', '144 cm\u00B2', '160 cm\u00B2', '120 cm\u00B2'], answerIndex: 3, source: 'SSC CPO 03/10/2023 (Shift-03)' },
  { question: 'The diagonal of a square is 8\u221A2 cm. Find the diagonal of another square whose area is triple that of the first square.', options: ['8\u221A5 cm', '8\u221A3 cm', '8\u221A2 cm', '8\u221A6 cm'], answerIndex: 3, source: 'SSC CGL 06/12/2022 (Shift-04)' },
  { question: 'A copper wire is bent in the form of a square and it encloses an area of 30.25 cm\u00B2. If the same wire is bent to form a circle, then find the area of the circle. (Use \u03C0 = 22/7)', options: ['38.50 cm\u00B2', '42.25 cm\u00B2', '35 cm\u00B2', '30.25 cm\u00B2'], answerIndex: 0, source: 'SSC CHSL 11/08/2023 (Shift-02)' },
  { question: 'The distance between the parallel sides of a trapezium is 18 cm. If the area of the trapezium is 1188 cm\u00B2, then what is the sum of the lengths of the parallel sides?', options: ['150 cm', '115 cm', '126 cm', '132 cm'], answerIndex: 3, source: 'SSC CPO 28/06/2024 (Shift-03)' },
  { question: 'A wheel makes 500 revolutions in covering a distance of 44 km. Find the radius of the wheel.', options: ['14 m', '21 m', '28 m', '7 m'], answerIndex: 0, source: 'SSC CHSL 10/03/2023 (Shift-02)' },
  { question: 'The ratio of the outer and the inner circumference of a circular path is 5:4. If path is 50 metres wide, then what is the radius of the inner circle?', options: ['250 metres', '300 metres', '200 metres', '210 metres'], answerIndex: 2, source: 'SSC CGL 06/12/2022 (Shift-03)' },
  { question: 'Three circles of radius 6 cm are kept touching each other. The string is tightly tied around these three circles. What is the length of the string?', options: ['36 + 12\u03C0 cm', '36 + 18\u03C0 cm', '24 + 36\u03C0 cm', '36 + 20\u03C0 cm'], answerIndex: 0, source: 'SSC CGL 03/12/2022 (Shift-02)' },
  { question: 'In a circle of radius 42 cm, an arc subtends an angle of 60\u00B0 at the centre. Find the length of the arc. (Use \u03C0 = 22/7)', options: ['22 cm', '44 cm', '21 cm', '42 cm'], answerIndex: 1, source: 'SSC CPO 05/10/2023 (Shift-01)' },
  { question: 'Find the area of a minor sector of a circle whose circumference is 88 cm and the length of its minor arc is 22 cm. (Use \u03C0 = 22/7)', options: ['154 cm\u00B2', '451 cm\u00B2', '415 cm\u00B2', '145 cm\u00B2'], answerIndex: 0, source: 'SSC CPO 27/06/2024 (Shift-02)' },
  { question: 'The area of a sector of a circle is 88 cm\u00B2 and the angle of the sector is 36\u00B0. Find the radius (in cm) of the circle. (Use \u03C0 = 22/7)', options: ['3\u221A70', '\u221A70', '2\u221A70', '5\u221A70'], answerIndex: 2, source: 'SSC Phase XII 20/06/2024 (Shift-03)' },
  { question: 'The area of sector of a circle having radius 14 cm is 231 cm\u00B2. Find the degree measure of the corresponding central angle. (Use \u03C0 = 22/7)', options: ['125\u00B0', '150\u00B0', '140\u00B0', '135\u00B0'], answerIndex: 3, source: 'SSC CPO 28/06/2024 (Shift-02)' },
  { question: 'From a circular sheet of circumference 264 cm, two equal maximum-sized circular plates are cut off. What will be the circumference of each plate? (Use \u03C0 = 22/7)', options: ['264 cm', '135 cm', '176 cm', '132 cm'], answerIndex: 3, source: 'SSC CHSL 08/07/2024 (Shift-3)' },
  { question: 'Find the area (in cm\u00B2) of a circle with a maximum radius that can be inscribed in a rectangle of length 18 cm and breadth 12 cm.', options: ['72\u03C0', '136\u03C0', '36\u03C0', '28\u03C0'], answerIndex: 2, source: 'SSC Phase XII 20/06/2024 (Shift-03)' },
  { question: 'The area (in cm\u00B2) of biggest circle that could be drawn in a square of side 18 cm is:', options: ['91\u03C0', '81\u03C0', '49\u03C0', '168\u03C0'], answerIndex: 1, source: 'SSC CHSL 10/03/2023 (Shift-02)' },
  { question: 'Three circles each of radius 5 cm touch one another. The area (in cm\u00B2) subtended between them is:', options: ['50(\u221A3 - \u03C0/2)', '25(\u221A3 - \u03C0/2)', '25(2\u221A3 - \u03C0/2)', '25(\u221A3 - \u03C0)'], answerIndex: 3, source: 'SSC CPO 28/06/2024 (Shift-03)' },
  { question: 'Two circles of radius 7 units each, intersect in such a way that the common chord is of length 7 units. What is the common area in square units of the intersection?', options: ['(98\u03C0 - 3\u221A3)/(6\u221A3)', '(98\u03C0 - 3\u221A3)/(3\u221A4)', '(98\u03C0 - 3\u221A3)/(6\u221A6)', '(98\u03C0 - 3\u221A3)/(6\u221A4)'], answerIndex: 3, source: 'SSC CHSL 01/07/2024 (Shift-04)' },
  { question: 'If the area of a regular pentagon is 3920\u221A3 cm\u00B2, then how long is its each side?', options: ['38 cm', '56 cm', '46 cm', '58 cm'], answerIndex: 1, source: 'SSC Phase XII 25/06/2024 (Shift-02)' },
  { question: "The length and the breadth of the floor of a rectangular hall are 126 feet and 90 feet, respectively. What will be the area (in square feet) of each of the largest identical square tiles that can be used to tile this floor in a way that no part of the floor remains uncovered?", options: ['196 feet\u00B2', '256 feet\u00B2', '324 feet\u00B2', '484 feet\u00B2'], answerIndex: 2, source: 'SSC CPO 03/10/2023 (Shift-03)' },
  { question: 'For a given circle of radius 4 cm, the angle of its sector is 45\u00B0. Find the area (in cm\u00B2) of the sector. (Use \u03C0 = 3.14)', options: ['6.18', '7.28', '6.28', '7.18'], answerIndex: 2, source: 'SSC CHSL 03/07/2024 (Shift-03)' }
];

// SET 2 (20 Qs): Answer Key from image 2
// 1(d) 2(a) 3(d) 4(b) 5(d) 6(b) 7(d) 8(c) 9(c) 10(a)
// 11(a) 12(c) 13(d) 14(d) 15(b) 16(a) 17(c) 18(b) 19(d) 20(b)
const set2 = [
  { question: 'Find the area of triangle whose sides are 10 cm, 12 cm, and 18 cm.', options: ['22\u221A2 cm\u00B2', '30\u221A2 cm\u00B2', '28\u221A2 cm\u00B2', '40\u221A2 cm\u00B2'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The perimeter of an isosceles right-angled triangle having an area of 200 cm\u00B2 is:', options: ['68.3 cm', '78.2 cm', '70.6 cm', '58.6 cm'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'Two circles of radius 7 units each, intersect in such a way that the common chord is of length 7 units. What is the common area in square units of the intersection?', options: ['(98\u03C0-3\u221A3)/(6\u221A3)', '(98\u03C0-3\u221A3)/(3\u221A4)', '(98\u03C0-3\u221A3)/(6\u221A6)', '(98\u03C0-3\u221A3)/(6\u221A4)'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'Find the area (in cm\u00B2) of the sector whose perimeter is 64/3 cm and central angle is 60\u00B0. (Use \u03C0 = 22/7)', options: ['47/3', '77/3', '68/3', '85/3'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The perimeter of a parallelogram is 48 cm. If the height of the parallelogram is 6 cm and the length of the adjacent side is 8 cm, find its area.', options: ['90 cm\u00B2', '80 cm\u00B2', '84 cm\u00B2', '96 cm\u00B2'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The perimeter of equilateral triangle is 3 \u00D7 (4 + 16/\u221A3) units. Determine the area of the triangle.', options: ['4 unit\u00B2', '1 unit\u00B2', '3 unit\u00B2', '2 unit\u00B2'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'What will be the area of a plot of quadrilateral shape, one of whose diagonals is 20 m and lengths of the perpendiculars from the opposite vertices on it are 12 m and 18 m, respectively?', options: ['250 m\u00B2', '400 m\u00B2', '200 m\u00B2', '300 m\u00B2'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The side of an equilateral triangle is 28 cm. Taking each vertex as the centre, a circle is described with a radius equal to half the length of the side of the triangle. Find the area of that part of the triangle which is not included in the circles. (Use \u03C0 = 22/7 and \u221A3 = 1.73)', options: ['30.89 cm\u00B2', '38.08 cm\u00B2', '31.08 cm\u00B2', '39.08 cm\u00B2'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'A rectangular lawn whose length is twice of its breadth is extended by having four semi-circular portions on its sides. What is the total area (in m\u00B2) of the lawn if the smaller side of the rectangle is 12 m? (Take \u03C0 = 3.14)', options: ['548.32', '444', '853.2', '308.64'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'The ratio of the length of each equal side and the third side of an isosceles triangle is 3:5. If the area of the triangle is 30\u221A11 cm\u00B2 then the length of the third side (in cm) is:', options: ['10\u221A6', '5\u221A6', '13\u221A6', '11\u221A6'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'The area of a triangular park with sides 88 m, 165 m, and 187 m is equal to the area of a rectangular plot whose sides are in the ratio 5:3. What is the perimeter (in m) of the plot?', options: ['352', '384', '400', '320'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'What is the difference in area (in cm\u00B2) of triangle ABC having sides of 10 cm, 20 cm and 20 cm, and a right angled triangle PQR with hypotenuse of 13 cm and one of the perpendiculars of 12 cm?', options: ['70.05', '36.57', '66.75', '53.58'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: "A farmer's land is in the shape of a trapezium which has its parallel sides measuring 6.32 yards and 7.68 yards and the distance between the parallel sides is 5.50 yards. The cost of ploughing the land is Rs.1200 per square yard. What amount has to be spent in order to plough the entire land?", options: ['Rs.36600', 'Rs.32500', 'Rs.55400', 'Rs.46200'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The sum of the radii of two circles is 286 cm and the area between the concentric circles is 50336 cm\u00B2. What are the radii (in cm) of the two circles? (Take \u03C0 = 22/7)', options: ['91 and 84', '171 and 84', '115 and 91', '115 and 171'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'Half the perimeter of a rectangular garden, whose length is 8 cm more than its width, is 42 cm. Find the area of the rectangular garden.', options: ['542 cm\u00B2', '425 cm\u00B2', '254 cm\u00B2', '524 cm\u00B2'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The area of the rhombus (in cm\u00B2) having each side equal to 13 cm and one of its diagonals equal to 24 cm is:', options: ['120', '60', '110', '130'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'The area of a sector of a circle that subtends a 22.5\u00B0 angle at the center is given as 346.5 cm\u00B2. What will be the radius (in cm) of the circle? (Use \u03C0 = 22/7)', options: ['35', '45', '42', '48'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'The diagonal of a square A is (a + b) units. What will be the area (in square units) of the square drawn on the diagonal of square B, whose area is twice the area of square A?', options: ['(a+b)\u00B2', '2(a+b)\u00B2', '4(a+b)\u00B2', '8(a+b)\u00B2'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The sides of a triangle are 24 cm, 26 cm and 10 cm. At each of its vertices, circles of radius 4.2 cm are drawn. What is the area (in cm\u00B2) of the triangle, excluding the portion covered by the sectors of the circles? (Take \u03C0 = 22/7)', options: ['27.72', '120', '105.86', '92.28'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'If the sum of the diagonals of a rhombus is L and the perimeter is 4P, then find the area of the rhombus.', options: ['\u00BC(L\u00B2 - P\u00B2)', '\u00BC(L\u00B2 - 4P\u00B2)', '\u00BD(L\u00B2 - 4P\u00B2)', '\u00BC(L\u00B2 + 3P\u00B2)'], answerIndex: 1, source: 'Mensuration Practice Set' }
];

// SET 3 (45 Qs): Answer Key from image 3
// 1(b) 2(a) 3(a) 4(b) 5(b) 6(a) 7(b) 8(a) 9(b) 10(c)
// 11(c) 12(b) 13(d) 14(c) 15(b) 16(c) 17(c) 18(a) 19(b) 20(d)
// 21(d) 22(b) 23(b) 24(b) 25(d) 26(b) 27(c) 28(b) 29(b) 30(c)
// 31(c) 32(b) 33(a) 34(a) 35(d) 36(a) 37(d) 38(c) 39(d) 40(d)
// 41(d) 42(d) 43(a) 44(b) 45(d)
const set3 = [
  { question: 'The length of the side of a cube is 8 cm. Find the volume of the cube.', options: ['612 cm\u00B3', '512 cm\u00B3', '664 cm\u00B3', '564 cm\u00B3'], answerIndex: 1, source: 'SSC CPO 28/06/2024 (Shift-01)' },
  { question: 'The difference between the total surface area and lateral surface area of a cube, if side of the cube is 11 cm (in square cm), is:', options: ['242', '243', '241', '244'], answerIndex: 0, source: 'SSC Phase-XII 26/06/2024 (Shift-03)' },
  { question: 'A hollow cube is made of paper to have a volume of 512 cubic units. How much paper in square units will be required to make the cube?', options: ['384', '328', '348', '288'], answerIndex: 0, tier: 'tier2', source: 'SSC CHSL TIER-II 10/01/2024' },
  { question: 'Three cubes with sides in the ratio of 3:4:5 are melted to form a single cube whose diagonal is 18\u221A3 cm. The sides of the three cubes are:', options: ['21, 28 and 35 cm', '9, 12 and 15 cm', '18, 24 and 30 cm', '12, 16 and 20 cm'], answerIndex: 1, source: 'SSC CGL 20/07/2023 (Shift-01)' },
  { question: 'A solid cube, whose each edge is of length 48 cm, is melted. Identical solid cubes, each of volume 64 cm\u00B3, are made out of this molten cube, without any wastage. How many such small cubes are obtained?', options: ['1738', '1728', '1718', '1748'], answerIndex: 1, tier: 'tier2', source: 'SSC CGL TIER-II 26/10/2023' },
  { question: 'The dimensions of a pond are 20 m, 14 m and 6 m. Find the capacity of the pond.', options: ['1680 m\u00B3', '1520 m\u00B3', '1280 m\u00B3', '1460 m\u00B3'], answerIndex: 0, source: 'SSC Phase-XII 21/06/2024 (Shift-03)' },
  { question: 'The ratio of the length, width and height of a closed cuboid is given as 6:3:2. The total surface area of this cuboid is given as 1800 cm\u00B2. Find the volume (in cm\u00B3) of this cuboid.', options: ['4650', '4500', '4200', '4800'], answerIndex: 1, tier: 'tier2', source: 'SSC CGL TIER-II 26/10/2023' },
  { question: 'If the areas of three adjacent faces of a cuboidal box are 729 cm\u00B2, 529 cm\u00B2 and 289 cm\u00B2, respectively, then find the volume of the box.', options: ['10557 cm\u00B3', '10560 cm\u00B3', '10555 cm\u00B3', '10551 cm\u00B3'], answerIndex: 0, source: 'SSC CHSL 03/06/2022 (Shift-03)' },
  { question: 'The sum of the length, breadth and depth of a cuboid is 23 cm, and its diagonal is 5\u221A7 cm. Its surface area is:', options: ['288 cm\u00B2', '354 cm\u00B2', '372 cm\u00B2', '222 cm\u00B2'], answerIndex: 1, source: 'SSC CHSL 31/05/2022 (Shift-01)' },
  { question: 'A room is in the shape of a cuboid, with dimensions 12m \u00D7 10m \u00D7 3m. What is the cost of painting the four walls of the room at the rate of Rs.50 per sq.m?', options: ['Rs.15000', 'Rs.15600', 'Rs.6600', 'Rs.7500'], answerIndex: 2, source: 'SSC MTS 07/08/2019 (Shift-03)' },
  { question: 'The volume of a rectangular block is 12288 m\u00B3. Its dimensions are in the ratio of 4:3:2. If the entire surface is polished at the rate 2 paise per m\u00B2, then find the total cost of polishing.', options: ['Rs.33.28', 'Rs.44.42', 'Rs.66.56', 'Rs.11.14'], answerIndex: 2, source: 'SSC CHSL 11/07/2024 (Shift-04)' },
  { question: 'A covered wooden box has the inner measures as 128 cm, 90 cm, 25 cm and the thickness of wood is 5.5 cm. Find the volume of the wood.', options: ['329431 cm\u00B3', '217404 cm\u00B3', '819832 cm\u00B3', '192392 cm\u00B3'], answerIndex: 1, source: 'SSC CHSL 09/07/2024 (Shift-01)' },
  { question: 'The measurement of a right rectangular box is of length 1.6m, width 90 cm, height 60 cm. Soap cakes of dimensions 6 cm \u00D7 5 cm \u00D7 40 mm are to be packed in boxes in such a way that there is no empty space left. How many cakes can be packed in a box?', options: ['6500', '5600', '6000', '7200'], answerIndex: 3, tier: 'tier2', source: 'SSC CHSL TIER-II 10/01/2024' },
  { question: 'If the volume of one brick is 0.0014 m\u00B3, then how many bricks will be required to construct a wall of length 14 m, breadth 0.125 m and height 5 m?', options: ['5250', '3250', '6250', '4250'], answerIndex: 2, source: 'SSC CGL 21/07/2023 (Shift-03)' },
  { question: 'Four cubes each of volume 216 cubic cm are joined end to end to form a new solid. The surface area of the new solid is:', options: ['1296 sq cm', '648 sq cm', '672 sq cm', '324 sq cm'], answerIndex: 1, source: 'SSC CHSL 03/07/2024 (Shift-04)' },
  { question: 'Ranu carries water to school in a cylindrical flask with diameter 12 cm and height 21 cm. Determine the amount of water that she can carry in the flask. (Take \u03C0 = 22/7)', options: ['2372 cm\u00B3', '2370 cm\u00B3', '2376 cm\u00B3', '2374 cm\u00B3'], answerIndex: 2, source: 'SSC CGL 14/07/2023 (Shift-04)' },
  { question: 'A cylinder has a radius of 7 cm and the area of its curved surface is 396 cm\u00B2. The volume of the cylinder is:', options: ['1396 cm\u00B3', '1381 cm\u00B3', '1386 cm\u00B3', '1391 cm\u00B3'], answerIndex: 2, source: 'SSC CPO 28/06/2024 (Shift-02)' },
  { question: 'A cylinder of radius 7 cm has a curved surface area of 2200 cm\u00B2. Find its total surface area. (Use \u03C0 = 22/7)', options: ['2508 cm\u00B2', '2260 cm\u00B2', '2550 cm\u00B2', '1580 cm\u00B2'], answerIndex: 0, source: 'SSC CPO 28/06/2024 (Shift-02)' },
  { question: 'The respective ratio between numerical values of the curved surface area and the volume of a right circular cylinder is 2:3. If the respective ratio between the radius and the height of the cylinder is 3:7, what is the total surface area of the cylinder?', options: ['62\u03C0 cm\u00B2', '60\u03C0 cm\u00B2', '45\u03C0 cm\u00B2', '65\u03C0 cm\u00B2'], answerIndex: 1, source: 'SSC CHSL 01/07/2024 (Shift-02)' },
  { question: 'Two rectangular sheets of paper, each 60 cm \u00D7 36 cm, are made into two right circular cylinders, one by rolling the paper along its length and the other along the breadth. The ratio of the volumes of the two cylinders, thus formed, is:', options: ['5:6', '8:3', '7:4', '5:3'], answerIndex: 3, source: 'SSC CPO 29/06/2024 (Shift-03)' },
  { question: 'A patient in a hospital is given tea daily in a cylindrical cup of diameter 7 cm. If the cup is filled with tea to a height of 4 cm, how much tea the hospital has to prepare daily to serve 180 patients? (Use \u03C0 = 22/7)', options: ['22.27 litres', '22.77 litres', '27.27 litres', '27.72 litres'], answerIndex: 3, source: 'SSC CHSL 10/07/2024 (Shift-01)' },
  { question: 'A drainage tile is a cylindrical shell 42 cm long. The inside and outside diameters are 8 cm and 14 cm, respectively. What is the volume (in cm\u00B3) of clay required for the tile? (Use \u03C0 = 22/7)', options: ['5241', '4356', '4881', '4125'], answerIndex: 1, source: 'SSC CPO 27/06/2024 (Shift-03)' },
  { question: 'The curved surface area of a cone is 308 cm\u00B2, and its slant height is 28 cm. Find the radius of its base. (Use \u03C0 = 22/7)', options: ['2.8 cm', '3.5 cm', '2.5 cm', '3.0 cm'], answerIndex: 1, source: 'SSC CPO 28/06/2024 (Shift-03)' },
  { question: 'A solid cone with curved surface area twice its base area has slant height of 6\u221A3 cm. Its height is:', options: ['6\u221A2 cm', '9 cm', '6 cm', '3\u221A6 cm'], answerIndex: 1, source: 'SSC CGL 20/07/2023 (Shift-02)' },
  { question: 'The volume of a cone with height equal to radius, and slant height 5 cm is:', options: ['125\u03C0/(12\u221A3) cm\u00B3', '125\u03C0/(6\u221A3) cm\u00B3', '125\u03C0/(12\u221A2) cm\u00B3', '125\u03C0/(6\u221A2) cm\u00B3'], answerIndex: 3, source: 'SSC CGL 17/07/2023 (Shift-01)' },
  { question: 'What is the total surface area of a cone whose radius is r/4 and slant height is 4l?', options: ['8\u03C0r(l+r)', '\u03C0r(l+r/16)', '\u03C0r(l+r/4)', '4\u03C0r(l+r)'], answerIndex: 1, source: 'SSC CPO 27/06/2024 (Shift-01)' },
  { question: 'The ratio of the slant height and the height of a cone is 4:3. If the curved surface area of the cone is 4\u221A7\u03C0 square units, then the radius of the cone is ___ units.', options: ['\u221A7\u221A7', '\u221A7', '7', '7/\u221A7'], answerIndex: 2, source: 'SSC CPO 29/06/2024 (Shift-03)' },
  { question: 'How many metres of cloth will be required to make a conical tent, the radius of whose base is 21 metres and height is 28 metres? The width of the cloth is 5 metres. (Use \u03C0 = 22/7)', options: ['470', '462', '456', '478'], answerIndex: 1, source: 'SSC CPO 27/06/2024 (Shift-01)' },
  { question: 'The radii of the ends of a frustum of a solid right-circular cone 45 cm high are 28 cm and 7 cm. If this frustum is melted and reconstructed into a solid right circular cylinder whose radius of base and height are in the ratio 3:5, find the curved surface area (in cm\u00B2) of this cylinder. (Use \u03C0 = 22/7)', options: ['4610', '4620', '4640', '4680'], answerIndex: 1, source: 'SSC CPO 03/10/2023 (Shift-01)' },
  { question: 'The radius of the base and height of a cone are 5 cm and 6 cm, respectively, whereas the radius of the base and height of a cylinder are 2.5 cm and 3 cm, respectively. The ratio of the volume of the cone to that of the cylinder is: (Use \u03C0 = 22/7)', options: ['8:5', '9:4', '8:3', '3:5'], answerIndex: 2, source: 'SSC CPO 28/06/2024 (Shift-01)' },
  { question: 'If the radius of a sphere is 2.1 cm, then the volume of sphere is equal to:', options: ['36.088 cm\u00B3', '36.808 cm\u00B3', '38.808 cm\u00B3', '38.088 cm\u00B3'], answerIndex: 2, source: 'SSC CPO 27/06/2024 (Shift-01)' },
  { question: 'Find the surface area (in cm\u00B2) of a sphere of diameter 28 cm. (Use \u03C0 = 22/7)', options: ['1731', '2464', '2856', '1724'], answerIndex: 1, source: 'SSC CPO 27/06/2024 (Shift-03)' },
  { question: 'The volumes of two spheres are in the ratio of 512:3375. The ratio of their surface areas is:', options: ['64:225', '49:325', '27:144', '68:125'], answerIndex: 0, source: 'SSC CPO 27/06/2024 (Shift-02)' },
  { question: 'Rajesh is playing with a football having diameter of 28 cm. He wants to get a photo of his favourite player painted on the entire ball. The painter charges Rs.2/cm\u00B2. What will be the cost (in Rs.) of painting the ball? (Take \u03C0 = 22/7)', options: ['4,928', '4,828', '2,414', '2,464'], answerIndex: 0, source: 'SSC CHSL 05/07/2024 (Shift-01)' },
  { question: 'Find the total surface area of a hemisphere with a radius of 11 cm.', options: ['242\u03C0 cm\u00B2', '313\u03C0 cm\u00B2', '273\u03C0 cm\u00B2', '363\u03C0 cm\u00B2'], answerIndex: 3, source: 'SSC CPO 27/06/2024 (Shift-02)' },
  { question: 'The diameter of a hemispherical bowl is 21 cm. The volume of the bowl is equal to: (Take \u03C0 = 22/7)', options: ['2,425.5 cm\u00B3', '2,524.5 cm\u00B3', '2,725.5 cm\u00B3', '2,624.5 cm\u00B3'], answerIndex: 0, tier: 'tier2', source: 'SSC CHSL TIER-II 02/11/2023' },
  { question: 'If the inner radius of a hemispherical bowl is 5 cm and its thickness is 0.25 cm, then find the volume of the material required in making the bowl. (Take \u03C0 = 22/7) (Rounded up to two places of decimals)', options: ['34 cm\u00B3', '44 cm\u00B3', '45.34 cm\u00B3', '41.28 cm\u00B3'], answerIndex: 3, source: 'SSC CGL 21/07/2023 (Shift-04)' },
  { question: 'A hemispherical bowl has 21 cm radius. It is to be painted inside as well as outside. The cost of painting it at the rate of Rs.0.05 per cm\u00B2, assuming that the thickness of the bowl is negligible, is: (Use \u03C0 = 22/7)', options: ['Rs.188.30', 'Rs.410.10', 'Rs.277.20', 'Rs.388.20'], answerIndex: 2, source: 'SSC Phase-XII 24/06/2024 (Shift-02)' },
  { question: 'The inner and outer radii of a hemispherical wooden bowl are 6 cm and 8 cm, respectively. Its entire surface has to be polished and the cost of polishing \u03C0 cm\u00B2 is Rs.50. How much will it cost to polish the bowl?', options: ['Rs.12,000', 'Rs.10,000', 'Rs.11,600', 'Rs.11,400'], answerIndex: 3, source: 'SSC CHSL 08/07/2024 (Shift-4)' },
  { question: 'A sphere and a cube have equal surface areas. The ratio of the volume of the sphere to that of the cube is:', options: ['\u221A3 : \u221A\u03C0', '\u221A2 : \u221A\u03C0', '\u221A\u03C0 : \u221A8', '\u221A6 : \u221A\u03C0'], answerIndex: 3, source: 'SSC Phase-XII 25/06/2024 (Shift-04)' },
  { question: 'A hollow sphere of external and internal diameters of 10 cm and 6 cm, respectively, is melted and made into another solid in the shape of a right circular cone of base diameter 10 cm. Find the height of the cone.', options: ['13.68 cm', '14.68 cm', '16.68 cm', '15.68 cm'], answerIndex: 3, source: 'SSC CPO 28/06/2024 (Shift-02)' },
  { question: 'A spherical ball of lead, 3 cm in diameter is melted and recast into three spherical balls. The diameters of two of these balls are 3/2 cm and 2 cm, respectively. Find the diameter of the third ball.', options: ['2.1 cm', '3.3 cm', '3 cm', '2.5 cm'], answerIndex: 3, source: 'SSC CGL 17/07/2023 (Shift-04)' },
  { question: 'A copper sphere of diameter 12 cm is drawn into a wire of diameter 4 mm. What is the length (in cm) of the wire? (Use \u03C0 = 22/7)', options: ['7200', '7823', '8342', '9000'], answerIndex: 0, source: 'SSC CPO 27/06/2024 (Shift-02)' },
  { question: 'A largest possible sphere is carved from a cube of side 14 cm. What is its volume in cm\u00B3?', options: ['1600\u2153', '1437\u2153', '205\u2153', '1707\u2153'], answerIndex: 1, source: 'SSC CHSL 01/07/2024 (Shift-01)' },
  { question: 'The length of the largest possible rod that can be placed in a cubical room is 42\u221A3 m. The surface area (in m\u00B2) of the largest possible sphere that fit within the cubical room is: (Use \u03C0 = 22/7)', options: ['3590', '4589', '2564', '5544'], answerIndex: 3, source: 'SSC CPO 27/06/2024 (Shift-02)' }
];

// SET 4 (35 Qs): Answer Key from image 4
// 1(c) 2(b) 3(d) 4(b) 5(c) 6(a) 7(b) 8(d) 9(c) 10(b)
// 11(a) 12(b) 13(d) 14(b) 15(b) 16(b) 17(c) 18(a) 19(c) 20(c)
// 21(d) 22(d) 23(b) 24(c) 25(d) 26(a) 27(a) 28(b) 29(b) 30(a)
// 31(b) 32(d) 33(c) 34(a) 35(c)
const set4 = [
  { question: 'Four solid cubes, each of volume 1728 cm\u00B3, are kept in two rows having two cubes in each row. They form a rectangular solid with square base. The total surface area (in cm\u00B2) of the resulting solid is:', options: ['576', '1152', '2304', '1440'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'The external diameter of an iron pipe is 20 cm and its length is 12 cm. If the thickness of the pipe is 1 cm, find the surface area of the pipe correct to two places of decimal. (Take \u03C0 = 22/7)', options: ['1,662.67 cm\u00B2', '1,552.57 cm\u00B2', '1,442.48 cm\u00B2', '1,772.76 cm\u00B2'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The inner and outer radii of a hemispherical wooden bowl are 6 cm and 8 cm, respectively. Its entire surface has to be polished and the cost of polishing \u03C0 cm\u00B2 is Rs.50. How much will it cost to polish the bowl?', options: ['Rs.12,000', 'Rs.10,000', 'Rs.11,600', 'Rs.11,400'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'How many metres of cloth will be required to make a conical tent, the radius of whose base is 21 metres and height is 28 metres? The width of the cloth is 5 metres. (Use \u03C0 = 22/7)', options: ['470', '462', '456', '478'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'What is the total surface area of a pyramid whose base is a square with side 8 cm and height of the pyramid is 3 cm?', options: ['169 cm\u00B2', '121 cm\u00B2', '144 cm\u00B2', '184 cm\u00B2'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'If a cuboid of dimensions 32 cm \u00D7 12 cm \u00D7 9 cm is melted into two cubes of same size, what will be the ratio of the surface area of the cuboid to the total surface area of the two cubes?', options: ['65:72', '37:48', '24:35', '32:39'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'A cube of side 5 cm is made using 125 cubes, each of side 1 cm. A cube is removed from the middle of each of the faces. What will be the surface area (in cm\u00B2) of the remaining solid?', options: ['150', '174', '155', '144'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'A 22.5 m high tent is in the shape of a frustum of a cone surmounted by a hemisphere. If the diameters of the upper and the lower circular ends of the frustum are 21 m and 39 m, respectively, then find the area of the cloth (in m\u00B2) used to make the tent (ignoring wastage). (Take \u03C0 = 22/7)', options: ['787 2/7', '2800 2/7', '1635 6/7', '2107 2/7'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'A hemispherical bowl is 88 cm round the brim. Assuming it to be full, how many persons may be served from it in hemispherical glasses, 7 cm in diameter at the top? (Use \u03C0 = 22/7)', options: ['74', '68', '64', '70'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'A rectangular piece of paper is 50 cm long and 22 cm wide. If a cylinder is formed by rolling the paper along its breadth, then the volume of the cylinder is:', options: ['2125 cm\u00B3', '1925 cm\u00B3', '2025 cm\u00B3', '1825 cm\u00B3'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The surface area of a cube is 1728 cm\u00B2. Find its volume.', options: ['34562 cm\u00B3', '43562 cm\u00B3', '64532 cm\u00B3', '54362 cm\u00B3'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'The base of a pyramid is an equilateral triangle whose each side is 8 cm. Its slant edge is 24 cm. What is the total surface area (in cm\u00B2) of the pyramid?', options: ['24\u221A3 + 36\u221A35', '16\u221A3 + 48\u221A35', '24\u221A3 + 24\u221A35', '12\u221A3 + 24\u221A35'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'A solid cone of radius 7 cm and height 7 cm was melted along with two solid spheres of radius 7 cm each to form a solid cylinder of radius 7 cm. What is the curved surface area (in cm\u00B2) of the cylinder? (Take \u03C0 = 22/7)', options: ['880', '482', '2196', '924'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The volume of a sphere is given by 130977\u03C0 cm\u00B3. Its surface area (in cm\u00B2) is:', options: ['16847\u03C0', '12474\u03C0', '17424\u03C0', '14274\u03C0'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'A right circular cone is inscribed in a cube of side 9 cm occupying the maximum space possible. What is the ratio of the volume of the cube to the volume of the cone? (Take \u03C0 = 22/7)', options: ['22:81', '42:11', '11:42', '81:22'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The radii of the ends of a frustum of a solid right-circular cone 45 cm high are 28 cm and 7 cm. If this frustum is melted and reconstructed into a solid right circular cylinder whose radius of base and height are in the ratio 3:5, find the curved surface area (in cm\u00B2) of this cylinder. (Take \u03C0 = 22/7)', options: ['4610', '4620', '4640', '4680'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'Three cubes each of side 5 cm are joined end to end. The surface area of the resulting cuboid is:', options: ['150 cm\u00B2', '175 cm\u00B2', '350 cm\u00B2', '75 cm\u00B2'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'A cylinder has a curved surface area equal to 350% of the curved surface area of another cylinder. If their radii are in the ratio 3:1, then the volume of the smaller cylinder is approximately ____% of the larger cylinder.', options: ['9.52', '8.86', '7.28', '10.16'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'The surface area of a sphere is 2464 cm\u00B2. Find its volume.', options: ['13121\u2153 cm\u00B3', '11892\u2154 cm\u00B3', '11498\u2154 cm\u00B3', '11621\u2153 cm\u00B3'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'The volume of a wall whose height is 10 times its width and whose length is 8 times its height is 51.2 m\u00B3. What is the cost (in Rs.) of painting the wall on one side at the rate of Rs.100/m\u00B2?', options: ['12750', '12500', '12800', '12250'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'Let ABCDEF is a prism whose base is a right triangle whose perpendicular sides are 9 cm and 12 cm. If cost of painting the prism is Rs.151.20 at the rate of 20 paise/cm\u00B2, then find the height of the prism.', options: ['17 cm', '15 cm', '16 cm', '18 cm'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'The curved surface area and the volume of a cylindrical object are 88 cm\u00B2 and 132 cm\u00B3, respectively. The height (in cm) of the cylindrical object is: (Take \u03C0 = 22/7)', options: ['3\u2154', '4', '6', '4\u2154'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'Three cubes with sides in the ratio of 3:4:5 are melted to form a single cube whose diagonal is 18\u221A3 cm. The sides of the three cubes are:', options: ['21, 28 and 35 cm', '9, 12 and 15 cm', '18, 24 and 30 cm', '12, 16 and 20 cm'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The ratio of the volume of first and second cylinder is 32:9 and the ratio of their heights is 8:9. If the area of the base of the second cylinder is 616 cm\u00B2, then what will be the radius of the first cylinder?', options: ['24 cm', '20 cm', '28 cm', '36 cm'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'An iron box with external dimensions 60 cm, 40 cm, and 20 cm is made of 1 cm thick sheet. If 1 cm\u00B3 of iron weighs 50 gm, the weight of the empty box is:', options: ['214.05 kg', '240 kg', '400 kg', '416.40 kg'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'What is the volume (in cm\u00B3) of a spherical shell whose inner and outer radii are respectively 2 cm and 3 cm?', options: ['76\u03C0/3', '106\u03C0/3', '56\u03C0/3', '86\u03C0/3'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'The diameter of a hemispherical bowl is 21 cm. The volume of the bowl is equal to: (Take \u03C0 = 22/7)', options: ['2,425.5 cm\u00B3', '2,524.5 cm\u00B3', '2,725.5 cm\u00B3', '2,624.5 cm\u00B3'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'A toy is in the form of a cone mounted on a hemisphere. The radius of the hemisphere and that of the cone is 36 cm and height of the cone is 105 cm. The total surface area (in cm\u00B2) of the toy is:', options: ['5240\u03C0', '6588\u03C0', '6025\u03C0', '5799\u03C0'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'A solid cube, whose each edge is of length 48 cm, is melted. Identical solid cubes, each of volume 64 cm\u00B3, are made out of this molten cube, without any wastage. How many such small cubes are obtained?', options: ['1738', '1728', '1718', '1748'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'A hemispherical bowl of internal radius 18 cm is full of liquid. This liquid is to be filled in cylindrical bottles each of radius 3 cm and height 6 cm. How many bottles are required to empty the bowl?', options: ['72', '70', '68', '66'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'A right circular cone is sliced into a smaller cone and a frustum of a cone by a plane perpendicular to its axis. The volume of the smaller cone and the frustum of the cone are in the ratio 64:61. Then their curved surface areas are in the ratio:', options: ['4:1', '16:9', '64:61', '81:64'], answerIndex: 1, source: 'Mensuration Practice Set' },
  { question: 'The length of a diagonal of a cuboid is 11 cm. The surface area is 240 square cm. What is the sum of its length, breadth and height?', options: ['16 cm', '17 cm', '18 cm', '19 cm'], answerIndex: 3, source: 'Mensuration Practice Set' },
  { question: 'A cube whose edge is 14 cm long has on each of its faces a circle of 7 cm radius painted yellow. What is the total area of unpainted surface? (Take \u03C0 = 22/7)', options: ['126 square cm', '189 square cm', '252 square cm', '315 square cm'], answerIndex: 2, source: 'Mensuration Practice Set' },
  { question: 'A square sheet of side length 44 cm is rolled along one of its sides to form a cylinder by making opposite edges just to touch each other. What is the volume of the cylinder?', options: ['6776 cubic cm', '6248 cubic cm', '5896 cubic cm', '5680 cubic cm'], answerIndex: 0, source: 'Mensuration Practice Set' },
  { question: 'A hemispherical bowl of internal radius 18 cm contains a liquid. The liquid is filled in small cylindrical bottles of internal radius 3 cm and internal height 4 cm. What is the number of bottles used to empty the bowl?', options: ['54', '81', '108', '13'], answerIndex: 2, source: 'Mensuration Practice Set' }
];

const allSets = [...set1, ...set2, ...set3, ...set4];

// Deduplicate by question text (first 80 chars)
const seen = new Set();
const unique = [];
for (const q of allSets) {
  const key = q.question.substring(0, 80).toLowerCase().replace(/\s+/g, ' ');
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(q);
  }
}

console.log(`Total parsed: ${allSets.length}, Unique: ${unique.length}, Duplicates removed: ${allSets.length - unique.length}`);

const formatted = unique.map((q, i) => {
  const id = Date.now() + '_mens' + (i + 1);
  const tier = q.tier || 'tier1';
  return {
    id,
    type: 'question',
    examFamily: 'ssc',
    subject: 'quant',
    difficulty: 'medium',
    tier,
    questionMode: 'objective',
    topic: 'Mensuration',
    question: q.question,
    options: q.options,
    answerIndex: q.answerIndex,
    explanation: '',
    marks: tier === 'tier1' ? 2 : 3,
    negativeMarks: tier === 'tier1' ? 0.5 : 1,
    isChallengeCandidate: false,
    confidenceScore: 1,
    reviewStatus: 'approved',
    isPYQ: true,
    year: null,
    frequency: 1,
    subtopic: null,
    source: { kind: 'pyq', fileName: q.source, importedAt: now },
    createdAt: now,
    updatedAt: now,
    reviewAudit: { reviewedAt: now, reviewedBy: 'manual_import', decision: 'approve', rejectReason: '' }
  };
});

data.questions.push(...formatted);
data.updatedAt = now;
fs.writeFileSync('./data/question-bank.json', JSON.stringify(data, null, 2));

const t1 = formatted.filter(q => q.tier === 'tier1').length;
const t2 = formatted.filter(q => q.tier === 'tier2').length;
console.log(`Added ${formatted.length} Mensuration PYQs (${t1} tier1, ${t2} tier2) with confidenceScore=1`);
console.log(`Total questions now: ${data.questions.length}`);
