

let currentQuiz =null;
let currentQuestionIndex=0;
let userAnswers=[];



function loadQuizzes() {
 // Försök läsa tidigare sparade quiz från localstorage
  const stored = localStorage.getItem("quizzes");

  if (stored) {
    const quizzesArray =JSON.parse(stored);
    renderQuizList(quizzesArray);
  } else {
    //Om det inte finns i localstorage hämtar vi från JSON-filen
    fetch("quizzes.json")
      .then(res => res.json())
      .then(data => {
        const quizzesArray=data.quizzes;
        localStorage.setItem("quizzes", JSON.stringify(quizzesArray));
        //Rita upp quiz-listan
        renderQuizList(quizzesArray);
      })
      .catch(err => console.error("Kunde inte ladda quizzes.json", err));
  }
}


//Rita upp knapparna på startsidan, en knapp per quiz
function renderQuizList(quizzesArray){

    const quizList= document.getElementById("quiz-list");
    //Töm eventuell gammal HTML innan vi lägger till nya knappar
    quizList.innerHTML ="";
    //Loopa igenom alla quiz i arrayen
    quizzesArray.forEach((quiz, index) => {
        const btn = document.createElement("button");
        //Visa bara quiz-titeln på knappen
        btn.textContent = quiz.title;

        
        //anropa startQuiz
        btn.addEventListener("click", () => {
            startQuiz(index, quizzesArray);
        });

        quizList.appendChild(btn);
        
    });
}



function startQuiz(index, quizzes){
    //Spara vilket quiz som är aktivt
    currentQuiz = quizzes[index];
    //Börja med först fråga
    currentQuestionIndex =0;
    //userAnswers blir en array med lika många platser som quizs frågor. Alla värden är början null.
    userAnswers = new Array(currentQuiz.questions.length).fill(null);

    //Spara det aktuella quizet i localstorage 
    localStorage.setItem("currentQuiz", JSON.stringify(currentQuiz));

    //Göm quiz-listan(startsidan)
    document.getElementById("quiz-list-section").classList.add("hidden");
    //Visa quiz
    document.getElementById("quiz-section").classList.remove("hidden");
    //Sätt quiz-titel i rubriken
    document.getElementById("quiz-title").textContent=currentQuiz.title;

    showQuestion();


}


function showQuestion(){
    //Hämta frågor utifrån index
    const questions = currentQuiz.questions[currentQuestionIndex];
    const container =document.getElementById("question-container");
    const progress = document.getElementById("quiz-progress");

    //Uppdatera text: Fråga x av y
    progress.textContent = `Fråga ${currentQuestionIndex + 1} av ${currentQuiz.questions.length}`;

    //Töm frågehållaren innan vi lägger in ny fråga
    container.innerHTML= "";

    const p = document.createElement("p");
    p.textContent=questions.text;
    container.appendChild(p);

    //Skapa ett label + radio-knapp
    questions.options.forEach((opt, i) =>{
        const label=document.createElement("label");
        label.className="option-item";

        label.innerHTML = `
            <input type="radio" name="question" value="${i}">
            ${opt.text}
            `;

        
        const input = label.querySelector("input");
        input.addEventListener("change", () => {
            //Spara vilket alternativ användaren valt fär den här frågan
            userAnswers[currentQuestionIndex] = i;

              // Ta bort tidigare färgmarkeringar från alternativ
        const allaLabels = container.querySelectorAll(".option-item");
        allaLabels.forEach(l => {
            l.classList.remove("option-correct");
            l.classList.remove("option-wrong");
        });

        // Markera rätt/fel
        if (opt.isCorrect) {
            label.classList.add("option-correct"); // korrekt = grön
        } else {
            label.classList.add("option-wrong");   // fel = röd

            // Markera korrekt svar också
            questions.options.forEach((rättOpt, j) => {
                if (rättOpt.isCorrect) {
                    container.querySelectorAll(".option-item")[j].classList.add("option-correct");
                }
            });
        }

    });

    container.appendChild(label);
    });

    const nextBtn=document.getElementById("next-btn");
    const submitBtn=document.getElementById("submit-btn");

    //Om vi är på sista frågan, göm "Nästa", visa "Visa resultat", conditional rendering
    if(currentQuestionIndex== currentQuiz.questions.length -1){
        nextBtn.classList.add("hidden");
        submitBtn.classList.remove("hidden");

    }else {
        nextBtn.classList.remove("hidden");
        submitBtn.classList.add("hidden");
    }
}

function goToNextQuestion() {
  if (userAnswers[currentQuestionIndex] == null) {
    alert("Välj ett svar först.");
    return;
  }

  currentQuestionIndex++;
  showQuestion();
}


function submitQuiz() {
  if (userAnswers[currentQuestionIndex] == null) {
        alert("Välj ett svar först.");
        return;
  }

  let correct = 0;
  //Gå igenom alla frågor och räkna hur många som är rätt
  currentQuiz.questions.forEach((q, index) => {
    const userIndex = userAnswers[index];
    if (userIndex != null && q.options[userIndex].isCorrect) {
      correct++;
    }
  });

  const total = currentQuiz.questions.length;
  const percent = Math.round((correct / total) * 100);

  document.getElementById("quiz-section").classList.add("hidden");
  document.getElementById("result-section").classList.remove("hidden");

    const resultText = document.getElementById("result-text");
    resultText.textContent = `Du fick ${correct} av ${total} rätt (${percent}%).`;
}


function backToList() {
  document.getElementById("quiz-section").classList.add("hidden");
  document.getElementById("result-section").classList.add("hidden");
  document.getElementById("quiz-list-section").classList.remove("hidden");
}

function restart() {
  backToList();
}




document.addEventListener("DOMContentLoaded", () => {
    loadQuizzes();
 //Hämta knapper och lyssnar på klick
  document.getElementById("next-btn").addEventListener("click", goToNextQuestion);
  document.getElementById("submit-btn").addEventListener("click", submitQuiz);
  document.getElementById("restart-btn").addEventListener("click", restart);
  document.getElementById("back-btn").addEventListener("click", backToList);

  }); 