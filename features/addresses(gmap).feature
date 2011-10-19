Feature: Testing
  I would like to test module "Gmap"
  
  Scenario: Open page
    I go to the url "http://localhost:8080/openerp/login"

  Scenario: Login to OpenERP
    OpenERP login db "map", login "admin", password "admin"

  Scenario: Click   
    I have and click the element "SALES" using xpath "//div[@id='applications_menu']/ul/li/a/span"
    I sleep "3"
    I have and click the element "Addresses" using xpath "//table[@class='tree-field']/tbody/tr/td/a"
    I sleep "5"

  Scenario: See the page without map 
    I have and click the element using xpath "//tr[@record='9']"
    I sleep "5"
    I have the element "Latitude" using xpath "//label[@for='lat']" 
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I want to cmp using xpath "//td[@class='item item-float']/span" attribute "value" record ids "['0.000000','0.000000']" 
    I have the element "Please, click the “Get coordinates” button to geocode the address and draw the map." using xpath "//td[@class='item item-gmapwidget']/p"
    I want to find using xpath "//button[@id='gcb']" attribute "disabled"

  Scenario: Edit the page without map 
    I have and click the element "Edit" using xpath "//a[@class='button-a']"
    I sleep "5"
    I have the element "Latitude" using xpath "//label[@for='lat']"   
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I have the element "Please, click the “Get coordinates” button to geocode the address and draw the map." using xpath "//td[@class='item item-gmapwidget']/p"
    I verify the element using xpath "//button[@id='gcb']"
    I have and click the element "Get coordinates" using xpath "//button[@id='gcb']"
    I sleep "10"
    I have and click the element "Save" using xpath "//a[@class='button-a']"
    I sleep "10"
    I have the element "Latitude" using xpath "//label[@for='lat']" 
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I want to cmp using xpath "//td[@class='item item-float']/span" attribute "value" record ids "['50.850340','4.351710']"
    I verify the non_element using text "Please, click the “Get coordinates” button to geocode the address and draw the map."

  Scenario: Delete changes 
    I have and click the element "Edit" using xpath "//a[@class='button-a']"
    I sleep "5"
    I fill the field in "lat" with "0.000000"
    I fill the field in "lng" with "0.000000"
    I have and click the element "Save" using xpath "//a[@class='button-a']"
    I sleep "10"
    I want to cmp using xpath "//td[@class='item item-float']/span" attribute "value" record ids "['0.000000','0.000000']"  
    I have and click the element "Addresses" using xpath "//table[@class='tree-field']/tbody/tr/td/a"
    I sleep "5"

  Scenario: See the page with map  
    I have and click the element using xpath "//tr[@record='4']"
    I sleep "5"
    I have the element "Latitude" using xpath "//label[@for='lat']" 
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I want to cmp using xpath "//td[@class='item item-float']/span" attribute "value" record ids "['50.453049','3.969389']" 
    I verify the non_element using text "Please, click the “Get coordinates” button to geocode the address and draw the map."
    I want to find using xpath "//button[@id='gcb']" attribute "disabled"

  Scenario: Edit the page with map 
    I have and click the element "Edit" using xpath "//a[@class='button-a']"
    I sleep "5"
    I have the element "Latitude" using xpath "//label[@for='lat']"   
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I verify the non_element using text "Please, click the “Get coordinates” button to geocode the address and draw the map."
    I have and click the element "Get coordinates" using xpath "//button[@id='gcb']"
    I sleep "10"
    I have and click the element "Save" using xpath "//a[@class='button-a']"
    I sleep "10"
    I have the element "Latitude" using xpath "//label[@for='lat']" 
    I have the element "Longitude" using xpath "//label[@for='lng']"
    I want to cmp using xpath "//td[@class='item item-float']/span" attribute "value" record ids "['50.453049','3.969389']"
    I verify the non_element using text "Please, click the “Get coordinates” button to geocode the address and draw the map."
    I have and click the element "Addresses" using xpath "//table[@class='tree-field']/tbody/tr/td/a"
    I sleep "5"