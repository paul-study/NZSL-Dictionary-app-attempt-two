# 🤟 NZSL Speech to Sign Language Translator

A web application that converts spoken or typed English into New Zealand Sign Language (NZSL) video demonstrations.

## Features

- **Speech Recognition** - Speak naturally and have your words converted to text
- **NZSL Grammar Conversion** - Automatically restructures sentences using NZSL grammar rules:
  - Time words come first
  - Adjectives follow nouns
  - Negatives come last
- **Sign Video Playback** - Watch high-quality videos of each sign
- **Sign Slideshow** - Play all translated signs in a continuous loop
- **Search Function** - Search the dictionary for specific signs
- **Feedback System** - Built-in feedback form to share ideas and suggestions

## Getting Started

### Prerequisites

- A modern web browser (Chrome recommended for speech recognition)
- Node.js (for running the local server)

### Running the App

1. Open a terminal in the project directory
2. Start the local server:
   ```bash
   npx http-server -p 8080
   ```
3. Open your browser to `http://localhost:8080`

## Project Structure

```
NZSL-Dictionary/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js              # Main JavaScript application
├── signs-index.json    # Pre-built index of all signs
├── generate-index.js   # Script to regenerate the index
├── scrape.js           # Original data scraping script
├── data/               # JSON files with sign metadata
├── image/              # Sign illustration images
└── video/              # Sign demonstration videos (optional)
```

## Data Source

Sign data is sourced from the [NZSL Online Dictionary](https://www.nzsl.nz/), maintained by the Deaf Studies Research Unit at Victoria University of Wellington.

Videos are loaded from the official NZSL media server.

## Technologies Used

- **HTML5/CSS3/JavaScript** - Frontend
- **Web Speech API** - Speech recognition
- **Compromise NLP** - Natural language processing for grammar conversion
- **EmailJS** - Feedback form email delivery

## NZSL Grammar Rules

The app applies these NZSL grammar transformations:

1. **Time First**: "I will go home tomorrow" → "TOMORROW ME GO HOME"
2. **Adjectives After Nouns**: "The red car" → "CAR RED"
3. **Negatives Last**: "I don't want food" → "ME WANT FOOD NOT"
4. **Pronoun Simplification**: "I", "my", "mine" → "ME"

## License

NZSL Dictionary content is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

## Acknowledgments

- Deaf Studies Research Unit, Victoria University of Wellington
- NZSL Online Dictionary team
      // established signs are listed with a nzsl_id number, and classifier
      // signs are listed as a string in the format cl:plain-text-gloss
      // refer to https://nzsl.vuw.ac.nz/classifiers/ for info on classifier signs
      // and note, most usage videos in this collection do not include classifier
      "signs": [2297, 3382, "cl:get-on-horse", 4581, 676, "cl:fall-off-horse"],
      // an explanation of the meaning of the usage video, in English.
      "translation": "He mounted a horse but lost his balance and fell off."
   
  // attributes of the sign. You can expect a handshape and a location to be
  // listed and can treat these filenames as unique id's for each position and
  // handshape. the images can be found in /image/handshape.1.1.1-...png etc
  "attributes": {
    "handshapes": ["handshape.1.1.1-f5d9aca796fcb8a045553fa69be32b9a3f2cb2abcbe9639923f8a00189ea3da8.png"],
    "locations": ["location.1.1.in_front_of_body-9dd4eb3a77c2bc0fc515de633c0b0cc4d5b11fb1cabcb2d5578dc9d7a8b03ff2.png"]
  },
  // black and white cartoon illustration of the sign, available in /image/
  "image": "balance-676.png"

```

Where are the videos?!
======================

Github doesn't love having gigabytes of files synced to it, so I've excluded the
contents of /video/ from the repo. A complete copy of the dataset including
video is available from Archive: https://archive.org/details/nzsl-dict-2018-11-14

Copyright
=========

This dictionary dataset is originally and continues to be released under
Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
https://creativecommons.org/licenses/by-nc-sa/3.0

scrape.js source code and associated data structures are released as public
domain.
