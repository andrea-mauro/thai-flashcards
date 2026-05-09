# 🇹🇭 Thai Flashcards

A lightweight, standalone web application for learning Thai vocabulary and phrases. It features category filtering, dedicated sections for major topics and text-to-speech audio.

## 📁 Project Structure

- `src/`: Source code directory.
  - `index.html`: The main structure of the app.
  - `css/`: Modular styling (`base.css`, `flashcards.css`, `quiz.css`).
  - `data/flashcards.js`: The vocabulary dataset.
  - `js/`: Application logic and modules.

## 🚀 Local Development

You can develop locally by running `npm install` followed by `npm start`. You can also simply open `src/index.html` in any web browser. Because the data is loaded via a JavaScript script tag (rather than a `fetch` call), no local server is required to bypass CORS restrictions for basic testing.

## 🌐 Deployment

The project is configured for automated deployment via **GitHub Actions** to **GitHub Pages**.

### Deployment
Every time you push to the `main` branch, a GitHub Action automatically:
1. Minifies the CSS and JavaScript.
2. Optimizes the HTML.
3. Deploys the `dist/` folder to GitHub Pages.

## 🔊 Audio Support

The app uses the **Web Speech API**.
- **Desktop:** Works automatically in most modern browsers.
- **Mobile:** Ensure you have a Thai voice downloaded in your phone's system settings (usually under Accessibility > Spoken Content or Language settings) for the best experience.
