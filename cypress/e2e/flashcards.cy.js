describe('Flashcard Section Tests', () => {
  beforeEach(() => {
    // Visit the app
    cy.visit('/index.html');
  });

  it('loads the app and shows flashcards', () => {
    cy.get('h1').should('contain', 'Thai Flashcards');
    cy.get('.flashcard').should('have.length.at.least', 1);
  });

  it('filters cards by category', () => {
    // Click 'Family' category
    cy.get('.category-btn[data-category="family"]').click();
    cy.get('.category-btn[data-category="family"]').should('have.class', 'active');
    
    // Check if the total cards count updated
    cy.get('#totalCards').invoke('text').then((count) => {
      expect(parseInt(count)).to.be.greaterThan(0);
    });
  });

  it('verifies flashcard flip interaction', () => {
    cy.get('.flashcard').first().as('card');
    
    // Should not be flipped initially
    cy.get('@card').should('not.have.class', 'flipped');
    
    // Click the card (forcing it to ensure the click hits even during any grid rendering)
    cy.get('@card').click({ force: true });
    
    // Should have the flipped class
    cy.get('@card').should('have.class', 'flipped');
    
    // Verify Thai text exists (using exist instead of be.visible because 
    // backface-visibility and 3D transforms can sometimes confuse visibility checks)
    cy.get('@card').find('.thai-text').should('exist');
    
    // Flip back
    cy.get('@card').click({ force: true });
    cy.get('@card').should('not.have.class', 'flipped');
  });
});
