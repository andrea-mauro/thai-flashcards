declare global {
    interface Window {
        playAudio: (text: string, btn?: HTMLElement | null) => void;
        INITIAL_VIEW: string;
    }
}

export function playAudio(text: string, btn?: HTMLElement | null) {
    if (!text) return;

    if ('speechSynthesis' in window) {
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
window.playAudio = playAudio;

export function showToast(message: string) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }
}
