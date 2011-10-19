# -*- coding: utf-8 -*-    
from lettuce import *
from splinter.browser import Browser
import time

def log(var, filename="/tmp/lettice.log"):
    if type(var) is unicode:
        value = var.encode("utf8")
    else:
        value = str(var)
    open(filename, 'a').write(value + "\n")

def have_the_element_using_xpath(element, xpath):
    elements = world.browser.find_by_xpath(xpath)
    assert elements,  "Not found element %s" % xpath
    success = False
    world.element = False
    for each_element in elements:
        if element in each_element.text:
            world.element = each_element
            success = True
            break
    assert success,  "Not found text %s" % element
    return each_element
    
def dont_have_the_element_using_xpath(element, xpath):
    elements = world.browser.find_by_xpath(xpath)
    assert elements,  "Not found element %s" % xpath
    success = True
    world.element = False
    for each_element in elements:
        if element in each_element.text:
            world.element = each_element
            success = False
            break
    assert success,  "Not found text %s" % element
    return each_element

def have_the_element_using_xpath_click(element, xpath):
    element = have_the_element_using_xpath(element, xpath)
    element.click()
    
    
@before.all
def initial_browser(*args, **kw):
    world.browser = Browser('webdriver.firefox')
    #world.browser = Browser('webdriver.chrome')

@after.all
def teardown_browser(total):
    world.browser.quit()    


@step('I go to the url "(.*)"')
def go_to_the_url(step, url):
    world.response = world.browser.visit(url)
    
@step('OpenERP login db "(.*)", login "(.*)", password "(.*)"')
def openerp_login(step, db, login, pwd):
    world.browser.find_by_id('db')[0].find_by_value(db).click()    
    world.browser.fill('user', login)
    world.browser.fill('password', pwd)
    world.browser.find_by_xpath('//button[@type="submit"]').click()
    
@step('I fill the field in "(.*)" with "(.*)"')
def fill_the_field(step, field, value):
    world.browser.fill(field, value)
                                                                    
@step('I see value in field "(.*)" is "(.*)"')  
def see_value_is(step, field, expected):
    assert world.browser.find_by_name(field).value == expected, \
        "Not found value of %s" % field

@step('I have the element "(.*)" using xpath "(.*)"')
def have_the_element(step, element, xpath):
   have_the_element_using_xpath(element, xpath)
   
@step('I dont have the element "(.*)" using xpath "(.*)"')
def dont_have_the_element(step, element, xpath):
    dont_have_the_element_using_xpath(element, xpath)
    
@step('I cannot click the element "(.*)" using xpath "(.*)"')
def cannot_click_the_element(step, element, xpath):
    element = have_the_element_using_xpath(element, xpath)
    element.click()

@step('I have and click the element "(.*)" using xpath "(.*)"')
def click_the_element(step, element, xpath):
   have_the_element_using_xpath_click(element, xpath)

@step('I have and click the element "(.*)" using xpath "(.*)" iframe "(.*)"')
def click_the_element(step, element, xpath, iframe):
    with world.browser.get_iframe(iframe) as browser:
        world.browser = browser
        have_the_element_using_xpath_click(element, xpath)

@step('I have the element using xpath "(.*)"')
def have_the_element(step, xpath):
    elements = world.browser.find_by_xpath(xpath)
    assert elements, "Not found element %s" % xpath

@step('I have and click the element using xpath "(.*)"')
def have_and_click_the_element(step, xpath):
    elements = world.browser.find_by_xpath(xpath)
    assert elements, "Not found element %s" % xpath
    elements[0].click()
    
@step('I have alert using text "(.*)"')
def have_alert(step, text):
    with world.browser.get_alert() as alert:
        assert alert.text == text, "Not that text, was found text %s"%alert.text
           
@step('I accept alert')
def accept_alert(step):
    with world.browser.get_alert() as alert:
        alert.accept()
    

@step('I sleep "(.*)"')
def i_sleep(step, number):
    time.sleep(int(number))
  
@step('I verify the element using xpath "(.*)"')
def have_the_element(step, xpath):
    elements = world.browser.is_element_present_by_xpath(xpath)
    assert elements, "Not found element with xpath %s" % xpath  

@step('I verify the non_element using xpath "(.*)"')
def have_the_element(step, xpath):
    elements = world.browser.is_element_not_present_by_xpath(xpath)
    assert elements, "Not found element with xpath %s" % xpath

@step('I verify the element using id "(.*)"')
def have_the_element(step, id_el):
    elements = world.browser.is_element_present_by_id(id_el)
    assert elements, "Not found element with id %s" % id_el

@step('I verify the non_element using id "(.*)"')
def have_the_element(step, id_el):
    elements = world.browser.is_element_not_present_by_id(id_el)
    assert elements, "Found element with id %s" % id_el
    
@step('I verify the element using value "(.*)"')
def have_the_element(step, value_el):
    elements = world.browser.is_element_present_by_value(value_el)
    assert elements, "Not found element with value %s" % id_el
    
@step('I verify the element using text "(.*)"')
def have_the_element(step, text_el):
    elements = world.browser.is_text_present(text_el)
    assert elements, "Not found element with text %s" % text_el
    
@step('I verify the non_element using text "(.*)"')
def have_the_element(step, text_el):
    elements = world.browser.is_text_not_present(text_el)
    assert elements, "Not found element with text %s" % text_el
    
@step('I want to cmp using xpath "(.*)" attribute "(.*)" record ids "(.*)"')
def sort_the_elements(step, xpath, attribute, ids):
    ids = eval(ids)
    ids = map(str, ids)
    elements = world.browser.find_by_xpath(xpath)
    assert elements,  "Not found element %s" % xpath
    table_ids = map(lambda x: x._element.get_attribute(attribute), elements)
    assert table_ids == ids, "%s != %s" \
                   %('['+",".join(filter(None,table_ids)) +']', '['+",".join(filter(None,ids)) +']')
            
@step('I want to find using xpath "(.*)" attribute "(.*)"')
def sort_the_elements(step, xpath, attribute):
    elements = world.browser.find_by_xpath(xpath)
    assert elements,  "Not found element %s" % xpath
    table_ids = map(lambda x: x._element.get_attribute(attribute), elements)
    assert table_ids , "Does not exist %s" %('['+",".join(filter(None,table_ids)) +']')

