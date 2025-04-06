// Define CSS as a string – dark mode with a theme color included (blue)
const css = `
  body {
    background-color: #121212;
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
    font-size: 1rem;
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
  .emoji {
    font-size:20rem;
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
