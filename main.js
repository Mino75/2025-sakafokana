// Wrap all code in an IIFE
(function () {
  // Game state
  let kanaAssociations = [];
  let sakaAssociations = [];
  let kanjimachiroEntries = [];

  let kanaListHiragana = [];
  let kanaListKatakana = [];

  let kanjimachiroPool = []; // pool of displayed radical strings

  let mode = null; // "hiragana", "katakana", "sakafokana", "kanjimachiro"
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

  // Hash routing
  function setRoute(route) {
    // route like "#hiragana"
    if (location.hash !== route) location.hash = route;
  }

  function getRoute() {
    const h = (location.hash || "").trim().toLowerCase();
    // support "#/hiragana" or "#hiragana"
    if (h.startsWith("#/")) return "#" + h.slice(2);
    return h;
  }

  function routeFromHash() {
    const r = getRoute();
    if (r === "#hiragana") return startGame("hiragana");
    if (r === "#katakana") return startGame("katakana");
    if (r === "#sakafokana") return startGameSakafokana();
    if (r === "#kanjimachiro") return startGameKanjimachiro();
    // default screen if no route
    return startScreen();
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
    hiraganaBtn.onclick = () => setRoute("#hiragana");

    const katakanaBtn = document.createElement("button");
    katakanaBtn.textContent = "🌶️カタカナ";
    katakanaBtn.disabled = kanaAssociations.length === 0;
    katakanaBtn.onclick = () => setRoute("#katakana");

    const sakaBtn = document.createElement("button");
    sakaBtn.textContent = "🍚サカフカナ";
    sakaBtn.disabled = sakaAssociations.length === 0;
    sakaBtn.onclick = () => setRoute("#sakafokana");

    const kanjiBtn = document.createElement("button");
    kanjiBtn.textContent = "🀄カンジマチロ";
    kanjiBtn.disabled = kanjimachiroEntries.length === 0;
    kanjiBtn.onclick = () => setRoute("#kanjimachiro");

    buttonContainer.append(hiraganaBtn, katakanaBtn, sakaBtn, kanjiBtn);
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
    const options = generateOptionsKana(correctWord);

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
    renderPromptWithSpeech(q.emoji, q.description, q.word);

    const prev = mode;
    mode = q.type;
    const opts = generateOptionsKana(q.word);
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

  // Kanjimachiro mode
  function startGameKanjimachiro() {
    mode = "kanjimachiro";
    correctCount = 0;
    currentQuestionIndex = 0;

    // questions are entries, shuffled
    questions = kanjimachiroEntries.slice();
    shuffleArray(questions);
    showKanjimachiroQuestion();
  }

  function showKanjimachiroQuestion() {
    if (currentQuestionIndex >= questions.length) {
      return showPopup("Mission accomplished 🀄 — all radicals validated!", "success");
    }

    const q = questions[currentQuestionIndex];

    // Prompt: emoji + FR + meta (strokes + pinyin)
    renderPrompt(
      q.emoji || "🀄",
      `${q.fr} — ${q.strokeCount} trait${q.strokeCount > 1 ? "s" : ""} — ${q.pinyin}`
    );

    const correct = q.display; // string shown in options
    const opts = generateOptionsKanjimachiro(correct);

    shuffleArray(opts);
    renderOptions(opts, selected => {
      if (selected === correct) {
        correctCount++;
        currentQuestionIndex++;
        showKanjimachiroQuestion();
      } else {
        showPopup(`Incorrect. Correct answer: ${correct} 😅`, "fail");
      }
    });

    renderProgress(questions.length);
  }

  // UI helpers
  function renderPrompt(emoji, desc) {
    gameContainer.innerHTML = "";
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `<span class="emoji">${emoji}</span><span class="description">${desc}</span>`;
    gameContainer.appendChild(div);
  }

  // function for Sakafokana mode with speech
  function renderPromptWithSpeech(emoji, desc, kanaChar) {
    gameContainer.innerHTML = "";
    const div = document.createElement("div");
    div.className = "question";

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "emoji";
    emojiSpan.textContent = emoji;

    const descSpan = document.createElement("span");
    descSpan.className = "description";
    descSpan.textContent = desc;

    const soundEmoji = document.createElement("span");
    soundEmoji.innerHTML = " 🔊";
    soundEmoji.className = "sound-emoji";
    soundEmoji.title = `Écouter la prononciation : ${desc}`;
    soundEmoji.onclick = () => speakChinese(desc);

    div.appendChild(emojiSpan);
    div.appendChild(descSpan);
    div.appendChild(soundEmoji);
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
    div.textContent = `Question ${currentQuestionIndex + 1} / ${total}` + (stars ? ` | Stars: ${stars}` : "");
    gameContainer.appendChild(div);
  }

  // Option generation — Kana
  function generateOptionsKana(correctWord) {
    const opts = [correctWord];
    const set = new Set();
    while (set.size < 3) {
      const d = generateDistractorKana(correctWord);
      if (d !== correctWord) set.add(d);
    }
    return opts.concat([...set]);
  }

  function generateDistractorKana(word) {
    const chars = word.split("");
    let idx = 0;
    if ((mode === "hiragana" && chars[0] === "ん") || (mode === "katakana" && chars[0] === "ン")) {
      for (let i = 1; i < chars.length; i++) {
        if ((mode === "hiragana" && chars[i] !== "ん") || (mode === "katakana" && chars[i] !== "ン")) { idx = i; break; }
      }
    }
    const pool = mode === "hiragana" ? kanaListHiragana : kanaListKatakana;
    let c = chars[idx];
    while (c === chars[idx]) { c = pool[Math.floor(Math.random() * pool.length)]; }
    chars[idx] = c;
    return chars.join("");
  }

  // Option generation — Kanjimachiro (radicals)
  function generateOptionsKanjimachiro(correct) {
    const opts = [correct];
    const set = new Set();
    while (set.size < 3) {
      const pick = kanjimachiroPool[Math.floor(Math.random() * kanjimachiroPool.length)];
      if (pick !== correct) set.add(pick);
    }
    return opts.concat([...set]);
  }

  // Popup
  function showPopup(msg, type) {
    const overlay = document.createElement("div"); overlay.className = "overlay";
    const pop = document.createElement("div"); pop.className = "popup"; pop.textContent = msg;
    const btn = document.createElement("button");
    btn.textContent = type === "fail" ? "Try Again" : "Restart";
    btn.onclick = () => {
      document.body.removeChild(overlay);
      // keep route unless user wants home: here we go back to start screen and clear hash
      location.hash = "";
      startScreen();
    };
    pop.appendChild(btn); overlay.appendChild(pop); document.body.appendChild(overlay);
  }

  // Speech synthesis function
  function speakChinese(chineseText) {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(chineseText);
      utterance.lang = "zh-CN";
      utterance.rate = 0.7;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    } else {
      console.log("Speech synthesis not supported");
    }
  }

  // Load JSON data
  document.addEventListener("DOMContentLoaded", () => {
    const p1 = fetch("kana.json").then(r => r.json()).catch(_ => []);
    const p2 = fetch("sakafokana.json").then(r => r.json()).catch(_ => ({ kanaEntries: [] }));
    const p3 = fetch("kanjimachiro.json").then(r => r.json()).catch(_ => ({ entries: [] }));

    Promise.all([p1, p2, p3]).then(([kData, sData, kmData]) => {
      kanaAssociations = kData.kanaAssociations || kData;
      const h = new Set(), k = new Set();
      kanaAssociations.forEach(e => { h.add(e.kana.hiragana); k.add(e.kana.katakana); });
      kanaListHiragana = [...h];
      kanaListKatakana = [...k];

      sakaAssociations = sData.kanaEntries || [];

      kanjimachiroEntries = (kmData.entries || []).map(e => ({
        strokeCount: e.strokeCount,
        pinyin: e.pinyin,
        fr: e.fr,
        display: e.display,
        emoji: e.emoji
      }));

      kanjimachiroPool = kanjimachiroEntries.map(e => e.display);

      // route at start + listen for changes (pseudo-intent)
      window.addEventListener("hashchange", routeFromHash);
      routeFromHash();
    });
  });
})();
