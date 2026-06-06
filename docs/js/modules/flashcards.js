// Flashcard Module
(function() {
    let currentCategory = 'all';
    let currentCards = [...FLASHCARD_DATA];
    let masteredCards = new Set();
    let hideMastered = false;

    function init() {
        loadMasteredCards();
        hideMastered = document.getElementById('hideMasteredToggle')?.checked || false;
        populateCategories();
        filterCards(); // Use filterCards instead of renderFlashcards to respect hideMastered
        setupEventListeners();
    }

    function loadMasteredCards() {
        const saved = localStorage.getItem('thai_flashcards_mastered');
        if (saved) {
            try {
                const ids = JSON.parse(saved);
                masteredCards = new Set(ids);
            } catch (e) {
                console.error('Error loading mastered cards:', e);
                masteredCards = new Set();
            }
        }
    }

    function saveMasteredCards() {
        localStorage.setItem('thai_flashcards_mastered', JSON.stringify([...masteredCards]));
    }

    function toggleMastered(id, e) {
        e.stopPropagation();
        if (masteredCards.has(id)) {
            masteredCards.delete(id);
        } else {
            masteredCards.add(id);
        }
        saveMasteredCards();
        filterCards();
    }

    function resetProgress() {
        if (masteredCards.size === 0) {
            showToast('No progress to reset!');
            return;
        }

        const categoryCards = currentCategory === 'all' 
            ? FLASHCARD_DATA 
            : FLASHCARD_DATA.filter(card => card.category.includes(currentCategory));

        const cardsToReset = categoryCards.filter(card => masteredCards.has(card.id)).map(card => card.id);

        if (cardsToReset.length === 0) {
            showToast(`No progress to reset in ${currentCategory}!`);
            return;
        }

        const msg = currentCategory === 'all'
            ? 'Are you sure you want to clear ALL your mastered cards progress?'
            : `Are you sure you want to clear progress for the "${currentCategory}" category?`;

        if (confirm(msg)) {
            cardsToReset.forEach(id => masteredCards.delete(id));
            saveMasteredCards();
            filterCards();
            showToast('Progress reset!');
        }
    }

    function populateCategories() {
        const filterContainer = document.getElementById('categoryFilter');
        if (!filterContainer) return;

        const categories = ['all', ...new Set(FLASHCARD_DATA.flatMap(card => card.category))];
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

        const resetBtn = document.getElementById('resetProgressBtn');
        if (resetBtn) resetBtn.addEventListener('click', resetProgress);

        const hideMasteredToggle = document.getElementById('hideMasteredToggle');
        if (hideMasteredToggle) {
            hideMasteredToggle.addEventListener('change', (e) => {
                hideMastered = e.target.checked;
                filterCards();
            });
        }
    }

    function filterCards() {
        let cards = currentCategory === 'all' 
            ? [...FLASHCARD_DATA]
            : FLASHCARD_DATA.filter(card => card.category.includes(currentCategory));
            
        if (hideMastered) {
            cards = cards.filter(card => !masteredCards.has(card.id));
        }
        
        currentCards = cards;
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
            const isMastered = masteredCards.has(card.id);
            const tooltip = isMastered ? 'Unmark as mastered' : 'Mark as mastered';
            const flashcard = document.createElement('div');
            const categoryDisplay = card.category.join(', ');
            flashcard.className = `flashcard ${isMastered ? 'mastered' : ''}`;
            flashcard.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <button class="mastered-btn ${isMastered ? 'active' : ''}" title="${tooltip}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <span class="card-category">${categoryDisplay}</span>
                        <div class="english-text" style="font-size: 1.3rem;">${card.english}</div>
                        <div style="color: #7f8c8d; font-size: 0.9rem; margin-top: 15px;">Click to reveal Thai</div>
                    </div>
                    <div class="flashcard-back">
                        <button class="mastered-btn ${isMastered ? 'active' : ''}" title="${tooltip}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                        <span class="card-category">${categoryDisplay}</span>
                        <div class="thai-text">${card.thai}</div>
                        <div class="romanization">${card.romanization}</div>
                        <button class="audio-btn" onclick="playAudio('${card.thai}', this)"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg></button>
                    </div>
                </div>
            `;

            flashcard.addEventListener('click', (e) => {
                const masteredBtn = e.target.closest('.mastered-btn');
                if (masteredBtn) {
                    toggleMastered(card.id, e);
                    return;
                }
                
                if (!e.target.closest('.audio-btn')) {
                    flashcard.classList.toggle('flipped');
                }
            });

            container.appendChild(flashcard);
        });
    }

    function updateStats() {
        const totalEl = document.getElementById('totalCards');
        const masteredEl = document.getElementById('masteredCards');
        
        const categoryCards = currentCategory === 'all' 
            ? FLASHCARD_DATA 
            : FLASHCARD_DATA.filter(card => card.category.includes(currentCategory));

        if (totalEl) totalEl.textContent = categoryCards.length;
        
        if (masteredEl) {
            const masteredCount = categoryCards.filter(card => masteredCards.has(card.id)).length;
            masteredEl.textContent = masteredCount;
        }
    }

    window.Flashcards = {
        init: init,
        render: renderFlashcards,
        updateStats: updateStats
    };
})();
