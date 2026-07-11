describe("Workflow Designer Standalone", () => {
    it("should load the designer page", () => {
        cy.visit("/");
        cy.get("#root").should("exist");
    });
});
