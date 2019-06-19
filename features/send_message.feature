Feature: Send a message

  Scenario Outline: Send a message to a friend
    Given a "<user>" with a "<psswd>" that wants to talk with a friend
    Then the message is sent

  Examples:
    | user | psswd |
    | testdechat6a1 | Dechat_es6a1 |
