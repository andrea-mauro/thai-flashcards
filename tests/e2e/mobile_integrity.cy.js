describe('Mobile Integrity & Stability Tests', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    cy.visit('/index.html');
  });

  it('checks for "Mobile-Killer" CSS patterns', () => {
    // We know that @keyframes/animations on the main '.view' container 
    // caused the mobile browser to crash. 
    // This test inspects the computed styles of the view containers.
    
    cy.get('.view').each(($el) => {
      const win = $el[0].ownerDocument.defaultView;
      const style = win.getComputedStyle($el[0]);
      
      // If an animation is active on a main container, we flag it as a risk
      // Standard practice for low-end mobile is to avoid heavy transitions on large divs
      const animation = style.getPropertyValue('animation-name');
      
      expect(animation, 'Main view containers should not have heavy animations that can crash mobile Safari')
        .to.be.oneOf(['none', '']);
    });
  });

  it('verifies the page remains responsive after load', () => {
    // Check performance timing to see if the rendering "hangs"
    cy.window().then((win) => {
      const [entry] = win.performance.getEntriesByType('navigation');
      const loadTime = entry.loadEventEnd - entry.startTime;
      
      // If it takes more than 2 seconds to "finish" rendering on a simple app, 
      // it's a red flag for mobile.
      expect(loadTime).to.be.lessThan(2000);
    });
  });

  it('ensures no "illegal" characters are in the head', () => {
    // Checks if the parser hit an encoding snag
    cy.get('head').within(() => {
      cy.get('meta[charset="UTF-8"]').should('exist');
    });
    cy.document().its('charset').should('eq', 'UTF-8');
  });
});
