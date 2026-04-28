describe('Days & Months Section Tests', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/index.html#days');
  });

  it('loads the days view and guide', () => {
    cy.get('#daysView').should('be.visible');
    cy.get('#daysView .numbers-guide summary').should('contain', 'Days & Months Guide');
  });

  it('verifies the days and months lists in the guide', () => {
    cy.get('#daysView .numbers-guide summary').click();
    
    // Check days
    cy.get('#daysView .guide-content').should('contain', 'วันอาทิตย์'); // Sunday
    cy.get('#daysView .guide-content').should('contain', 'วันเสาร์'); // Saturday
    
    // Check months
    cy.get('#daysView .guide-content').should('contain', 'มกราคม'); // January
    cy.get('#daysView .guide-content').should('contain', 'ธันวาคม'); // December
  });

  it('interacts with the Date Explorer', () => {
    cy.get('#daysView .numbers-guide summary').click();
    
    // Select a date
    cy.get('#dateInput').type('2026-04-21', { force: true });
    cy.get('#dateTranslateBtn').click({ force: true });
    
    // Verify result exists
    cy.get('#dateResult').should('exist');
    cy.get('#dateThai').should('not.be.empty');
    cy.get('#dateRoman').should('not.be.empty');
  });

  it('interacts with the Days/Months Quiz', () => {
    // Should have generated a question
    cy.get('#dayQuestion').should('not.contain', 'Ready?');
    cy.get('#dayChoices .choice-btn').should('have.length', 4);

    // Switch to Months mode
    cy.get('.day-range-btn[data-mode="months"]').click({ force: true });
    cy.get('.day-range-btn[data-mode="months"]').should('have.class', 'active');
    
    // Click an answer and verify feedback
    cy.get('#dayChoices .choice-btn').first().click({ force: true });
    cy.get('#dayFeedback').should('not.be.empty');
    cy.get('#nextDayBtn').should('be.visible');
  });

  it('verifies visual vs audio mode in days quiz', () => {
    const checkModes = (iterations) => {
      if (iterations <= 0) return;
      
      cy.get('#dayTypeLabel').invoke('text').then((text) => {
        if (text.includes('Thai?')) {
          // Visual Mode: Expect English word (e.g. Sunday or January)
          // We can't easily regex match all words, but we check if it's NOT Thai script
          cy.get('#dayQuestion').invoke('text').should('not.match', /[\u0E00-\u0E7F]/);
        } else {
          // Audio Mode: Expect Thai script inside divs
          cy.get('#dayQuestion').find('div').should('have.length.at.least', 1);
        }
      });

      cy.get('#dayChoices .choice-btn').first().click({ force: true });
      cy.get('#nextDayBtn').click({ force: true });
      checkModes(iterations - 1);
    };

    checkModes(3);
  });
});
