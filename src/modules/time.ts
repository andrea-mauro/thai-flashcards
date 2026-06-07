import { playAudio } from '../utils';
import { NumbersQuiz } from './numbers';
import type { Time, ThaiResult } from '../types';

let currentCorrectTime: Time | null = null;
let quizMode = 'visual';

function init() {
    setupEventListeners();
    if (currentCorrectTime === null) generateQuestion();
}

function setupEventListeners() {
    const nextTimeBtn = document.getElementById('nextTimeBtn');
    if (nextTimeBtn) nextTimeBtn.addEventListener('click', generateQuestion);

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

function toThaiTime(h: number, m: number): ThaiResult {
    let thai = '';
    let roman = '';

    if (h === 0) {
        thai = 'เที่ยงคืน';
        roman = 'thîang khʉuen';
    } else if (h >= 1 && h <= 5) {
        thai = 'ตี' + NumbersQuiz.toThai(h).thai;
        roman = 'dtii-' + NumbersQuiz.toThai(h).roman;
    } else if (h >= 6 && h <= 11) {
        const hData = NumbersQuiz.toThai(h);
        thai = hData.thai + 'โมงเช้า';
        roman = hData.roman + '-moong-cháao';
    } else if (h === 12) {
        thai = 'เที่ยง';
        roman = 'thîang';
    } else if (h >= 13 && h <= 15) {
        const hData = NumbersQuiz.toThai(h - 12);
        thai = 'บ่าย' + hData.thai + 'โมง';
        roman = 'bàai-' + hData.roman + '-moong';
    } else if (h >= 16 && h <= 18) {
        const hData = NumbersQuiz.toThai(h - 12);
        thai = hData.thai + 'โมงเย็น';
        roman = hData.roman + '-moong-yen';
    } else {
        const hData = NumbersQuiz.toThai(h - 18);
        thai = hData.thai + 'ทุ่ม';
        roman = hData.roman + '-thûm';
    }

    if (m === 30) {
        thai += 'ครึ่ง';
        roman += '-khrʉueng';
    } else if (m !== 0) {
        const mData = NumbersQuiz.toThai(m);
        thai += mData.thai + 'นาที';
        roman += '-' + mData.roman + '-naa-thii';
    }

    return { thai, roman };
}

function generateQuestion() {
    const h = Math.floor(Math.random() * 24);
    const mChoices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
    const m = mChoices[Math.floor(Math.random() * mChoices.length)];

    currentCorrectTime = { h, m };
    quizMode = Math.random() > 0.5 ? 'visual' : 'audio';

    const questionEl = document.getElementById('timeQuestion');
    const typeLabel = document.getElementById('timeTypeLabel');
    const audioVis = document.getElementById('timeAudioVis');
    const choicesEl = document.getElementById('timeChoices');
    const feedback = document.getElementById('timeFeedback');
    const nextBtn = document.getElementById('nextTimeBtn');

    if (!questionEl || !typeLabel || !audioVis || !choicesEl || !feedback || !nextBtn) return;

    feedback.textContent = '';
    feedback.className = 'quiz-feedback';
    nextBtn.style.display = 'none';
    choicesEl.innerHTML = '';

    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const correctData = toThaiTime(h, m);

    if (quizMode === 'visual') {
        questionEl.textContent = timeStr;
        typeLabel.textContent = 'What is this time in Thai?';
        audioVis.style.display = 'none';
    } else {
        questionEl.innerHTML = `<div style="font-size: 2rem;">${correctData.thai}</div><div style="font-size: 1.1rem; color: #7f8c8d; font-weight: normal; margin-top: 5px;">${correctData.roman}</div>`;
        typeLabel.textContent = 'Identify this Thai time';
        audioVis.style.display = 'block';
    }

    let choices: Time[] = [currentCorrectTime];
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
        const digitalTime = `${c.h.toString().padStart(2, '0')}:${c.m.toString().padStart(2, '0')}`;

        if (quizMode === 'visual') {
            btn.innerHTML = `<div style="font-size: 0.95rem; font-weight: bold; line-height: 1.2;">${cData.thai}</div><div class="choice-romanization" style="font-size: 0.75rem;">${cData.roman}</div>`;
        } else {
            btn.textContent = digitalTime;
        }

        btn.onclick = () => checkAnswer(c, btn);
        choicesEl.appendChild(btn);
    });
}

function checkAnswer(selected: Time, btn: HTMLButtonElement) {
    if (document.querySelector('#timeChoices .choice-btn.correct')) return;
    if (!currentCorrectTime) return;

    const feedback = document.getElementById('timeFeedback');
    const nextBtn = document.getElementById('nextTimeBtn');
    if (!feedback || !nextBtn) return;

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
        document.querySelectorAll<HTMLElement>('#timeChoices .choice-btn').forEach(b => {
            if (quizMode === 'visual') {
                if (b.innerText.includes(data.thai)) b.classList.add('correct');
            } else {
                if (b.textContent === digitalTime) b.classList.add('correct');
            }
        });
    }
    nextBtn.style.display = 'inline-block';
}

export const TimeQuiz = {
    init,
    generate: generateQuestion,
};
