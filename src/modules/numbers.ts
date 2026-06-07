import { playAudio, showToast } from '../utils';
import type { ThaiResult } from '../types';

let currentNumberRange = 10;
let currentCorrectNumber: number | null = null;
let quizMode = 'visual';

const thaiNumbers = {
    units: ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'],
    tens: ['', 'สิบ', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ'],
};

const thaiRoman = {
    units: ['', 'nùeng', 'sǎawng', 'sǎam', 'sìi', 'hâa', 'hòk', 'jèt', 'bpàet', 'gâao'],
    positions: ['', 'sìp', 'rɔ́ɔi', 'phan', 'mùen', 'sǎen', 'láan'],
};

const thaiPos = {
    units: ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'],
};

function init() {
    setupEventListeners();
    if (currentCorrectNumber === null) generateQuestion();
}

function setupEventListeners() {
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            currentNumberRange = target.dataset.range === 'random' ? 5000 : parseInt(target.dataset.range ?? '10');
            generateQuestion();
        });
    });

    const nextBtn = document.getElementById('nextNumberBtn');
    if (nextBtn) nextBtn.addEventListener('click', generateQuestion);

    const audioBtn = document.getElementById('quizAudioBtn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (currentCorrectNumber !== null) {
                playAudio(toThai(currentCorrectNumber).thai);
            }
        });
    }

    const explorerBtn = document.getElementById('explorerBtn');
    const explorerInput = document.getElementById('explorerInput') as HTMLInputElement | null;
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

            if (thaiEl) thaiEl.textContent = data.thai;
            if (romanEl) romanEl.textContent = data.roman;
            if (resultEl) resultEl.style.display = 'block';

            playAudio(data.thai);
        });
    }
}

function toThai(n: number): ThaiResult {
    if (n === 0) return { thai: 'ศูนย์', roman: 'sǔun' };
    if (n === 10) return { thai: 'สิบ', roman: 'sìp' };

    let thai = '';
    let roman = '';
    const numStr = n.toString();
    const len = numStr.length;

    for (let i = 0; i < len; i++) {
        const digit = parseInt(numStr[i]);
        const pos = len - i - 1;

        if (digit !== 0) {
            if (pos === 1) {
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
            } else if (pos === 0 && len > 1 && digit === 1) {
                thai += 'เอ็ด';
                roman += (roman === '' ? '' : '-') + 'èt';
            } else {
                const positionLabel = thaiPos.units[pos] ?? '';
                const positionRoman = thaiRoman.positions[pos] ?? '';
                thai += thaiNumbers.units[digit] + positionLabel;
                roman += (roman === '' ? '' : '-') + thaiRoman.units[digit] + (positionRoman ? '-' + positionRoman : '');
            }
        }
    }
    return { thai, roman };
}

function generateQuestion() {
    currentCorrectNumber = Math.floor(Math.random() * currentNumberRange) + 1;
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
        questionEl.textContent = String(currentCorrectNumber);
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

    let choices = [currentCorrectNumber];
    while (choices.length < 4) {
        let wrong = currentCorrectNumber + (Math.floor(Math.random() * 21) - 10);
        if (wrong < 1) wrong = Math.floor(Math.random() * currentNumberRange) + 1;
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
            btn.textContent = String(num);
        }
        btn.onclick = () => checkAnswer(num, btn);
        choicesEl.appendChild(btn);
    });
}

function checkAnswer(selected: number, btn: HTMLButtonElement) {
    if (document.querySelector('#quizChoices .choice-btn.correct')) return;

    const feedback = document.getElementById('quizFeedback');
    const nextBtn = document.getElementById('nextNumberBtn');
    if (!feedback || !nextBtn || currentCorrectNumber === null) return;

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
        document.querySelectorAll<HTMLElement>('#quizChoices .choice-btn').forEach(b => {
            if (quizMode === 'visual') {
                if (b.innerText.includes(data.thai)) b.classList.add('correct');
            } else {
                if (parseInt(b.textContent ?? '') === currentCorrectNumber) b.classList.add('correct');
            }
        });
    }
    nextBtn.style.display = 'inline-block';
}

export const NumbersQuiz = {
    init,
    toThai,
    generate: generateQuestion,
};
