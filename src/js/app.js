
        // State management
        let flashcardData = FLASHCARD_DATA;
        let currentView = 'flashcards';
        let currentCategory = 'all';
        let currentCards = [...flashcardData];

        // Immediate Routing (Before DOM load)
        const initialHash = window.location.hash.replace('#', '');
        currentView = initialHash || 'flashcards';

        // Numbers Quiz State
        let currentNumberRange = 10;
        let currentCorrectNumber = null;
        let quizMode = 'visual'; // 'visual' (digit -> thai) or 'audio' (sound -> digit)

        // Time Quiz State
        let currentCorrectTime = null; // { h: 14, m: 30 }
        let timeQuizMode = 'visual';

        const thaiNumbers = {
            units: ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'],
            tens: ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ']
        };

        const thaiRoman = {
            units: ['', 'nùeng', 'sǎawng', 'sǎam', 'sìi', 'hâa', 'hòk', 'jèt', 'bpàet', 'gâao'],
            positions: ['', 'sìp', 'rɔ́ɔi', 'phan', 'mùen', 'sǎen', 'láan']
        };

        const thaiPos = {
            units: ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน']
        };

        // Initialize app
        function init() {
            try {
                // Instantly show the correct view
                const startingView = window.INITIAL_VIEW || 'flashcards';
                switchView(startingView);
                
                renderFlashcards();
                setupEventListeners();
                updateStats();

                // Lift the loading shield
                document.documentElement.classList.remove('app-loading');

                window.addEventListener('hashchange', handleRouting);
            } catch (error) {
                console.error('Error initializing flashcard app:', error);
                showToast('Error loading application.');
            }
        }

        function handleRouting() {
            const hash = window.location.hash.replace('#', '');
            switchView(hash || 'flashcards');
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', init);

        // Setup event listeners
        function setupEventListeners() {
            // Main Navigation Tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    window.location.hash = btn.dataset.view;
                });
            });

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
            const shuffleBtn = document.getElementById('shuffleBtn');
            if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);

            // Numbers Quiz Range
            document.querySelectorAll('.range-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    currentNumberRange = e.target.dataset.range === 'random' ? 5000 : parseInt(e.target.dataset.range);
                    generateNumberQuestion();
                });
            });

            const nextBtn = document.getElementById('nextNumberBtn');
            if (nextBtn) nextBtn.addEventListener('click', generateNumberQuestion);
            
            const audioBtn = document.getElementById('quizAudioBtn');
            if (audioBtn) {
                audioBtn.addEventListener('click', () => {
                    if (currentCorrectNumber !== null) {
                        playAudio(toThai(currentCorrectNumber).thai);
                    }
                });
            }

            // Number Explorer
            const explorerBtn = document.getElementById('explorerBtn');
            const explorerInput = document.getElementById('explorerInput');
            if (explorerBtn && explorerInput) {
                explorerBtn.addEventListener('click', () => {
                    const val = parseInt(explorerInput.value);
                    if (isNaN(val) || val < 0) {
                        showToast('Please enter a valid positive number.');
                        return;
                    }
                    if (val > 9999999) {
                        showToast('Number too large (max 9,999,999).');
                        return;
                    }
                    
                    const data = toThai(val);
                    const resultEl = document.getElementById('explorerResult');
                    const thaiEl = document.getElementById('explorerThai');
                    const romanEl = document.getElementById('explorerRoman');
                    
                    thaiEl.textContent = data.thai;
                    romanEl.textContent = data.roman;
                    resultEl.style.display = 'block';
                    
                    playAudio(data.thai);
                });
            }

            // Time Quiz Controls
            const nextTimeBtn = document.getElementById('nextTimeBtn');
            if (nextTimeBtn) nextTimeBtn.addEventListener('click', generateTimeQuestion);

            const timeAudioBtn = document.getElementById('timeAudioBtn');
            if (timeAudioBtn) {
                timeAudioBtn.addEventListener('click', () => {
                    if (currentCorrectTime) {
                        const data = toThaiTime(currentCorrectTime.h, currentCorrectTime.m);
                        playAudio(data.thai);
                    }
                });
            }
        }

        // View management
        function switchView(viewId) {
            const viewEl = document.getElementById(`${viewId}View`);
            const tabEl = document.querySelector(`[data-view="${viewId}"]`);
            const statsBar = document.querySelector('.stats-bar');
            
            // If the view doesn't exist, fall back to flashcards
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

            // Hide/Show stats bar based on view
            if (statsBar) {
                statsBar.style.display = viewId === 'flashcards' ? 'flex' : 'none';
            }
            
            if (viewId === 'numbers' && currentCorrectNumber === null) {
                generateNumberQuestion();
            }

            if (viewId === 'time' && currentCorrectTime === null) {
                generateTimeQuestion();
            }
        }

        // --- Thai Number Logic ---
        function toThai(n) {
            if (n === 0) return { thai: 'ศูนย์', roman: 'sǔun' };
            if (n === 10) return { thai: 'สิบ', roman: 'sìp' };
            
            let thai = '';
            let roman = '';
            let numStr = n.toString();
            let len = numStr.length;

            for (let i = 0; i < len; i++) {
                let digit = parseInt(numStr[i]);
                let pos = len - i - 1;

                if (digit !== 0) {
                    if (pos === 1) { // Tens position
                        if (digit === 1) {
                            thai += 'สิบ';
                            roman += (roman === '' ? '' : '-') + 'sìp';
                        } else if (digit === 2) {
                            thai += 'ยี่สิบ';
                            roman += (roman === '' ? '' : '-') + 'yîi-sìp';
                        } else {
                            thai += thaiNumbers.units[digit] + 'สิบ';
                            roman += (roman === '' ? '' : '-') + thaiRoman.units[digit] + '-sìp';
                        }
                    } else if (pos === 0 && len > 1 && digit === 1) { // Units position (special 1)
                        thai += 'เอ็ด';
                        roman += (roman === '' ? '' : '-') + 'èt';
                    } else {
                        // All other positions (100, 1k, 10k, 100k, 1m)
                        const positionLabel = thaiPos.units[pos] || '';
                        const positionRoman = thaiRoman.positions[pos] || '';
                        
                        thai += thaiNumbers.units[digit] + positionLabel;
                        roman += (roman === '' ? '' : '-') + thaiRoman.units[digit] + (positionRoman ? '-' + positionRoman : '');
                    }
                }
            }
            return { thai, roman };
        }

        // --- Thai Time Logic ---
        function toThaiTime(h, m) {
            let thai = '';
            let roman = '';

            // Period & Hour Logic
            if (h === 0) {
                thai = 'เที่ยงคืน';
                roman = 'thîang khʉuen';
            } else if (h >= 1 && h <= 5) {
                thai = 'ตี' + thaiNumbers.units[h];
                roman = 'dtii-' + thaiRoman.units[h];
            } else if (h >= 6 && h <= 11) {
                thai = thaiNumbers.units[h] + 'โมงเช้า';
                roman = thaiRoman.units[h] + '-moong-cháao';
            } else if (h === 12) {
                thai = 'เที่ยง';
                roman = 'thîang';
            } else if (h >= 13 && h <= 15) {
                const hour = h - 12;
                thai = 'บ่าย' + thaiNumbers.units[hour] + 'โมง';
                roman = 'bàai-' + thaiRoman.units[hour] + '-moong';
            } else if (h >= 16 && h <= 18) {
                const hour = h - 12;
                thai = thaiNumbers.units[hour] + 'โมงเย็น';
                roman = thaiRoman.units[hour] + '-moong-yen';
            } else if (h >= 19 && h <= 23) {
                const hour = h - 18;
                thai = thaiNumbers.units[hour] + 'ทุ่ม';
                roman = thaiRoman.units[hour] + '-thûm';
            }

            // Minutes Logic
            if (m === 0) {
                // Optional: add 'trong' for o'clock
            } else if (m === 30) {
                thai += 'ครึ่ง';
                roman += '-khrʉueng';
            } else {
                const mData = toThai(m);
                thai += mData.thai + 'นาที';
                roman += '-' + mData.roman + '-naa-thii';
            }

            return { thai, roman };
        }

        function generateTimeQuestion() {
            const h = Math.floor(Math.random() * 24);
            const mChoices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            const m = mChoices[Math.floor(Math.random() * mChoices.length)];
            
            currentCorrectTime = { h, m };
            timeQuizMode = Math.random() > 0.5 ? 'visual' : 'audio';

            const questionEl = document.getElementById('timeQuestion');
            const typeLabel = document.getElementById('timeTypeLabel');
            const audioVis = document.getElementById('timeAudioVis');
            const choicesEl = document.getElementById('timeChoices');
            const feedback = document.getElementById('timeFeedback');
            const nextBtn = document.getElementById('nextTimeBtn');

            if (!questionEl || !choicesEl || !feedback || !nextBtn) return;

            feedback.textContent = '';
            feedback.className = 'quiz-feedback';
            nextBtn.style.display = 'none';
            choicesEl.innerHTML = '';

            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            const correctData = toThaiTime(h, m);

            if (timeQuizMode === 'visual') {
                questionEl.textContent = timeStr;
                typeLabel.textContent = 'What is this time in Thai?';
                audioVis.style.display = 'none';
            } else {
                questionEl.innerHTML = `<div style="font-size: 2rem;">${correctData.thai}</div><div style="font-size: 1.1rem; color: #7f8c8d; font-weight: normal; margin-top: 5px;">${correctData.roman}</div>`;
                typeLabel.textContent = 'Identify this Thai time';
                audioVis.style.display = 'block';
            }

            // Generate choices
            let choices = [currentCorrectTime];
            while (choices.length < 4) {
                const wh = Math.floor(Math.random() * 24);
                const wm = mChoices[Math.floor(Math.random() * mChoices.length)];
                if (!choices.some(c => c.h === wh && c.m === wm)) {
                    choices.push({ h: wh, m: wm });
                }
            }
            choices.sort(() => Math.random() - 0.5);

            choices.forEach(c => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                const cData = toThaiTime(c.h, c.m);
                const cStr = `${c.h.toString().padStart(2, '0')}:${c.h >= 12 ? ' PM' : ' AM'}`; // Simplified display for choice
                const digitalTime = `${c.h.toString().padStart(2, '0')}:${c.m.toString().padStart(2, '0')}`;

                if (timeQuizMode === 'visual') {
                    btn.innerHTML = `<div style="font-size: 0.95rem; font-weight: bold; line-height: 1.2;">${cData.thai}</div><div class="choice-romanization" style="font-size: 0.75rem;">${cData.roman}</div>`;
                } else {
                    btn.textContent = digitalTime;
                }
                
                btn.onclick = () => checkTimeAnswer(c, btn);
                choicesEl.appendChild(btn);
            });
        }

        function checkTimeAnswer(selected, btn) {
            if (document.querySelector('#timeChoices .choice-btn.correct')) return;

            const feedback = document.getElementById('timeFeedback');
            const nextBtn = document.getElementById('nextTimeBtn');
            const data = toThaiTime(currentCorrectTime.h, currentCorrectTime.m);
            const digitalTime = `${currentCorrectTime.h.toString().padStart(2, '0')}:${currentCorrectTime.m.toString().padStart(2, '0')}`;

            if (selected.h === currentCorrectTime.h && selected.m === currentCorrectTime.m) {
                btn.classList.add('correct');
                feedback.innerHTML = `Correct! <strong>${digitalTime}</strong> is ${data.thai}`;
                feedback.className = 'quiz-feedback correct';
                playAudio(data.thai);
            } else {
                btn.classList.add('incorrect');
                feedback.innerHTML = `Incorrect. It was <strong>${digitalTime}</strong>`;
                feedback.className = 'quiz-feedback incorrect';
                
                document.querySelectorAll('#timeChoices .choice-btn').forEach(b => {
                    if (timeQuizMode === 'visual') {
                        if (b.innerText.includes(data.thai)) b.classList.add('correct');
                    } else {
                        if (b.textContent === digitalTime) b.classList.add('correct');
                    }
                });
            }
            nextBtn.style.display = 'inline-block';
        }

        function generateNumberQuestion() {
            const range = currentNumberRange;
            currentCorrectNumber = Math.floor(Math.random() * range) + 1;
            quizMode = Math.random() > 0.5 ? 'visual' : 'audio';

            const questionEl = document.getElementById('quizQuestion');
            const typeLabel = document.getElementById('quizTypeLabel');
            const audioVis = document.getElementById('audioVisualizer');
            const choicesEl = document.getElementById('quizChoices');
            const feedback = document.getElementById('quizFeedback');
            const nextBtn = document.getElementById('nextNumberBtn');

            if (!questionEl || !typeLabel || !audioVis || !choicesEl || !feedback || !nextBtn) return;

            feedback.textContent = '';
            feedback.className = 'quiz-feedback';
            nextBtn.style.display = 'none';
            choicesEl.innerHTML = '';

            if (quizMode === 'visual') {
                questionEl.textContent = currentCorrectNumber;
                typeLabel.textContent = 'What is this in Thai?';
                audioVis.style.display = 'none';
                questionEl.style.fontSize = '4rem';
            } else {
                const data = toThai(currentCorrectNumber);
                questionEl.innerHTML = `<div>${data.thai}</div><div style="font-size: 1.2rem; color: #7f8c8d; font-weight: normal; margin-top: 10px;">${data.roman}</div>`;
                typeLabel.textContent = 'Listen and identify the number';
                audioVis.style.display = 'block';
                questionEl.style.fontSize = '3rem';
            }

            // Generate choices
            let choices = [currentCorrectNumber];
            while (choices.length < 4) {
                let wrong = currentCorrectNumber + (Math.floor(Math.random() * 21) - 10);
                if (wrong < 1) wrong = Math.floor(Math.random() * range) + 1;
                if (!choices.includes(wrong)) choices.push(wrong);
            }
            choices.sort(() => Math.random() - 0.5);

            choices.forEach(num => {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                const data = toThai(num);
                if (quizMode === 'visual') {
                    btn.innerHTML = `<div style="font-size: 1.2rem; font-weight: bold;">${data.thai}</div><div class="choice-romanization">${data.roman}</div>`;
                } else {
                    btn.textContent = num;
                }
                btn.onclick = () => checkNumberAnswer(num, btn);
                choicesEl.appendChild(btn);
            });
        }

        function checkNumberAnswer(selected, btn) {
            if (document.querySelector('.choice-btn.correct')) return; // Already answered

            const feedback = document.getElementById('quizFeedback');
            const nextBtn = document.getElementById('nextNumberBtn');
            if (!feedback || !nextBtn) return;
            const data = toThai(currentCorrectNumber);

            if (selected === currentCorrectNumber) {
                btn.classList.add('correct');
                feedback.innerHTML = `Correct! <strong>${data.thai}</strong> (${data.roman})`;
                feedback.className = 'quiz-feedback correct';
                playAudio(data.thai);
            } else {
                btn.classList.add('incorrect');
                feedback.innerHTML = `Incorrect. It was <strong>${data.thai}</strong> (${data.roman})`;
                feedback.className = 'quiz-feedback incorrect';
                // Show correct one
                document.querySelectorAll('.choice-btn').forEach(b => {
                    if (quizMode === 'visual') {
                        if (b.innerText.includes(data.thai)) b.classList.add('correct');
                    } else {
                        if (parseInt(b.textContent) === currentCorrectNumber) b.classList.add('correct');
                    }
                });
            }
            nextBtn.style.display = 'inline-block';
        }

        // Filter cards by category
        function filterCards() {
            if (currentCategory === 'all') {
                currentCards = [...flashcardData];
            } else {
                currentCards = flashcardData.filter(card => card.category === currentCategory);
            }
            renderFlashcards();
            updateStats();
        }

        // Shuffle cards
        function shuffleCards() {
            for (let i = currentCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentCards[i], currentCards[j]] = [currentCards[j], currentCards[i]];
            }
            renderFlashcards();
            updateStats();
            showToast('Cards shuffled!');
        }

        // Render flashcards
        function renderFlashcards() {
            const container = document.getElementById('flashcardContainer');
            if (!container) return;
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

        // Play audio using Web Speech API
        function playAudio(text, btn) {
            if (!text) return;
            
            if ('speechSynthesis' in window) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();

                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'th-TH';
                utterance.rate = 0.85;
                utterance.pitch = 1;

                if (btn && btn.classList) btn.classList.add('playing');

                utterance.onend = () => {
                    if (btn && btn.classList) btn.classList.remove('playing');
                };

                utterance.onerror = (event) => {
                    console.error('SpeechSynthesis Error:', event);
                    if (btn && btn.classList) btn.classList.remove('playing');
                };

                window.speechSynthesis.speak(utterance);
            } else {
                showToast('Text-to-speech not supported in this browser');
            }
        }

        // Update stats
        function updateStats() {
            const el = document.getElementById('totalCards');
            if (el) el.textContent = currentCards.length;
        }

        // Toast notification
        function showToast(message) {
            const toast = document.getElementById('toast');
            if (toast) {
                toast.textContent = message;
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 2500);
            }
        }
    