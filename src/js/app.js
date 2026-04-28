
        // Main Application Orchestrator
        (function() {
            let currentView = 'flashcards';

            function init() {
                try {
                    // Initial route
                    const startingView = window.INITIAL_VIEW || 'flashcards';
                    switchView(startingView);

                    // Global components
                    Flashcards.init();
                    NumbersQuiz.init();
                    TimeQuiz.init();
                    DaysQuiz.init();

                    setupEventListeners();

                    // Lift the loading shield
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
                // Main Navigation Tabs
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.location.hash = btn.dataset.view;
                    });
                });
            }

            function switchView(viewId) {
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

                currentView = viewId;
                document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                
                viewEl.style.display = 'block';
                if (tabEl) tabEl.classList.add('active');

                // Toggle global stats bar
                if (statsBar) {
                    statsBar.style.display = viewId === 'flashcards' ? 'flex' : 'none';
                }
            }

            document.addEventListener('DOMContentLoaded', init);

            window.App = {
                switchView: switchView
            };
        })();
    