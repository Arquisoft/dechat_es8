Feature: Login at the system
  Login with an existing user

  Scenario Outline: testdechat6a1 is an user
    Given "<user>" with password "<psswd>"
    Then the login is success
	
    Examples:
      | user | psswd |
	  | testdechat6a1 | Dechat_es6a1 |
	  | testdechat6a1 | hello |
