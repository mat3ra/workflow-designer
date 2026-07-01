import { When, Then, And } from "@badeball/cypress-cucumber-preprocessor";

When("I open the workflow designer app", () => {
    cy.visit("/");
});

Then("I see the workflow designer root element", () => {
    cy.get("#root").should("exist");
    cy.get("#root").should("not.be.empty");
});

Then("the page title contains {string}", (title: string) => {
    cy.title().should("contain", title);
});

Then("I see the workflow designer heading", () => {
    cy.get("#workflow-designer-app").should("exist");
    cy.get("h1").should("contain.text", "Workflow Designer");
});

Then("the clean workflow validation section exists", () => {
    cy.get("#validation-alert-clean").should("exist");
});

Then("no MUI alert is visible in the clean validation section", () => {
    // WorkflowValidationAlert renders nothing (null) when there are no errors
    cy.get("#validation-alert-clean").find("[role='alert']").should("not.exist");
});

Then("the error workflow validation section exists", () => {
    cy.get("#validation-alert-error").should("exist");
});

Then("a MUI alert is visible in the error validation section", () => {
    cy.get("#validation-alert-error").find("[role='alert']").should("exist");
});

Then("the alert contains error message text", () => {
    cy.get("#validation-alert-error")
        .find("[role='alert']")
        .should("contain.text", "SCF did not converge");
});
