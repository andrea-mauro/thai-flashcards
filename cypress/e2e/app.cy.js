describe('Thai Flashcards E2E Tests', () => {
  beforeEach(() => {
    // Visit the app (requires Live Server or a local server running)
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

  it('switches to Numbers view and generates a question', () => {
    // Click Numbers tab
    cy.get('.tab-btn[data-view="numbers"]').click();
    cy.get('#numbersView').should('be.visible');
    cy.get('#flashcardsView').should('not.be.visible');

    // Check if a question is generated
    cy.get('#quizQuestion').should('not.contain', 'Ready?');
    cy.get('.choice-btn').should('have.length', 4);
  });

  it('interacts with the Numbers quiz', () => {
    cy.get('.tab-btn[data-view="numbers"]').click();
    
    // Click a range button
    cy.get('.range-btn[data-range="100"]').click();
    
    // Attempt to answer (logic check)
    cy.get('.choice-btn').first().click();
    cy.get('#quizFeedback').should('not.be.empty');
    cy.get('#nextNumberBtn').should('be.visible');
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
