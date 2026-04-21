describe('Numbers Quiz Section Tests', () => {
  beforeEach(() => {
    cy.visit('/index.html');
    // Navigate to the Numbers view
    cy.get('.tab-btn[data-view="numbers"]').click();
    cy.get('#numbersView').should('be.visible');
  });

  it('switches to Numbers view and generates a question', () => {
    // Check if a question is generated
    cy.get('#quizQuestion').should('not.contain', 'Ready?');
    cy.get('.choice-btn').should('have.length', 4);
  });

  it('interacts with the Numbers quiz', () => {
    // Click a range button
    cy.get('.range-btn[data-range="100"]').click();
    
    // Attempt to answer (logic check)
    cy.get('.choice-btn').first().click();
    cy.get('#quizFeedback').should('not.be.empty');
    cy.get('#nextNumberBtn').should('be.visible');
  });
});
