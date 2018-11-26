## Automated QA Worker

_A breathtakingly simple way to write QA Checks and keep running them_


### Description

This project allows you to write simple high-level QA checks in JavaScript
using a dead-simple API. With that done "Automated QA" will be able to
run those QA Checks for you on demand or on a schedule making sure to notify
you when a check fails so that you can get that bug fixed before customers
even notice.

### Usage

Using Automated QA is mean to be as simple as can be. It uses snapshot testing
to remove a lot of the test maintenance burden from you meaning you only need
to defined the "actions" you want to do and automated qa will take care of
comparing the result to preview snapshots.

An working example is present in the [`example/`](./example) folder.

Using the Automated QA SDK to test an API using it's API client would
look a bit like this:

```js
import { client } from "my-todo-api-client";
import { flow, act, check, start } from "automated-qa-sdk";

flow("todo api", () => {
  act("list todos", () => client.todos());
  check("no todos exist");

  act("create 1st todo", () => client.new({text: "#1"}));
  check("1st todo was created");
  act("list todos", () => client.todos());
  check("1 todo exists with done=false");

  act("delete todo", (todos) => client.delete(todos[0].id));
  check("1st todo was deleted");
  act("list todos", () => client.todos());
  check("no todos left");
});

start();
```

Each of those `check` statements will generate an assertion with a snapshot
and each time it's ran, it'll be expected that the resulting value of the
previous act expression didn't change. See
[`automated-at`](https://github.com/lambdagrid/automated-qa) for more
documentation on how this works.


### Methods

**flow(name: string, fn: () => void): void**

`flow` defines a new flow which is used to group related checks. Often
named after a specific feature, page or functionality. The `fn` parameter
will be called immediatly and any `act` or `check` called within it will
be added to this flow.

**act(name: string, fn: (previousResult: any) => any): void**

`act` defines a new act step. It get's passed the result of the previous
act or check step and it's `fn` is expected to generate an action returning
some result to be used either by the following `act` step or compared to
a "snapshot" by a `check` step.

**check(name: string, transformFn?: (result: any) => any): void**

`check` defines a new check step. It will make sure to take the result of the
previous `act` step and compare it to the snapshotted result from the
previous run marking this "check" as failed in the case the don't match.

Here the `transformFn` parameter is optional and allows you to transform the
result from the previous `act` step before it's compared to it's snapshot.
This is useful when you need to strip non-deterministic data like unique `id`s.

**start(): void**

`start` starts a simple websever making your checklist accesible to
automated-qa's manager. It exposes a single endpoint that runs all your flows
sequentially and records the value of each assertion.


### Deploying

TBD


### License

GPL-3.0. See `LICENSE.txt` file.
