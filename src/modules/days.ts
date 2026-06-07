import { playAudio, showToast } from '../utils';
import { NumbersQuiz } from './numbers';
import type { ThaiItem } from '../types';

let currentQuizMode = 'days';
let currentCorrectItem: ThaiItem | null = null;
let quizType = 'visual';

const thaiDays: ThaiItem[] = [
    { id: 0, english: 'Sunday', thai: 'วันอาทิตย์', roman: 'wan aa-thít' },
    { id: 1, english: 'Monday', thai: 'วันจันทร์', roman: 'wan jan' },
    { id: 2, english: 'Tuesday', thai: 'วันอังคาร', roman: 'wan ang-khaan' },
    { id: 3, english: 'Wednesday', thai: 'วันพุธ', roman: 'wan phút' },
    { id: 4, english: 'Thursday', thai: 'วันพฤหัสบดี', roman: 'wan phá-rú-hàt' },
    { id: 5, english: 'Friday', thai: 'วันศุกร์', roman: 'wan sùk' },
    { id: 6, english: 'Saturday', thai: 'วันเสาร์', roman: 'wan sǎo' },
];

const thaiMonths: ThaiItem[] = [
    { id: 0, english: 'January', thai: 'มกราคม', roman: 'mók-gà-raa-khom' },
    { id: 1, english: 'February', thai: 'กุมภาพันธ์', roman: 'gum-phaa-phan' },
    { id: 2, english: 'March', thai: 'มีนาคม', roman: 'mii-naa-khom' },
    { id: 3, english: 'April', thai: 'เมษายน', roman: 'mee-sǎa-yon' },
    { id: 4, english: 'May', thai: 'พฤษภาคม', roman: 'phrúet-sà-phaa-khom' },
    { id: 5, english: 'June', thai: 'มิถุนายน', roman: 'mí-thù-naa-yon' },
    { id: 6, english: 'July', thai: 'กรกฎาคม', roman: 'gà-rá-gà-daa-khom' },
    { id: 7, english: 'August', thai: 'สิงหาคม', roman: 'sǐng-hǎa-khom' },
    { id: 8, english: 'September', thai: 'กันยายน', roman: 'gan-yaa-yon' },
    { id: 9, english: 'October', thai: 'ตุลาคม', roman: 'dtù-laa-khom' },
    { id: 10, english: 'November', thai: 'พฤศจิกายน', roman: 'phrúet-sà-jì-gaa-yon' },
    { id: 11, english: 'December', thai: 'ธันวาคม', roman: 'than-waa-khom' },
];

function init() {
    setupEventListeners();
    if (currentCorrectItem === null) generateQuestion();
}

function setupEventListeners() {
    document.querySelectorAll('.day-range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            document.querySelectorAll('.day-range-btn').forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            currentQuizMode = target.dataset.mode ?? 'days';
            generateQuestion();
        });
    });

    const nextBtn = document.getElementById('nextDayBtn');
    if (nextBtn) nextBtn.addEventListener('click', generateQuestion);

    const audioBtn = document.getElementById('dayAudioBtn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (currentCorrectItem) playAudio(currentCorrectItem.thai);
        });
    }

    const dateTranslateBtn = document.getElementById('dateTranslateBtn');
    const dateInput = document.getElementById('dateInput') as HTMLInputElement | null;
    if (dateTranslateBtn && dateInput) {
        dateTranslateBtn.addEventListener('click', () => {
            if (!dateInput.value) {
                showToast('Please select a date.');
                return;
            }
            const date = new Date(dateInput.value);
            const data = toThaiDate(date);
            const resultEl = document.getElementById('dateResult');
            const thaiEl = document.getElementById('dateThai');
            const romanEl = document.getElementById('dateRoman');

            if (thaiEl) thaiEl.textContent = data.thai;
            if (romanEl) romanEl.textContent = data.roman;
            if (resultEl) resultEl.style.display = 'block';

            playAudio(data.thai);
        });
    }
}

function toThaiDate(date: Date) {
    const dayOfWeek = thaiDays[date.getDay()];
    const month = thaiMonths[date.getMonth()];
    const dayOfMonth = date.getDate();
    const year = date.getFullYear() + 543;

    const dayData = NumbersQuiz.toThai(dayOfMonth);
    const yearData = NumbersQuiz.toThai(year);

    return {
        thai: `${dayOfWeek.thai}ที่ ${dayData.thai} ${month.thai} พ.ศ. ${yearData.thai}`,
        roman: `${dayOfWeek.roman} thîi ${dayData.roman} ${month.roman} phɔɔ-sɔ̌ɔ ${yearData.roman}`,
    };
}

function generateQuestion() {
    let pool: ThaiItem[] = [];
    if (currentQuizMode === 'days') pool = thaiDays;
    else if (currentQuizMode === 'months') pool = thaiMonths;
    else pool = [...thaiDays, ...thaiMonths];

    currentCorrectItem = pool[Math.floor(Math.random() * pool.length)];
    quizType = Math.random() > 0.5 ? 'visual' : 'audio';

    const questionEl = document.getElementById('dayQuestion');
    const typeLabel = document.getElementById('dayTypeLabel');
    const audioVis = document.getElementById('dayAudioVis');
    const choicesEl = document.getElementById('dayChoices');
    const feedback = document.getElementById('dayFeedback');
    const nextBtn = document.getElementById('nextDayBtn');

    if (!questionEl || !typeLabel || !audioVis || !choicesEl || !feedback || !nextBtn) return;

    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    nextBtn.style.display = 'none';
    choicesEl.innerHTML = '';

    if (quizType === 'visual') {
        questionEl.textContent = currentCorrectItem.english;
        typeLabel.textContent = 'What is this in Thai?';
        audioVis.style.display = 'none';
        questionEl.style.fontSize = '3rem';
    } else {
        questionEl.innerHTML = `<div>${currentCorrectItem.thai}</div><div style="font-size: 1.2rem; color: #7f8c8d; font-weight: normal; margin-top: 10px;">${currentCorrectItem.roman}</div>`;
        typeLabel.textContent = 'Identify this Thai word';
        audioVis.style.display = 'block';
        questionEl.style.fontSize = '2.5rem';
    }

    let choices: ThaiItem[] = [currentCorrectItem];
    while (choices.length < 4) {
        const wrong = pool[Math.floor(Math.random() * pool.length)];
        if (!choices.find(c => c.id === wrong.id && c.english === wrong.english)) {
            choices.push(wrong);
        }
    }
    choices.sort(() => Math.random() - 0.5);

    choices.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        if (quizType === 'visual') {
            btn.innerHTML = `<div style="font-size: 1.1rem; font-weight: bold;">${item.thai}</div><div class="choice-romanization">${item.roman}</div>`;
        } else {
            btn.textContent = item.english;
        }
        btn.onclick = () => checkAnswer(item, btn);
        choicesEl.appendChild(btn);
    });
}

function checkAnswer(selected: ThaiItem, btn: HTMLButtonElement) {
    if (document.querySelector('#dayChoices .choice-btn.correct')) return;
    if (!currentCorrectItem) return;

    const feedback = document.getElementById('dayFeedback');
    const nextBtn = document.getElementById('nextDayBtn');
    if (!feedback || !nextBtn) return;

    if (selected.id === currentCorrectItem.id && selected.english === currentCorrectItem.english) {
        btn.classList.add('correct');
        feedback.innerHTML = `Correct! <strong>${currentCorrectItem.thai}</strong> (${currentCorrectItem.roman})`;
        feedback.className = 'quiz-feedback correct';
        playAudio(currentCorrectItem.thai);
    } else {
        btn.classList.add('incorrect');
        feedback.innerHTML = `Incorrect. It was <strong>${currentCorrectItem.thai}</strong>`;
        feedback.className = 'quiz-feedback incorrect';
        document.querySelectorAll<HTMLElement>('#dayChoices .choice-btn').forEach(b => {
            if (quizType === 'visual') {
                if (b.innerText.includes(currentCorrectItem!.thai)) b.classList.add('correct');
            } else {
                if (b.textContent === currentCorrectItem!.english) b.classList.add('correct');
            }
        });
    }
    nextBtn.style.display = 'inline-block';
}

export const DaysQuiz = {
    init,
    generate: generateQuestion,
};
