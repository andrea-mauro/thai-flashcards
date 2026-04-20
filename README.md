# 🇹🇭 Thai Flashcards

A lightweight, standalone web application for learning Thai vocabulary and phrases. It features category filtering, progress tracking (learned vs. hard cards), daily streaks, and text-to-speech audio.

## 📁 Project Structure

- `src/`: Source code directory.
  - `index.html`: The main structure of the app.
  - `css/styles.css`: Visual styling and responsive design.
  - `data/flashcards.js`: The vocabulary dataset.
  - `js/app.js`: Application logic (rendering, filtering, and state management).
- `firebase.json` & `.firebaserc`: Firebase Hosting configuration.

## 🚀 Local Development

You can develop locally by simply opening `src/index.html` in any web browser. Because the data is loaded via a JavaScript script tag (rather than a `fetch` call), no local server is required to bypass CORS restrictions.

## 🌐 Deployment (Firebase Hosting)

The project is configured for Firebase Hosting. To deploy updates:

1. Ensure you have the Firebase CLI installed: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. Deploy: `firebase deploy`

The app is live at: `https://thai-flashcards-1d99d.web.app`

## 🔊 Audio Support

The app uses the **Web Speech API**.
- **Desktop:** Works automatically in most modern browsers.
- **Mobile:** Ensure you have a Thai voice downloaded in your phone's system settings (usually under Accessibility > Spoken Content or Language settings) for the best experience.

## 💾 Progress Saving

Progress is saved automatically to your browser's `localStorage`. This means your learned cards and streaks are preserved locally on your device even if you close the browser or refresh the page.
