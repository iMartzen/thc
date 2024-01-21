// Function: loadQuestions
// Description: Loads the questions from the JSON file and creates the HTML elements for the questions and answers.
function loadQuestions() {
  fetch('questions.json')
      .then(response => response.json())
      .then(questionsData => {
          const questionsContainer = document.getElementById('questionsContainer');
          Object.entries(questionsData).forEach(([key, value]) => {
              const questionBlock = document.createElement('div');
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
      .catch(error => {
          console.error('Error loading questions:', error);
      });
}

// Event Listener: DOMContentLoaded
// Description: Ensures that the DOM is fully loaded before executing scripts.
document.addEventListener('DOMContentLoaded', function() {
  loadQuestions();
  attachFormSubmitListener();
});

// Function: attachFormSubmitListener
// Description: Attaches the event listener to the assessment form for handling form submission.
function attachFormSubmitListener() {
  // Assuming the ID of your form is 'assessmentForm'
  const form = document.getElementById('assessmentForm');
  if (form) {
      form.addEventListener('submit', function(event) {
          event.preventDefault();
          console.log('Form submitted');
          submitAssessment();
      });
  } else {
      console.error('Form not found');
  }
}

// Function: submitAssessment
// Description: Handles the submission of the assessment and calculation of scores.
function submitAssessment() {
  fetch('questions.json')
      .then(response => response.json())
      .then(questionsData => {
          const scores = calculateScores(questionsData);
          const averages = calculateAverages(scores);
          displayResults(averages);
      })
      .catch(error => {
          console.error('Error processing assessment:', error);
      });
}

// Function: calculateScores
// Description: Calculates scores for each group based on the form responses.
function calculateScores(questionsData) {
  const scores = {
      "Trust": [], "Conflict": [], "Results": [], "Accountability": [], "Commitment": []
  };

  Object.entries(questionsData).forEach(([key, value]) => {
      const selectedValue = document.querySelector(`input[name="question${key}"]:checked`)?.value;
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
      const average = groupScores.length > 0 ? groupScores.reduce((a, b) => a + b, 0) / groupScores.length : 0;
      averages[group] = average.toFixed(2); // round to 2 decimal places
  }
  return averages;
}

// Function: displayResults
// Description: Displays the results of the assessment in a SweetAlert modal.
function displayResults(averages) {
  let resultText = '';
  for (const group in averages) {
      resultText += `${group}: ${averages[group]}<br>`;
  }

  Swal.fire({
      title: 'Team Assessment Results',
      html: resultText,
      confirmButtonText: 'Print',
      showCancelButton: true,
      cancelButtonText: 'Close',
      customClass: { confirmButton: "copy-button" },
      //TODO footer: '<a href="interpretation.html">Interpretation of scores</a>'
  }).then((result) => {
      if (result.isConfirmed) {
          window.print();
      }
  });
}
