# 🍜 SakafoKana

## 📋 Table of Contents
- [📖 About](#-about)
- [🚀 Getting Started](#-getting-started)
- [🔨 How to Build / How to Run](#-how-to-build--how-to-run)
- [🏗️ Project Structure](#️-project-structure)
- [🎯 Features](#-features)
- [🎮 How to Play](#-how-to-play)
- [🐳 Docker Deployment](#-docker-deployment)
- [📚 Data Files](#-data-files)
- [📄 License](#-license)

## 📖 About
SakafoKana ( sakafo = food/meal in MG and kana from JP) is an educational Progressive Web App for learning Japanese Kana (Hiragana and Katakana) through food-related vocabulary. The app combines language learning with cultural education, featuring speech synthesis for pronunciation practice and interactive quizzes to reinforce learning.

## 🚀 Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm package manager
- Modern web browser with speech synthesis support

### 📦 Installation
```bash
git clone <repository-url>
cd sakafokana
npm install
```

## 🔨 How to Build / How to Run

### Development Mode
```bash
# Start the development server
node server.js
```
The application will be available at `http://localhost:3000`

### Production Mode
```bash
# Install dependencies
npm install

# Start the production server
node server.js
```

## 🏗️ Project Structure
```
sakafokana/
├── index.html          # Main application HTML structure
├── main.js             # Quiz logic, speech synthesis, and game mechanics
├── styles.js           # Dynamic styling and responsive UI
├── server.js           # Express server configuration
├── manifest.json       # PWA manifest for mobile installation
├── kana.json           # Kana character data (hiragana/katakana)
├── sakafokana.json     # Food vocabulary and associations
├── dockerfile          # Docker containerization
├── package.json        # Project dependencies
├── .gitignore          # Git ignore patterns
└── .github/workflows/  # CI/CD automation
    └── main.yml        # Docker build and deployment
```

## 🎯 Features
- **Dual Kana Learning**: Interactive quizzes for both Hiragana and Katakana
- **Food Vocabulary**: Learn Japanese through culturally relevant food terms
- **Speech Synthesis**: Hear correct pronunciation of words (🔊 button)
- **Progressive Difficulty**: Adaptive learning with increasing complexity
- **Score Tracking**: Star-based progress system
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Full functionality without internet
- **Responsive Design**: Optimized for all device sizes

## 🎮 How to Play

### Game Modes
1. **Hiragana Mode**: Practice reading hiragana characters
2. **Katakana Mode**: Practice reading katakana characters  
3. **Sakafokana Mode**: Learn food vocabulary with pronunciation

### Controls
- **Select Answer**: Tap/click on the correct option
- **Listen to Pronunciation**: Click the 🔊 speaker icon
- **Progress Tracking**: Earn stars for every 10 correct answers

## 🐳 Docker Deployment

### Build and Run
```bash
# Build Docker image
docker build -t sakafokana:latest .

# Run container
docker run -p 3000:3000 sakafokana:latest
```

### Environment
- **Base Image**: Node.js 22 Alpine
- **Port**: 3000
- **Volume**: Application files

## 📚 Data Files

### kana.json
Contains kana character associations:
```json
{
  "kanaAssociations": [
    {
      "kana": {
        "hiragana": "あ",
        "katakana": "ア"
      },
      "emoji": "🍎",
      "description": "apple"
    }
  ]
}
```

### sakafokana.json
Contains food vocabulary data:
```json
{
  "kanaEntries": [
    {
      "kana": {
        "hiragana": "りんご",
        "katakana": "リンゴ"
      },
      "emoji": "🍎",
      "foodsentence1": "苹果",
      "foodsentence2": "apple"
    }
  ]
}
```

## 📄 License
MIT License - see LICENSE file for details.
