// Shared Utility Functions
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
