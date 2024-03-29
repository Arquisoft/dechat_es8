'use strict';

const assert = require('assert');
var seleniumWebDriver = require ('selenium-webdriver');


module.exports = function () {
    
    //Test login existing user
    this.Given(/^"([^"]*)" with password "([^"]*)"$/, function (user,psswd) {
        var parent = driver.getWindowHandle();
        return helpers.loadPage("https://arquisoft.github.io/dechat_es8/")
            .then(()=> {
                    return driver.findElement(by.xpath("//*[@id='login-btn']")).click()
                        .then(() => {
                            return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                                driver.switchTo().window(allhandles[allhandles.length - 1]);
								return driver.wait(until.elementsLocated(by.xpath("/html/body/div/div/div/button[2]")), 200)
								.then(() => {
									return driver.findElement(by.xpath("/html/body/div/div/div/button[2]")).click()
										.then(() => {
											driver.wait(until.elementsLocated(by.name("username")), 20000);
											driver.findElement(By.name("username")).sendKeys(user); 
											driver.findElement(By.name("password")).sendKeys(psswd); 
											return driver.findElement(by.xpath("//*[@id='login']")).click().then(() => {
												driver.switchTo().window(parent);
												return driver.wait(until.elementsLocated(by.xpath("//*[@id='new-chat-options']")), 200);
											})
									})
								})
                            });
                    })
                })
    });
    
    this.Then(/^the login is success$/,function (){
        return driver.wait(until.elementsLocated(by.xpath("//*[@id='new-chat-options']")), 200);
    });
	
	//Test logout existing user
    this.Given(/^"([^"]*)" with password "([^"]*)", the user make login and log out$/, function (user,psswd) {
        var parent = driver.getWindowHandle();
        return helpers.loadPage("https://arquisoft.github.io/dechat_es8/")
            .then(()=> {
                    return driver.findElement(by.xpath("//*[@id='login-btn']")).click()
                        .then(() => {
                            return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                                driver.switchTo().window(allhandles[allhandles.length - 1]);
								return driver.wait(until.elementsLocated(by.xpath("/html/body/div/div/div/button[2]")), 200)
								.then(() => {
									return driver.findElement(by.xpath("/html/body/div/div/div/button[2]")).click()
										.then(() => {
											driver.wait(until.elementsLocated(by.name("username")), 20000);
											driver.findElement(By.name("username")).sendKeys(user); 
											driver.findElement(By.name("password")).sendKeys(psswd); 
											return driver.findElement(by.xpath("//*[@id='login']")).click().then(() => {
												driver.switchTo().window(parent);
												driver.wait(until.elementsLocated(by.xpath("//*[@id='logout-btn']")), 2000);
											})
									})
								})
                            });
                    })
                })
    });
    
    this.Then(/^the first screen is shown$/,function (){
        driver.findElement(By.xpath("//*[@id='logout-btn']")).click();
        return driver.findElement(by.xpath("//*[@id='login-btn']"));
    });
	
	//Test send a message
    this.Given(/^a "([^"]*)" with a "([^"]*)" that wants to talk with a friend$/, function (user,psswd) {
        var parent = driver.getWindowHandle();
        return helpers.loadPage("https://arquisoft.github.io/dechat_es8/")
            .then(()=> {
                    return driver.findElement(by.xpath("//*[@id='login-btn']")).click()
                        .then(() => {
                            return driver.getAllWindowHandles().then(function gotWindowHandles(allhandles) {
                                driver.switchTo().window(allhandles[allhandles.length - 1]);
                                return driver.findElement(by.xpath("/html/body/div/div/div/button[2]")).click()
                                    .then(() => {
                                        driver.wait(until.elementsLocated(by.name("username")), 20000);
                                        driver.findElement(By.name("username")).sendKeys(user); 
                                        driver.findElement(By.name("password")).sendKeys(psswd); 
                                        return driver.findElement(by.xpath("//*[@id='login']")).click().then(() => {
                                            driver.switchTo().window(parent);                                           
                                            return driver.wait(until.elementsLocated(by.xpath("//*[@id='friend0']")), 20000);
                                        })
                                })
                            });
                    })
                })
    });
    
    this.Then(/^the message is sent$/,function (){
			return driver.wait(until.elementsLocated(by.xpath("//*[@id='friend0']")), 200)
				.then(() => {
					return driver.findElement(by.xpath("//*[@id='friend0']")).click()
						.then(()=> {
							return driver.wait(until.elementsLocated(by.xpath("//*[@id='friend-name']")), 200)
								.then(()=> {
									return driver.findElement(by.xpath("//*[@id='message']")).sendKeys("Message test")
										.then(()=> {
											driver.findElement(by.xpath("//*[@id='write-chat']")).click();
											return driver.wait(until.elementsLocated(by.xpath("//*[@id='right']")), 200);
										})
								});
					});
				});
    });
	
};
