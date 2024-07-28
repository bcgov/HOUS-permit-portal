/// <reference types ="Cypress"/>

describe ('API tests',function(){

it('API test', function(){
    cy.intercept('GET','https://dev.buildingpermit.gov.bc.ca/welcome').as('loginPage')
    cy.wait('@loginPage').then(xhr=>{
        expect (xhrs.map(xhr=>xhr.status)).to.include(200)
    })
})
})