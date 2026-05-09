// Flashcard Module
(function() {
    let currentCategory = 'all';
    let currentCards = [...FLASHCARD_DATA];

    function init() {
        populateCategories();
        renderFlashcards();
        updateStats();
        setupEventListeners();
    }

    function populateCategories() {
        const filterContainer = document.getElementById('categoryFilter');
        if (!filterContainer) return;

        const categories = ['all', ...new Set(FLASHCARD_DATA.map(card => card.category))];
        filterContainer.innerHTML = '';
        
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `category-btn ${cat === 'all' ? 'active' : ''}`;
            btn.dataset.category = cat;
            btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            filterContainer.appendChild(btn);
        });
    }

    function setupEventListeners() {
        // Category filtering (using event delegation for dynamic buttons)
        const filterContainer = document.getElementById('categoryFilter');
        if (filterContainer) {
            filterContainer.addEventListener('click', (e) => {
                const btn = e.target.closest('.category-btn');
                if (!btn) return;

                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                filterCards();
            });
        }

        // Controls
        const shuffleBtn = document.getElementById('shuffleBtn');
        if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);
    }

    function filterCards() {
        if (currentCategory === 'all') {
            currentCards = [...FLASHCARD_DATA];
        } else {
            currentCards = FLASHCARD_DATA.filter(card => card.category === currentCategory);
        }
        renderFlashcards();
        updateStats();
    }

    function shuffleCards() {
        for (let i = currentCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
        }
        renderFlashcards();
        updateStats();
        showToast('Cards shuffled!');
    }

    function renderFlashcards() {
        const container = document.getElementById('flashcardContainer');
        if (!container) return;
        container.innerHTML = '';

        currentCards.forEach((card) => {
            const flashcard = document.createElement('div');
            flashcard.className = 'flashcard';
            flashcard.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <span class="card-category">${card.category}</span>
                        <div class="english-text" style="font-size: 1.3rem;">${card.english}</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 15px;">Click to reveal Thai</div>
                    </div>
                    <div class="flashcard-back">
                        <span class="card-category">${card.category}</span>
                        <div class="thai-text">${card.thai}</div>
                        <div class="romanization">${card.romanization}</div>
                        <button class="audio-btn" onclick="playAudio('${card.thai}', this)">🔊</button>
                    </div>
                </div>
            `;

            flashcard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('audio-btn')) {
                    flashcard.classList.toggle('flipped');
                }
            });

            container.appendChild(flashcard);
        });
    }

    function updateStats() {
        const el = document.getElementById('totalCards');
        if (el) el.textContent = currentCards.length;
    }

    window.Flashcards = {
        init: init,
        render: renderFlashcards,
        updateStats: updateStats
    };
})();
