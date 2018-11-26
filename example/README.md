## Example use of `automated-qa`

This folder is an example of how you can use Lambda Grid's `automated-qa` tool
to write API tests.

The `index.js` file contains tests verifying that the simple "todo" API
implemented [here](https://github.com/lambdagrid/automated-qa/tree/master/test-service)
works as designed.

Assertions are declared as simple `flow`, `act` and `check` statements (those
are explained in greater detail in this project's top level readme).

A project using the `automated-qa` SDK is meant to be deployed someplace that's
accessible to the "manager" that will be responsible for running this checklist
and checking for matches/failures. This could be a public url on your main app
if you are using Node.js or any cloud PaaS like Heroku or Now.sh.
