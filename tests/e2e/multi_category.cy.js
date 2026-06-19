describe('Multi-Category Flashcards', () => {
    beforeEach(() => {
        cy.visit('http://localhost:5566');
        // Ensure we are on the flashcards tab
        cy.contains('button', 'Flashcards').click();
    });

    it('should show words assigned to multiple categories in both filters', () => {
        // "Bag" is assigned to ["basic", "clothing"]
        
        // Check in Basic
        cy.get('.category-btn').contains('Basic').click();
        cy.get('#flashcardContainer').contains('Bag').should('be.visible');

        // Check in Clothing
        cy.get('.category-btn').contains('Clothing').click();
        cy.get('#flashcardContainer').contains('Bag').should('be.visible');

        // "Water" is assigned to ["eating", "nature"]
        
        // Check in Eating
        cy.get('.category-btn').contains('Eating').click();
        cy.get('#flashcardContainer').contains('Water').should('be.visible');

        // Check in Nature
        cy.get('.category-btn').contains('Nature').click();
        cy.get('#flashcardContainer').contains('Water').should('be.visible');

        // Check in House
        cy.get('.category-btn').contains('House').click();
        cy.get('#flashcardContainer').contains('Bathroom').should('be.visible');

        // Check in Bathroom
        cy.get('.category-btn').contains('Bathroom').click();
        cy.get('#flashcardContainer').contains('Bathroom').should('be.visible');
    });

    it('should filter correctly for single category words', () => {
        // "Bad" is ["basic"]
        cy.get('.category-btn').contains('Clothing').click();
        cy.get('#flashcardContainer').contains('Bad').should('not.exist');

        cy.get('.category-btn').contains('Basic').click();
        cy.get('#flashcardContainer').contains('Bad').should('be.visible');
    });
});
