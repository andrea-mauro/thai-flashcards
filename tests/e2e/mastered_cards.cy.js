describe('Mastered Cards Feature', () => {
  beforeEach(() => {
    // Clear localStorage before each test to have a clean state
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit('/index.html');
  });

  it('marks a card as mastered and updates UI/counter', () => {
    // Check initial counter
    cy.get('#masteredCards').should('have.text', '0');

    // Click the first card's mastered button
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });

    // Card should have 'mastered' class and button should be 'active'
    cy.get('.flashcard').first().should('have.class', 'mastered');
    cy.get('.flashcard').first().find('.mastered-btn').first().should('have.class', 'active');

    // Counter should increment
    cy.get('#masteredCards').should('have.text', '1');
  });

  it('unmarks a card as mastered', () => {
    // Mark as mastered
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('#masteredCards').should('have.text', '1');

    // Unmark
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });

    // UI and counter should update
    cy.get('.flashcard').first().should('not.have.class', 'mastered');
    cy.get('#masteredCards').should('have.text', '0');
  });

  it('persists mastered status across reloads', () => {
    // Mark first card as mastered
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('#masteredCards').should('have.text', '1');

    // Reload the page
    cy.reload();

    // Status should still be there (order may differ due to shuffle)
    cy.get('.flashcard.mastered').should('have.length', 1);
    cy.get('#masteredCards').should('have.text', '1');
  });

  it('verifies localStorage content', () => {
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true }).then(() => {
        const saved = localStorage.getItem('thai_flashcards_mastered');
        expect(saved).to.not.be.null;
        const ids = JSON.parse(saved);
        expect(ids).to.have.length(1);
    });
  });

  it('updates counter correctly when filtering categories', () => {
    // Filter to Bathroom
    cy.get('.category-btn[data-category="bathroom"]').click();
    
    // Mark first card in Bathroom as mastered
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('#masteredCards').should('have.text', '1');

    // Switch to all
    cy.get('.category-btn[data-category="all"]').click();
    cy.get('#masteredCards').should('have.text', '1');

    // Switch to another category (where nothing is marked)
    cy.get('.category-btn[data-category="kitchen"]').click();
    cy.get('#masteredCards').should('have.text', '0');
  });

  it('resets only the current category progress', () => {
    // Mark a card in Bathroom as mastered
    cy.get('.category-btn[data-category="bathroom"]').click();
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('#masteredCards').should('have.text', '1');

    // Mark a card in Kitchen as mastered
    cy.get('.category-btn[data-category="kitchen"]').click();
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('#masteredCards').should('have.text', '1');

    // Total should be 2
    cy.get('.category-btn[data-category="all"]').click();
    cy.get('#masteredCards').should('have.text', '2');

    // Go back to Kitchen and reset
    cy.get('.category-btn[data-category="kitchen"]').click();
    cy.on('window:confirm', () => true);
    cy.get('#resetProgressBtn').click();

    // Kitchen should be 0
    cy.get('#masteredCards').should('have.text', '0');

    // All should be 1 (the one from Bathroom remains)
    cy.get('.category-btn[data-category="all"]').click();
    cy.get('#masteredCards').should('have.text', '1');
  });

  it('resets all categories progress when "all" is selected', () => {
    // Mark a card in Bathroom as mastered
    cy.get('.category-btn[data-category="bathroom"]').click();
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });

    // Mark a card in Kitchen as mastered
    cy.get('.category-btn[data-category="kitchen"]').click();
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });

    // Select "all" and reset
    cy.get('.category-btn[data-category="all"]').click();
    cy.get('#masteredCards').should('have.text', '2');
    
    cy.on('window:confirm', () => true);
    cy.get('#resetProgressBtn').click();

    // Check UI and counter
    cy.get('#masteredCards').should('have.text', '0');
    cy.get('.flashcard.mastered').should('have.length', 0);
  });

  it('updates the tooltip based on mastery status', () => {
    // Initial state: "Mark as mastered"
    cy.get('.flashcard').first().find('.mastered-btn').first()
      .should('have.attr', 'title', 'Mark as mastered');

    // Mark as mastered: should be "Unmark as mastered"
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('.flashcard').first().find('.mastered-btn').first()
      .should('have.attr', 'title', 'Unmark as mastered');

    // Unmark: should return to "Mark as mastered"
    cy.get('.flashcard').first().find('.mastered-btn').first().click({ force: true });
    cy.get('.flashcard').first().find('.mastered-btn').first()
      .should('have.attr', 'title', 'Mark as mastered');
  });
});
