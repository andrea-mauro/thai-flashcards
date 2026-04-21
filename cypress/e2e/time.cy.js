describe('Thai Time Section Tests', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/index.html#time');
  });

  it('loads the time view and guide', () => {
    cy.get('#timeView').should('be.visible');
    cy.get('#timeView .numbers-guide summary').should('contain', 'Thai Time Guide');
  });

  it('verifies the 6-hour cycle logic in the guide', () => {
    // Open the specific time guide
    cy.get('#timeView .numbers-guide summary').click();
    
    // Check for specific periods
    cy.get('#timeView .guide-content').should('contain', '1-5 AM');
    cy.get('#timeView .guide-content').should('contain', '7-11 PM');
    
    // Check for historical curiosity
    cy.get('#timeView .curiosity-col').should('contain', 'Historical Curiosity');
  });

  it('verifies the 24-hour reference list', () => {
    cy.get('#timeView .numbers-guide summary').click();
    cy.get('#timeView .hours-reference').should('be.visible');
    
    // Check specific hour formats from your notes
    cy.get('#timeView .reference-grid').should('contain', 'ตีหนึ่ง'); // 1 AM
    cy.get('#timeView .reference-grid').should('contain', 'บ่ายโมง'); // 1 PM
    cy.get('#timeView .reference-grid').should('contain', 'หนึ่งทุ่ม'); // 7 PM
  });

  it('interacts with the Time Quiz', () => {
    // Should have generated a question on load
    cy.get('#timeQuestion').should('not.contain', 'Ready?');
    cy.get('#timeChoices .choice-btn').should('have.length', 4);

    // Click an answer and verify feedback
    cy.get('#timeChoices .choice-btn').first().click();
    cy.get('#timeFeedback').should('not.be.empty');
    cy.get('#nextTimeBtn').should('be.visible');

    // Click Next Time and verify refresh
    cy.get('#nextTimeBtn').click();
    cy.get('#timeFeedback').should('be.empty');
    cy.get('#nextTimeBtn').should('not.be.visible');
  });

  it('verifies correct Thai time representation in choices for visual mode', () => {
    cy.viewport('iphone-x');
    cy.visit('/index.html#time');

    // Generate a question and answer it to reveal the correct one
    cy.get('#timeQuestion').should('not.contain', 'Ready?'); // Ensure question is loaded
    cy.get('#timeChoices .choice-btn').first().click({ force: true }); // Click a random choice
    cy.get('#timeFeedback').should('not.be.empty'); // Ensure feedback is shown
    cy.get('#nextTimeBtn').should('be.visible'); // Ensure next button is visible

    // Find the correct answer button
    cy.get('#timeChoices .choice-btn.correct').then(($correctBtn) => {
      // Extract Thai text and romanization from the correct choice
      const thaiText = $correctBtn.find('div').first().text();
      const romanization = $correctBtn.find('.choice-romanization').text();

      // Basic assertions on the extracted text
      expect(thaiText).to.be.a('string').and.not.be.empty;
      expect(thaiText).to.match(/^[\u0E00-\u0E7F\s]+$/); // Check for Thai characters

      expect(romanization).to.be.a('string').and.not.be.empty;
      // Basic check on romanization format
      expect(romanization).to.include('-'); // Romanizations often use hyphens

      // Further assertions could be added here if specific time formats were known/mocked.
      // For now, we confirm that a Thai representation and romanization are present and look valid.
    });

    // Click next to reset for potential further tests or just to clean up the state.
    cy.get('#nextTimeBtn').click();
  });
});
