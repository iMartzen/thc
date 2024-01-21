// Function: loadQuestions
// Description: Loads the questions from the JSON file and creates the HTML elements for the questions and answers.
function loadQuestions() {
  fetch("questions.json")
    .then((response) => response.json())
    .then((questionsData) => {
      const questionsContainer = document.getElementById("questionsContainer");
      Object.entries(questionsData).forEach(([key, value]) => {
        const questionBlock = document.createElement("div");
        questionBlock.innerHTML = `
                  <h3>${value.questions}</h3>
                  <div>
                      <input type="radio" name="question${key}" value="1" required > Never
                      <input type="radio" name="question${key}" value="2" required > Rarely
                      <input type="radio" name="question${key}" value="3" required > Sometimes
                      <input type="radio" name="question${key}" value="4" required > Often
                      <input type="radio" name="question${key}" value="5" required > Always
                  </div>
              `;
        questionsContainer.appendChild(questionBlock);
      });
    })
    .catch((error) => {
      console.error("Error loading questions:", error);
    });
}

// Event Listener: DOMContentLoaded
// Description: Ensures that the DOM is fully loaded before executing scripts.
document.addEventListener("DOMContentLoaded", function () {
  loadQuestions();
  attachFormSubmitListener();
});

// Function: attachFormSubmitListener
// Description: Attaches the event listener to the assessment form for handling form submission.
function attachFormSubmitListener() {
  // Assuming the ID of your form is 'assessmentForm'
  const form = document.getElementById("assessmentForm");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      submitAssessment();
    });
  } else {
    console.error("Form not found");
  }
}

// Function: submitAssessment
// Description: Handles the submission of the assessment and calculation of scores.
function submitAssessment() {
  fetch("questions.json")
    .then((response) => response.json())
    .then((questionsData) => {
      const scores = calculateScores(questionsData);
      const averages = calculateAverages(scores);
      displayResults(averages);
    })
    .catch((error) => {
      console.error("Error processing assessment:", error);
    });
}

// Function: calculateScores
// Description: Calculates scores for each group based on the form responses.
function calculateScores(questionsData) {
  const scores = {
    Trust: [],
    Conflict: [],
    Results: [],
    Accountability: [],
    Commitment: [],
  };

  Object.entries(questionsData).forEach(([key, value]) => {
    const selectedValue = document.querySelector(
      `input[name="question${key}"]:checked`
    )?.value;
    if (selectedValue) {
      scores[value.group].push(parseInt(selectedValue, 10));
    }
  });

  return scores;
}

// Function: calculateAverages
// Description: Calculates the average score for each group.
function calculateAverages(scores) {
  const averages = {};
  for (const group in scores) {
    const groupScores = scores[group];
    const average =
      groupScores.length > 0
        ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length
        : 0;
    averages[group] = average.toFixed(2); // round to 2 decimal places
  }
  return averages;
}

// Function: fetchInterpretations
// Description: Fetches the interpretations from the JSON file.
function fetchInterpretations() {
  return fetch("interpretations.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching interpretations:", error);
    });
}

// Function: displayResults
// Description: Displays the results of the assessment.
function displayResults(averages) {
  fetchInterpretations().then((interpretations) => {
    if (!interpretations) {
      console.error("Failed to load interpretations");
      return;
    }

    let explanationText = `<p class="explaination">In our assessment, team scores are averaged and categorized as: High (3.75 and above), indicating strong performance; Medium (3.25 to 3.74), suggesting room for improvement; and Low (3.24 and below), pointing to significant areas for development.</p>`;
    let resultText = `<h3>Your team scores:</h3>`;

    for (const group in averages) {
      const score = averages[group];
      let level = score >= 3.75 ? "High" : score >= 3.25 ? "Medium" : "Low";
      resultText += `<strong>${group}:</strong> ${averages[group]} - ${level}<br>`;
    }

    // Function: showInitialResults
    // Description: Displays the initial results of the assessment.
    function showInitialResults() {
      Swal.fire({
        title: "Assessment Results",
        html: explanationText + resultText,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Print Results",
        denyButtonText: "View Interpretation",
        cancelButtonText: "Close",
        customClass: {
          confirmButton: "copy-button",
          denyButton: "interpretation-button",
        },
        preConfirm: () => window.print(),
        preDeny: () => showScoreInterpretation(),
      });
    }

    // Function: showScoreInterpretation
    // Description: Displays the score interpretation.
    function showScoreInterpretation() {
      fetchInterpretations().then((interpretations) => {
        if (!interpretations) {
          console.error("Failed to load interpretations");
          return;
        }

        let interpretationText = getScoreInterpretation(
          averages,
          interpretations
        );

        Swal.fire({
          title: "Score Interpretation",
          html: interpretationText,
          confirmButtonText: "Print Results",
          cancelButtonText: "Back",
          showCancelButton: true,
          preConfirm: () => window.print(),
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            showInitialResults();
          }
        });
      });
    }

    showInitialResults();
  });
}

// Function: getScoreInterpretation
// Description: Returns the score interpretation.
function getScoreInterpretation(averages, interpretations) {
  let interpretationText = "";
  for (const group in averages) {
    const score = averages[group];
    let level = score >= 3.75 ? "High" : score >= 3.25 ? "Medium" : "Low";
    interpretationText += `Your score on <b>${group}</b>:<br>`;
    interpretationText += `<div class="${level}-score"><strong>${level}: </strong>${interpretations[group][level]}</div><br>`;

    interpretationText += `
          <details>
              <summary>View All Levels</summary>
              <p><strong>High:</strong> ${interpretations[group]["High"]}</p>
              <p><strong>Medium:</strong> ${interpretations[group]["Medium"]}</p>
              <p><strong>Low:</strong> ${interpretations[group]["Low"]}</p>
          </details>
          <br>`;
  }

  return interpretationText;
}
