describe('General App Tests', () => {
  beforeEach(() => {
    // Visit the app and ensure the initial view is flashcards
    cy.visit('/index.html#flashcards');
  });

  // Add any general app tests here that don't fit into specific feature files.
  // For example, testing navigation between views or overall app loading.
  it('navigates between views', () => {
    // Test initial view
    cy.url().should('include', '#flashcards');

    // Navigate to Numbers view
    cy.get('.tab-btn[data-view="numbers"]').click();
    cy.url().should('include', '#numbers');
    cy.get('#numbersView').should('be.visible');

    // Navigate to Time view
    cy.get('.tab-btn[data-view="time"]').click();
    cy.url().should('include', '#time');
    cy.get('#timeView').should('be.visible');

    // Navigate back to Flashcards view
    cy.get('.tab-btn[data-view="flashcards"]').click();
    cy.url().should('include', '#flashcards');
    cy.get('#flashcardsView').should('be.visible');
  });
});

