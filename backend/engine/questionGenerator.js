/**
 * Parameterized Template-Based Question Generator
 * Generates mathematically perfect SSC CGL Quant questions with computed answers.
 *
 * Every question is built from a template + random valid parameters + formula.
 * Distractors are based on common mistakes, not random numbers.
 *
 * Usage:
 *   const gen = require('./questionGenerator');
 *   const questions = gen.generate({ subject: 'quant', topic: 'Percentage', count: 5, difficulty: 'medium' });
 *   const fullMock  = gen.generateMockSection('quant', 25, 'tier1');
 */

// ── Utilities ───────────────────────────────────────────────

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function frac(num, den) {
  const g = gcd(Math.abs(num), Math.abs(den));
  return { n: num / g, d: den / g };
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a, b) {
  return (a / gcd(a, b)) * b;
}

/** Build 4 options: correct answer + 3 smart distractors */
function buildOptions(correct, distractors) {
  // Remove any duplicates or values equal to correct
  const unique = [...new Set(distractors.map(d => round2(d)))]
    .filter(d => d !== round2(correct) && Number.isFinite(d) && d >= 0);

  // Ensure we have at least 3 distractors
  while (unique.length < 3) {
    const offset = rand(1, 5) * (Math.random() > 0.5 ? 1 : -1);
    const val = round2(correct + offset);
    if (val > 0 && !unique.includes(val) && val !== round2(correct)) unique.push(val);
  }

  const opts = [round2(correct), unique[0], unique[1], unique[2]];
  const shuffled = shuffle(opts);
  return {
    options: shuffled.map(o => formatNum(o)),
    answerIndex: shuffled.indexOf(round2(correct))
  };
}

function buildStringOptions(correct, distractors) {
  const unique = [...new Set(distractors)].filter(d => d !== correct);
  while (unique.length < 3) unique.push(correct + " (approx)");
  const opts = [correct, unique[0], unique[1], unique[2]];
  const shuffled = shuffle(opts);
  return { options: shuffled, answerIndex: shuffled.indexOf(correct) };
}

function formatNum(n) {
  if (Number.isInteger(n)) return String(n);
  return String(round2(n));
}

function formatRupee(n) {
  if (Number.isInteger(n)) return `₹${n.toLocaleString("en-IN")}`;
  return `₹${round2(n).toLocaleString("en-IN")}`;
}

function uid() {
  return "tpl_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 8);
}

// ── TOPIC TEMPLATES ─────────────────────────────────────────
// Each template: { id, difficulty, build() → {question, correct, distractors, explanation} }

const TEMPLATES = {};

// ═══════════════════════════════════════════════════════════
// PERCENTAGE
// ═══════════════════════════════════════════════════════════
TEMPLATES["Percentage"] = [
  // 1. Basic X% of Y
  {
    id: "pct_basic", difficulty: ["easy"],
    build() {
      const pct = pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75]);
      const base = rand(2, 20) * 100;
      const ans = (pct / 100) * base;
      return {
        question: `What is ${pct}% of ${base}?`,
        correct: ans,
        distractors: [ans + base * 0.05, ans - base * 0.05, (pct / 10) * base],
        explanation: `${pct}% of ${base} = ${pct}/100 × ${base} = ${ans}`
      };
    }
  },
  // 2. Percentage increase
  {
    id: "pct_increase", difficulty: ["easy", "medium"],
    build() {
      const original = rand(2, 50) * 10;
      const pct = pick([10, 15, 20, 25, 30, 40, 50]);
      const increased = original * (1 + pct / 100);
      return {
        question: `If a number ${original} is increased by ${pct}%, what is the new number?`,
        correct: increased,
        distractors: [original + pct, original * pct / 100, original * (1 - pct / 100)],
        explanation: `Increased value = ${original} × (1 + ${pct}/100) = ${original} × ${round2(1 + pct / 100)} = ${increased}`
      };
    }
  },
  // 3. Percentage decrease
  {
    id: "pct_decrease", difficulty: ["easy", "medium"],
    build() {
      const original = rand(2, 50) * 10;
      const pct = pick([10, 15, 20, 25, 30, 40]);
      const decreased = original * (1 - pct / 100);
      return {
        question: `If a value of ${original} is decreased by ${pct}%, what is the resulting value?`,
        correct: decreased,
        distractors: [original - pct, original * pct / 100, original * (1 + pct / 100)],
        explanation: `Decreased value = ${original} × (1 − ${pct}/100) = ${decreased}`
      };
    }
  },
  // 4. If A is X% more than B, B is what % less than A?
  {
    id: "pct_reverse", difficulty: ["medium", "hard"],
    build() {
      const pct = pick([10, 20, 25, 30, 40, 50]);
      const ans = round2((pct / (100 + pct)) * 100);
      return {
        question: `If A is ${pct}% more than B, then B is what percentage less than A?`,
        correct: ans,
        distractors: [pct, round2(pct - ans), round2(100 - pct)],
        explanation: `B is less than A by ${pct}/(100+${pct}) × 100 = ${pct}/${100 + pct} × 100 = ${ans}%`
      };
    }
  },
  // 5. Successive percentage changes
  {
    id: "pct_successive", difficulty: ["medium", "hard"],
    build() {
      const p1 = pick([10, 15, 20, 25, 30]);
      const p2 = pick([10, 15, 20, 25, 30]);
      const net = round2(p1 + p2 + (p1 * p2) / 100);
      return {
        question: `A shopkeeper increases the price of an article by ${p1}% and then again by ${p2}%. The total percentage increase in the price is:`,
        correct: net,
        distractors: [p1 + p2, round2(p1 * p2 / 100), round2(net + 5)],
        explanation: `Net % change = ${p1} + ${p2} + (${p1}×${p2})/100 = ${p1} + ${p2} + ${round2(p1 * p2 / 100)} = ${net}%`
      };
    }
  },
  // 6. Population increase/decrease
  {
    id: "pct_population", difficulty: ["medium"],
    build() {
      const pop = rand(5, 50) * 1000;
      const rate = pick([5, 8, 10, 12, 15, 20]);
      const years = pick([2, 3]);
      const ans = Math.round(pop * Math.pow(1 + rate / 100, years));
      return {
        question: `The population of a town is ${pop.toLocaleString("en-IN")}. It increases by ${rate}% per annum. What will be the population after ${years} years?`,
        correct: ans,
        distractors: [Math.round(pop * (1 + rate * years / 100)), Math.round(pop * Math.pow(1 + rate / 100, years - 1)), Math.round(pop * Math.pow(1 - rate / 100, years))],
        explanation: `Population = ${pop} × (1 + ${rate}/100)^${years} = ${pop} × ${round2(Math.pow(1 + rate / 100, years))} = ${ans}`
      };
    }
  },
  // 7. Expenditure/consumption after price change
  {
    id: "pct_expenditure", difficulty: ["medium", "hard"],
    build() {
      const inc = pick([10, 15, 20, 25, 30, 40, 50]);
      const reduction = round2((inc / (100 + inc)) * 100);
      return {
        question: `If the price of sugar increases by ${inc}%, by what percent must a household reduce its consumption so as not to increase its expenditure?`,
        correct: reduction,
        distractors: [inc, round2(reduction + 3), round2(reduction - 3)],
        explanation: `Reduction = ${inc}/(100+${inc}) × 100 = ${round2(reduction)}%`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// PROFIT & LOSS
// ═══════════════════════════════════════════════════════════
TEMPLATES["Profit & Loss"] = [
  // 1. SP from CP and profit%
  {
    id: "pl_sp_from_profit", difficulty: ["easy"],
    build() {
      const cp = rand(1, 50) * 100;
      const profit = pick([5, 10, 12, 15, 20, 25, 30]);
      const sp = cp * (1 + profit / 100);
      return {
        question: `An article is bought for ${formatRupee(cp)} and sold at ${profit}% profit. What is the selling price?`,
        correct: sp,
        distractors: [cp + profit, cp * profit / 100, cp * (1 - profit / 100)],
        explanation: `SP = CP × (1 + P%/100) = ${cp} × ${round2(1 + profit / 100)} = ${formatRupee(sp)}`
      };
    }
  },
  // 2. CP from SP and loss%
  {
    id: "pl_cp_from_loss", difficulty: ["easy", "medium"],
    build() {
      const cp = rand(2, 50) * 100;
      const loss = pick([5, 10, 12, 15, 20, 25]);
      const sp = cp * (1 - loss / 100);
      return {
        question: `An article is sold for ${formatRupee(sp)} at a loss of ${loss}%. What is the cost price?`,
        correct: cp,
        distractors: [round2(sp * (1 + loss / 100)), round2(sp + loss), round2(sp / (1 + loss / 100))],
        explanation: `CP = SP / (1 − L%/100) = ${sp} / ${round2(1 - loss / 100)} = ${formatRupee(cp)}`
      };
    }
  },
  // 3. Profit/Loss on selling two articles at same price
  {
    id: "pl_two_articles", difficulty: ["medium", "hard"],
    build() {
      const sp = rand(2, 20) * 100;
      const pct = pick([10, 15, 20, 25]);
      const cp1 = round2(sp / (1 + pct / 100));
      const cp2 = round2(sp / (1 - pct / 100));
      const totalCP = round2(cp1 + cp2);
      const totalSP = 2 * sp;
      const netPL = round2(totalSP - totalCP);
      const absPL = Math.abs(netPL);
      const type = netPL >= 0 ? "profit" : "loss";
      return {
        question: `A man sells two articles each at ${formatRupee(sp)}. On one he gains ${pct}% and on the other he loses ${pct}%. His overall ${type} is:`,
        correct: absPL,
        distractors: [0, round2(absPL + sp * 0.02), round2(sp * pct / 100)],
        explanation: `CP₁ = ${sp}/(1.${pct < 10 ? "0" + pct : pct}) = ${formatRupee(cp1)}, CP₂ = ${sp}/(0.${100 - pct}) = ${formatRupee(cp2)}. Net = ${totalSP} − ${round2(totalCP)} = ${formatRupee(netPL)} (${type})`
      };
    }
  },
  // 4. Marked price and discount
  {
    id: "pl_marked_price", difficulty: ["medium"],
    build() {
      const cp = rand(2, 40) * 100;
      const markup = pick([20, 25, 30, 40, 50]);
      const discount = pick([5, 10, 15, 20]);
      const mp = cp * (1 + markup / 100);
      const sp = mp * (1 - discount / 100);
      const profitPct = round2(((sp - cp) / cp) * 100);
      return {
        question: `A shopkeeper marks an article ${markup}% above the cost price of ${formatRupee(cp)} and gives a discount of ${discount}%. His profit percentage is:`,
        correct: profitPct,
        distractors: [markup - discount, round2(profitPct + 3), round2(markup * discount / 100)],
        explanation: `MP = ${cp} × ${round2(1 + markup / 100)} = ${formatRupee(mp)}. SP = ${round2(mp)} × ${round2(1 - discount / 100)} = ${formatRupee(sp)}. Profit% = (${round2(sp)}−${cp})/${cp} × 100 = ${profitPct}%`
      };
    }
  },
  // 5. Dishonest dealer
  {
    id: "pl_dishonest", difficulty: ["hard"],
    build() {
      const cheat = pick([10, 15, 20, 25]);
      const profitPct = round2((cheat / (100 - cheat)) * 100);
      return {
        question: `A dishonest dealer claims to sell at cost price but uses a weight that is ${cheat}% less. His profit percentage is:`,
        correct: profitPct,
        distractors: [cheat, round2(profitPct + 5), round2(cheat * 100 / (100 + cheat))],
        explanation: `Profit% = ${cheat}/(100−${cheat}) × 100 = ${cheat}/${100 - cheat} × 100 = ${round2(profitPct)}%`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// SIMPLE & COMPOUND INTEREST
// ═══════════════════════════════════════════════════════════
TEMPLATES["Simple & Compound Interest"] = [
  // 1. Simple interest
  {
    id: "si_basic", difficulty: ["easy"],
    build() {
      const P = rand(1, 50) * 1000;
      const R = pick([4, 5, 6, 8, 10, 12]);
      const T = pick([2, 3, 4, 5]);
      const SI = P * R * T / 100;
      return {
        question: `Find the simple interest on ${formatRupee(P)} at ${R}% per annum for ${T} years.`,
        correct: SI,
        distractors: [P * R / 100, SI + P * 0.01, round2(P * Math.pow(1 + R / 100, T) - P)],
        explanation: `SI = PRT/100 = ${P}×${R}×${T}/100 = ${formatRupee(SI)}`
      };
    }
  },
  // 2. Compound interest
  {
    id: "ci_basic", difficulty: ["medium"],
    build() {
      const P = rand(1, 20) * 1000;
      const R = pick([5, 8, 10, 12, 15, 20]);
      const T = pick([2, 3]);
      const A = Math.round(P * Math.pow(1 + R / 100, T));
      const CI = A - P;
      return {
        question: `Find the compound interest on ${formatRupee(P)} at ${R}% per annum for ${T} years, compounded annually.`,
        correct: CI,
        distractors: [P * R * T / 100, CI + rand(10, 100), A],
        explanation: `A = P(1+R/100)^T = ${P}(1+${R}/100)^${T} = ${formatRupee(A)}. CI = A−P = ${formatRupee(CI)}`
      };
    }
  },
  // 3. Difference between CI and SI for 2 years
  {
    id: "ci_si_diff", difficulty: ["medium", "hard"],
    build() {
      const P = rand(1, 30) * 1000;
      const R = pick([5, 8, 10, 12, 15]);
      const diff = round2(P * R * R / (100 * 100));
      return {
        question: `The difference between compound interest and simple interest on ${formatRupee(P)} at ${R}% per annum for 2 years is:`,
        correct: diff,
        distractors: [round2(diff * 2), round2(P * R / 100), round2(diff + P * 0.001)],
        explanation: `Diff for 2 years = P(R/100)² = ${P}×(${R}/100)² = ${formatRupee(diff)}`
      };
    }
  },
  // 4. Amount doubles — find time
  {
    id: "si_double", difficulty: ["easy"],
    build() {
      const R = pick([5, 8, 10, 12.5, 15, 20, 25]);
      const T = round2(100 / R);
      return {
        question: `At what rate of simple interest will a sum of money double itself in ${T} years?`,
        correct: R,
        distractors: [round2(R + 2), round2(R / 2), round2(100 / (T + 2))],
        explanation: `For doubling, SI = P. So P = P×R×${T}/100 → R = 100/${T} = ${R}%`
      };
    }
  },
  // 5. Find principal from amount and SI
  {
    id: "si_find_principal", difficulty: ["medium"],
    build() {
      const P = rand(2, 30) * 1000;
      const R = pick([5, 6, 8, 10, 12]);
      const T = pick([2, 3, 4, 5]);
      const A = P + (P * R * T / 100);
      return {
        question: `A sum of money amounts to ${formatRupee(A)} in ${T} years at ${R}% per annum simple interest. The sum is:`,
        correct: P,
        distractors: [A - rand(100, 500), round2(A / (1 + R / 100)), round2(A * 100 / (100 + R))],
        explanation: `A = P(1 + RT/100). So P = ${A}/(1 + ${R}×${T}/100) = ${A}/${round2(1 + R * T / 100)} = ${formatRupee(P)}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// RATIO & PROPORTION
// ═══════════════════════════════════════════════════════════
TEMPLATES["Ratio & Proportion"] = [
  // 1. Divide amount in ratio
  {
    id: "ratio_divide", difficulty: ["easy"],
    build() {
      const a = rand(1, 7);
      let b = rand(1, 7);
      if (b === a) b = a + 1;
      const total = (a + b) * rand(10, 100);
      const shareA = (a / (a + b)) * total;
      const shareB = (b / (a + b)) * total;
      const askA = Math.random() > 0.5;
      return {
        question: `${formatRupee(total)} is divided between A and B in the ratio ${a}:${b}. ${askA ? "A's" : "B's"} share is:`,
        correct: askA ? shareA : shareB,
        distractors: [askA ? shareB : shareA, total / 2, round2(total * a / b)],
        explanation: `${askA ? "A's" : "B's"} share = ${total} × ${askA ? a : b}/${a + b} = ${formatRupee(askA ? shareA : shareB)}`
      };
    }
  },
  // 2. Fourth proportional
  {
    id: "ratio_fourth", difficulty: ["easy", "medium"],
    build() {
      const a = rand(2, 12);
      const b = rand(2, 12);
      const c = rand(2, 12);
      const d = (b * c) / a;
      if (!Number.isInteger(d) || d < 1) return this.build();
      return {
        question: `What is the fourth proportional to ${a}, ${b} and ${c}?`,
        correct: d,
        distractors: [a * b / c, a * c / b, d + rand(1, 5)],
        explanation: `Fourth proportional = (b×c)/a = (${b}×${c})/${a} = ${d}`
      };
    }
  },
  // 3. Mean proportional
  {
    id: "ratio_mean", difficulty: ["medium"],
    build() {
      const root = rand(2, 15);
      const a = root * rand(1, 5);
      const b = (root * root) / a;
      if (!Number.isInteger(b) || b < 1) return this.build();
      const mean = Math.sqrt(a * b);
      return {
        question: `Find the mean proportional between ${a} and ${b}.`,
        correct: mean,
        distractors: [(a + b) / 2, round2(mean + 2), Math.abs(a - b)],
        explanation: `Mean proportional = √(${a}×${b}) = √${a * b} = ${mean}`
      };
    }
  },
  // 4. Three-way ratio division
  {
    id: "ratio_three_way", difficulty: ["medium"],
    build() {
      const a = rand(1, 5), b = rand(1, 5), c = rand(1, 5);
      const total = (a + b + c) * rand(100, 500);
      const shares = [a, b, c].map(x => (x / (a + b + c)) * total);
      const idx = rand(0, 2);
      const names = ["A", "B", "C"];
      return {
        question: `${formatRupee(total)} is divided among A, B and C in the ratio ${a}:${b}:${c}. ${names[idx]}'s share is:`,
        correct: shares[idx],
        distractors: [shares[(idx + 1) % 3], shares[(idx + 2) % 3], total / 3],
        explanation: `${names[idx]}'s share = ${total} × ${[a, b, c][idx]}/${a + b + c} = ${formatRupee(shares[idx])}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// AVERAGES
// ═══════════════════════════════════════════════════════════
TEMPLATES["Average"] = [
  // 1. Basic average
  {
    id: "avg_basic", difficulty: ["easy"],
    build() {
      const n = pick([5, 6, 7, 8, 10]);
      const avg = rand(10, 80);
      const total = n * avg;
      return {
        question: `The average of ${n} numbers is ${avg}. What is their sum?`,
        correct: total,
        distractors: [total + n, total - n, round2(total / 2)],
        explanation: `Sum = Average × Count = ${avg} × ${n} = ${total}`
      };
    }
  },
  // 2. New average when one number added
  {
    id: "avg_add_one", difficulty: ["medium"],
    build() {
      const n = pick([5, 6, 7, 8, 10]);
      const avg = rand(20, 60);
      const newNum = avg + rand(5, 25);
      const newAvg = round2((n * avg + newNum) / (n + 1));
      return {
        question: `The average of ${n} numbers is ${avg}. If ${newNum} is added to this set, the new average becomes:`,
        correct: newAvg,
        distractors: [round2((avg + newNum) / 2), avg + 1, round2(newAvg + 2)],
        explanation: `New avg = (${n}×${avg} + ${newNum})/${n + 1} = ${n * avg + newNum}/${n + 1} = ${newAvg}`
      };
    }
  },
  // 3. Average speed
  {
    id: "avg_speed", difficulty: ["medium", "hard"],
    build() {
      const s1 = pick([20, 30, 40, 50, 60]);
      let s2 = pick([20, 30, 40, 50, 60, 80]);
      if (s2 === s1) s2 = s1 + 10;
      const avgSpeed = round2((2 * s1 * s2) / (s1 + s2));
      return {
        question: `A person goes from A to B at ${s1} km/h and returns at ${s2} km/h. The average speed for the entire journey is:`,
        correct: avgSpeed,
        distractors: [(s1 + s2) / 2, round2(avgSpeed + 3), round2(Math.sqrt(s1 * s2))],
        explanation: `Average speed = 2×${s1}×${s2}/(${s1}+${s2}) = ${2 * s1 * s2}/${s1 + s2} = ${avgSpeed} km/h`
      };
    }
  },
  // 4. Replaced member average change
  {
    id: "avg_replace", difficulty: ["medium"],
    build() {
      const n = pick([5, 7, 8, 10]);
      const increase = rand(2, 8);
      const oldVal = rand(20, 50);
      const newVal = oldVal + n * increase;
      return {
        question: `The average of ${n} numbers is increased by ${increase} when one of the numbers, ${oldVal}, is replaced by a new number. The new number is:`,
        correct: newVal,
        distractors: [oldVal + increase, newVal + n, newVal - increase],
        explanation: `New number = old + n × increase = ${oldVal} + ${n}×${increase} = ${newVal}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// TIME & DISTANCE
// ═══════════════════════════════════════════════════════════
TEMPLATES["Time & Distance"] = [
  // 1. Basic speed/time/distance
  {
    id: "td_basic", difficulty: ["easy"],
    build() {
      const speed = pick([20, 30, 36, 40, 45, 50, 60, 72, 80]);
      const time = pick([2, 3, 4, 5, 6]);
      const dist = speed * time;
      const askWhat = pick(["distance", "speed", "time"]);
      if (askWhat === "distance") {
        return {
          question: `A car travels at ${speed} km/h for ${time} hours. What distance does it cover?`,
          correct: dist,
          distractors: [dist + speed, dist - speed, speed + time],
          explanation: `Distance = Speed × Time = ${speed} × ${time} = ${dist} km`
        };
      } else if (askWhat === "speed") {
        return {
          question: `A car covers ${dist} km in ${time} hours. What is its speed?`,
          correct: speed,
          distractors: [speed + 10, dist / (time + 1), speed - 5],
          explanation: `Speed = Distance/Time = ${dist}/${time} = ${speed} km/h`
        };
      } else {
        return {
          question: `A car travelling at ${speed} km/h covers a distance of ${dist} km. How many hours does it take?`,
          correct: time,
          distractors: [time + 1, time - 1, round2(dist / (speed + 10))],
          explanation: `Time = Distance/Speed = ${dist}/${speed} = ${time} hours`
        };
      }
    }
  },
  // 2. Train crossing a pole/person
  {
    id: "td_train_pole", difficulty: ["easy", "medium"],
    build() {
      const speed_kmh = pick([36, 45, 54, 72, 90, 108]);
      const speed_ms = round2(speed_kmh * 5 / 18);
      const time = pick([5, 8, 10, 12, 15, 18, 20]);
      const length = speed_ms * time;
      return {
        question: `A train running at ${speed_kmh} km/h crosses a pole in ${time} seconds. The length of the train (in metres) is:`,
        correct: length,
        distractors: [round2(speed_kmh * time), round2(length + 50), round2(speed_kmh * 5 / 18 * (time + 5))],
        explanation: `Speed = ${speed_kmh} × 5/18 = ${speed_ms} m/s. Length = ${speed_ms} × ${time} = ${length} m`
      };
    }
  },
  // 3. Train crossing a bridge/platform
  {
    id: "td_train_bridge", difficulty: ["medium"],
    build() {
      const speed_kmh = pick([36, 54, 72, 90]);
      const speed_ms = round2(speed_kmh * 5 / 18);
      const trainLen = rand(1, 5) * 100;
      const bridgeLen = rand(1, 5) * 100;
      const totalLen = trainLen + bridgeLen;
      const time = round2(totalLen / speed_ms);
      return {
        question: `A train ${trainLen} m long, running at ${speed_kmh} km/h, crosses a bridge ${bridgeLen} m long in how many seconds?`,
        correct: time,
        distractors: [round2(trainLen / speed_ms), round2(bridgeLen / speed_ms), round2(time + 5)],
        explanation: `Speed = ${speed_ms} m/s. Total distance = ${trainLen}+${bridgeLen} = ${totalLen} m. Time = ${totalLen}/${speed_ms} = ${time} sec`
      };
    }
  },
  // 4. Boat upstream/downstream
  {
    id: "td_boat", difficulty: ["medium", "hard"],
    build() {
      const boat = rand(5, 15);
      const stream = rand(1, boat - 1);
      const downstream = boat + stream;
      const upstream = boat - stream;
      const dist = lcm(downstream, upstream) * pick([1, 2]);
      const timeDown = round2(dist / downstream);
      const timeUp = round2(dist / upstream);
      return {
        question: `A boat can travel at ${boat} km/h in still water. The speed of the stream is ${stream} km/h. The time taken to travel ${dist} km downstream is:`,
        correct: timeDown,
        distractors: [timeUp, round2(dist / boat), round2(timeDown + 2)],
        explanation: `Downstream speed = ${boat}+${stream} = ${downstream} km/h. Time = ${dist}/${downstream} = ${timeDown} hours`
      };
    }
  },
  // 5. Relative speed — same direction
  {
    id: "td_relative_same", difficulty: ["medium"],
    build() {
      const s1 = rand(4, 10) * 10;
      const s2 = s1 + rand(1, 4) * 10;
      const dist = rand(5, 30) * 10;
      const relSpeed = s2 - s1;
      const time = round2(dist / relSpeed);
      return {
        question: `Two cars start from the same place. Car A travels at ${s1} km/h and Car B at ${s2} km/h in the same direction. In how many hours will they be ${dist} km apart?`,
        correct: time,
        distractors: [round2(dist / (s1 + s2)), round2(dist / s2), round2(time + 1)],
        explanation: `Relative speed = ${s2}−${s1} = ${relSpeed} km/h. Time = ${dist}/${relSpeed} = ${time} hours`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// TIME & WORK
// ═══════════════════════════════════════════════════════════
TEMPLATES["Time & Work"] = [
  // 1. A and B together
  {
    id: "tw_together", difficulty: ["easy"],
    build() {
      const a = pick([6, 8, 10, 12, 15, 18, 20, 24, 30]);
      let b = pick([6, 8, 10, 12, 15, 18, 20, 24, 30]);
      if (b === a) b = a + 6;
      const together = round2((a * b) / (a + b));
      return {
        question: `A can finish a work in ${a} days and B can finish it in ${b} days. Working together, they will finish the work in how many days?`,
        correct: together,
        distractors: [(a + b) / 2, Math.min(a, b), round2(together + 2)],
        explanation: `Together = (${a}×${b})/(${a}+${b}) = ${a * b}/${a + b} = ${together} days`
      };
    }
  },
  // 2. B leaves after working together
  {
    id: "tw_b_leaves", difficulty: ["medium"],
    build() {
      const a = pick([10, 12, 15, 18, 20, 24]);
      let b = pick([8, 10, 12, 15, 20]);
      if (b === a) b = a - 2;
      const togetherDays = rand(2, Math.min(a, b) - 2);
      const workDone = togetherDays * (1 / a + 1 / b);
      const remaining = 1 - workDone;
      if (remaining <= 0) return this.build();
      const aDays = round2(remaining * a);
      const total = round2(togetherDays + aDays);
      return {
        question: `A can do a work in ${a} days and B in ${b} days. They work together for ${togetherDays} days, then B leaves. In how many more days will A finish the remaining work?`,
        correct: aDays,
        distractors: [round2(total), round2(aDays + 2), round2(remaining * b)],
        explanation: `Work done in ${togetherDays} days = ${togetherDays}(1/${a}+1/${b}) = ${round2(workDone)}. Remaining = ${round2(remaining)}. A finishes in ${round2(remaining)}×${a} = ${aDays} days`
      };
    }
  },
  // 3. Pipe filling
  {
    id: "tw_pipe", difficulty: ["medium"],
    build() {
      const fill = pick([6, 8, 10, 12, 15, 18, 20]);
      const empty = fill + pick([4, 6, 8, 10, 12]);
      const net = round2((fill * empty) / (empty - fill));
      return {
        question: `A pipe can fill a tank in ${fill} hours and another pipe can empty it in ${empty} hours. If both are opened together, the tank will be filled in:`,
        correct: net,
        distractors: [round2((fill * empty) / (fill + empty)), fill, round2(net + 3)],
        explanation: `Net rate = 1/${fill} − 1/${empty} = (${empty}−${fill})/${fill * empty}. Time = ${fill}×${empty}/(${empty}−${fill}) = ${net} hours`
      };
    }
  },
  // 4. Efficiency ratio
  {
    id: "tw_efficiency", difficulty: ["medium", "hard"],
    build() {
      const effRatio = pick([2, 3]);
      const bDays = rand(3, 10) * effRatio;
      const aDays = bDays / effRatio;
      const together = round2((aDays * bDays) / (aDays + bDays));
      return {
        question: `A is ${effRatio} times as efficient as B. B alone can finish a work in ${bDays} days. A and B together can finish the work in:`,
        correct: together,
        distractors: [aDays, bDays / 2, round2(together + 3)],
        explanation: `A takes ${bDays}/${effRatio} = ${aDays} days. Together = (${aDays}×${bDays})/(${aDays}+${bDays}) = ${together} days`
      };
    }
  },
  // 5. Wages proportional to work
  {
    id: "tw_wages", difficulty: ["medium"],
    build() {
      const a = pick([10, 12, 15, 18, 20]);
      const b = pick([12, 15, 18, 20, 24, 30]);
      if (b === a) return this.build();
      const totalWage = rand(2, 10) * 1000;
      const wageA = Math.round(totalWage * b / (a + b));
      const wageB = totalWage - wageA;
      return {
        question: `A can do a work in ${a} days, B in ${b} days. Together they earn ${formatRupee(totalWage)}. A's share is:`,
        correct: wageA,
        distractors: [wageB, totalWage / 2, round2(totalWage * a / (a + b))],
        explanation: `A's efficiency : B's = 1/${a} : 1/${b} = ${b}:${a}. A's share = ${totalWage}×${b}/${a + b} = ${formatRupee(wageA)}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// AGES
// ═══════════════════════════════════════════════════════════
TEMPLATES["Ages"] = [
  // 1. Present ages from ratio and difference
  {
    id: "age_ratio_diff", difficulty: ["easy", "medium"],
    build() {
      const a = rand(2, 7), b = rand(1, a - 1);
      const diff = (a - b) * rand(2, 5);
      const unit = diff / (a - b);
      const ageA = a * unit, ageB = b * unit;
      return {
        question: `The ratio of present ages of A and B is ${a}:${b}. If the difference between their ages is ${diff} years, find A's present age.`,
        correct: ageA,
        distractors: [ageB, ageA + unit, diff * a / (a + b)],
        explanation: `Let ages be ${a}k and ${b}k. Difference = ${a - b}k = ${diff}, so k = ${unit}. A's age = ${a}×${unit} = ${ageA}`
      };
    }
  },
  // 2. Father and son
  {
    id: "age_father_son", difficulty: ["medium"],
    build() {
      const sonAge = rand(5, 15);
      const fatherAge = sonAge + rand(20, 30);
      const years = rand(3, 10);
      const futureRatio_n = fatherAge + years;
      const futureRatio_d = sonAge + years;
      const g = gcd(futureRatio_n, futureRatio_d);
      return {
        question: `A father is ${fatherAge} years old and his son is ${sonAge} years old. After how many years will the father's age be twice the son's age?`,
        correct: fatherAge - 2 * sonAge,
        distractors: [fatherAge - sonAge, round2((fatherAge - 2 * sonAge) + 3), sonAge],
        explanation: `After x years: ${fatherAge}+x = 2(${sonAge}+x). ${fatherAge}+x = ${2 * sonAge}+2x. x = ${fatherAge - 2 * sonAge} years`
      };
    }
  },
  // 3. Sum of ages
  {
    id: "age_sum", difficulty: ["easy"],
    build() {
      const a = rand(20, 50), b = rand(10, 40);
      const sum = a + b;
      const years = rand(3, 8);
      const futureSum = sum + 2 * years;
      return {
        question: `The sum of present ages of A and B is ${sum} years. What will be the sum of their ages after ${years} years?`,
        correct: futureSum,
        distractors: [sum + years, futureSum + years, sum * 2],
        explanation: `After ${years} years, each person's age increases by ${years}. New sum = ${sum} + 2×${years} = ${futureSum}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// NUMBER SYSTEM
// ═══════════════════════════════════════════════════════════
TEMPLATES["Number System"] = [
  // 1. Remainder
  {
    id: "ns_remainder", difficulty: ["easy", "medium"],
    build() {
      const divisor = pick([7, 9, 11, 13, 17, 19]);
      const quotient = rand(10, 50);
      const remainder = rand(1, divisor - 1);
      const number = divisor * quotient + remainder;
      return {
        question: `When ${number} is divided by ${divisor}, the remainder is:`,
        correct: remainder,
        distractors: [divisor - remainder, remainder + 1, remainder - 1 < 0 ? remainder + 2 : remainder - 1],
        explanation: `${number} = ${divisor} × ${quotient} + ${remainder}. Remainder = ${remainder}`
      };
    }
  },
  // 2. HCF
  {
    id: "ns_hcf", difficulty: ["easy"],
    build() {
      const g = rand(3, 15);
      const a = g * rand(2, 8);
      const b = g * rand(2, 8);
      if (a === b) return this.build();
      const h = gcd(a, b);
      return {
        question: `What is the HCF of ${a} and ${b}?`,
        correct: h,
        distractors: [lcm(a, b), h * 2, h + rand(1, 5)],
        explanation: `HCF(${a}, ${b}) = ${h}`
      };
    }
  },
  // 3. LCM
  {
    id: "ns_lcm", difficulty: ["easy", "medium"],
    build() {
      const a = rand(2, 12) * rand(2, 5);
      const b = rand(2, 12) * rand(2, 5);
      if (a === b) return this.build();
      const l = lcm(a, b);
      return {
        question: `What is the LCM of ${a} and ${b}?`,
        correct: l,
        distractors: [a * b, gcd(a, b), l + rand(1, 10)],
        explanation: `LCM(${a}, ${b}) = ${l}`
      };
    }
  },
  // 4. Sum of digits
  {
    id: "ns_divisibility", difficulty: ["medium"],
    build() {
      const n = rand(100, 999);
      const digitSum = String(n).split("").reduce((s, d) => s + Number(d), 0);
      return {
        question: `What is the sum of the digits of the number ${n}?`,
        correct: digitSum,
        distractors: [digitSum + 1, digitSum - 1, digitSum + 3],
        explanation: `${String(n).split("").join(" + ")} = ${digitSum}`
      };
    }
  },
  // 5. Product of HCF and LCM
  {
    id: "ns_hcf_lcm_product", difficulty: ["medium"],
    build() {
      const a = rand(4, 20) * 2;
      const b = rand(4, 20) * 3;
      const product = a * b;
      const h = gcd(a, b);
      const l = lcm(a, b);
      return {
        question: `The product of HCF and LCM of two numbers ${a} and ${b} is:`,
        correct: product,
        distractors: [h * h, l * l, h + l],
        explanation: `HCF × LCM = product of numbers = ${a} × ${b} = ${product}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// MENSURATION
// ═══════════════════════════════════════════════════════════
TEMPLATES["Mensuration"] = [
  // 1. Area of rectangle
  {
    id: "mens_rect_area", difficulty: ["easy"],
    build() {
      const l = rand(5, 30);
      const b = rand(3, 20);
      const area = l * b;
      return {
        question: `The length and breadth of a rectangle are ${l} cm and ${b} cm respectively. Its area (in cm²) is:`,
        correct: area,
        distractors: [2 * (l + b), l * l, b * b],
        explanation: `Area = l × b = ${l} × ${b} = ${area} cm²`
      };
    }
  },
  // 2. Area of circle
  {
    id: "mens_circle_area", difficulty: ["easy", "medium"],
    build() {
      const r = pick([7, 14, 21, 35]);
      const area = round2(22 / 7 * r * r);
      return {
        question: `The radius of a circle is ${r} cm. Find its area. (Use π = 22/7)`,
        correct: area,
        distractors: [round2(2 * 22 / 7 * r), round2(22 / 7 * r), round2(area + 100)],
        explanation: `Area = πr² = (22/7) × ${r}² = ${area} cm²`
      };
    }
  },
  // 3. Volume of cylinder
  {
    id: "mens_cylinder_vol", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 3.5]);
      const h = rand(5, 20);
      const vol = round2(22 / 7 * r * r * h);
      return {
        question: `A cylinder has radius ${r} cm and height ${h} cm. Its volume (in cm³) is: (Use π = 22/7)`,
        correct: vol,
        distractors: [round2(22 / 7 * r * r), round2(2 * 22 / 7 * r * h), round2(vol + 100)],
        explanation: `Volume = πr²h = (22/7) × ${r}² × ${h} = ${vol} cm³`
      };
    }
  },
  // 4. Surface area of sphere
  {
    id: "mens_sphere_sa", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 3.5, 21]);
      const sa = round2(4 * 22 / 7 * r * r);
      return {
        question: `Find the total surface area of a sphere with radius ${r} cm. (Use π = 22/7)`,
        correct: sa,
        distractors: [round2(22 / 7 * r * r), round2(4 / 3 * 22 / 7 * r * r * r), round2(2 * 22 / 7 * r * r)],
        explanation: `SA = 4πr² = 4 × (22/7) × ${r}² = ${sa} cm²`
      };
    }
  },
  // 5. Perimeter of triangle
  {
    id: "mens_tri_perimeter", difficulty: ["easy"],
    build() {
      const a = rand(5, 15), b = rand(5, 15), c = rand(Math.abs(a - b) + 1, a + b - 1);
      const peri = a + b + c;
      return {
        question: `A triangle has sides ${a} cm, ${b} cm and ${c} cm. Its perimeter (in cm) is:`,
        correct: peri,
        distractors: [peri + 2, peri - 2, round2(a * b / 2)],
        explanation: `Perimeter = ${a} + ${b} + ${c} = ${peri} cm`
      };
    }
  },
  // 6. Volume of cube
  {
    id: "mens_cube_vol", difficulty: ["easy"],
    build() {
      const s = rand(3, 12);
      const vol = s * s * s;
      return {
        question: `The side of a cube is ${s} cm. Its volume (in cm³) is:`,
        correct: vol,
        distractors: [6 * s * s, s * s, vol + s * s],
        explanation: `Volume = s³ = ${s}³ = ${vol} cm³`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// ALGEBRA
// ═══════════════════════════════════════════════════════════
TEMPLATES["Algebra"] = [
  // 1. a² + b² from a+b and ab
  {
    id: "alg_sum_product", difficulty: ["medium"],
    build() {
      const a = rand(2, 10), b = rand(2, 10);
      const sum = a + b, prod = a * b;
      const sumSq = sum * sum - 2 * prod;
      return {
        question: `If a + b = ${sum} and ab = ${prod}, then a² + b² is equal to:`,
        correct: sumSq,
        distractors: [sum * sum, 2 * prod, sumSq + prod],
        explanation: `a² + b² = (a+b)² − 2ab = ${sum}² − 2×${prod} = ${sum * sum} − ${2 * prod} = ${sumSq}`
      };
    }
  },
  // 2. (a-b)² from a+b and ab
  {
    id: "alg_diff_sq", difficulty: ["medium"],
    build() {
      const a = rand(3, 12), b = rand(1, a - 1);
      const sum = a + b, prod = a * b;
      const diffSq = sum * sum - 4 * prod;
      return {
        question: `If a + b = ${sum} and ab = ${prod}, then (a − b)² is equal to:`,
        correct: diffSq,
        distractors: [sum * sum, Math.abs(a - b), diffSq + 4],
        explanation: `(a−b)² = (a+b)² − 4ab = ${sum * sum} − ${4 * prod} = ${diffSq}`
      };
    }
  },
  // 3. x + 1/x from x² + 1/x²
  {
    id: "alg_reciprocal", difficulty: ["medium", "hard"],
    build() {
      const val = rand(3, 8);
      const xPlusInv = val;
      const x2PlusInv2 = val * val - 2;
      return {
        question: `If x + 1/x = ${val}, then x² + 1/x² is equal to:`,
        correct: x2PlusInv2,
        distractors: [val * val, x2PlusInv2 + 2, x2PlusInv2 - 1],
        explanation: `x² + 1/x² = (x + 1/x)² − 2 = ${val}² − 2 = ${val * val} − 2 = ${x2PlusInv2}`
      };
    }
  },
  // 4. a³ + b³
  {
    id: "alg_cube_sum", difficulty: ["hard"],
    build() {
      const a = rand(2, 6), b = rand(1, 5);
      const sum = a + b, prod = a * b;
      const cubeSum = a * a * a + b * b * b;
      return {
        question: `If a + b = ${sum} and ab = ${prod}, then a³ + b³ is equal to:`,
        correct: cubeSum,
        distractors: [sum * sum * sum, cubeSum + prod, 3 * sum * prod],
        explanation: `a³+b³ = (a+b)³ − 3ab(a+b) = ${sum}³ − 3×${prod}×${sum} = ${sum * sum * sum} − ${3 * prod * sum} = ${cubeSum}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// GEOMETRY (basic computational)
// ═══════════════════════════════════════════════════════════
TEMPLATES["Geometry"] = [
  // 1. Third angle of triangle
  {
    id: "geo_third_angle", difficulty: ["easy"],
    build() {
      const a = rand(30, 80);
      const b = rand(20, 180 - a - 10);
      const c = 180 - a - b;
      return {
        question: `In a triangle, two angles are ${a}° and ${b}°. The third angle is:`,
        correct: c,
        distractors: [180 - a, 180 - b, a + b],
        explanation: `Third angle = 180° − ${a}° − ${b}° = ${c}°`
      };
    }
  },
  // 2. Pythagorean triplet
  {
    id: "geo_pythagoras", difficulty: ["medium"],
    build() {
      const triplets = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]];
      const [a, b, c] = pick(triplets);
      const mult = pick([1, 2, 3]);
      const A = a * mult, B = b * mult, C = c * mult;
      return {
        question: `In a right-angled triangle, the two shorter sides are ${A} cm and ${B} cm. The length of the hypotenuse (in cm) is:`,
        correct: C,
        distractors: [A + B, round2(Math.sqrt(A + B)), C + mult],
        explanation: `Hypotenuse = √(${A}² + ${B}²) = √(${A * A} + ${B * B}) = √${A * A + B * B} = ${C} cm`
      };
    }
  },
  // 3. Exterior angle theorem
  {
    id: "geo_exterior", difficulty: ["easy", "medium"],
    build() {
      const a = rand(35, 75);
      const b = rand(30, 70);
      const ext = a + b;
      return {
        question: `In a triangle, two interior angles are ${a}° and ${b}°. The exterior angle opposite to the third angle is:`,
        correct: ext,
        distractors: [180 - ext, 180 - a, 180 - b],
        explanation: `Exterior angle = sum of non-adjacent interior angles = ${a}° + ${b}° = ${ext}°`
      };
    }
  },
  // 4. Circumference of circle
  {
    id: "geo_circumference", difficulty: ["easy"],
    build() {
      const r = pick([7, 14, 21, 35, 42]);
      const c = round2(2 * 22 / 7 * r);
      return {
        question: `The radius of a circle is ${r} cm. Its circumference (in cm) is: (Use π = 22/7)`,
        correct: c,
        distractors: [round2(22 / 7 * r * r), round2(c / 2), round2(c + 10)],
        explanation: `Circumference = 2πr = 2 × 22/7 × ${r} = ${c} cm`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// SIMPLIFICATION
// ═══════════════════════════════════════════════════════════
TEMPLATES["Simplification"] = [
  // 1. BODMAS
  {
    id: "simp_bodmas", difficulty: ["easy"],
    build() {
      const a = rand(10, 50), b = rand(2, 10), c = rand(2, 10), d = rand(1, 5);
      const ans = a + b * c - d;
      return {
        question: `Simplify: ${a} + ${b} × ${c} − ${d} = ?`,
        correct: ans,
        distractors: [(a + b) * c - d, a + b * (c - d), round2(ans + 5)],
        explanation: `= ${a} + ${b * c} − ${d} = ${ans} (multiplication first by BODMAS)`
      };
    }
  },
  // 2. Fraction simplification
  {
    id: "simp_fraction", difficulty: ["easy", "medium"],
    build() {
      const a = rand(1, 9), b = rand(2, 9);
      const c = rand(1, 9), d = rand(2, 9);
      const num = a * d + c * b;
      const den = b * d;
      const g = gcd(num, den);
      const resultN = num / g, resultD = den / g;
      const ans = round2(num / den);
      return {
        question: `What is ${a}/${b} + ${c}/${d}?`,
        correct: ans,
        distractors: [round2((a + c) / (b + d)), round2((a * c) / (b * d)), round2(ans + 0.5)],
        explanation: `${a}/${b} + ${c}/${d} = (${a}×${d} + ${c}×${b})/(${b}×${d}) = ${num}/${den} = ${resultN}/${resultD} = ${ans}`
      };
    }
  },
  // 3. Square and square root
  {
    id: "simp_square", difficulty: ["easy"],
    build() {
      const n = rand(11, 30);
      const sq = n * n;
      return {
        question: `What is the value of ${n}²?`,
        correct: sq,
        distractors: [sq + n, sq - n, (n + 1) * (n + 1)],
        explanation: `${n}² = ${n} × ${n} = ${sq}`
      };
    }
  },
  // 4. Square root
  {
    id: "simp_sqrt", difficulty: ["easy"],
    build() {
      const root = rand(4, 25);
      const sq = root * root;
      return {
        question: `What is the square root of ${sq}?`,
        correct: root,
        distractors: [root + 1, root - 1, root + 2],
        explanation: `√${sq} = ${root}`
      };
    }
  },
  // 5. Cube root
  {
    id: "simp_cbrt", difficulty: ["medium"],
    build() {
      const root = rand(2, 12);
      const cube = root * root * root;
      return {
        question: `What is the cube root of ${cube}?`,
        correct: root,
        distractors: [root + 1, root - 1, root * root],
        explanation: `∛${cube} = ${root}`
      };
    }
  },
  // 6. Decimal to fraction
  {
    id: "simp_decimal_frac", difficulty: ["easy"],
    build() {
      const nums = [
        { dec: "0.25", ans: "1/4" }, { dec: "0.5", ans: "1/2" }, { dec: "0.75", ans: "3/4" },
        { dec: "0.125", ans: "1/8" }, { dec: "0.375", ans: "3/8" }, { dec: "0.625", ans: "5/8" },
        { dec: "0.2", ans: "1/5" }, { dec: "0.4", ans: "2/5" }, { dec: "0.6", ans: "3/5" },
        { dec: "0.8", ans: "4/5" }, { dec: "0.125", ans: "1/8" }, { dec: "0.875", ans: "7/8" }
      ];
      const { dec, ans } = pick(nums);
      const wrong = ["1/3", "2/7", "3/11", "5/9", "4/7", "2/3", "7/9"];
      return {
        question: `Convert ${dec} to a fraction in its simplest form.`,
        correct: ans,
        distractors: shuffle(wrong.filter(w => w !== ans)).slice(0, 3),
        explanation: `${dec} = ${ans}`,
        isString: true
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// MIXTURE & ALLIGATION
// ═══════════════════════════════════════════════════════════
TEMPLATES["Mixture & Alligation"] = [
  // 1. Basic mixture - two quantities at different prices
  {
    id: "mix_basic", difficulty: ["easy", "medium"],
    build() {
      const p1 = rand(3, 15) * 10;
      const p2 = p1 + rand(2, 8) * 10;
      const mean = p1 + rand(1, (p2 - p1) / 10) * 10;
      const ratio1 = p2 - mean;
      const ratio2 = mean - p1;
      const g = gcd(ratio1, ratio2);
      return {
        question: `In what ratio must rice at ₹${p1}/kg be mixed with rice at ₹${p2}/kg so that the mixture costs ₹${mean}/kg?`,
        correct: `${ratio1 / g}:${ratio2 / g}`,
        distractors: [`${ratio2 / g}:${ratio1 / g}`, `${p1}:${p2}`, `1:${Math.max(2, Math.round(ratio2 / ratio1))}`],
        explanation: `By alligation: cheaper : dearer = (${p2}−${mean}) : (${mean}−${p1}) = ${ratio1}:${ratio2} = ${ratio1 / g}:${ratio2 / g}`,
        isString: true
      };
    }
  },
  // 2. Water added to milk
  {
    id: "mix_water_milk", difficulty: ["medium"],
    build() {
      const milk = rand(20, 60);
      const water = rand(5, 20);
      const total = milk + water;
      const pctMilk = round2((milk / total) * 100);
      return {
        question: `${milk} litres of milk is mixed with ${water} litres of water. The percentage of milk in the mixture is:`,
        correct: pctMilk,
        distractors: [round2(100 - pctMilk), round2(milk / water * 100), round2(pctMilk + 5)],
        explanation: `% of milk = ${milk}/${total} × 100 = ${pctMilk}%`
      };
    }
  },
  // 3. Replacement problem
  {
    id: "mix_replace", difficulty: ["medium", "hard"],
    build() {
      const total = pick([20, 30, 40, 50, 60]);
      const removed = pick([5, 10, 15]);
      const times = pick([2, 3]);
      const remaining = round2(total * Math.pow((total - removed) / total, times));
      return {
        question: `A container has ${total} litres of milk. ${removed} litres is drawn out and replaced with water. This is done ${times} times. How much milk is left?`,
        correct: remaining,
        distractors: [total - removed * times, round2(remaining + 3), round2(total * (total - removed) / total)],
        explanation: `Milk left = ${total} × (${total - removed}/${total})^${times} = ${total} × ${round2(Math.pow((total - removed) / total, times))} = ${remaining} litres`
      };
    }
  },
  // 4. Mixture ratio
  {
    id: "mix_ratio", difficulty: ["medium"],
    build() {
      const a = rand(2, 8), b = rand(1, 5);
      const totalMix = (a + b) * rand(3, 10);
      const qtyA = (a / (a + b)) * totalMix;
      const qtyB = totalMix - qtyA;
      return {
        question: `A mixture of milk and water is in the ratio ${a}:${b}. If the total mixture is ${totalMix} litres, how much milk is in it?`,
        correct: qtyA,
        distractors: [qtyB, totalMix / 2, round2(qtyA + b)],
        explanation: `Milk = ${totalMix} × ${a}/${a + b} = ${qtyA} litres`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// PARTNERSHIP
// ═══════════════════════════════════════════════════════════
TEMPLATES["Partnership"] = [
  // 1. Simple partnership (same time)
  {
    id: "part_simple", difficulty: ["easy", "medium"],
    build() {
      const invA = rand(2, 10) * 1000;
      const invB = rand(2, 10) * 1000;
      const profit = rand(5, 30) * 1000;
      const shareA = Math.round(profit * invA / (invA + invB));
      const shareB = profit - shareA;
      return {
        question: `A invests ${formatRupee(invA)} and B invests ${formatRupee(invB)} in a business. The total profit is ${formatRupee(profit)}. A's share of profit is:`,
        correct: shareA,
        distractors: [shareB, profit / 2, round2(profit * invB / (invA + invB))],
        explanation: `Ratio = ${invA}:${invB}. A's share = ${profit} × ${invA}/${invA + invB} = ${formatRupee(shareA)}`
      };
    }
  },
  // 2. Compound partnership (different times)
  {
    id: "part_compound", difficulty: ["medium", "hard"],
    build() {
      const invA = rand(2, 8) * 1000;
      const invB = rand(2, 8) * 1000;
      const monthsA = rand(6, 12);
      const monthsB = rand(4, 12);
      const capA = invA * monthsA;
      const capB = invB * monthsB;
      const profit = rand(5, 20) * 1000;
      const shareA = Math.round(profit * capA / (capA + capB));
      const shareB = profit - shareA;
      return {
        question: `A invests ${formatRupee(invA)} for ${monthsA} months and B invests ${formatRupee(invB)} for ${monthsB} months. If total profit is ${formatRupee(profit)}, A's share is:`,
        correct: shareA,
        distractors: [shareB, Math.round(profit * invA / (invA + invB)), round2(shareA + 500)],
        explanation: `Capital ratio = ${invA}×${monthsA} : ${invB}×${monthsB} = ${capA}:${capB}. A's share = ${profit}×${capA}/${capA + capB} = ${formatRupee(shareA)}`
      };
    }
  },
  // 3. Three-partner
  {
    id: "part_three", difficulty: ["medium"],
    build() {
      const invA = rand(2, 6) * 1000;
      const invB = rand(2, 6) * 1000;
      const invC = rand(2, 6) * 1000;
      const total = invA + invB + invC;
      const profit = total * rand(1, 3);
      const shareA = Math.round(profit * invA / total);
      return {
        question: `A, B, and C invest ${formatRupee(invA)}, ${formatRupee(invB)}, and ${formatRupee(invC)} respectively. From a profit of ${formatRupee(profit)}, A's share is:`,
        correct: shareA,
        distractors: [Math.round(profit * invB / total), Math.round(profit / 3), round2(shareA + 200)],
        explanation: `Ratio = ${invA}:${invB}:${invC}. A's share = ${profit} × ${invA}/${total} = ${formatRupee(shareA)}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// TRIGONOMETRY
// ═══════════════════════════════════════════════════════════
TEMPLATES["Trigonometry"] = [
  // 1. Standard trigonometric values
  {
    id: "trig_values", difficulty: ["easy"],
    build() {
      const table = [
        { fn: "sin", angle: 0, val: "0" }, { fn: "sin", angle: 30, val: "1/2" },
        { fn: "sin", angle: 45, val: "1/√2" }, { fn: "sin", angle: 60, val: "√3/2" },
        { fn: "sin", angle: 90, val: "1" },
        { fn: "cos", angle: 0, val: "1" }, { fn: "cos", angle: 30, val: "√3/2" },
        { fn: "cos", angle: 45, val: "1/√2" }, { fn: "cos", angle: 60, val: "1/2" },
        { fn: "cos", angle: 90, val: "0" },
        { fn: "tan", angle: 0, val: "0" }, { fn: "tan", angle: 30, val: "1/√3" },
        { fn: "tan", angle: 45, val: "1" }, { fn: "tan", angle: 60, val: "√3" }
      ];
      const entry = pick(table);
      const allVals = ["0", "1/2", "1/√2", "√3/2", "1", "1/√3", "√3", "2"];
      const wrongs = shuffle(allVals.filter(v => v !== entry.val)).slice(0, 3);
      return {
        question: `What is the value of ${entry.fn}(${entry.angle}°)?`,
        correct: entry.val,
        distractors: wrongs,
        explanation: `${entry.fn}(${entry.angle}°) = ${entry.val}`,
        isString: true
      };
    }
  },
  // 2. Complementary angles
  {
    id: "trig_complementary", difficulty: ["easy", "medium"],
    build() {
      const angle = pick([20, 25, 30, 35, 40, 50, 55, 60, 65, 70]);
      const comp = 90 - angle;
      const fnPairs = [["sin", "cos"], ["cos", "sin"], ["tan", "cot"], ["cot", "tan"], ["sec", "cosec"], ["cosec", "sec"]];
      const [fn1, fn2] = pick(fnPairs);
      return {
        question: `${fn1}(${angle}°) is equal to:`,
        correct: `${fn2}(${comp}°)`,
        distractors: [`${fn1}(${comp}°)`, `${fn2}(${angle}°)`, `${fn1}(${90 + angle}°)`],
        explanation: `${fn1}(${angle}°) = ${fn2}(90°−${angle}°) = ${fn2}(${comp}°)`,
        isString: true
      };
    }
  },
  // 3. sin²θ + cos²θ = 1 identity
  {
    id: "trig_identity1", difficulty: ["medium"],
    build() {
      const sinVal = pick([0.3, 0.4, 0.5, 0.6, 0.8]);
      const cosVal = round2(Math.sqrt(1 - sinVal * sinVal));
      return {
        question: `If sin θ = ${sinVal}, then cos θ is (θ is acute):`,
        correct: cosVal,
        distractors: [round2(1 - sinVal), sinVal, round2(cosVal + 0.1)],
        explanation: `cos θ = √(1 − sin²θ) = √(1 − ${round2(sinVal * sinVal)}) = √${round2(1 - sinVal * sinVal)} = ${cosVal}`
      };
    }
  },
  // 4. Height and distance
  {
    id: "trig_height", difficulty: ["medium", "hard"],
    build() {
      const scenarios = [
        { angle: 30, tanVal: round2(1 / Math.sqrt(3)), dist: rand(5, 30) * Math.round(Math.sqrt(3)) },
        { angle: 45, tanVal: 1, dist: rand(10, 50) },
        { angle: 60, tanVal: round2(Math.sqrt(3)), dist: rand(5, 20) }
      ];
      const s = pick(scenarios);
      const height = round2(s.dist * s.tanVal);
      return {
        question: `From a point ${s.dist} m away from the base of a tower, the angle of elevation of the top is ${s.angle}°. The height of the tower is:`,
        correct: height,
        distractors: [round2(s.dist / s.tanVal), round2(height + 5), s.dist],
        explanation: `tan(${s.angle}°) = height/${s.dist}. Height = ${s.dist} × tan(${s.angle}°) = ${s.dist} × ${s.tanVal} = ${height} m`
      };
    }
  },
  // 5. sec²θ − tan²θ = 1
  {
    id: "trig_identity2", difficulty: ["medium"],
    build() {
      const tanVal = pick([3, 4, 5, 7, 12]);
      const secSq = tanVal * tanVal + 1;
      return {
        question: `If tan θ = ${tanVal}/1, then sec²θ is:`,
        correct: secSq,
        distractors: [tanVal * tanVal, secSq + 1, tanVal + 1],
        explanation: `sec²θ = 1 + tan²θ = 1 + ${tanVal * tanVal} = ${secSq}`
      };
    }
  },
  // 6. Numerical identity evaluation
  {
    id: "trig_eval", difficulty: ["medium"],
    build() {
      const exprs = [
        { q: "sin²30° + cos²30°", ans: 1 },
        { q: "2sin30° × cos30°", ans: round2(2 * 0.5 * (Math.sqrt(3) / 2)) },
        { q: "tan45° + cot45°", ans: 2 },
        { q: "sin60° × cos30° + cos60° × sin30°", ans: 1 },
        { q: "cos²45° − sin²45°", ans: 0 },
        { q: "1 + tan²45°", ans: 2 }
      ];
      const e = pick(exprs);
      return {
        question: `What is the value of ${e.q}?`,
        correct: e.ans,
        distractors: [round2(e.ans + 1), round2(e.ans + 0.5), round2(Math.abs(e.ans - 1))],
        explanation: `${e.q} = ${e.ans}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// STATISTICS (Mean, Median, Mode)
// ═══════════════════════════════════════════════════════════
TEMPLATES["Statistics"] = [
  // 1. Mean of numbers
  {
    id: "stat_mean", difficulty: ["easy"],
    build() {
      const n = pick([5, 6, 7, 8]);
      const nums = Array.from({ length: n }, () => rand(5, 50));
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = round2(sum / n);
      return {
        question: `Find the mean of: ${nums.join(", ")}`,
        correct: mean,
        distractors: [sum, round2(mean + 2), round2(mean - 2)],
        explanation: `Mean = (${nums.join("+")})/${n} = ${sum}/${n} = ${mean}`
      };
    }
  },
  // 2. Median (odd count)
  {
    id: "stat_median_odd", difficulty: ["easy", "medium"],
    build() {
      const n = pick([5, 7, 9]);
      const nums = Array.from({ length: n }, () => rand(5, 50));
      const sorted = [...nums].sort((a, b) => a - b);
      const median = sorted[Math.floor(n / 2)];
      return {
        question: `Find the median of: ${nums.join(", ")}`,
        correct: median,
        distractors: [sorted[0], sorted[n - 1], round2(nums.reduce((a, b) => a + b, 0) / n)],
        explanation: `Sorted: ${sorted.join(", ")}. Middle value = ${median}`
      };
    }
  },
  // 3. Median (even count)
  {
    id: "stat_median_even", difficulty: ["medium"],
    build() {
      const n = pick([6, 8]);
      const nums = Array.from({ length: n }, () => rand(5, 50));
      const sorted = [...nums].sort((a, b) => a - b);
      const median = round2((sorted[n / 2 - 1] + sorted[n / 2]) / 2);
      return {
        question: `Find the median of: ${nums.join(", ")}`,
        correct: median,
        distractors: [sorted[n / 2], sorted[n / 2 - 1], round2(nums.reduce((a, b) => a + b, 0) / n)],
        explanation: `Sorted: ${sorted.join(", ")}. Median = (${sorted[n / 2 - 1]}+${sorted[n / 2]})/2 = ${median}`
      };
    }
  },
  // 4. Mode
  {
    id: "stat_mode", difficulty: ["easy"],
    build() {
      const base = rand(5, 40);
      const mode = base + rand(0, 10);
      const nums = [base, base + 2, mode, base + 5, mode, base + 7, mode, base + 3];
      const display = shuffle(nums);
      return {
        question: `Find the mode of: ${display.join(", ")}`,
        correct: mode,
        distractors: [base, base + 5, round2(nums.reduce((a, b) => a + b, 0) / nums.length)],
        explanation: `${mode} appears 3 times (most frequent). Mode = ${mode}`
      };
    }
  },
  // 5. Range
  {
    id: "stat_range", difficulty: ["easy"],
    build() {
      const nums = Array.from({ length: rand(5, 8) }, () => rand(3, 60));
      const max = Math.max(...nums);
      const min = Math.min(...nums);
      const range = max - min;
      return {
        question: `Find the range of: ${nums.join(", ")}`,
        correct: range,
        distractors: [max, min, round2((max + min) / 2)],
        explanation: `Range = Max − Min = ${max} − ${min} = ${range}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// PROBABILITY
// ═══════════════════════════════════════════════════════════
TEMPLATES["Probability"] = [
  // 1. Coin toss
  {
    id: "prob_coin", difficulty: ["easy"],
    build() {
      const outcomes = [
        { event: "getting a head", p: "1/2" },
        { event: "getting a tail", p: "1/2" },
        { event: "getting head or tail", p: "1" }
      ];
      const e = pick(outcomes);
      return {
        question: `A fair coin is tossed. What is the probability of ${e.event}?`,
        correct: e.p,
        distractors: ["1/4", "1/3", "3/4"].filter(d => d !== e.p).slice(0, 3),
        explanation: `P(${e.event}) = ${e.p}`,
        isString: true
      };
    }
  },
  // 2. Dice
  {
    id: "prob_dice", difficulty: ["easy", "medium"],
    build() {
      const events = [
        { event: "getting a number greater than 4", favorable: 2, p: "1/3" },
        { event: "getting an even number", favorable: 3, p: "1/2" },
        { event: "getting an odd number", favorable: 3, p: "1/2" },
        { event: "getting a prime number", favorable: 3, p: "1/2" },
        { event: "getting a number less than 3", favorable: 2, p: "1/3" },
        { event: "getting the number 6", favorable: 1, p: "1/6" }
      ];
      const e = pick(events);
      return {
        question: `A fair die is rolled. What is the probability of ${e.event}?`,
        correct: e.p,
        distractors: ["1/6", "1/3", "1/2", "2/3", "5/6"].filter(d => d !== e.p).slice(0, 3),
        explanation: `Favorable outcomes = ${e.favorable}, Total = 6. P = ${e.favorable}/6 = ${e.p}`,
        isString: true
      };
    }
  },
  // 3. Cards
  {
    id: "prob_cards", difficulty: ["medium"],
    build() {
      const events = [
        { event: "drawing a king", favorable: 4, p: "1/13" },
        { event: "drawing a heart", favorable: 13, p: "1/4" },
        { event: "drawing a red card", favorable: 26, p: "1/2" },
        { event: "drawing an ace", favorable: 4, p: "1/13" },
        { event: "drawing a face card", favorable: 12, p: "3/13" },
        { event: "drawing a black king", favorable: 2, p: "1/26" }
      ];
      const e = pick(events);
      return {
        question: `From a well-shuffled deck of 52 cards, one card is drawn. The probability of ${e.event} is:`,
        correct: e.p,
        distractors: ["1/4", "1/13", "1/52", "1/26", "3/13", "1/2"].filter(d => d !== e.p).slice(0, 3),
        explanation: `Favorable = ${e.favorable}, Total = 52. P = ${e.favorable}/52 = ${e.p}`,
        isString: true
      };
    }
  },
  // 4. Balls from bag
  {
    id: "prob_balls", difficulty: ["medium"],
    build() {
      const red = rand(2, 8), blue = rand(2, 8), green = rand(1, 5);
      const total = red + blue + green;
      const askColor = pick(["red", "blue", "green"]);
      const favorable = askColor === "red" ? red : askColor === "blue" ? blue : green;
      const g = gcd(favorable, total);
      return {
        question: `A bag contains ${red} red, ${blue} blue, and ${green} green balls. If one ball is drawn at random, the probability that it is ${askColor} is:`,
        correct: `${favorable / g}/${total / g}`,
        distractors: [`${favorable}/${total + 1}`, `${total - favorable}/${total}`, `1/${total}`].slice(0, 3),
        explanation: `P(${askColor}) = ${favorable}/${total} = ${favorable / g}/${total / g}`,
        isString: true
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// LINEAR EQUATIONS (Word Problems)
// ═══════════════════════════════════════════════════════════
TEMPLATES["Linear Equations"] = [
  // 1. Sum & difference of two numbers
  {
    id: "leq_sum_diff", difficulty: ["easy", "medium"],
    build() {
      const x = rand(10, 50), y = rand(5, x - 1);
      const sum = x + y, diff = x - y;
      return {
        question: `The sum of two numbers is ${sum} and their difference is ${diff}. The larger number is:`,
        correct: x,
        distractors: [y, sum / 2, x + 1],
        explanation: `Larger = (${sum} + ${diff})/2 = ${sum + diff}/2 = ${x}`
      };
    }
  },
  // 2. Two equations
  {
    id: "leq_two_var", difficulty: ["medium"],
    build() {
      const x = rand(2, 15), y = rand(2, 15);
      const a1 = rand(1, 5), b1 = rand(1, 5);
      const c1 = a1 * x + b1 * y;
      const a2 = rand(1, 5), b2 = rand(1, 5);
      const c2 = a2 * x + b2 * y;
      if (a1 * b2 === a2 * b1) return this.build();
      return {
        question: `If ${a1}x + ${b1}y = ${c1} and ${a2}x + ${b2}y = ${c2}, find the value of x.`,
        correct: x,
        distractors: [y, x + y, Math.abs(x - y)],
        explanation: `Solving: x = ${x}, y = ${y}`
      };
    }
  },
  // 3. Age-type word problem
  {
    id: "leq_age_word", difficulty: ["medium"],
    build() {
      const present = rand(10, 40);
      const years = rand(3, 10);
      const future = present + years;
      const multiple = pick([2, 3]);
      const otherPresent = multiple * future - years;
      return {
        question: `A is ${present} years old. In ${years} years, B will be ${multiple} times A's age at that time. B's present age is:`,
        correct: otherPresent,
        distractors: [multiple * present, otherPresent + years, otherPresent - years],
        explanation: `After ${years} years: A = ${future}. B's future age = ${multiple}×${future} = ${multiple * future}. B's present age = ${multiple * future}−${years} = ${otherPresent}`
      };
    }
  },
  // 4. Number problems
  {
    id: "leq_number", difficulty: ["easy"],
    build() {
      const n = rand(5, 30);
      const mult = pick([3, 4, 5, 6, 7]);
      const added = rand(5, 20);
      const result = mult * n + added;
      return {
        question: `${mult} times a number plus ${added} equals ${result}. The number is:`,
        correct: n,
        distractors: [n + 1, n - 1, round2(result / mult)],
        explanation: `${mult}x + ${added} = ${result}. ${mult}x = ${result - added}. x = ${n}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// QUADRATIC EQUATIONS
// ═══════════════════════════════════════════════════════════
TEMPLATES["Quadratic Equations"] = [
  // 1. Factored form: (x-a)(x-b) = 0
  {
    id: "quad_factor", difficulty: ["medium"],
    build() {
      const r1 = rand(1, 10), r2 = rand(1, 10);
      const a = 1, b = -(r1 + r2), c = r1 * r2;
      const sumRoots = r1 + r2;
      return {
        question: `If x² ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}x + ${c} = 0, the sum of the roots is:`,
        correct: sumRoots,
        distractors: [c, r1 * r2, sumRoots + 2],
        explanation: `Sum of roots = −(${b})/1 = ${sumRoots}`
      };
    }
  },
  // 2. Product of roots
  {
    id: "quad_product", difficulty: ["medium"],
    build() {
      const r1 = rand(1, 8), r2 = rand(1, 8);
      const b = -(r1 + r2), c = r1 * r2;
      return {
        question: `For the equation x² ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}x + ${c} = 0, the product of the roots is:`,
        correct: c,
        distractors: [r1 + r2, Math.abs(b), c + 2],
        explanation: `Product of roots = c/a = ${c}/1 = ${c}`
      };
    }
  },
  // 3. Solve quadratic
  {
    id: "quad_solve", difficulty: ["medium", "hard"],
    build() {
      const r1 = rand(1, 12), r2 = rand(1, 12);
      if (r1 === r2) return this.build();
      const b = -(r1 + r2), c = r1 * r2;
      return {
        question: `The roots of x² ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}x + ${c} = 0 are:`,
        correct: `${r1} and ${r2}`,
        distractors: [`${r1} and ${r1}`, `${r1 + 1} and ${r2 - 1}`, `${-r1} and ${-r2}`],
        explanation: `x² ${b >= 0 ? "+" + b : b}x + ${c} = (x−${r1})(x−${r2}) = 0. x = ${r1} or ${r2}`,
        isString: true
      };
    }
  },
  // 4. Discriminant
  {
    id: "quad_discriminant", difficulty: ["medium"],
    build() {
      const a = 1, b = rand(-10, 10), c = rand(-10, 10);
      const D = b * b - 4 * a * c;
      const nature = D > 0 ? "real and distinct" : D === 0 ? "real and equal" : "not real";
      return {
        question: `The discriminant of x² ${b >= 0 ? "+ " + b : "− " + Math.abs(b)}x ${c >= 0 ? "+ " + c : "− " + Math.abs(c)} = 0 is:`,
        correct: D,
        distractors: [D + 4, Math.abs(D - 4), b * b],
        explanation: `D = b²−4ac = ${b}²−4(1)(${c}) = ${b * b}−${4 * c} = ${D}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// SURDS
// ═══════════════════════════════════════════════════════════
TEMPLATES["Surds"] = [
  // 1. Simplify √n
  {
    id: "surd_simplify", difficulty: ["easy", "medium"],
    build() {
      const outer = rand(2, 6);
      const inner = pick([2, 3, 5, 7]);
      const total = outer * outer * inner;
      return {
        question: `Simplify: √${total}`,
        correct: `${outer}√${inner}`,
        distractors: [`${outer + 1}√${inner}`, `${outer}√${inner + 1}`, `${total}`],
        explanation: `√${total} = √(${outer}²×${inner}) = ${outer}√${inner}`,
        isString: true
      };
    }
  },
  // 2. Rationalise denominator
  {
    id: "surd_rationalise", difficulty: ["medium"],
    build() {
      const a = rand(1, 5);
      const b = pick([2, 3, 5]);
      const conjugate = `${a}+√${b}`;
      const denom = a * a - b;
      if (denom === 0 || denom < 0) return this.build();
      return {
        question: `Rationalise: 1/(${a}−√${b}). The denominator becomes:`,
        correct: denom,
        distractors: [a * a + b, Math.abs(denom - 2), a - b],
        explanation: `Multiply by (${a}+√${b})/(${a}+√${b}). Denominator = ${a}²−(√${b})² = ${a * a}−${b} = ${denom}`
      };
    }
  },
  // 3. Addition of surds
  {
    id: "surd_add", difficulty: ["easy"],
    build() {
      const a = rand(2, 6), b = rand(1, 5);
      const inner = pick([2, 3, 5]);
      const sum = a + b;
      return {
        question: `Simplify: ${a}√${inner} + ${b}√${inner}`,
        correct: `${sum}√${inner}`,
        distractors: [`${a * b}√${inner}`, `${sum}√${inner * 2}`, `${a - b}√${inner}`],
        explanation: `${a}√${inner} + ${b}√${inner} = (${a}+${b})√${inner} = ${sum}√${inner}`,
        isString: true
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// MENSURATION 3D (additional)
// ═══════════════════════════════════════════════════════════
TEMPLATES["Mensuration 3D"] = [
  // 1. Volume of cone
  {
    id: "m3d_cone_vol", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 3.5, 21]);
      const h = rand(5, 20);
      const vol = round2((1 / 3) * (22 / 7) * r * r * h);
      return {
        question: `A cone has radius ${r} cm and height ${h} cm. Its volume (in cm³) is: (Use π = 22/7)`,
        correct: vol,
        distractors: [round2(22 / 7 * r * r * h), round2(vol * 3), round2(vol + 100)],
        explanation: `Volume = (1/3)πr²h = (1/3)(22/7)(${r})²(${h}) = ${vol} cm³`
      };
    }
  },
  // 2. CSA of cone
  {
    id: "m3d_cone_csa", difficulty: ["medium"],
    build() {
      const r = pick([7, 14]);
      const l = rand(10, 30);
      const csa = round2(22 / 7 * r * l);
      return {
        question: `A cone has radius ${r} cm and slant height ${l} cm. Its curved surface area (in cm²) is: (Use π = 22/7)`,
        correct: csa,
        distractors: [round2(22 / 7 * r * r), round2(csa + 22 / 7 * r * r), round2(2 * 22 / 7 * r * l)],
        explanation: `CSA = πrl = (22/7)(${r})(${l}) = ${csa} cm²`
      };
    }
  },
  // 3. Volume of hemisphere
  {
    id: "m3d_hemi_vol", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 21, 3.5]);
      const vol = round2((2 / 3) * (22 / 7) * r * r * r);
      return {
        question: `A hemisphere has radius ${r} cm. Its volume (in cm³) is: (Use π = 22/7)`,
        correct: vol,
        distractors: [round2(4 / 3 * 22 / 7 * r * r * r), round2(vol * 2), round2(22 / 7 * r * r * r)],
        explanation: `Volume = (2/3)πr³ = (2/3)(22/7)(${r})³ = ${vol} cm³`
      };
    }
  },
  // 4. TSA of hemisphere
  {
    id: "m3d_hemi_tsa", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 3.5]);
      const tsa = round2(3 * 22 / 7 * r * r);
      return {
        question: `Find the total surface area of a solid hemisphere with radius ${r} cm. (Use π = 22/7)`,
        correct: tsa,
        distractors: [round2(2 * 22 / 7 * r * r), round2(4 * 22 / 7 * r * r), round2(22 / 7 * r * r)],
        explanation: `TSA = 3πr² = 3 × (22/7) × ${r}² = ${tsa} cm²`
      };
    }
  },
  // 5. Volume of prism (triangular base)
  {
    id: "m3d_prism_vol", difficulty: ["medium", "hard"],
    build() {
      const base = rand(4, 12);
      const height_tri = rand(3, 10);
      const length = rand(5, 20);
      const baseArea = round2(0.5 * base * height_tri);
      const vol = round2(baseArea * length);
      return {
        question: `A triangular prism has a base of ${base} cm, height of triangle ${height_tri} cm, and length ${length} cm. Its volume (in cm³) is:`,
        correct: vol,
        distractors: [round2(base * height_tri * length), round2(vol / 2), round2(vol + base * length)],
        explanation: `Base area = ½ × ${base} × ${height_tri} = ${baseArea}. Volume = ${baseArea} × ${length} = ${vol} cm³`
      };
    }
  },
  // 6. Surface area of cylinder
  {
    id: "m3d_cyl_tsa", difficulty: ["medium"],
    build() {
      const r = pick([7, 14, 3.5]);
      const h = rand(5, 20);
      const tsa = round2(2 * 22 / 7 * r * (r + h));
      return {
        question: `A cylinder has radius ${r} cm and height ${h} cm. Its total surface area (in cm²) is: (Use π = 22/7)`,
        correct: tsa,
        distractors: [round2(2 * 22 / 7 * r * h), round2(22 / 7 * r * r * h), round2(tsa + 100)],
        explanation: `TSA = 2πr(r+h) = 2(22/7)(${r})(${r}+${h}) = 2(22/7)(${r})(${r + h}) = ${tsa} cm²`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// UNIT DIGIT & DIVISIBILITY
// ═══════════════════════════════════════════════════════════
TEMPLATES["Divisibility & Unit Digit"] = [
  // 1. Unit digit of power
  {
    id: "ud_power", difficulty: ["medium", "hard"],
    build() {
      const base = rand(2, 9);
      const exp = rand(10, 99);
      const cycle = {
        2: [2, 4, 8, 6], 3: [3, 9, 7, 1], 4: [4, 6], 5: [5], 6: [6],
        7: [7, 9, 3, 1], 8: [8, 4, 2, 6], 9: [9, 1]
      };
      const c = cycle[base];
      const ud = c[(exp - 1) % c.length];
      return {
        question: `What is the unit digit of ${base}^${exp}?`,
        correct: ud,
        distractors: [...c.filter(d => d !== ud).slice(0, 2), (ud + 2) % 10],
        explanation: `Unit digits of ${base}^n cycle as: ${c.join(",")}. ${base}^${exp}: position = ${exp} mod ${c.length} = ${exp % c.length}. Unit digit = ${ud}`
      };
    }
  },
  // 2. Divisibility by 3
  {
    id: "ud_div3", difficulty: ["easy"],
    build() {
      const mult = rand(100, 300) * 3;
      const notMult = mult + pick([1, 2]);
      const askDivisible = Math.random() > 0.5;
      const num = askDivisible ? mult : notMult;
      const digitSum = String(num).split("").reduce((s, d) => s + Number(d), 0);
      return {
        question: `Is ${num} divisible by 3? The sum of its digits is:`,
        correct: digitSum,
        distractors: [digitSum + 1, digitSum - 1, digitSum + 3],
        explanation: `Sum of digits = ${String(num).split("").join("+")} = ${digitSum}. ${digitSum % 3 === 0 ? "Divisible" : "Not divisible"} by 3.`
      };
    }
  },
  // 3. Divisibility by 11
  {
    id: "ud_div11", difficulty: ["medium"],
    build() {
      const mult = rand(10, 90) * 11;
      const digits = String(mult).split("").map(Number);
      const oddSum = digits.filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);
      const evenSum = digits.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
      const diff = Math.abs(oddSum - evenSum);
      return {
        question: `For the number ${mult}, the difference between the sum of digits at odd places and even places is:`,
        correct: diff,
        distractors: [diff + 1, oddSum, evenSum],
        explanation: `Odd-place digits sum = ${oddSum}, Even-place = ${evenSum}. Difference = ${diff} (divisible by 11 → ${mult} is divisible by 11)`
      };
    }
  },
  // 4. Largest n-digit number divisible by k
  {
    id: "ud_largest_div", difficulty: ["medium"],
    build() {
      const divisor = pick([7, 8, 9, 11, 12, 13, 15]);
      const largest = 999;
      const ans = largest - (largest % divisor);
      return {
        question: `The largest 3-digit number exactly divisible by ${divisor} is:`,
        correct: ans,
        distractors: [ans - divisor, ans + divisor, 999],
        explanation: `${largest} ÷ ${divisor} = ${Math.floor(999 / divisor)} remainder ${999 % divisor}. Largest = ${999} − ${999 % divisor} = ${ans}`
      };
    }
  }
];

// ═══════════════════════════════════════════════════════════
// INSTALLMENTS
// ═══════════════════════════════════════════════════════════
TEMPLATES["Installments"] = [
  // 1. Equal annual installment (SI)
  {
    id: "inst_si", difficulty: ["medium", "hard"],
    build() {
      const P = rand(2, 10) * 1000;
      const R = pick([5, 8, 10, 12]);
      const T = pick([2, 3]);
      const A = P * (1 + R * T / 100);
      const installment = round2(A / T);
      return {
        question: `A sum of ${formatRupee(P)} is to be repaid in ${T} equal annual installments at ${R}% SI per annum. Each installment is approximately:`,
        correct: installment,
        distractors: [round2(P / T), round2(installment + 100), round2(A / (T + 1))],
        explanation: `Amount = ${P}(1 + ${R}×${T}/100) = ${formatRupee(A)}. Each installment ≈ ${A}/${T} = ${formatRupee(installment)}`
      };
    }
  },
  // 2. Present worth of installments
  {
    id: "inst_ci_pw", difficulty: ["hard"],
    build() {
      const installment = rand(2, 10) * 1000;
      const R = pick([10, 20]);
      const n = 2;
      const pw = round2(installment / (1 + R / 100) + installment / Math.pow(1 + R / 100, 2));
      return {
        question: `The present worth of ${formatRupee(installment)} due in 1 year and ${formatRupee(installment)} due in 2 years at ${R}% CI is:`,
        correct: pw,
        distractors: [installment * 2, round2(pw + 500), round2(installment * 2 / (1 + R / 100))],
        explanation: `PW = ${installment}/${round2(1 + R / 100)} + ${installment}/${round2(Math.pow(1 + R / 100, 2))} = ${round2(installment / (1 + R / 100))} + ${round2(installment / Math.pow(1 + R / 100, 2))} = ${formatRupee(pw)}`
      };
    }
  }
];

// ── MAIN API ────────────────────────────────────────────────

/** Refresh topic list dynamically */
function getAllTopics() { return Object.keys(TEMPLATES); }

function getAvailableTopics() {
  return getAllTopics().map(t => ({ topic: t, templates: TEMPLATES[t].length }));
}

/**
 * Register a brand-new topic with templates.
 * Usage: registerTopic("My Topic", [ { id: "mt_1", difficulty: ["easy"], build() { ... } } ]);
 */
function registerTopic(name, templates) {
  if (TEMPLATES[name]) throw new Error(`Topic "${name}" already exists. Use addTemplates() to append.`);
  TEMPLATES[name] = templates;
}

/**
 * Append additional templates to an existing topic.
 * Usage: addTemplates("Percentage", [ { id: "pct_custom1", difficulty: ["hard"], build() { ... } } ]);
 */
function addTemplates(name, templates) {
  if (!TEMPLATES[name]) {
    TEMPLATES[name] = templates;
  } else {
    TEMPLATES[name].push(...templates);
  }
}

/**
 * Generate questions for a specific topic
 * @param {object} opts
 * @param {string} opts.topic - e.g. "Percentage"
 * @param {number} opts.count - how many questions
 * @param {string} opts.difficulty - "easy" | "medium" | "hard" | "mixed" (default)
 * @returns {Array} questions
 */
function generate({ topic, count = 5, difficulty = "mixed" } = {}) {
  const templates = TEMPLATES[topic];
  if (!templates || templates.length === 0) return [];

  let pool = templates;
  if (difficulty !== "mixed") {
    pool = templates.filter(t => t.difficulty.includes(difficulty));
    if (pool.length === 0) pool = templates;
  }

  const questions = [];
  const usedIds = new Set();
  let attempts = 0;

  while (questions.length < count && attempts < count * 10) {
    attempts++;
    const tpl = pick(pool);
    try {
      const result = tpl.build();
      if (!result || result.correct === -1) continue;

      let options, answerIndex;
      if (result.isString) {
        ({ options, answerIndex } = buildStringOptions(result.correct, result.distractors));
      } else {
        ({ options, answerIndex } = buildOptions(result.correct, result.distractors));
      }

      const q = {
        id: uid(),
        question: result.question,
        options,
        answerIndex,
        subject: "quant",
        topic,
        difficulty: pick(tpl.difficulty),
        marks: 2,
        negativeMarks: 0.5,
        isPYQ: false,
        isGenerated: true,
        explanation: result.explanation,
        reviewStatus: "approved"
      };

      // Avoid exact duplicate questions
      const fingerprint = q.question + q.options.join("|");
      if (usedIds.has(fingerprint)) continue;
      usedIds.add(fingerprint);

      questions.push(q);
    } catch (e) {
      // Template produced invalid params, retry
    }
  }

  return questions;
}

/**
 * Generate a complete mock section for quant
 * Distributes questions across topics like real SSC CGL
 * @param {number} totalQuestions - e.g. 25 for tier1, 35 for tier2
 * @param {string} difficulty - "easy" | "medium" | "hard" | "mixed"
 * @returns {Array} questions
 */
function generateQuantSection(totalQuestions = 25, difficulty = "mixed") {
  // SSC CGL topic distribution (approximate real exam weights)
  const distribution = [
    { topic: "Percentage", weight: 2 },
    { topic: "Profit & Loss", weight: 2 },
    { topic: "Simple & Compound Interest", weight: 2 },
    { topic: "Ratio & Proportion", weight: 2 },
    { topic: "Average", weight: 2 },
    { topic: "Time & Distance", weight: 2 },
    { topic: "Time & Work", weight: 2 },
    { topic: "Ages", weight: 1 },
    { topic: "Number System", weight: 1 },
    { topic: "Mensuration", weight: 2 },
    { topic: "Mensuration 3D", weight: 1 },
    { topic: "Geometry", weight: 1 },
    { topic: "Algebra", weight: 2 },
    { topic: "Trigonometry", weight: 2 },
    { topic: "Simplification", weight: 1 },
    { topic: "Mixture & Alligation", weight: 1 },
    { topic: "Partnership", weight: 1 },
    { topic: "Statistics", weight: 1 },
    { topic: "Probability", weight: 1 },
    { topic: "Linear Equations", weight: 1 },
    { topic: "Quadratic Equations", weight: 1 },
    { topic: "Surds", weight: 1 },
    { topic: "Divisibility & Unit Digit", weight: 1 },
    { topic: "Installments", weight: 1 }
  ];

  const totalWeight = distribution.reduce((s, d) => s + d.weight, 0);
  const questions = [];

  for (const { topic, weight } of distribution) {
    if (!TEMPLATES[topic]) continue;
    const count = Math.max(1, Math.round((weight / totalWeight) * totalQuestions));
    const generated = generate({ topic, count, difficulty });
    questions.push(...generated);
  }

  // If we have too many, trim. If too few, fill from random topics.
  if (questions.length > totalQuestions) {
    return shuffle(questions).slice(0, totalQuestions);
  }
  const allTopics = getAllTopics();
  while (questions.length < totalQuestions) {
    const topic = pick(allTopics);
    const extra = generate({ topic, count: 1, difficulty });
    questions.push(...extra);
  }

  return shuffle(questions);
}

module.exports = { generate, generateQuantSection, getAvailableTopics, registerTopic, addTemplates, TEMPLATES };
