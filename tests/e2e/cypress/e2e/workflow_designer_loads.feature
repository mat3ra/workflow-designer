Feature: Workflow Designer standalone app loads and renders

    Scenario: The standalone app root element renders without errors
        When I open the workflow designer app
        Then I see the workflow designer root element

    Scenario: The app title is correct
        When I open the workflow designer app
        Then the page title contains "Workflow Designer"

    Scenario: The workflow designer heading is visible
        When I open the workflow designer app
        Then I see the workflow designer heading

    Scenario: No alert is shown when a workflow has no errors
        When I open the workflow designer app
        Then the clean workflow validation section exists
        And no MUI alert is visible in the clean validation section

    Scenario: An error alert is shown when a workflow has execution errors
        When I open the workflow designer app
        Then the error workflow validation section exists
        And a MUI alert is visible in the error validation section
        And the alert contains error message text
