
        // State management
        let flashcardData = FLASHCARD_DATA;
        let currentCategory = 'all';
        let currentCards = [...flashcardData];
        let learnedCards = new Set();
        let streakData = loadStreakData();

        // Initialize app
        function init() {
            try {
                loadProgress();
                renderFlashcards();
                setupEventListeners();
                updateStats();
            } catch (error) {
                console.error('Error initializing flashcard app:', error);
                showToast('Error loading application.');
            }
        }

        // Load saved progress
        function loadProgress() {
            const saved = localStorage.getItem('thaiFlashcards_learned');
            if (saved) {
                learnedCards = new Set(JSON.parse(saved));
            }
            updateStats();
        }

        function saveProgress() {
            localStorage.setItem('thaiFlashcards_learned', JSON.stringify([...learnedCards]));
        }

        function loadStreakData() {
            const saved = localStorage.getItem('thaiFlashcards_streak');
            if (saved) {
                return JSON.parse(saved);
            }
            return { count: 0, lastDate: null };
        }

        function updateStreak() {
            const today = new Date().toDateString();
            if (streakData.lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (streakData.lastDate === yesterday.toDateString()) {
                    streakData.count++;
                } else if (streakData.lastDate !== today) {
                    streakData.count = 1;
                }
                streakData.lastDate = today;
                localStorage.setItem('thaiFlashcards_streak', JSON.stringify(streakData));
            }
            updateStats();
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', init);

        // Setup event listeners
        function setupEventListeners() {
            // Category filtering
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    currentCategory = e.target.dataset.category;
                    filterCards();
                });
            });

            // Controls
            document.getElementById('shuffleBtn').addEventListener('click', shuffleCards);
            document.getElementById('resetBtn').addEventListener('click', resetProgress);
        }

        // Filter cards by category
        function filterCards() {
            if (currentCategory === 'all') {
                currentCards = [...flashcardData];
            } else {
                currentCards = flashcardData.filter(card => card.category === currentCategory);
            }
            renderFlashcards();
        }

        // Shuffle cards
        function shuffleCards() {
            for (let i = currentCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
            }
            renderFlashcards();
            showToast('Cards shuffled!');
        }

        // Render flashcards
        function renderFlashcards() {
            const container = document.getElementById('flashcardContainer');
            container.innerHTML = '';

            currentCards.forEach((card, index) => {
                const flashcard = document.createElement('div');
                flashcard.className = 'flashcard';
                flashcard.innerHTML = `
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <span class="card-number">${card.id}</span>
                            <span class="card-category">${card.category}</span>
                            <div class="english-text" style="font-size: 1.3rem;">${card.english}</div>
                            <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 15px;">Click to reveal Thai</div>
                        </div>
                        <div class="flashcard-back">
                            <span class="card-number">${card.id}</span>
                            <span class="card-category">${card.category}</span>
                            <div class="thai-text">${card.thai}</div>
                            <div class="romanization">${card.romanization}</div>
                            <button class="audio-btn" onclick="playAudio('${card.thai}', this)">🔊</button>
                            <div class="difficulty-buttons">
                                <button class="diff-btn easy" onclick="markLearned(${card.id}, event)">✓ Learned</button>
                                <button class="diff-btn hard" onclick="markHard(${card.id}, event)">✗ Hard</button>
                            </div>
                        </div>
                    </div>
                `;

                flashcard.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('audio-btn') && !e.target.classList.contains('diff-btn')) {
                        flashcard.classList.toggle('flipped');
                    }
                });

                container.appendChild(flashcard);
            });
        }

        // Play audio using Web Speech API
        function playAudio(text, btn) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'th-TH';
                utterance.rate = 0.8;
                utterance.pitch = 1;

                if (btn) btn.classList.add('playing');

                utterance.onend = () => {
                    if (btn) btn.classList.remove('playing');
                };

                speechSynthesis.speak(utterance);
            } else {
                showToast('Text-to-speech not supported in this browser');
            }
        }

        // Mark card as learned
        function markLearned(id, event) {
            event.stopPropagation();
            learnedCards.add(id);
            saveProgress();
            updateStats();
            updateStreak();
            showToast('Marked as learned! ✓');
        }

        // Mark card as hard
        function markHard(id, event) {
            event.stopPropagation();
            showToast('Keep practicing! 💪');
        }

        // Update stats
        function updateStats() {
            document.getElementById('totalCards').textContent = flashcardData.length;
            document.getElementById('learnedCards').textContent = learnedCards.size;
            document.getElementById('streakCount').textContent = streakData.count;
        }

        // Reset progress
        function resetProgress() {
            if (confirm('Are you sure you want to reset all progress?')) {
                learnedCards.clear();
                saveProgress();
                updateStats();
                showToast('Progress reset!');
            }
        }

        // Toast notification
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
            }, 2500);
        }
    