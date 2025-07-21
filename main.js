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

// Wrap all code in an IIFE
(function () {
  // Game state
  let kanaAssociations = [];
  let sakaAssociations = [];
  let kanaListHiragana = [];
  let kanaListKatakana = [];
  let mode = null; // "hiragana", "katakana", or "sakafokana"
  let questions = [];
  let currentQuestionIndex = 0;
  let correctCount = 0;

  const gameContainer = document.getElementById("game-container");

  // Fisher-Yates shuffle
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Render start screen
  function startScreen() {
    gameContainer.innerHTML = "";
    const title = document.createElement("h1");
    title.textContent = "🍎SakafoKana Quiz ";
    gameContainer.appendChild(title);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container";

    const hiraganaBtn = document.createElement("button");
    hiraganaBtn.textContent = "🍉ひらがな";
    hiraganaBtn.disabled = kanaAssociations.length === 0;
    hiraganaBtn.onclick = () => startGame("hiragana");

    const katakanaBtn = document.createElement("button");
    katakanaBtn.textContent = "🌶️カタカナ";
    katakanaBtn.disabled = kanaAssociations.length === 0;
    katakanaBtn.onclick = () => startGame("katakana");

    const sakaBtn = document.createElement("button");
    sakaBtn.textContent = "🍚サカフカナ";
    sakaBtn.disabled = sakaAssociations.length === 0;
    sakaBtn.onclick = () => startGameSakafokana();

    buttonContainer.append(hiraganaBtn, katakanaBtn, sakaBtn);
    gameContainer.appendChild(buttonContainer);
  }

  // Original modes
  function startGame(selectedMode) {
    mode = selectedMode;
    correctCount = 0;
    currentQuestionIndex = 0;
    questions = kanaAssociations.slice();
    shuffleArray(questions);
    showQuestion();
  }

  function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
      return showPopup("Congratulations! 🍍 You completed the quiz! 🎉🎊", "success");
    }
    const current = questions[currentQuestionIndex];
    renderPrompt(current.emoji, current.description);
    const correctWord = current.word[mode];
    const options = generateOptions(correctWord);
    shuffleArray(options);
    renderOptions(options, selected => {
      if (selected === correctWord) {
        correctCount++;
        currentQuestionIndex++;
        showQuestion();
      } else {
        showPopup(`Wrong answer! Correct answer: ${correctWord} 😝 Try again.`, "fail");
      }
    });
    renderProgress(questions.length);
  }

  // Sakafokana mode
  function startGameSakafokana() {
    mode = "sakafokana";
    correctCount = 0;
    currentQuestionIndex = 0;
    // build flat list
    questions = sakaAssociations.flatMap(entry => [
      { type: "hiragana", word: entry.kana.hiragana, emoji: entry.emoji, description: entry.foodsentence1 },
      { type: "katakana", word: entry.kana.katakana, emoji: entry.emoji, description: entry.foodsentence2 }
    ]);
    shuffleArray(questions);
    showSakaQuestion();
  }

  function showSakaQuestion() {
    if (currentQuestionIndex >= questions.length) {
      return showPopup("Great job! 🍧 You've gone through all Sakafokana!  🎉", "success");
    }
    const q = questions[currentQuestionIndex];
    renderPrompt(q.emoji, q.description);
    // temporarily set mode for distractors
    const prev = mode;
    mode = q.type;
    const opts = generateOptions(q.word);
    mode = prev;
    shuffleArray(opts);
    renderOptions(opts, selected => {
      if (selected === q.word) {
        correctCount++;
        currentQuestionIndex++;
        showSakaQuestion();
      } else {
        showPopup(`Wrong answer! Right answer: ${q.word} 😅 Try again.`, "fail");
      }
    });
    renderProgress(questions.length);
  }

  // UI helpers
  function renderPrompt(emoji, desc) {
    gameContainer.innerHTML = "";
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<span class=\"emoji\">${emoji}</span><span class=\"description\">${desc}</span>`;
    gameContainer.appendChild(div);
  }

  function renderOptions(options, onClick) {
    const div = document.createElement("div");
    div.className = "options";
    options.forEach(o => {
      const btn = document.createElement("button");
      btn.textContent = o;
      btn.onclick = () => onClick(o);
      div.appendChild(btn);
    });
    gameContainer.appendChild(div);
  }

  function renderProgress(total) {
    const stars = "⭐".repeat(Math.floor(correctCount / 10));
    const div = document.createElement("div");
    div.className = "progress";
    div.textContent = `Question ${currentQuestionIndex+1} / ${total}` + (stars ? ` | Stars: ${stars}` : '');
    gameContainer.appendChild(div);
  }

  // Option generation
  function generateOptions(correctWord) {
    const opts = [correctWord];
    const set = new Set();
    while (set.size < 3) {
      const d = generateDistractor(correctWord);
      if (d !== correctWord) set.add(d);
    }
    return opts.concat([...set]);
  }

  function generateDistractor(word) {
    const chars = word.split("");
    let idx = 0;
    if ((mode === "hiragana" && chars[0] === "ん") || (mode === "katakana" && chars[0] === "ン")) {
      for (let i=1; i<chars.length; i++) {
        if ((mode==="hiragana"&&chars[i]!="ん")||(mode==="katakana"&&chars[i]!="ン")) { idx=i; break; }
      }
    }
    const pool = mode==="hiragana"?kanaListHiragana:kanaListKatakana;
    let c = chars[idx];
    while (c===chars[idx]) { c = pool[Math.floor(Math.random()*pool.length)]; }
    chars[idx] = c;
    return chars.join("");
  }

  // Popup
  function showPopup(msg, type) {
    const overlay = document.createElement("div"); overlay.className="overlay";
    const pop = document.createElement("div"); pop.className="popup"; pop.textContent=msg;
    const btn = document.createElement("button");
    btn.textContent = type==="fail"?"Try Again":"Restart";
    btn.onclick = ()=>{document.body.removeChild(overlay); startScreen();};
    pop.appendChild(btn); overlay.appendChild(pop); document.body.appendChild(overlay);
  }

  // Load JSON data
  document.addEventListener("DOMContentLoaded", ()=>{
    const p1 = fetch("kana.json").then(r=>r.json()).catch(_=>[]);
    const p2 = fetch("sakafokana.json").then(r=>r.json()).catch(_=>({kanaEntries:[]}));
    Promise.all([p1,p2]).then(([kData,sData])=>{
      kanaAssociations = kData.kanaAssociations||kData;
      const h=new Set(),k=new Set(); kanaAssociations.forEach(e=>{h.add(e.kana.hiragana);k.add(e.kana.katakana)});
      kanaListHiragana=[...h]; kanaListKatakana=[...k];
      sakaAssociations = sData.kanaEntries;
      startScreen();
    });
  });
})();
