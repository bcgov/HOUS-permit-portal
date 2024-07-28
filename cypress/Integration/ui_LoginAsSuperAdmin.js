// login as SuperAdmin 
/// <reference types ="Cypress"/>
describe('Login As Super Admin',function(){

    it (' Login',function(){
        cy.visit("https://dev.buildingpermit.gov.bc.ca/admin");
        cy.wait(4000);
        // click on menu hamburger menu
        cy.get("body.chakra-ui-light:nth-child(2) div.css-zf0iqh:nth-child(1) nav.css-98q0xj div.chakra-container.css-14vcoqp div.css-1k9efnl div.chakra-stack.css-8pmr8q:nth-child(5) button.chakra-button.chakra-menu__menu-button.css-1cpz837:nth-child(3) span.chakra-button__icon.css-1wh2kri > svg:nth-child(1)").click();
        cy.wait(4000);
        // click on login button from the dropdown
        cy.contains('Login').click({force: true});
        cy.wait(4000);
        // assert if on the correct page
        cy.contains("Basic BCeID").then((el)=> {
            assert.include(el.text(), 'BCeID');  
          });
        cy.contains('Login with BCeID').click({force: true});
        cy.wait(4000);
        cy.get("#user").click({force: true}).type('tanmaysubmitter6');
        cy.wait(4000);
        cy.get("#password").click({force: true}).type('P@ssword1');
        cy.wait(4000);
        cy.once('uncaught:exception', () => false);
        cy.clearLocalStorage()
        cy.wait(4000);
        // assert if on the correct page
        cy.contains("BCeID").then((el)=> {
            assert.include(el.text(), 'BCeID');  
          });
        cy.get("input").eq(3).click({force: true})
        cy.wait(2000);
        cy.get("div.main section.container:nth-child(4) div.row:nth-child(2) div.col-sm-7.col-md-8 div.panel div.panel-body form:nth-child(6) a:nth-child(6) > input.btn.btn-primary").click({force: true});
        cy.wait(2000);
        
        cy.get("body.chakra-ui-light:nth-child(2) div.css-zf0iqh:nth-child(1) nav.css-98q0xj div.chakra-container.css-14vcoqp div.css-1k9efnl > p.chakra-text.css-1v88s50:nth-child(2)").contains('Building Permit Hub');
          cy.get("body.chakra-ui-light:nth-child(2) div.css-zf0iqh:nth-child(1) nav.css-98q0xj div.chakra-container.css-14vcoqp div.css-1k9efnl > p.chakra-text.css-1v88s50:nth-child(2)").then((el)=> {
            assert.include(el.text(), 'Building Permit Hub'); 
          });
        cy.wait(2000);
        cy.get("button").eq(1).click({force:true});
        cy.wait(2000);
        cy.contains('Logout').click({force: true});
        cy.wait(20000);
    })
    })