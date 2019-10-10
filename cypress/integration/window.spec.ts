/// <reference types="Cypress" />

context("Window", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("cy.window() - get the global window object", () => {
    cy.window().should("have.property", "top");
  });

  it("cy.document() - get the document object", () => {
    cy.document()
      .should("have.property", "charset")
      .and("eq", "UTF-8");
  });

  it("cy.title() - get the title", () => {
    cy.title().should("include", "Raaga | See · Play · Learn");
  });
});
