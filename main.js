


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
    let sakaAssociations = [];
    let kanaListHiragana = [];
    let kanaListKatakana = [];
    let mode = null; // "hiragana" or "katakana" or "sakafokana"
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
      hiraganaBtn.textContent = "🍒 ひらがな";
      hiraganaBtn.disabled = kanaAssociations.length === 0;
      hiraganaBtn.onclick = () => startGame("hiragana");
  
      const katakanaBtn = document.createElement("button");
      katakanaBtn.textContent = "🍉 カタカナ  ";
      katakanaBtn.disabled = kanaAssociations.length === 0;
      katakanaBtn.onclick = () => startGame("katakana");

      const sakafokanaBtn = document.createElement("button");
      sakafokanaBtn.textContent = "🌶️ サカフカナ  ";
      sakafokanaBtn.disabled = sakaAssociations.length === 0;
      sakafokanaBtn.onclick = () => startGameSakafokana();
        
      buttonContainer.appendChild(hiraganaBtn);
      buttonContainer.appendChild(katakanaBtn);
      buttonContainer.appendChild(sakafokanaBtn);
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

    //  startGameSakafokana for sakafokana.json
    function startGameSakafokana() {
      mode = "sakafokana";
      correctCount = 0;
      currentQuestionIndex = 0;
      // Build combined questions
      const flat = [];
      sakaAssociations.forEach(entry => {
        flat.push({ type: "hiragana",  word: entry.kana.hiragana, emoji: entry.emoji, description: entry.foodsentence1 });
        flat.push({ type: "katakana",  word: entry.kana.katakana, emoji: entry.emoji, description: entry.foodsentence2 });
      });
      questions = flat;
      shuffleArray(questions);
      showSakaQuestion();
    }

// Show question for sakafokana mode
    function showSakaQuestion() {
      if (currentQuestionIndex >= questions.length) {
        showPopup("Great job! You've gone through all kana! 🎉", "success");
        return;
      }
      const q = questions[currentQuestionIndex];
      gameContainer.innerHTML = "";
      const questionDiv = document.createElement("div");
      questionDiv.className = "question";
      questionDiv.innerHTML = `
        <span class="emoji">${q.emoji}</span>
        <span class="description">${q.description}</span>
      `;
      gameContainer.appendChild(questionDiv);
      // generate options with correct list
      const prevMode = mode;
      mode = q.type;
      let opts = generateOptions(q.word);
      mode = prevMode;
      shuffleArray(opts);
      renderOptions(opts, answer => {
        if (answer === q.word) {
          correctCount++;
          currentQuestionIndex++;
          showSakaQuestion();
        } else {
          showPopup("Wrong answer! Try again.", "fail");
        }
      });
      renderProgress();
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
  
    // Load both JSON files, handle errors independently
    document.addEventListener("DOMContentLoaded", () => {
      const pKana = fetch("kana.json").then(r => r.json()).catch(err => {
        console.error("Failed loading kana.json:", err);
        kanaAssociations = []; return [];
      });
      const pSaka = fetch("sakafokana.json").then(r => r.json()).catch(err => {
        console.error("Failed loading sakafokana.json:", err);
        sakaAssociations = []; return { kanaEntries: [] };
      });
      Promise.all([pKana, pSaka]).then(([kanaData, sakaData]) => {
        kanaAssociations = kanaData.kanaAssociations || kanaData;
        const h = new Set(), k = new Set();
        kanaAssociations.forEach(e => { h.add(e.kana.hiragana); k.add(e.kana.katakana); });
        kanaListHiragana = Array.from(h);
        kanaListKatakana = Array.from(k);
        sakaAssociations = sakaData.kanaEntries;
        startScreen();
      });

        
    });
})();
