// Tree Fertilization — Fertilizer Analysis Practice
// Generates the practice table, grades answers, and runs the "bags needed" challenge.

(function () {
  "use strict";

  // ---- Data -----------------------------------------------------------

  // Pool of possible practice rows; 3 are drawn at random each time the page
  // loads or "Reset" is clicked. Each row has its own whole-number weight for
  // kg and for lb (not a unit conversion of each other) so both views always
  // show clean numbers.
  const practicePool = [
    { weightKg: 10, weightLb: 20, n: 10, p: 5, k: 5 },
    { weightKg: 12, weightLb: 25, n: 16, p: 4, k: 8 },
    { weightKg: 16, weightLb: 30, n: 12, p: 12, k: 12 },
    { weightKg: 20, weightLb: 40, n: 20, p: 0, k: 10 },
    { weightKg: 25, weightLb: 50, n: 8, p: 2, k: 6 },
  ];
  const PRACTICE_ROW_COUNT = 3;
  let practiceRowsState = [];

  // Pool of "how many bags" challenge scenarios, covering N, P, and K.
  // 2 are drawn at random each time the page loads or the challenge is reset.
  // The full guaranteed analysis is shown, so students must identify which
  // of the three numbers matches the nutrient asked about.
  const bagChallengePool = [
    { nutrient: "n", needKg: 5, bagWeight: 20, n: 10, p: 6, k: 3 },
    { nutrient: "n", needKg: 8, bagWeight: 25, n: 16, p: 4, k: 8 },
    { nutrient: "n", needKg: 12, bagWeight: 50, n: 20, p: 0, k: 10 },
    { nutrient: "p", needKg: 3, bagWeight: 20, n: 12, p: 12, k: 12 },
    { nutrient: "p", needKg: 1, bagWeight: 30, n: 8, p: 2, k: 6 },
    { nutrient: "k", needKg: 4, bagWeight: 25, n: 16, p: 4, k: 8 },
  ];
  const BAG_QUESTION_COUNT = 2;
  let currentBagQuestions = [];

  const nutrientNames = { n: "nitrogen", p: "available phosphate", k: "soluble potash" };
  const nutrientKeys = ["n", "p", "k"];

  // Fixed reference row shown pre-filled at the top of the practice table
  const exampleRowData = { bag: 20, n: 10, p: 6, k: 3 };

  const KG_PER_LB = 0.45359237;
  let practiceUnit = "lb"; // "kg" or "lb"

  const round1 = (num) => Math.round(num * 10) / 10;

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickPracticeRows() {
    return shuffleArray(practicePool).slice(0, PRACTICE_ROW_COUNT);
  }

  function pickBagQuestions() {
    return shuffleArray(bagChallengePool).slice(0, BAG_QUESTION_COUNT);
  }

  function weightInPracticeUnit(kgWeight) {
    return practiceUnit === "kg" ? kgWeight : round1(kgWeight / KG_PER_LB);
  }

  function nutrientAmountInPracticeUnit(kgWeight, percent) {
    return round1((weightInPracticeUnit(kgWeight) * percent) / 100);
  }

  function weightPoolInUnit(row) {
    return practiceUnit === "kg" ? row.weightKg : row.weightLb;
  }

  function nutrientAmountPool(row, percent) {
    return round1((weightPoolInUnit(row) * percent) / 100);
  }

  // ---- Build practice table -------------------------------------------

  const practiceRows = document.getElementById("practiceRows");
  const scoreTotal = document.getElementById("scoreTotal");

  function renderExampleRow() {
    const weightCell = document.getElementById("exampleWeightCell");
    const analysisCell = document.getElementById("exampleAnalysisCell");
    const nCell = document.getElementById("exampleNCell");
    const pCell = document.getElementById("examplePCell");
    const kCell = document.getElementById("exampleKCell");
    if (weightCell) weightCell.textContent = `${weightInPracticeUnit(exampleRowData.bag)}`;
    if (analysisCell) analysisCell.textContent = `${exampleRowData.n}\u2013${exampleRowData.p}\u2013${exampleRowData.k}`;
    if (nCell) nCell.textContent = nutrientAmountInPracticeUnit(exampleRowData.bag, exampleRowData.n);
    if (pCell) pCell.textContent = nutrientAmountInPracticeUnit(exampleRowData.bag, exampleRowData.p);
    if (kCell) kCell.textContent = nutrientAmountInPracticeUnit(exampleRowData.bag, exampleRowData.k);
  }

  function buildPracticeTable() {
    const colWeightHeader = document.getElementById("colWeightHeader");
    const colNHeader = document.getElementById("colNHeader");
    const colPHeader = document.getElementById("colPHeader");
    const colKHeader = document.getElementById("colKHeader");
    if (colWeightHeader) colWeightHeader.textContent = `Bag weight (${practiceUnit})`;
    if (colNHeader) colNHeader.textContent = `${practiceUnit} of N`;
    if (colPHeader) colPHeader.textContent = `${practiceUnit} of available phosphate`;
    if (colKHeader) colKHeader.textContent = `${practiceUnit} of soluble potash`;

    practiceRows.innerHTML = "";
    practiceRowsState.forEach((row, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${weightPoolInUnit(row)}</td>
        <td>${row.n}–${row.p}–${row.k}</td>
        <td><input class="answer-input" type="number" step="0.1" inputmode="decimal"
             aria-label="Amount of nitrogen in ${practiceUnit} for row ${index + 1}" data-row="${index}" data-field="n"></td>
        <td><input class="answer-input" type="number" step="0.1" inputmode="decimal"
             aria-label="Amount of available phosphate in ${practiceUnit} for row ${index + 1}" data-row="${index}" data-field="p"></td>
        <td><input class="answer-input" type="number" step="0.1" inputmode="decimal"
             aria-label="Amount of soluble potash in ${practiceUnit} for row ${index + 1}" data-row="${index}" data-field="k"></td>
      `;
      practiceRows.appendChild(tr);
    });
  }

  function checkPractice() {
    const scoreValue = document.getElementById("scoreValue");
    const feedback = document.getElementById("feedback");
    let correctCount = 0;
    let answeredCount = 0;

    practiceRowsState.forEach((row, index) => {
      ["n", "p", "k"].forEach((field) => {
        const input = practiceRows.querySelector(
          `input[data-row="${index}"][data-field="${field}"]`
        );
        if (!input) return;
        const expected = nutrientAmountPool(row, row[field]);
        const raw = input.value.trim();
        input.classList.remove("correct", "incorrect");

        if (raw === "") return;
        answeredCount += 1;
        const given = parseFloat(raw);
        if (!isNaN(given) && Math.abs(given - expected) < 0.05) {
          input.classList.add("correct");
          correctCount += 1;
        } else {
          input.classList.add("incorrect");
        }
      });
    });

    if (scoreValue) scoreValue.textContent = correctCount;

    if (feedback) {
      feedback.classList.remove("good", "needs-work");
      const total = practiceRowsState.length * 3;
      if (answeredCount === 0) {
        feedback.textContent = "Enter an answer in each box, then check again.";
        feedback.classList.add("needs-work");
      } else if (correctCount === total) {
        feedback.textContent = "All correct! Nicely done.";
        feedback.classList.add("good");
      } else {
        feedback.textContent = `${correctCount} of ${total} correct so far. Review the highlighted boxes and try again.`;
        feedback.classList.add("needs-work");
      }
    }
  }

  function resetPractice() {
    practiceRowsState = pickPracticeRows();
    buildPracticeTable();
    renderExampleRow();
    const scoreValue = document.getElementById("scoreValue");
    const feedback = document.getElementById("feedback");
    const hint = document.getElementById("hint");
    if (scoreValue) scoreValue.textContent = "0";
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("good", "needs-work");
    }
    if (hint) hint.hidden = true;
  }

  function setPracticeUnit(nextUnit) {
    practiceUnit = nextUnit;
    const toggle = document.getElementById("practiceUnitToggle");
    if (toggle) toggle.setAttribute("aria-checked", practiceUnit === "kg" ? "true" : "false");
    const kgLabel = document.getElementById("practiceUnitLabelKg");
    const lbLabel = document.getElementById("practiceUnitLabelLb");
    if (kgLabel) kgLabel.classList.toggle("active", practiceUnit === "kg");
    if (lbLabel) lbLabel.classList.toggle("active", practiceUnit === "lb");
    const hintText = document.getElementById("practiceUnitHint");
    if (hintText) {
      hintText.textContent = `Using the bag weight and guaranteed analysis, enter the amount of nitrogen, phosphorus, and potassium in ${practiceUnit === "kg" ? "kilograms" : "pounds"}. Decimals are allowed. 
      
      The first row is completed as an example.`;
    }
    buildPracticeTable();
    renderExampleRow();
    const scoreValue = document.getElementById("scoreValue");
    const feedback = document.getElementById("feedback");
    if (scoreValue) scoreValue.textContent = "0";
    if (feedback) {
      feedback.textContent = "";
      feedback.classList.remove("good", "needs-work");
    }
  }

  function togglePracticeUnit() {
    setPracticeUnit(practiceUnit === "kg" ? "lb" : "kg");
  }

  function toggleHint() {
    const hint = document.getElementById("hint");
    if (!hint) return;
    hint.hidden = !hint.hidden;
    if (!hint.hidden) {
      hint.textContent =
        `Hint 1: The three numbers on a fertilizer label are always listed as % nitrogen \u2013 % available phosphate \u2013 % soluble potash.

Hint 2: Nutrient mass (${practiceUnit}) = bag mass (${practiceUnit}) \u00d7 nutrient percentage \u00f7 100.`;
    }
  }

  // ---- Build "how many bags" challenge ---------------------------------

  const bagQuestions = document.getElementById("bagQuestions");

  function buildBagQuestions() {
    bagQuestions.innerHTML = "";
    currentBagQuestions.forEach((q, index) => {
      const div = document.createElement("div");
      div.className = "question";
      div.innerHTML = `
        <label for="bagAnswer${index}">
          A tree needs ${q.needKg} kg of ${nutrientNames[q.nutrient]}. Fertilizer comes in ${q.bagWeight} kg bags
          labeled ${q.n}\u2013${q.p}\u2013${q.k}. How many bags should be purchased?
        </label>
        <div class="input-row">
          <input class="bag-answer" id="bagAnswer${index}" type="number" step="1" inputmode="numeric"
                 aria-label="Number of bags for question ${index + 1}" data-index="${index}">
          <span>bag(s)</span>
        </div>
      `;
      bagQuestions.appendChild(div);
    });
  }

  function checkBags() {
    const bagFeedback = document.getElementById("bagFeedback");
    let correctCount = 0;
    let answeredCount = 0;

    currentBagQuestions.forEach((q, index) => {
      const input = document.getElementById(`bagAnswer${index}`);
      if (!input) return;
      const percent = q[q.nutrient];
      const kgPerBag = (q.bagWeight * percent) / 100;
      const expected = Math.ceil(q.needKg / kgPerBag);
      const raw = input.value.trim();
      input.classList.remove("correct", "incorrect");

      if (raw === "") return;
      answeredCount += 1;
      const given = parseInt(raw, 10);
      if (given === expected) {
        input.classList.add("correct");
        correctCount += 1;
      } else {
        input.classList.add("incorrect");
      }
    });

    if (bagFeedback) {
      bagFeedback.classList.remove("good", "needs-work");
      if (answeredCount === 0) {
        bagFeedback.textContent = "Enter your answer for each scenario, then check again.";
        bagFeedback.classList.add("needs-work");
      } else if (correctCount === currentBagQuestions.length) {
        bagFeedback.textContent = "All correct! Remember to round up to a whole bag.";
        bagFeedback.classList.add("good");
      } else {
        bagFeedback.textContent = `${correctCount} of ${currentBagQuestions.length} correct. Check whether you rounded up to the next whole bag.`;
        bagFeedback.classList.add("needs-work");
      }
    }
  }

  function resetBags() {
    currentBagQuestions = pickBagQuestions();
    buildBagQuestions();
    const bagFeedback = document.getElementById("bagFeedback");
    if (bagFeedback) {
      bagFeedback.textContent = "";
      bagFeedback.classList.remove("good", "needs-work");
    }
  }

  // ---- Read-the-label quiz (rotating bag images, kg/lb toggle) ----------

  // Filenames encode guaranteed analysis as N-P-K; all bags are 50 lb net weight
  const bagFiles = ["20-17-8.png", "30-12-10.png", "25-8-6.png"];
  const BAG_WEIGHT_LB = 50;

  let unit = "lb"; // "lb" or "kg"
  let quizState = null; // { file, values: {n,p,k}, q1Key, q2Key, q3Key }

  function parseBagFile(file) {
    const [n, p, k] = file.replace(".png", "").split("-").map(Number);
    return { n, p, k };
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function bagWeightInUnit() {
    return unit === "lb" ? BAG_WEIGHT_LB : round1(BAG_WEIGHT_LB * KG_PER_LB);
  }

  function amountFor(key) {
    return round1((bagWeightInUnit() * quizState.values[key]) / 100);
  }

  function buildQuizState() {
    const file = pickRandom(bagFiles);
    const values = parseBagFile(file);
    const q1Key = pickRandom(nutrientKeys);
    const q2Key = pickRandom(nutrientKeys);
    const remaining = nutrientKeys.filter((k) => k !== q2Key);
    const q3Key = pickRandom(remaining);
    return { file, values, q1Key, q2Key, q3Key };
  }

  function renderQuiz() {
    const bagImage = document.getElementById("bagImage");
    if (bagImage) {
      bagImage.src = quizState.file;
      bagImage.alt = `Fertilizer bag labeled ${quizState.values.n}-${quizState.values.p}-${quizState.values.k}, net weight ${BAG_WEIGHT_LB} lb`;
    }

    const q1Label = document.getElementById("q1Label");
    if (q1Label) q1Label.textContent = `What percentage of the guaranteed analysis is ${nutrientNames[quizState.q1Key]}?`;

    const q2Label = document.getElementById("q2Label");
    if (q2Label) q2Label.textContent = `How many ${unit} of ${nutrientNames[quizState.q2Key]} are in this bag?`;

    const q3Label = document.getElementById("q3Label");
    if (q3Label) q3Label.textContent = `How many ${unit} of ${nutrientNames[quizState.q3Key]} are in this bag?`;

    const q1Suffix = document.getElementById("q1Suffix");
    if (q1Suffix) q1Suffix.textContent = "%";
    const q2Suffix = document.getElementById("q2Suffix");
    if (q2Suffix) q2Suffix.textContent = unit;
    const q3Suffix = document.getElementById("q3Suffix");
    if (q3Suffix) q3Suffix.textContent = unit;

    ["q1Answer", "q2Answer", "q3Answer"].forEach((id) => {
      const input = document.getElementById(id);
      if (input) {
        input.value = "";
        input.classList.remove("correct", "incorrect");
      }
    });
    const labelFeedback = document.getElementById("labelFeedback");
    if (labelFeedback) {
      labelFeedback.textContent = "";
      labelFeedback.classList.remove("good", "needs-work");
    }
  }

  function newLabelQuiz() {
    quizState = buildQuizState();
    renderQuiz();
  }

  function setUnit(nextUnit) {
    unit = nextUnit;
    const unitToggle = document.getElementById("unitToggle");
    if (unitToggle) unitToggle.setAttribute("aria-checked", unit === "kg" ? "true" : "false");
    const lbLabel = document.getElementById("unitLabelLb");
    const kgLabel = document.getElementById("unitLabelKg");
    if (lbLabel) lbLabel.classList.toggle("active", unit === "lb");
    if (kgLabel) kgLabel.classList.toggle("active", unit === "kg");
    renderQuiz();
  }

  function toggleUnit() {
    setUnit(unit === "lb" ? "kg" : "lb");
  }

  function checkLabel() {
    if (!quizState) return;
    const labelFeedback = document.getElementById("labelFeedback");
    const checks = [
      { id: "q1Answer", expected: quizState.values[quizState.q1Key], tolerance: 0 },
      { id: "q2Answer", expected: amountFor(quizState.q2Key), tolerance: 0.05 },
      { id: "q3Answer", expected: amountFor(quizState.q3Key), tolerance: 0.05 },
    ];
    let correctCount = 0;
    let answeredCount = 0;

    checks.forEach(({ id, expected, tolerance }) => {
      const input = document.getElementById(id);
      if (!input) return;
      const raw = input.value.trim();
      input.classList.remove("correct", "incorrect");
      if (raw === "") return;
      answeredCount += 1;
      const given = parseFloat(raw);
      if (!isNaN(given) && Math.abs(given - expected) <= tolerance + 0.001) {
        input.classList.add("correct");
        correctCount += 1;
      } else {
        input.classList.add("incorrect");
      }
    });

    if (labelFeedback) {
      labelFeedback.classList.remove("good", "needs-work");
      if (answeredCount === 0) {
        labelFeedback.textContent = "Enter a value for each question, then check again.";
        labelFeedback.classList.add("needs-work");
      } else if (correctCount === checks.length) {
        labelFeedback.textContent = "All correct! That's how the label reads.";
        labelFeedback.classList.add("good");
      } else {
        labelFeedback.textContent = `${correctCount} of ${checks.length} correct. Check the highlighted boxes against the label.`;
        labelFeedback.classList.add("needs-work");
      }
    }
  }

  // ---- Wire up events ---------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    practiceRowsState = pickPracticeRows();
    setPracticeUnit(practiceUnit);
    resetBags();
    newLabelQuiz();
    setUnit(unit);

    document.getElementById("checkButton").addEventListener("click", checkPractice);
    document.getElementById("resetButton").addEventListener("click", resetPractice);
    document.getElementById("hintButton").addEventListener("click", toggleHint);
    document.getElementById("practiceUnitToggle").addEventListener("click", togglePracticeUnit);

    document.getElementById("checkBagsButton").addEventListener("click", checkBags);
    document.getElementById("resetBagsButton").addEventListener("click", resetBags);

    document.getElementById("checkLabelButton").addEventListener("click", checkLabel);
    document.getElementById("resetLabelButton").addEventListener("click", newLabelQuiz);
    document.getElementById("unitToggle").addEventListener("click", toggleUnit);
  });
})();
