describe('Hide Mastered Toggle', () => {
    beforeEach(() => {
        cy.visit('http://localhost:5566');
        cy.contains('button', 'Flashcards').click();
    });

    it('should hide mastered cards when the toggle is active', () => {
        // Mark first card as mastered
        cy.get('.flashcard').first().as('firstCard');
        cy.get('@firstCard').find('.mastered-btn').first().click();
        
        // Ensure it's marked as mastered (has the class)
        cy.get('@firstCard').should('have.class', 'mastered');

        // Get the text of the mastered card to verify later
        cy.get('@firstCard').find('.english-text').invoke('text').then((masteredText) => {
            // Activate "Hide Mastered" toggle
            cy.get('#hideMasteredToggle').click({ force: true });

            // Verify the card is no longer in the list
            cy.get('#flashcardContainer').should('not.contain', masteredText);

            // Verify stats counters still show the mastered card
            cy.get('#masteredCards').should('contain', '1');
            cy.get('#totalCards').invoke('text').then((text) => {
                const total = parseInt(text);
                expect(total).to.be.greaterThan(0);
            });

            // Deactivate toggle
            cy.get('#hideMasteredToggle').click({ force: true });

            // Verify the card is back
            cy.get('#flashcardContainer').should('contain', masteredText);
        });
    });

    it('should immediately hide a card when marked as mastered while toggle is ON', () => {
        // Activate toggle first
        cy.get('#hideMasteredToggle').click({ force: true });

        // Find a card and get its text
        cy.get('.flashcard').first().as('cardToMaster');
        cy.get('@cardToMaster').find('.english-text').invoke('text').then((text) => {
            // Click the master button
            cy.get('@cardToMaster').find('.mastered-btn').first().click();

            // Card should immediately disappear
            cy.get('#flashcardContainer').should('not.contain', text);
        });
    });

    it('should show mastered cards again after resetting progress', () => {
        // Mark first card as mastered and hide it
        cy.get('.flashcard').first().find('.english-text').invoke('text').then((text) => {
            cy.get('.flashcard').first().find('.mastered-btn').first().click();
            cy.get('#hideMasteredToggle').click({ force: true });
            cy.get('#flashcardContainer').should('not.contain', text);

            // Reset progress
            cy.get('#resetProgressBtn').click();
            cy.on('window:confirm', () => true);

            // Should be visible again even if toggle is ON (because it's no longer mastered)
            cy.get('#flashcardContainer').should('contain', text);
        });
    });

    it('should successfully reset category progress even when Hide Mastered is active', () => {
        // 1. Select a category (Basic)
        cy.get('.category-btn').contains('Basic').click();

        // 2. Master a card
        cy.get('.flashcard').first().as('card');
        cy.get('@card').find('.mastered-btn').first().click();

        // 3. Turn ON Hide Mastered
        cy.get('#hideMasteredToggle').click({ force: true });
        
        // 4. Verify card is hidden but counter shows 1
        cy.get('#masteredCards').should('contain', '1');

        // 5. Click reset (stub the confirm dialog)
        cy.get('#resetProgressBtn').click();
        cy.on('window:confirm', () => true);

        // 6. Verify counter is back to 0 and card is visible again
        cy.get('#masteredCards').should('contain', '0');
        cy.get('.flashcard').should('exist');
    });
});
