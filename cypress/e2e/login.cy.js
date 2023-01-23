/// <reference types="cypress" />

let idToken;
let user = {};
const originalUser = {
  firstName: "Nikh",
  lastName: "NewTester",
};
const newUser = {
  firstName: "test",
  lastName: "thisisatest",
};
const username = Cypress.env("USERNAME");
const password = Cypress.env("PASSWORD");
const login = (email, password) => {
  cy.visit("https://instantscripts.com.au/login");
  // Prevents a race condition on repeated runs
  cy.wait("@lg", { timeout: 10000 });
  cy.get('[name="email"]').type(email);
  cy.get('[name="password"]').type(password);
  cy.get(".border-transparent").click();
  const expectedProperties = [
    "idToken",
    "email",
    "refreshToken",
    "expiresIn",
    "localId",
    "registered",
  ];
  cy.wait("@login").then((req) => {
    expect(req.response.statusCode).to.equal(200);
    expect(req.response.body).to.have.any.keys(expectedProperties);
    // Intended to use with the reset state of user test
    idToken = req.response.body.idToken;
  });
};
const editUser = (firstName, lastName) => {
  cy.get(".right > .ui").click();
  cy.get("[href='/profile']").last().click();
  cy.get("#user_signed_area").within(() => {
    cy.get("button.ui.primary.button").first().click();
  });
  cy.get("div.ui.modal.transition.visible.active").within(() => {
    cy.get("[name='first_name']").clear().type(firstName);
    cy.get("[name='last_name']").clear().type(lastName);
    cy.get("button.ui.green.primary.button").click();
  });
  cy.wait("@updateUser").then((req) => {
    expect(req.request.body).to.have.property("first_name", firstName);
    expect(req.request.body).to.have.property("last_name", lastName);
    expect(req.response.statusCode).to.equal(200);
    expect(req.response.body.res).to.eq("ok");
  });
};

describe("Login to InstantScripts", () => {
  beforeEach(() => {
    cy.intercept(
      "POST",
      "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=*"
    ).as("login");
    cy.intercept("POST", "https://api.instantscripts.com.au/lg").as("lg");
    cy.intercept(
      "POST",
      "https://api.instantscripts.com.au/User/updateUserProfile"
    ).as("updateUser");
    cy.intercept(
      "POST",
      "https://api.instantscripts.com.au/User/loadUserProf"
    ).as("loadUserProf");
  });

  afterEach(() => {
    // I was hoping to use an api call to reset the user details but I get a 403 error
    // cy.request({
    //   url: "https://api.instantscripts.com.au/User/updateUserProfile",
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     authorization: `Bearer ${idToken}`,
    //   },
    // body: {
    //   uid: "cmrL0CszZbW3fjiMW1ZtYwNKYKA2",
    //   parent: null,
    //   email: username,
    //   first_name: "Nikh",
    //   last_name: "NewTester",
    //   mobile: "0400 100 234",
    //   newname: "Nikh NewTester",
    // },
  });

  it("Should be able to login and edit users profile correctly", () => {
    login(username, password);
    editUser(newUser.firstName, newUser.lastName);
    // After editing the user this responds with the original user details for some reason?
    cy.wait("@loadUserProf").then((req) => {
      expect(req.response.body.first_name).to.eq(originalUser.firstName);
      expect(req.response.body.last_name).to.eq(originalUser.lastName);
    });
    // Reset state of user
    editUser(originalUser.firstName, originalUser.lastName);
  });

  it("Should be able to search for medicine correctly", () => {
    login(username, password);
    cy.get("#home-section-features").within(() => {
      cy.contains("Request a Script $19").click();
    });
    // App seems to crash without the wait here?
    cy.wait("@loadUserProf", { timeout: 10000 });
    cy.get("[placeholder='Search by medicine name…']").type("diabetes");
    cy.get(".cards-list").first().children().should("have.length", 3);
  });
});
