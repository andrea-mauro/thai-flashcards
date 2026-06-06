const { FLASHCARD_DATA } = require('../../docs/data/flashcards');

describe('Flashcard Data Integrity', () => {
    test('all flashcard IDs should be unique', () => {
        const ids = FLASHCARD_DATA.map(card => card.id);
        const uniqueIds = new Set(ids);
        
        expect(ids.length).toBe(uniqueIds.size);
    });
});
