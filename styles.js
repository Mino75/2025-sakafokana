// Define preset background colors and pick one randomly
const backgroundOptions = ['#FF8F00', '#D32F2F', '#388E3C', '#1976D2', '#7B1FA2'];
const selectedBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];

// Define CSS as a string – dark mode with a theme color included (blue)
const css = `
  body {
    background-color: ${selectedBackground};
    color: #e0e0e0;
    font-family: sans-serif;
    margin: 0;
    padding: 20px;
  }
  #game-container {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }
  h1 {
    margin-bottom: 30px;
  }
  button {
    background-color: #1e88e5;
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 10px;
    border-radius: 5px;
    font-size: 2rem;
  }
  button:hover {
    background-color: #1565c0;
    cursor: pointer;
  }
  .button-container {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
  .options button {
    display: block;
    width: 80%;
    margin: 10px auto;
  }
  .question {
    margin: 20px 0;
    font-size: 1.5rem;
  }
   .sound-emoji {
    font-size: 2rem;
    cursor: pointer;
    display: inline-block;
    margin-left: 10px;
    transition: transform 0.2s ease;
    user-select: none;
  }
  .sound-emoji:hover {
    transform: scale(1.2);
  }
  .sound-emoji:active {
    transform: scale(0.9);
  }
  .emoji {
    font-size:10rem;
    display: block;
    margin-bottom: 10px;
  }
  .progress {
    margin-top: 20px;
    font-size: 1rem;
  }
  .overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .popup {
    background: #333;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    animation: flash 1s infinite;
  }
  @keyframes flash {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

// Inject CSS into the page by creating a <style> tag
const styleTag = document.createElement("style");
styleTag.innerHTML = css;
document.head.appendChild(styleTag);
