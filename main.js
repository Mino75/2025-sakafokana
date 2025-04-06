


// ----------------------------
// Service Worker Registration
// ----------------------------
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(() => {
      console.log('Service Worker Registered');
    });
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.action === 'reload') {
        console.log('New version available. Reloading...');
        window.location.reload();
      }
    });
  }
  


// Wrap all code in an IIFE to avoid polluting the global scope 
(function () {
    // Global variables for game state
    let kanaAssociations = [];
    let kanaListHiragana = [];
    let kanaListKatakana = [];
    let mode = null; // "hiragana" or "katakana"
    let questions = [];
    let currentQuestionIndex = 0;
    let correctCount = 0;
  
    const gameContainer = document.getElementById("game-container");
  
    // Helper: Fisher-Yates shuffle algorithm
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
  
    // Display the start screen with mode selection buttons
    function startScreen() {
      gameContainer.innerHTML = "";
      const title = document.createElement("h1");
      title.textContent = "Kana Quiz Game";
      gameContainer.appendChild(title);
  
      const buttonContainer = document.createElement("div");
      buttonContainer.className = "button-container";
  
      const hiraganaBtn = document.createElement("button");
      hiraganaBtn.textContent = "ひらがな";
      hiraganaBtn.onclick = () => startGame("hiragana");
  
      const katakanaBtn = document.createElement("button");
      katakanaBtn.textContent = "カタカナ";
      katakanaBtn.onclick = () => startGame("katakana");
  
      buttonContainer.appendChild(hiraganaBtn);
      buttonContainer.appendChild(katakanaBtn);
      gameContainer.appendChild(buttonContainer);
    }
  
    // Start the game using the selected mode ("hiragana" or "katakana")
    function startGame(selectedMode) {
      mode = selectedMode;
      correctCount = 0;
      currentQuestionIndex = 0;
      // Clone and shuffle the questions array
      questions = kanaAssociations.slice();
      shuffleArray(questions);
      showQuestion();
    }
  
    // Display a question with its answer options
    function showQuestion() {
      if (currentQuestionIndex >= questions.length) {
        showPopup("Congratulations! You completed the quiz! 🎉🎊", "success");
        return;
      }
  
      const currentQuestion = questions[currentQuestionIndex];
      gameContainer.innerHTML = "";
  
      // Create question container (shows emoji and description)
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
  
      const emojiSpan = document.createElement("span");
      emojiSpan.className = "emoji";
      emojiSpan.textContent = currentQuestion.emoji;
  
      const descSpan = document.createElement("span");
      descSpan.className = "description";
      descSpan.textContent = currentQuestion.description;
  
      questionDiv.appendChild(emojiSpan);
      questionDiv.appendChild(descSpan);
      gameContainer.appendChild(questionDiv);
  
      // Get the correct word for the chosen mode
      const correctWord = currentQuestion.word[mode];
      const options = generateOptions(correctWord);
      shuffleArray(options);
  
      const optionsDiv = document.createElement("div");
      optionsDiv.className = "options";
      options.forEach(option => {
        const btn = document.createElement("button");
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, correctWord);
        optionsDiv.appendChild(btn);
      });
      gameContainer.appendChild(optionsDiv);
  
      // Show progress info and earned stars (one star per 10 correct answers)
      const progressDiv = document.createElement("div");
      progressDiv.className = "progress";
      progressDiv.textContent = `Question ${currentQuestionIndex + 1} / ${questions.length} | Stars: ${"⭐".repeat(Math.floor(correctCount / 10))}`;
      gameContainer.appendChild(progressDiv);
    }
  
    // Generate options: the correct answer plus three distractors
    function generateOptions(correctWord) {
      const options = [correctWord];
      const distractors = new Set();
      while (distractors.size < 3) {
        const distractor = generateDistractor(correctWord);
        if (distractor !== correctWord) {
          distractors.add(distractor);
        }
      }
      return options.concat(Array.from(distractors));
    }
  
    // Generate a distractor by shuffling only the first valid character in the correct word
    function generateDistractor(word) {
      const chars = word.split("");
      // Always attempt to change the first character unless it's invalid ("ん" or "ン")
      let indexToReplace = 0;
      if ((mode === "hiragana" && chars[0] === "ん") || (mode === "katakana" && chars[0] === "ン")) {
        // Look for the next valid character
        for (let i = 1; i < chars.length; i++) {
          if ((mode === "hiragana" && chars[i] !== "ん") || (mode === "katakana" && chars[i] !== "ン")) {
            indexToReplace = i;
            break;
          }
        }
      }
      // Use the kana list retrieved from kana.json
      const kanaList = mode === "hiragana" ? kanaListHiragana : kanaListKatakana;
      let newChar = chars[indexToReplace];
      // Choose a different character from the list
      while (newChar === chars[indexToReplace]) {
        newChar = kanaList[Math.floor(Math.random() * kanaList.length)];
      }
      chars[indexToReplace] = newChar;
      return chars.join("");
    }
  
    // Check the answer and proceed accordingly
    function checkAnswer(selected, correct) {
      if (selected === correct) {
        correctCount++;
        currentQuestionIndex++;
        showQuestion();
      } else {
        showPopup("Wrong answer! Try again.", "fail");
      }
    }
  
    // Display an overlay popup message (success or failure)
    function showPopup(message, type) {
      const overlay = document.createElement("div");
      overlay.className = "overlay";
  
      const popup = document.createElement("div");
      popup.className = "popup";
      popup.textContent = message;
  
      const btn = document.createElement("button");
      btn.textContent = type === "fail" ? "Try Again" : "Restart";
      btn.onclick = () => {
        document.body.removeChild(overlay);
        startScreen();
      };
      popup.appendChild(btn);
      overlay.appendChild(popup);
      document.body.appendChild(overlay);
    }
  
    // Load kana data from kana.json, build kana lists, then initialize the game
    document.addEventListener("DOMContentLoaded", () => {
      fetch("kana.json")
        .then(response => response.json())
        .then(data => {
          kanaAssociations = data.kanaAssociations;
          // Build the kana lists from the loaded data
          const hiraganaSet = new Set();
          const katakanaSet = new Set();
          kanaAssociations.forEach(entry => {
            if (entry.kana && entry.kana.hiragana) {
              hiraganaSet.add(entry.kana.hiragana);
            }
            if (entry.kana && entry.kana.katakana) {
              katakanaSet.add(entry.kana.katakana);
            }
          });
          kanaListHiragana = Array.from(hiraganaSet);
          kanaListKatakana = Array.from(katakanaSet);
          startScreen();
        })
        .catch(err => {
          console.error("Error loading kana data:", err);
          gameContainer.innerHTML = "<p>Error loading game data.</p>";
        });
    });
})();
