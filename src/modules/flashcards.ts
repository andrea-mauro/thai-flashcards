import { FLASHCARD_DATA } from '../data/flashcards';
import { showToast } from '../utils';

let currentCategory = 'all';
let currentCards = [...FLASHCARD_DATA];
let masteredCards = new Set<string>();
let hideMastered = false;
let lookupMap = new Map<string, string>();

function init() {
    loadMasteredCards();
    buildLookupMap();
    hideMastered = (document.getElementById('hideMasteredToggle') as HTMLInputElement)?.checked ?? false;
    populateCategories();
    filterCards();
    setupEventListeners();
}

function buildLookupMap() {
    lookupMap = new Map<string, string>();
    FLASHCARD_DATA.forEach(card => {
        const roman = card.romanization.toLowerCase();
        const variants = roman.split(/\s*\/\s*/);

        variants.forEach(variant => {
            const part = variant.trim();
            if (part.length < 2) return;

            if (lookupMap.has(part)) {
                const existing = lookupMap.get(part)!;
                const existingArray = existing.split('; ');
                if (!existingArray.includes(card.english)) {
                    lookupMap.set(part, existing + '; ' + card.english);
                }
            } else {
                lookupMap.set(part, card.english);
            }
        });
    });
}

function generateRomanizationHtml(romanization: string, currentEnglish: string): string {
    const parts = romanization.split(/([a-zA-Zɛɔəʉàáâǎèéêěìíîǐòóôǒùúûǔɛ̀ɛ́ɛ̂ɛ̌ɔ̀ɔ́ɔ̂ɔ̌ə̀ə́ə̂ə̌ʉ̀ʉ́ʉ̂ʉ̌]+)/g);

    return parts.map(part => {
        const lowerPart = part.toLowerCase();
        if (lookupMap.has(lowerPart)) {
            let meaning = lookupMap.get(lowerPart)!;

            if (currentEnglish) {
                const currentLower = currentEnglish.toLowerCase();
                const meanings = meaning.split('; ');
                const filtered = meanings.filter(m => m.toLowerCase() !== currentLower);

                if (filtered.length === 0) return part;
                meaning = filtered.join('; ');
            }

            return `<span class="compound-token" data-tooltip="${meaning}">${part}</span>`;
        }
        return part;
    }).join('');
}

function loadMasteredCards() {
    const saved = localStorage.getItem('thai_flashcards_mastered');
    if (saved) {
        try {
            const ids = JSON.parse(saved) as string[];
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

function toggleMastered(id: string, el: HTMLElement) {
    const nowMastered = !masteredCards.has(id);
    if (nowMastered) {
        masteredCards.add(id);
    } else {
        masteredCards.delete(id);
    }
    saveMasteredCards();

    el.classList.toggle('mastered', nowMastered);
    el.querySelectorAll('.mastered-btn').forEach(btn => {
        btn.classList.toggle('active', nowMastered);
        btn.setAttribute('title', nowMastered ? 'Unmark as mastered' : 'Mark as mastered');
    });

    if (hideMastered && nowMastered) {
        el.remove();
        updateStats();
        return;
    }

    updateStats();
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
    const filterContainer = document.getElementById('categoryFilter');
    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            const btn = (e.target as HTMLElement).closest('.category-btn') as HTMLElement | null;
            if (!btn) return;

            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category ?? 'all';
            filterCards();
        });
    }

    const resetBtn = document.getElementById('resetProgressBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetProgress);

    const hideMasteredToggle = document.getElementById('hideMasteredToggle');
    if (hideMasteredToggle) {
        hideMasteredToggle.addEventListener('change', (e) => {
            hideMastered = (e.target as HTMLInputElement).checked;
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

    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    currentCards = cards;
    renderFlashcards();
    updateStats();
}

function renderFlashcards() {
    const container = document.getElementById('flashcardContainer');
    if (!container) return;
    container.innerHTML = '';

    currentCards.forEach((card) => {
        const isMastered = masteredCards.has(card.id);
        const tooltip = isMastered ? 'Unmark as mastered' : 'Mark as mastered';
        const flashcard = document.createElement('div');
        const romanizationHtml = generateRomanizationHtml(card.romanization, card.english);

        flashcard.className = `flashcard ${isMastered ? 'mastered' : ''}`;
        flashcard.innerHTML = `
            <div class="flashcard-inner">
                <div class="flashcard-front">
                    <button class="mastered-btn ${isMastered ? 'active' : ''}" title="${tooltip}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                    <div class="english-text" style="font-size: 1.3rem;">${card.english}</div>
                </div>
                <div class="flashcard-back">
                    <button class="mastered-btn ${isMastered ? 'active' : ''}" title="${tooltip}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                    </button>
                    <button class="audio-btn" onclick="playAudio('${card.thai}', this)"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg></button>
                    <div class="romanization">${romanizationHtml}</div>
                    <div class="thai-text">${card.thai}</div>
                </div>
            </div>
        `;

        flashcard.querySelectorAll('.mastered-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMastered(card.id, flashcard);
            });
        });

        flashcard.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.audio-btn')) {
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

    if (totalEl) totalEl.textContent = String(categoryCards.length);

    if (masteredEl) {
        const masteredCount = categoryCards.filter(card => masteredCards.has(card.id)).length;
        masteredEl.textContent = String(masteredCount);
    }
}

export const Flashcards = {
    init,
    render: renderFlashcards,
    updateStats,
};
