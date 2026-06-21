describe('Compound Word Breakdown', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should show compound word breakdown for "River"', () => {
        // 1. Select "Nature" category
        cy.get('.category-btn').contains('Nature').click();

        // 2. Find the River card (Mae-Nam)
        cy.contains('.english-text', /^River$/).parents('.flashcard').as('riverCard');
        
        // 3. Reveal the back
        cy.get('@riverCard').click();

        // 4. Verify romanization contains compound tokens
        cy.get('@riverCard').find('.romanization').within(() => {
            // "mɛ̂ɛ-náam"
            cy.get('.compound-token').should('have.length', 2);
            
            // First token: mɛ̂ɛ
            cy.get('.compound-token').eq(0).should('contain', 'mɛ̂ɛ');
            cy.get('.compound-token').eq(0).should('have.attr', 'data-tooltip').and('include', 'Mother');
            
            // Second token: náam
            cy.get('.compound-token').eq(1).should('contain', 'náam');
            cy.get('.compound-token').eq(1).should('have.attr', 'data-tooltip').and('include', 'Water');
            cy.get('.compound-token').eq(1).should('have.attr', 'data-tooltip').and('not.include', 'River');
        });
    });

    it('should not highlight the word itself on its own card', () => {
        // "Water" -> "náam"
        cy.get('.category-btn').contains('Eating').click();
        cy.contains('.english-text', /^Water$/).parents('.flashcard').as('waterCard');
        cy.get('@waterCard').click();

        // Should NOT have any compound tokens if it's a perfect match with the card meaning
        cy.get('@waterCard').find('.romanization').within(() => {
            cy.get('.compound-token').should('not.exist');
        });
    });

    it('should show compound breakdown for "Bath sponge" precisely', () => {
        // "fɔɔng náam àap náam"
        cy.get('.category-btn').contains('Bathroom').click();
        cy.contains('.english-text', /^Bath sponge$/).parents('.flashcard').as('spongeCard');
        cy.get('@spongeCard').click();

        cy.get('@spongeCard').find('.romanization').within(() => {
            // "náam" appears twice, "fɔɔng" appears once.
            // Tokens found: "fɔɔng", "náam", "náam".
            cy.get('.compound-token').should('have.length', 3);
        });
    });
});
