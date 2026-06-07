import { Flashcards } from './modules/flashcards';
import { NumbersQuiz } from './modules/numbers';
import { TimeQuiz } from './modules/time';
import { DaysQuiz } from './modules/days';
import { TonesGuide } from './modules/tones';
import { showToast } from './utils';

function init() {
    try {
        const startingView = window.INITIAL_VIEW || 'flashcards';
        switchView(startingView);

        Flashcards.init();
        NumbersQuiz.init();
        TimeQuiz.init();
        DaysQuiz.init();
        TonesGuide.init();

        setupEventListeners();

        document.documentElement.classList.remove('app-loading');
        window.addEventListener('hashchange', handleRouting);
    } catch (error) {
        console.error('Error initializing app:', error);
        if (typeof showToast === 'function') showToast('Error loading application.');
    }
}

function handleRouting() {
    const hash = window.location.hash.replace('#', '');
    switchView(hash || 'flashcards');
}

function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.hash = (btn as HTMLElement).dataset.view ?? '';
        });
    });
}

function switchView(viewId: string) {
    const viewEl = document.getElementById(`${viewId}View`);
    const tabEl = document.querySelector(`[data-view="${viewId}"]`);
    const statsBar = document.querySelector('.stats-bar');

    if (!viewEl) {
        if (viewId !== 'flashcards') {
            console.warn(`View "${viewId}" not found. Falling back to flashcards.`);
            switchView('flashcards');
        }
        return;
    }

    document.querySelectorAll<HTMLElement>('.view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    viewEl.style.display = 'block';
    if (tabEl) tabEl.classList.add('active');

    if (statsBar) {
        (statsBar as HTMLElement).style.display = viewId === 'flashcards' ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);
