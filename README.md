# 🇹🇭 Thai Flashcards

A lightweight, standalone web application for learning Thai vocabulary and phrases. It features category filtering, progress tracking (learned vs. hard cards), daily streaks, and text-to-speech audio.

## 📁 Project Structure

- `src/`: Source code directory.
  - `index.html`: The main structure of the app.
  - `css/styles.css`: Visual styling and responsive design.
  - `data/flashcards.js`: The vocabulary dataset (stored as a JS variable for local compatibility).
  - `js/app.js`: Application logic (rendering, filtering, and state management).
- `bundle.js`: A build script to compile the app into a single file.
- `dist/`: Output directory for the bundled application.

## 🚀 Local Development

Since the project uses standard JavaScript variables to store data, you can develop locally by simply opening `src/index.html` in any web browser. No local server is required.

## 📦 Bundling for Mobile

If you want to use the app on your phone as a single standalone file, you can "compile" it using the provided bundler.

### 1. Requirements
- [Node.js](https://nodejs.org/) installed on your computer.

### 2. Run the Bundler
Execute the following command in your terminal from the project root:

```bash
node bundle.js
```

### 3. Output
The script will create a new file:
`dist/thai-flashcards-mobile.html`

This file contains the HTML, CSS, and JavaScript all in one. You can send this single file to your phone (via AirDrop, Email, or Cloud Storage) and open it directly in a mobile browser.

## 🔊 Audio Support
The app uses the **Web Speech API**. 
- **Desktop:** Works automatically in most modern browsers.
- **Mobile:** Ensure you have a Thai voice downloaded in your phone's system settings (usually under Accessibility > Spoken Content or Language/Region settings) for the best experience.

## 💾 Progress Saving
Progress is saved automatically to your browser's `localStorage`. If you use the bundled file, your progress is tied to that specific file/URL in your mobile browser.
