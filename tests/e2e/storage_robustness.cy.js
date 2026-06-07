describe('Storage Integrity and Robustness', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('ignores non-existent IDs in localStorage and maintains correct counter', () => {
    // 1. Setup localStorage with one valid ID and one fake (orphaned) ID
    // We'll pick the first card's ID as the valid one
    cy.readFile('src/data/flashcards.ts').then((content) => {
      // Regex to grab the first ID from the file
      const idMatch = content.match(/"id":"([^"]+)"/);
      const validId = idMatch[1];
      const fakeId = 'this-id-does-not-exist-in-data';

      // Set the storage manually
      const masteredList = [validId, fakeId];
      
      cy.window().then((win) => {
        win.localStorage.setItem('thai_flashcards_mastered', JSON.stringify(masteredList));
      });

      // 2. Reload the page to load the new storage state
      cy.reload();

      // 3. Verify the counter only counts the valid ID
      // It should be 1, not 2
      cy.get('#masteredCards').should('have.text', '1');

      // 4. Verify the valid card is visually marked as mastered
      cy.get('.flashcard.mastered').should('have.length', 1);
      
      // 5. Verify the app didn't crash and other UI elements are present
      cy.get('h1').should('contain', 'Thai Flashcards');
      cy.get('#flashcardContainer').children().should('have.length.at.least', 1);
    });
  });
});
