document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const tolerance = 0.01;

  const rows = [
    { weight: 18, analysis: [12, 4, 6] },
    { weight: 25, analysis: [8, 10, 5] },
    { weight: 15, analysis: [6, 3, 12] },
    { weight: 22, analysis: [14, 7, 4] },
    { weight: 30, analysis: [5, 8, 10] }
  ];

  const bagProblems = [
    { requiredN: 4, bagWeight: 20, analysis: [10, 6, 3] },
    { requiredN: 6, bagWeight: 25, analysis: [12, 4, 8] },
    { requiredN: 7, bagWeight: 20, analysis: [14, 7, 4] }
  ];

  const nutrientNames = [
    "nitrogen",
    "available phosphate",
    "soluble potash"
  ];

  const practiceRows = document.getElementById("practiceRows");
  const feedback = document.getElementById("feedback");
  const hint = document.getElementById("hint");
  const scoreValue = document.getElementById("scoreValue");
  const scoreTotal = document.getElementById("scoreTotal");
  const bagQuestions = document.getElementById("bagQuestions");
  const bagFeedback = document.getElementById("bagFeedback");

  const checkButton = document.getElementById("checkButton");
  const hintButton = document.getElementById("hintButton");
  const resetButton = document.getElementById("resetButton");
  const checkBagsButton = document.getElementById("checkBagsButton");
  const resetBagsButton = document.getElementById("resetBagsButton");

  const requiredElements = {
    practiceRows,
    feedback,
    hint,
    scoreValue,
    scoreTotal,
    bagQuestions,
    bagFeedback,
    checkButton,
    hintButton,
    resetButton,
    checkBagsButton,
    resetBagsButton
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      "The following required HTML elements are missing:",
      missingElements.join(", ")
    );
    return;
  }

  function nutrientAmount(weight, percentage) {
    return (weight * percentage) / 100;
  }

  function closeEnough(value, expected) {
    return Math.abs(value - expected) <= tolerance;
  }

  function formatNumber(value) {
    return Number(value.toFixed(2)).toString();
  }

  function buildPracticeTable() {
    practiceRows.innerHTML = "";

    rows.forEach((row, rowIndex) => {
      const tableRow = document.createElement("tr");

      const weightCell = document.createElement("td");
      weightCell.textContent = `${row.weight} kg`;
      tableRow.appendChild(weightCell);

      const analysisCell = document.createElement("td");
      analysisCell.textContent = row.analysis.join("–");
      tableRow.appendChild(analysisCell);

      row.analysis.forEach((percentage, nutrientIndex) => {
        const answerCell = document.createElement("td");

        const input = document.createElement("input");
        input.id = `answer-${rowIndex}-${nutrientIndex}`;
        input.className = "answer-input";
        input.type = "number";
        input.inputMode = "decimal";
        input.min = "0";
        input.step = "0.01";
        input.dataset.row = String(rowIndex);
        input.dataset.nutrient = String(nutrientIndex);
        input.setAttribute(
          "aria-label",
          `${row.weight} kilogram bag, kilograms of ${nutrientNames[nutrientIndex]}`
        );

        answerCell.appendChild(input);
        tableRow.appendChild(answerCell);
      });

      practiceRows.appendChild(tableRow);
    });

    scoreTotal.textContent = String(rows.length * 3);
  }

  function checkPracticeAnswers() {
    const inputs = document.querySelectorAll(".answer-input");
    let correct = 0;
    let answered = 0;

    inputs.forEach((input) => {
      input.classList.remove("correct", "incorrect");

      if (input.value.trim() === "") {
        return;
      }

      answered += 1;

      const rowIndex = Number(input.dataset.row);
      const nutrientIndex = Number(input.dataset.nutrient);
      const row = rows[rowIndex];

      const expected = nutrientAmount(
        row.weight,
        row.analysis[nutrientIndex]
      );

      const studentAnswer = Number(input.value);

      if (
        Number.isFinite(studentAnswer) &&
        closeEnough(studentAnswer, expected)
      ) {
        input.classList.add("correct");
        correct += 1;
      } else {
        input.classList.add("incorrect");
      }
    });

    scoreValue.textContent = String(correct);
    feedback.className = "feedback";

    if (answered === 0) {
      feedback.classList.add("needs-work");
      feedback.textContent =
        "Enter at least one answer before checking.";
      return;
    }

    if (correct === inputs.length) {
      feedback.classList.add("good");
      feedback.textContent =
        "Excellent work — every answer is correct.";
      return;
    }

    feedback.classList.add("needs-work");
    feedback.textContent =
      `${correct} of ${inputs.length} answers are correct. ` +
      "Green answers are correct; red answers need another look.";
  }

  function showHint() {
    const inputs = Array.from(
      document.querySelectorAll(".answer-input")
    );

    const target =
      inputs.find((input) => input.value.trim() === "") || inputs[0];

    if (!target) {
      return;
    }

    const rowIndex = Number(target.dataset.row);
    const nutrientIndex = Number(target.dataset.nutrient);
    const row = rows[rowIndex];
    const percentage = row.analysis[nutrientIndex];
    const expected = nutrientAmount(row.weight, percentage);

    hint.innerHTML =
      `For the <strong>${row.weight} kg</strong> bag, calculate ` +
      `${nutrientNames[nutrientIndex]} using:<br>` +
      `<strong>${row.weight} × ${percentage} ÷ 100</strong><br>` +
      `This gives <strong>${formatNumber(expected)} kg</strong>.`;

    hint.hidden = false;
  }

  function resetPractice() {
    document.querySelectorAll(".answer-input").forEach((input) => {
      input.value = "";
      input.classList.remove("correct", "incorrect");
    });

    scoreValue.textContent = "0";
    feedback.textContent = "";
    feedback.className = "feedback";
    hint.textContent = "";
    hint.hidden = true;
  }

  function buildBagQuestions() {
    bagQuestions.innerHTML = "";

    bagProblems.forEach((problem, index) => {
      const nitrogenPerBag = nutrientAmount(
        problem.bagWeight,
        problem.analysis[0]
      );

      const question = document.createElement("div");
      question.className = "question";

      const label = document.createElement("label");
      label.setAttribute("for", `bag-${index}`);
      label.textContent =
        `${index + 1}. A project requires ${problem.requiredN} kg of ` +
        `actual nitrogen. Fertilizer is sold in ${problem.bagWeight} kg ` +
        `bags with an analysis of ${problem.analysis.join("–")}. ` +
        "How many full bags must be purchased?";

      const inputRow = document.createElement("div");
      inputRow.className = "input-row";

      const input = document.createElement("input");
      input.id = `bag-${index}`;
      input.className = "bag-answer";
      input.type = "number";
      input.inputMode = "numeric";
      input.min = "0";
      input.step = "1";
      input.dataset.index = String(index);

      const unit = document.createElement("span");
      unit.textContent = "bags";

      const note = document.createElement("small");
      note.textContent =
        `One bag contains ${formatNumber(nitrogenPerBag)} kg of nitrogen.`;

      inputRow.appendChild(input);
      inputRow.appendChild(unit);

      question.appendChild(label);
      question.appendChild(inputRow);
      question.appendChild(note);

      bagQuestions.appendChild(question);
    });
  }

  function checkBagAnswers() {
    const inputs = document.querySelectorAll(".bag-answer");
    let correct = 0;
    let answered = 0;

    inputs.forEach((input) => {
      input.classList.remove("correct", "incorrect");

      if (input.value.trim() === "") {
        return;
      }

      answered += 1;

      const problemIndex = Number(input.dataset.index);
      const problem = bagProblems[problemIndex];

      const nitrogenPerBag = nutrientAmount(
        problem.bagWeight,
        problem.analysis[0]
      );

      const expectedBags = Math.ceil(
        problem.requiredN / nitrogenPerBag
      );

      const studentAnswer = Number(input.value);

      if (
        Number.isInteger(studentAnswer) &&
        studentAnswer === expectedBags
      ) {
        input.classList.add("correct");
        correct += 1;
      } else {
        input.classList.add("incorrect");
      }
    });

    bagFeedback.className = "feedback";

    if (answered === 0) {
      bagFeedback.classList.add("needs-work");
      bagFeedback.textContent =
        "Enter at least one answer before checking.";
      return;
    }

    if (correct === inputs.length) {
      bagFeedback.classList.add("good");
      bagFeedback.textContent =
        "Great job — all challenge questions are correct.";
      return;
    }

    bagFeedback.classList.add("needs-work");
    bagFeedback.textContent =
      `${correct} of ${inputs.length} challenge answers are correct. ` +
      "Remember to round up to a full bag.";
  }

  function resetBagQuestions() {
    document.querySelectorAll(".bag-answer").forEach((input) => {
      input.value = "";
      input.classList.remove("correct", "incorrect");
    });

    bagFeedback.textContent = "";
    bagFeedback.className = "feedback";
  }

  buildPracticeTable();
  buildBagQuestions();

  checkButton.addEventListener("click", checkPracticeAnswers);
  hintButton.addEventListener("click", showHint);
  resetButton.addEventListener("click", resetPractice);
  checkBagsButton.addEventListener("click", checkBagAnswers);
  resetBagsButton.addEventListener("click", resetBagQuestions);
});
