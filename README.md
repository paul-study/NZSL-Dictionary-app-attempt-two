# 🤟 NZSL Speech to Sign Language Translator

A Progressive Web App (PWA) that converts spoken or typed English into New Zealand Sign Language (NZSL) video demonstrations. Built with Deaf community colors (turquoise, navy blue, and yellow).

**🌐 Live Demo:** [https://tohu.netlify.app/](https://tohu.netlify.app/)

## ✨ Features

- **🎤 Speech Recognition** - Speak naturally and have your words converted to text
- **📝 Text Input** - Type words directly for translation
- **🔄 NZSL Grammar Conversion** - Automatically restructures sentences using NZSL grammar rules:
  - Time words come first (e.g., "tomorrow" moves to start)
  - Adjectives follow nouns (e.g., "red car" → "CAR RED")
  - Negatives come last (e.g., "not" moves to end)
- **🎬 Sign Video Playback** - Watch high-quality videos of each sign
- **▶️ Sign Slideshow** - Play all translated signs in a continuous loop
- **🔍 Search Function** - Search the dictionary of 4,800+ signs
- **💬 Feedback System** - Built-in feedback form powered by EmailJS
- **📲 PWA Install** - Install on mobile or desktop for app-like experience

## 🎨 Design

The app uses official **Deaf community colors**:
- **Turquoise** (#0d9488) - Represents Sign Language and Deaf culture
- **Navy Blue** (#1e3a5f) - Represents Deaf awareness
- **Yellow** (#fbbf24) - Represents light, life, and coexistence

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome recommended for speech recognition)
- Node.js (optional, for running a local server)

### Running Locally

1. Clone the repository
2. Start a local server:
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser to `http://localhost:8080`

### Installing as PWA

- **Mobile (Android/iOS)**: Visit the site → Browser menu → "Add to Home Screen"
- **Desktop (Chrome/Edge)**: Click the install icon (⊕) in the address bar

## 📁 Project Structure

```
NZSL-Dictionary/
├── index.html          # Main HTML file with SEO & schema markup
├── styles.css          # CSS styles with Deaf community colors
├── app.js              # Main JavaScript application
├── sw.js               # Service Worker for PWA installation
├── manifest.json       # PWA manifest
├── signs-index.json    # Pre-built index of 4,800+ signs
├── sitemap.xml         # SEO sitemap
├── robots.txt          # SEO robots file
├── generate-index.js   # Script to regenerate the sign index
├── scrape.js           # Original data scraping script
├── data/               # JSON files with sign metadata
└── image/              # Sign illustration images
```

## 🛠️ Technologies Used

- **HTML5/CSS3/JavaScript** - Frontend
- **Web Speech API** - Speech recognition
- **Compromise NLP** - Natural language processing for grammar conversion
- **EmailJS** - Feedback form email delivery
- **PWA** - Progressive Web App for installation

## 📖 NZSL Grammar Rules

The app applies these NZSL grammar transformations:

| Rule | English | NZSL Gloss |
|------|---------|------------|
| Time First | "I will go home tomorrow" | "TOMORROW ME GO HOME" |
| Adjectives After | "The red car" | "CAR RED" |
| Negatives Last | "I don't want food" | "ME WANT FOOD NOT" |
| Pronoun Simplification | "I", "my", "mine" | "ME" |

## 📊 Data Source

Sign data is sourced from the [NZSL Online Dictionary](https://www.nzsl.nz/), maintained by the Deaf Studies Research Unit at Victoria University of Wellington.

Videos are loaded from the official NZSL media server.

## 📹 Where are the videos?

GitHub doesn't support hosting large video files, so videos are streamed from the official NZSL media server. A complete copy of the dataset including videos is available from Archive: [https://archive.org/details/nzsl-dict-2018-11-14](https://archive.org/details/nzsl-dict-2018-11-14)

## 📜 License

- **NZSL Dictionary content**: [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License](https://creativecommons.org/licenses/by-nc-sa/3.0/)
- **App code** (scrape.js, app.js, etc.): Public domain

## 🙏 Acknowledgments

- Deaf Studies Research Unit, Victoria University of Wellington
- NZSL Online Dictionary team
- Tohu Korero

---

© 2025 Tohu Korero. All rights reserved.
