Feature: Logout at the system
	Login with an existing user

  Scenario Outline: testdechat6a1 is an user
    Given "<user>" with password "<psswd>", the user make login and log out
    Then the first screen is shown

  Examples:
    | user | psswd |
    | testdechat6a1 | Dechat_es6a1 |