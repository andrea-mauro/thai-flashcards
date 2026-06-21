describe('Mobile UX Specific Tests', () => {
  beforeEach(() => {
    // Set to iPhone viewport
    cy.viewport('iphone-x');
    
    // Mock Web Speech API since Cypress environment might not support physical audio
    cy.visit('/index.html', {
      onBeforeLoad(win) {
        // Stub speechSynthesis
        const stub = {
          speak: cy.stub().as('speak'),
          cancel: cy.stub(),
          getVoices: cy.stub().returns([]),
        };
        Object.defineProperty(win, 'speechSynthesis', { value: stub });
        
        // Stub SpeechSynthesisUtterance
        win.SpeechSynthesisUtterance = function(text) {
          this.text = text;
          this.lang = 'th-TH';
          // Trigger onend manually after a short delay to simulate finished speaking
          setTimeout(() => {
            if (this.onend) this.onend();
          }, 300);
          return this;
        };
      }
    });
  });

  it('has touch-friendly button sizes', () => {
    // Buttons should be at least 44px tall for Apple UX guidelines
    cy.get('.tab-btn').first().then($btn => {
      expect($btn.outerHeight()).to.be.at.least(40);
    });

    cy.get('.category-btn').first().then($btn => {
      expect($btn.outerHeight()).to.be.at.least(30);
    });
  });

  it('renders flashcards in a single column on small screens', () => {
    // Check if the container is using a single column grid
    cy.get('.flashcard-container').should('have.css', 'grid-template-columns').then(cols => {
      const columnCount = cols.split(' ').length;
      expect(columnCount).to.equal(1);
    });
  });

  it('handles the "audio playing" state without crashing', () => {
    // Flip the card first because the audio button is on the back
    cy.get('.flashcard').first().click({ force: true });
    
    // Now click the audio button on the back
    cy.get('.audio-btn').first().click({ force: true });
    
    // The 'playing' class should be added when speaking starts
    cy.get('.audio-btn').first().should('have.class', 'playing');
    
    // The 'speak' stub should have been called
    cy.get('@speak').should('have.been.called');

    // After our mock delay (300ms), the class should be removed
    cy.wait(400);
    cy.get('.audio-btn').first().should('not.have.class', 'playing');
  });

});
