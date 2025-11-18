// Include the cypress customized commands related files
import addContext from 'mochawesome/addContext';
import './hooks';
import './a11y';
import 'cypress-mochawesome-reporter/register';
import { Result } from 'axe-core';
import { initPerfMeasuring } from './perf';

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      logA11yViolations(violations: Result[], target: string): Chainable<Element>;
      testA11y(target: string, selector?: string): Chainable<Element>;
      perfGroupStart(groupName: string): void;
      perfGroupEnd(groupName: string): void;
    }
  }
}

// Handling errors from application
// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
Cypress.on('uncaught:exception', (err) => {
  return false;
});

Cypress.on('test:after:run', (test, runnable) => {
  if (test.state === 'failed') {
    // Capture DOM structure
    cy.window().then((win) => {
      cy.log('Capturing DOM structure');
      const domContent = win.document.documentElement.outerHTML;
      // You'll need to decide how to save/attach this DOM content.
      // Directly embedding large DOM structures in mochawesome context might make the report very large.
      // A better approach might be to save it to a file and link to it.
      // For demonstration, let's add a small snippet to the report.
      addContext(
        { test },
        {
          title: 'Failed DOM Structure (Snippet)',
          value: domContent.length > 10000 ? domContent.substring(0, 10000) + '...' : domContent,
        },
      );
    });
  }
});

// Add browser logs collector
const logOptions = {
  enableExtendedCollector: true,
};
require('cypress-terminal-report/src/installLogsCollector')(logOptions);
initPerfMeasuring('cypress/perfstats.json');
