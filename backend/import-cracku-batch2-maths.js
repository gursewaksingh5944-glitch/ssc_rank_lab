const fs = require('fs');
const path = require('path');
const bankPath = path.join(__dirname, 'data', 'question-bank.json');
const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

// Format: [answerIndex, topic, questionText, [opt1, opt2, opt3, opt4]]
const papers = [
// ========== Paper 1: SSC CGL Tier-2 30-Nov-2016 Maths ==========
{ name:"CGL Tier-2 30-Nov-2016 Maths", year:2016, questions:[
[2,"Time and Work","A and B can do a piece of work in 18 days, B and C in 24 days, A and C in 36 days. Working together they can do the work in",["12 days","13 days","16 days","26 days"]],
[3,"Time and Work","Ramesh and Rahman can do a work in 20 and 25 days respectively. After doing collectively 10 days of work, they leave the work due to illness and Suresh completes rest of the work in 3 days. How many days Suresh alone can take to complete the whole work?",["32 days","28 days","29 days","30 days"]],
[2,"Time and Work","A can do a piece of work in 10 days and B can do it in 12 days. They work together for 3 days. Then B leaves and A alone continues. 2 days after that C joins and the work is completed in 2 days more. In how many days can C do it, if he works alone?",["30 days","50 days","40 days","60 days"]],
[0,"Mixture and Alligation","Two bottles contain acid and water in the ratio 2 : 3 and 1 : 2 respectively. These are mixed in the ratio 1 : 3. What is the ratio of acid and water in the new mixture?",["7:13","11:57","23:37","1:3"]],
[3,"Mixture and Alligation","In two types of brass, the ratios of Copper to Zinc are 8:3 and 15:7 respectively. If the two types of brass be melted and mixed in the ratio 5:2 a new type of brass is obtained. The ratio of Copper to Zinc in this new type of brass is",["3:2","2:3","3:4","5:2"]],
[0,"Average","An hour-long test has 60 problems. If a student completes 30 problems in 25 minutes, then the required seconds he has taken on average for computing each of the remaining problems is",["70 seconds","50 seconds","40 seconds","30 seconds"]],
[2,"Average","A and B have their annual average income Rs. 80,000. B and C have their annual average income Rs. 75,000. C and A have their annual average income Rs. 78,000. The annual income of A is?",["Rs.81000","Rs.82000","Rs.83000","Rs.84000"]],
[0,"Speed/Time/Distance","A car travels from A to B with 40 Km/h and returns from B to A with 60 Km/h. Its average speed during the whole journey is",["48 km/h","50 km/h","45 km/h","60 km/h"]],
[3,"Ratio and Proportion","A, B and C together start a business. Three times the investment of A equals four times the Investment of B and the Capital of B is twice that of C. The ratio of share of each in the profit.",["8:3:6","3:8:6","3:6:8","8:6:3"]],
[1,"Profit and Loss","Ramesh sold a book at a loss of 30%. If he had sold it for Rs. 140 more, he would have made a profit of 40%. The cost price of the book is",["Rs. 280","Rs. 200","Rs. 260","Rs. 300"]],
[1,"Profit and Loss","A shopkeeper purchased 510 eggs at the rate of Rs. 20 per dozen. 30 eggs were broken on the way. In order to make a gain of 20%, he must sell the remaining eggs at the rate of",["Rs.22.50 per dozen","Rs.25.50 per dozen","Rs.26 per dozen","Rs.26.50 per dozen"]],
[0,"Profit and Loss","A sell a watch to B at a loss of 12%. B makes a profit of 12.5 percent by selling watch to C. If A sells watch to B at cost of which C purchased it, then percentage of loss or profit of A will be?",["1% loss","1% profit","2% loss","2% profit"]],
[1,"Profit and Loss","A man buys 3 type-I cakes and 6 type-II cakes for Rs. 900. He sells type-I cakes at a profit of 15% and type-II cakes at a loss of 10%. If his overall profit is 2.5%, then the cost prices of type-I cake and type-II cake are respectively",["100,100","160,70","180,60","120,90"]],
[2,"Percentage","A Number is increased by 20%. To get back to the original number, the increased number is to be reduced by",["20%","21%","16 2/3%","14 2/3%"]],
[1,"Speed/Time/Distance","A bus travels 150 Km in 3 hours and then travels next 2 hours at 60 Km/hr. Then the average speed of the bus will be",["55 Km/hr","54 Km/hr","50 Km/hr","60 Km/hr"]],
[1,"Speed/Time/Distance","Three runners A, B and C run a race, with runner A finishing 12 meters ahead of runner B and 18 meters ahead of runner C, while runner B finishes 8 meters ahead of runner C. Each runner travels the entire distance at a constant speed. The length of the race is",["36 Metres","48 Metres","60 Metres","72 Metres"]],
[0,"Compound Interest","The compound interest on Rs. 4000 for 4 years at 10% per annum will be",["Rs.1856.40","Rs.1600","Rs.1856","Rs.1756.60"]],
[3,"Compound Interest","If the difference of the compound interest and the simple interest on a sum of money for 3 years is Rs. 186. Find the sum of money, if the rate of interest in both case be 10%",["Rs.5500","Rs.7200","Rs.6500","Rs.6000"]],
[1,"Compound Interest","A sum of money is invested at 20% compound interest (compounded annually). It would fetch Rs. 723 more if interest is compounded half-yearly. The sum is",["Rs.15,000","Rs.30,000","Rs.20,000","Rs.7,500"]],
[1,"Mensuration","The height of an equilateral triangle is 18 cm. Its area is",["36√3 sq.cm","108√3 sq.cm","108 sq.cm","96√3 sq.cm"]],
[0,"Mensuration","A solid sphere and a solid hemisphere have the same total surface area. The ratio of their volumes is",["3√3 : 4","4 : 3√3","3 : 4√3","1 : 12√3"]],
[2,"Mensuration","The base of a right prism is a trapezium whose the length of parallel sides are 25 cm and 11 cm and the perpendicular distance between the parallel sides is 16 cm. If the height of the prism is 10 cm, then the volume of the prism is",["1440 cu.cm","1540 cu.cm","2880 cu.cm","960 cu.cm"]],
[1,"Mensuration","The length and breadth of a rectangular piece of a land are in a ratio 5:3. The owner spent Rs. 6000 for surrounding it from all sides at Rs.7.50 per metre. The difference between its length and breadth is",["50 metres","100 metres","150 metres","250 metres"]],
[0,"Mensuration","The ratio between the area of a square and that of a circle, when the length of a side of the square is equal to that of the diameter of the circle, is (take π=22/7)",["14 : 11","28 : 11","7 : 22","22 : 7"]],
[0,"Mensuration","A piece of wire 132 cm long is bent successively in the shape of an equilateral triangle, a square and a circle. Then area will be longest in shape of",["Circle","Equilateral triangle","Square","Equal in all the shapes"]],
[2,"Mensuration","If a cone is divided into two parts by drawing a plane through the midpoints of its axis, then the ratio of the volume of the 2 parts of the cone is",["1:2","1:4","1:7","1:8"]],
[3,"Geometry","Two regular polygons are such that the ratio between their number of sides is 1:2 and the ratio of measures of their interior angles is 3:4. Then the number of sides of each polygon are",["10,20","4,8","3,6","5,10"]],
[2,"Mensuration","In an isosceles triangle, the length of each equal side is twice the length of the third side. The ratio of areas of the isosceles triangle and an equilateral triangle with same perimeter is",["30√5 : 100","32√5 : 100","36√5 : 100","42√5 : 100"]],
[2,"Mensuration","A right circular cylinder is partially filled with water. Two iron spherical balls are completely immersed in the water so that the height of the water in the cylinder rises by 4 cm. If the radius of one ball is half of the other and the diameter of the cylinder is 18 cm, then the radii of the spherical balls are",["6 cm and 12 cm","4 cm and 8 cm","3 cm and 6 cm","2 cm and 4 cm"]],
[3,"Algebra","A complete factorisation of x⁴ + 64 is",["(x²+8)²","(x²+8)(x²-8)","(x²-4x+8)(x²-4x-8)","(x²+4x+8)(x²-4x+8)"]],
[3,"Algebra","If x = 1 + √2 + √3, then the value of 2x⁴ - 8x³ - 5x² + 26x - 28 is",["2√2","3√3","5√5","6√6"]],
[2,"Geometry","In an equilateral triangle ABC, G is the centroid. Each side of the triangle is 6 cm. The length of AG is",["2√2 cm","3√2 cm","2√3 cm","3√3 cm"]],
[2,"Geometry","PQ is a tangent to the circle at T. If TR = TS where R and S are points on the circle and ∠RST = 65°, then ∠PTS =",["65°","130°","115°","55°"]],
[2,"Geometry","In △ABC, AC = BC and ∠ABC = 50°, the side BC is produced to D so that BC = CD then the value of ∠BAD is",["80°","40°","90°","50°"]],
[2,"Geometry","In a circle, a diameter AB and a chord PQ (which is not a diameter) intersect each other at X perpendicularly. If AX : BX = 3 : 2 and the radius of the circle is 5 cm, then the length of chord PQ is",["2√13 cm","5√3 cm","4√6 cm","6√5 cm"]],
[1,"Geometry","ABC is a triangle, PQ is line segment intersecting AB in P and AC in Q and PQ ∥ BC. The ratio of AP : BP = 3 : 5 and length of PQ is 18 cm. The length of BC is",["28 cm","48 cm","84 cm","42 cm"]],
[3,"Geometry","If the parallel sides of a trapezium are 8 cm and 4 cm, M and N are the mid points of the diagonals of the trapezium, then length of MN is",["12 cm","6 cm","1 cm","2 cm"]],
[0,"Geometry","△ABC is isosceles having AB = AC and ∠A = 40°. Bisectors PO and OQ of the exterior angles ∠ABD and ∠ACE formed by producing BC on both sides, meet at O. Then the value of ∠BOC is",["70°","110°","80°","55°"]],
[0,"Geometry","An equilateral triangle of side 6 cm is inscribed in a circle. Then radius of the circle is",["2√3 cm","3√2 cm","4√3 cm","3 cm"]],
[2,"Geometry","In a circle with centre O, AB is a diameter and CD is a chord which is equal to the radius OC. AC and BD are extended in such a way that they intersect each other at a point P, exterior to the circle. The measure of ∠APB is",["30°","45°","60°","90°"]],
[2,"Geometry","Two chords AB and CD of a circle with centre O intersect at P. If ∠APC = 40°. Then the value of ∠AOC + ∠BOD is",["50°","60°","80°","120°"]],
[1,"Trigonometry","If x tan 60° + cos 45° = sec 45° then the value of x² + 1 is",["6/7","7/6","5/6","6/5"]],
[1,"Trigonometry","If a²sec²x - b²tan²x = c² then the value of sec²x + tan²x is equal to (b² ≠ a²)",["(b²-a²+2c²)/(b²+a²)","(b²+a²-2c²)/(b²-a²)","(b²-a²-2c²)/(b²+a²)","(b²-a²)/(b²+a²+2c²)"]],
[2,"Height and Distance","If the angle of elevation of the sun decreases from 45° to 30°, then the length of the shadow of a pillar increases by 60m. The height of the pillar is",["60(√3+1) m","30(√3-1) m","30(√3+1) m","60(√3-1) m"]],
[3,"Height and Distance","The angle of elevation of the top of a tower, vertically erected in the middle of a paddy field, from two points on a horizontal line through the foot of the tower are given to be α and β (α>β). The height of the tower is h unit. A possible distance (in the same unit) between the points is",["h(cotβ-cotα)/cos(α+β)","h(cotα-cotβ)","h(tanβ-tanα)/(tanα·tanβ)","h(cotα+cotβ)"]],
]},

// ========== Paper 2: SSC CGL Tier-2 13-Sep-2019 Maths ==========
{ name:"CGL Tier-2 13-Sep-2019 Maths", year:2019, questions:[
[1,"Geometry","In a circle with centre O, ABCD is a cyclic quadrilateral and AC is the diameter. Chords AB and CD are produced to meet at E. If ∠CAE = 34° and ∠E = 30°, then ∠CBD is equal to:",["36°","26°","24°","34°"]],
[3,"Algebra","ab(a - b) + bc(b - c) + ca(c - a) is equal to:",["(a + b)(b - c)(c - a)","(a - b)(b + c)(c - a)","(a - b)(b - c)(c - a)","(b - a)(b - c)(c - a)"]],
[0,"Time and Work","A is as efficient as B and C together. Working together A and B can complete a work in 36 days and C alone can complete it in 60 days. A and C work together for 10 days. B alone will complete the remaining work in:",["110 days","88 days","84 days","90 days"]],
[1,"Mixture and Alligation","A vessel contains a 32 litre solution of acid and water in which the ratio of acid and water is 5 : 3. If 12 litres of the solution are taken out and 7.5 litres of water are added to it, then what is the ratio of acid and water in the resulting solution?",["4:7","5:6","4:9","8:11"]],
[2,"Mensuration","A sphere of maximum volume is cut out from a solid hemisphere. What is the ratio of the volume of the sphere to that of the remaining solid?",["1:4","1:2","1:3","1:1"]],
[3,"Geometry","S is the incenter of △PQR. If ∠PSR = 125°, then the measure of ∠PQR is:",["75°","55°","80°","70°"]],
[3,"Geometry","If in △ABC, D and E are the points on AB and BC respectively such that DE ∥ BC, and AD : AB = 3:8, then (area of △BDE) : (area of quadrilateral DECA) = ?",["9:55","9:64","8:13","25:39"]],
[0,"Ratio and Proportion","A, B and C started a business with their capitals in the ratio 2 : 3 : 5. A increased his capital by 50% after 4 months, B increased his capital by 33⅓% after 6 months and C withdrew 50% of his capital after 8 months, from the start of the business. If the total profit at the end of a year was ₹86,800, then the difference between the shares of A and C in the profit was:",["₹12,600","₹7,000","₹9,800","₹8,400"]],
[2,"Profit and Loss","An article was sold at a profit of 14%. Had it been sold for ₹121 less, a loss of 8% would have been incurred. If the same article would have been sold for ₹536.25, then the profit/loss per cent would have been:",["Profit, 5%","Loss, 5%","Loss, 2.5%","Profit, 2.5%"]],
[2,"Discount","A shopkeeper allows 18% discount on the marked price of an article and still makes a profit of 23%. If he gains ₹18.40 on the sale of the article, then what is the marked price of the article?",["₹140","₹125","₹120","₹146"]],
[2,"Time and Work","A can do one-third of a work in 15 days, B can do 75% of the same work in 18 days and C can do the same work in 36 days. B and C work together for 8 days. In how many days will A alone complete the remaining work?",["24 days","18 days","20 days","16 days"]],
[0,"Percentage","The price of oil is increased by 20%. However, its consumption decreased by 8⅓%. What is the percentage increase or decrease in the expenditure on it?",["Increase by 10%","Increase by 5%","Decrease by 10%","Decrease by 5%"]],
[2,"Discount","The marked price of an article is ₹1500. If two successive discounts, each of x%, on the marked price is equal to a single discount of ₹587.40, then what will be the selling price of the article if a single discount of x% is given on the marked price?",["₹1,025","₹1,155","₹1,170","₹1,200"]],
[3,"Geometry","If the measure of each exterior angle of a regular polygon is (51 3/7)° then the ratio of the number of its diagonals to the number of its sides is:",["5:2","13:6","3:1","2:1"]],
[1,"Pipe and Cistern","Pipes A and B are filling pipes while pipe C is an emptying pipe. A and B can fill a tank in 72 and 90 minutes respectively. When all the three pipes are opened together, the tank gets filled in 2 hours. A and B are opened together for 12 minutes, then closed and C is opened. The tank will be empty after:",["15 minutes","18 minutes","12 minutes","16 minutes"]],
[3,"Geometry","In △ABC, BE ⊥ AC, CD ⊥ AB and BE and CD intersect each other at O. The bisectors of ∠OBC and ∠OCB meet at P. If ∠BPC = 148°, then what is the measure of ∠A?",["56°","28°","32°","64°"]],
[1,"Geometry","In △PQR, ∠Q > ∠R, PS is the bisector of ∠P and PT ⊥ QR. If ∠SPT = 28° and ∠R = 23°, then the measure of ∠Q is:",["74°","79°","82°","89°"]],
[0,"Mensuration","The radius of the base of a right circular cylinder is 3 cm and its curved surface area is 60π cm². The volume of the cylinder (in cm³) is:",["90π","72π","60π","81π"]],
[1,"Ratio and Proportion","A, B and C spend 80%, 85% and 75% of their incomes, respectively. If their savings are in the ratio 8 : 9 : 20 and the difference between the incomes of A and C is ₹18,000, then the income of B is:",["₹24,000","₹27,000","₹30,000","₹36,000"]],
[1,"Percentage","If 25% of half of x is equal to 2.5 times the value of 30% of one-fourth of y, then x is what percent more or less than y?",["33⅓% more","50% more","33⅓% less","50% less"]],
[2,"Geometry","In quadrilateral ABCD, ∠C = 72° and ∠D = 28°. The bisectors of ∠A and ∠B meet at O. What is the measure of ∠AOB?",["48°","54°","50°","36°"]],
[1,"Ratio and Proportion","A, B and C started a business. Thrice the investment of A is equal to twice the investment of B and also equal to four times the investment of C. If C's share out of the total profit is ₹4,863, then the share of A in the profit is:",["₹7,272","₹6,484","₹9,726","₹8,105"]],
[0,"Ratio and Proportion","If (5x + 2y) : (10x + 3y) = 5 : 9, then (2x² + 3y²) : (4x² + 9y²) = ?",["31:87","10:27","16:47","1:3"]],
[1,"Geometry","In △ABC, D and E are the points on AB and AC respectively such that AD × AC = AB × AE. If ∠ADE = ∠ACB + 30° and ∠ABC = 78°, then ∠A = ?",["56°","54°","68°","48°"]],
[2,"Geometry","If in △PQR, ∠P = 120°, PS ⊥ QR at S and PQ + QS = SR, then the measure of ∠Q is:",["20°","50°","40°","30°"]],
[2,"Profit and Loss","If the selling price of an article is 32% more than its cost price and the discount offered on its marked price is 12%, then what is the ratio of its cost price to the marked price?",["4:5","3:8","2:3","1:2"]],
[3,"Compound Interest","A certain loan was returned in two equal half yearly instalments each of ₹6,760. If the rate of interest was 8% p.a., compounded yearly, how much was the interest paid on the loan?",["₹750","₹810","₹790","₹770"]],
[3,"Compound Interest","A certain sum amounts to ₹4,205.55 at 15% p.a. in 2⅖ years, interest compounded yearly. The sum is:",["₹3,200","₹3,500","₹2,700","₹3,000"]],
[0,"Geometry","In △ABD, C is the midpoint of BD. If AB = 10 cm, AD = 12 cm and AC = 9 cm, then BD = ?",["2√41 cm","2√10 cm","√41 cm","√10 cm"]],
[1,"Simple Interest","A sum of ₹10,500 amounts to ₹13,825 in 3½ years at a certain rate per cent per annum simple interest. What will be the simple interest on the same sum for 5 years at double the earlier rate?",["₹8,470","₹8,750","₹8,670","₹8,560"]],
]},

// ========== Paper 3: SSC CGL Tier-2 18-Feb-2018 Maths ==========
{ name:"CGL Tier-2 18-Feb-2018 Maths", year:2018, questions:[
[2,"Mensuration","A regular hexagonal base prism has height 8 cm and side of base is 4 cm. What is the total surface area (in cm²) of the prism?",["54(3+√3)","36(3+√3)","48(4+√3)","24(4+√3)"]],
[0,"Mensuration","Three toys are in a shape of cylinder, hemisphere and cone. The three toys have same base. Height of each toy is 2√2 cm. What is the ratio of the total surface areas of cylinder, hemisphere and cone respectively?",["4 : 3 : (√2+1)","4 : 3 : (2+√2)","4 : 3 : 2√2","2 : 1 : (1+√2)"]],
[2,"Height and Distance","A tower stands on the top of a building which is 40 metres high. The angle of depression of a point situated on the ground from the top and bottom of the tower are found to be 60° and 45° respectively. What is the height (in metres) of tower?",["20√3","30(√3+1)","40(√3-1)","50(√3-1)"]],
[2,"Ratio and Proportion","A starts a taxi service by investing Rs 25 lakhs. After 3 months, B joins the business by investing Rs 40 lakhs then 4 months after B joined, C too joins them by investing Rs 50 lakhs. One year after A started the business they make Rs 2,73,000 in profit. What is C's share of the profit (in Rs)?",["1,00,000","1,25,000","75,000","1,50,000"]],
[0,"Time and Work","A can do a work in 36 days and B in 12 days. If they work on it together for 3 days, then what fraction of work is left?",["2/3","1/3","1/4","1/5"]],
]},

// ========== Paper 4: SSC CGL Tier-2 19-Feb-2018 Maths ==========
{ name:"CGL Tier-2 19-Feb-2018 Maths", year:2018, questions:[
[3,"Algebra","If a and b are the roots of the equation x² + x - 1 = 0, then what is the equation whose roots are a⁵ and b⁵?",["x²+7x-1=0","x²-7x-1=0","x²-11x-1=0","x²+11x-1=0"]],
[0,"Mensuration","The ratio of the curved surface area and total surface area of a right circular cylinder is 2 : 5. If the total surface area is 3080 cm², then what is the volume (in cm³) of the cylinder?",["4312√6","3822√6","4522√6","4642√6"]],
[3,"Mensuration","A regular triangular pyramid is cut by 2 planes which are parallel to its base. The planes trisect the altitude of the pyramid. Volume of top, middle and bottom part is V₁, V₂ and V₃ respectively. What is the value of V₁ : V₂ : V₃?",["1:8:27","1:8:19","2:9:27","1:7:19"]],
[3,"Trigonometry","What is the value of [(cos 7A + cos 5A) ÷ (sin 7A - sin 5A)]?",["tan A","tan 4A","cot 4A","cot A"]],
[0,"Mixture and Alligation","If a dairy mixes cow's milk which contains 10% fat with buffalo's milk which contains 20% fat, then the resulting mixture has 12.86% fat. What ratio was the cow's milk mixed with buffalo's milk?",["2:5","1:5","2:3","2:1"]],
[1,"Mixture and Alligation","In what ratio should tea costing Rs 300/kg be mixed with tea costing Rs 200/kg so that the cost of the mixture is Rs 225/kg?",["3:1","1:3","1:4","4:1"]],
[3,"Ratio and Proportion","If 2A = 3B = 8C; What is A : B : C?",["8:3:2","8:4:3","2:3:8","12:8:3"]],
[1,"Percentage","2% of a = b, then b% of 10 is the same as:",["200% of a","20% of a/100","20% of a/10","200% of a/10"]],
]},

// ========== Paper 5: SSC CGL Tier-2 20-Feb-2018 Maths ==========
{ name:"CGL Tier-2 20-Feb-2018 Maths", year:2018, questions:[
[2,"Algebra","If a and b are the roots of equation x² - 2x + 4 = 0, then what is the equation whose roots are b² and a²?",["x²-4x+8=0","x²-32x+4=0","x²-2x+4=0","x²-16x+4=0"]],
[3,"Algebra","If one root of the equation Ax² + Bx + C = 0 is two and a half times the others, then which of the following is TRUE?",["7B²=3CA","7B²=4CA","7B²=36CA","10B²=49CA"]],
[2,"Algebra","If 3x+4y-2z+9=17, 7x+2y+11z+8=23 and 5x+9y+6z-4=18, then what is the value of x+y+z-34?",["−28","−14","−31","−45"]],
[2,"Geometry","ABCDEF is a regular hexagon of side 12 cm. What is the area (in cm²) of triangle ECD?",["18√3","24√3","36√3","42√3"]],
[2,"Geometry","PQRS is a square whose side is 16 cm. What is the value of the side (in cm) of the largest regular octagon that can be cut from the given square?",["8-4√2","16+8√2","16√2-16","16-8√2"]],
[1,"Mensuration","The radius of base of solid cone is 9 cm and its height is 21 cm. It is cut into 3 parts by two cuts, which are parallel to its base. The cuts are at height of 7 cm and 14 cm from the base respectively. What is the ratio of curved surface areas of top, middle and bottom parts respectively?",["1:4:8","1:3:5","1:3:9","1:6:12"]],
[3,"Mensuration","The ratio of curved surface area and volume of a cylinder is 1 : 7. The ratio of total surface area and volume is 187 : 770. What is the respective ratio of its base radius and height?",["5:8","4:9","3:7","7:10"]],
[0,"Mensuration","A solid cube has side 8 cm. It is cut along diagonals of top face to get 4 equal parts. What is the total surface area (in cm²) of each part?",["96+64√2","80+64√2","96+48√2","80+48√2"]],
[1,"Height and Distance","The angle of elevation of an aeroplane from a point on the ground is 60°. After flying for 30 seconds, the angle of elevation changes to 30°. If the aeroplane is flying at a height of 4500 m, then what is the speed (in m/s) of aeroplane?",["50√3","100√3","200√3","300√3"]],
[1,"Ratio and Proportion","If 3A = 6B = 9C; What is A : B : C?",["6:3:1","6:3:2","9:3:6","9:3:1"]],
[0,"Ages","The ratio of ages of the father and mother was 11:10 when their son was born. The ratio of ages of the father and mother will be 19:18 when the son will be twice his present age. What is the ratio of present ages of father and mother?",["15:14","14:13","16:15","17:16"]],
]},

// ========== Paper 6: SSC CGL Tier-2 21-Feb-2018 Maths ==========
{ name:"CGL Tier-2 21-Feb-2018 Maths", year:2018, questions:[
[3,"Number System","If A = 1 - 10 + 3 - 12 + 5 - 14 + 7 + … upto 60 terms, then what is the value of A?",["−360","−310","−240","−270"]],
[0,"Number System","Which of the following statement(s) is/are TRUE? I. √(64)+√(0.0064)+√(0.81)+√(0.0081)=9.07 II. √(0.010201)+√(98.01)+√(0.25)=11.51",["Only I","Only II","Both I and II","Neither I nor II"]],
[1,"Number System","Which of the following statement(s) is/are TRUE? I. (0.7)²+(0.07)²+(11.1)²>123.8 II. (1.12)²+(10.3)²+(1.05)²>108.3",["Only I","Only II","Both I and II","Neither I nor II"]],
[2,"Number System","Which of the following statement(s) is/are TRUE? I. √71 < √91 < √99 II. √135 > √157 > √181",["Only I","Only II","Both I and II","Neither I nor II"]],
[1,"Number System","Which of the following statement(s) is/are TRUE? I. √5+√5 > √7+√3 II. √6+√7 > √8+√5 III. √3+√9 > √6+√6",["Only I","Only I and II","Only II and III","Only I and III"]],
[1,"Algebra","If the difference between the roots of the equation Ax²-Bx+C=0 is 4, then which of the following is TRUE?",["B²-16A²=4AC+4B²","B²-10A²=4AC+6A²","B²-8A²=4AC+10A²","B²-16A²=4AC+8B²"]],
[0,"Algebra","a and b are the roots of quadratic equation. If a+b=8 and a-b=2√5, then which of the following equation will have roots a⁴ and b⁴?",["x²-1522x+14641=0","x²+1921x+14641=0","x²-1764x+14641=0","x²+2520x+14641=0"]],
[0,"Algebra","If A and B are the roots of the equation Ax²-A²x+AB=0, then what is the value of A and B respectively?",["1, 0","1, 1","0, 2","0, 1"]],
[3,"Geometry","ABCD is a trapezium in which AB is parallel to CD and AB = 4(CD). The diagonals of the trapezium intersect at O. What is the ratio of area of triangle DCO to the area of the triangle ABO?",["1:4","1:2","1:8","1:16"]],
[1,"Geometry","PQRS is a square whose side is 20 cm. By joining opposite vertices of PQRS we get four triangles. What is the sum of the perimeters of the four triangles?",["40√2","80√2+80","40√2+40","40√2+80"]],
[3,"Mensuration","The base of a prism is in the shape of an equilateral triangle. If the perimeter of the base is 18 cm and the height of the prism is 20 cm, then what is the volume (in cm³) of the prism?",["60√3","30√6","60√2","180√3"]],
[0,"Ratio and Proportion","According to the will, the wealth of Rs 21,25,000 was to be divided between the son and the daughter in the ratio 3:2. How much did the son get (in Rs)?",["8,75,000","12,50,000","10,00,000","11,25,000"]],
]},
];

// ============ IMPORT LOGIC (with preference for new over old) ============
let added = 0, updated = 0, skipped = 0;
const keyMap = new Map();
bank.questions.forEach((q, idx) => {
  keyMap.set(q.question.trim().toLowerCase().substring(0, 50), idx);
});

for (const paper of papers) {
  let pAdd = 0, pUpd = 0;
  for (const [a, topic, q, o] of paper.questions) {
    const key = q.trim().toLowerCase().substring(0, 50);
    const existIdx = keyMap.get(key);
    if (existIdx !== undefined) {
      // Update existing with cleaner text (prefer new)
      const existing = bank.questions[existIdx];
      existing.question = q;
      existing.options = o;
      existing.answerIndex = a;
      existing.topic = topic;
      existing.year = paper.year;
      existing.updatedAt = new Date().toISOString();
      updated++; pUpd++;
    } else {
      const qObj = {
        id: Date.now().toString() + '_' + Math.random().toString(36).slice(2, 9),
        type: 'question', examFamily: 'ssc', subject: 'quant',
        difficulty: 'medium', tier: 'tier2', questionMode: 'objective',
        topic, question: q, options: o, answerIndex: a,
        explanation: '', marks: 2, negativeMarks: 0.5,
        isPYQ: true, year: paper.year, subtopic: null,
        source: { kind: 'cracku-extract', fileName: paper.name, importedAt: new Date().toISOString() },
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      bank.questions.push(qObj);
      keyMap.set(key, bank.questions.length - 1);
      added++; pAdd++;
    }
  }
  console.log(`  ${paper.name}: ${pAdd} added, ${pUpd} updated`);
}

bank.updatedAt = new Date().toISOString();
fs.writeFileSync(bankPath, JSON.stringify(bank, null, 2));
console.log(`\nDone: ${added} added, ${updated} updated, total: ${bank.questions.length}`);
