# 🇹🇭 Thai Flashcards

A lightweight, standalone web application for learning Thai vocabulary and phrases. It features category filtering, dedicated sections for major topics and text-to-speech audio.

## 📁 Project Structure

- `src/`: Source code directory.
  - `index.html`: The main structure of the app.
  - `css/`: Modular styling (`base.css`, `flashcards.css`, `quiz.css`).
  - `data/flashcards.js`: The vocabulary dataset (managed via UUIDs).
  - `js/`: Application logic and modules.

## 🏆 Scoring & Progress

The app features a **Mastered Flashcards** system:
-   **Marking Cards:** Click the checkmark icon in the top-left of any card to mark it as mastered.
-   **Progress Tracking:** A real-time counter in the stats bar shows your mastered words for the current category.
-   **Persistence:** Your progress is saved locally in your browser, so you can pick up where you left off.

## 🛠️ Data Management

The vocabulary dataset (`docs/data/flashcards.js`) uses **UUIDs** for unique identification. This allows for:
-   **Easy Expansion:** Add new words anywhere in the file without worrying about ID conflicts.
-   **Stable Mastered Lists:** Persistence relies on these UUIDs, ensuring your progress is maintained even as the dictionary grows.

## 🚀 Local Development

You can develop locally by running `npm install` followed by `npm start`. You can also simply open `src/index.html` in any web browser. Because the data is loaded via a JavaScript script tag (rather than a `fetch` call), no local server is required to bypass CORS restrictions for basic testing.

## 🌐 Deployment

The project is configured for automated deployment via **GitHub Actions** to **GitHub Pages**. 

## 🔊 Audio Support

The app uses the **Web Speech API**.
- **Desktop:** Works automatically in most modern browsers.
- **Mobile:** Ensure you have a Thai voice downloaded in your phone's system settings (usually under Accessibility > Spoken Content or Language settings) for the best experience.
