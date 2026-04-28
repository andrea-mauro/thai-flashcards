describe('General App Tests', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    // Visit the app and ensure the initial view is flashcards
    cy.visit('/index.html#flashcards');
    // Wait for the app-loading shield to be removed from HTML
    cy.get('html', { timeout: 10000 }).should('not.have.class', 'app-loading');
  });

  it('navigates between views', () => {
    // Navigate to Numbers view
    cy.get('.tab-btn[data-view="numbers"]').click();
    cy.url().should('include', '#numbers');
    cy.get('#numbersView').should('be.visible');

    // Navigate to Time view
    cy.get('.tab-btn[data-view="time"]').click();
    cy.url().should('include', '#time');
    cy.get('#timeView').should('be.visible');
    
    // Navigate to Days view
    cy.get('.tab-btn[data-view="days"]').click();
    cy.url().should('include', '#days');
    cy.get('#daysView').should('be.visible');

    // Navigate back to Flashcards view
    cy.get('.tab-btn[data-view="flashcards"]').click();
    cy.url().should('include', '#flashcards');
    cy.get('#flashcardsView').should('be.visible');
  });
});
