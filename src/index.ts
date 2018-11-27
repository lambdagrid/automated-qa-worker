import * as http from "http";

interface IAssertion {
  name: string;
  snapshot: string;
}

interface IFlow {
  name: string;
  assertions: IAssertion[];
  fns: Array<(data: any) => Promise<any>>;
}

// Ordered list of registered Flow's
const FLOWS: IFlow[] = [];
// Flow currently being defined, must be a global so that top-level
// `act` and `check` can know on which Flow to add their functions & assertions
let currentFlow: IFlow = null;

export function flow(name: string, fn: () => void) {
  if (currentFlow) {
    throw new Error("You can't nest flows. Do not call `flow` within an other `flow` definition.");
  }

  // Setup globals
  currentFlow = { name, fns: [] } as IFlow;
  FLOWS.push(currentFlow);

  // Call callback which in turn will be calling act and check
  fn();

  // Clear globals so the `flow` can be called again
  currentFlow = null;
}

export function act(name: string, fn: (data: any) => Promise<any>) {
  if (!currentFlow) {
    throw new Error("You can't call `act` outside of a flow.");
  }
  currentFlow.fns.push(async (data: any) => {
    log("  ACT: %s", name);
    return await fn(data);
  });
}

export function check(name: string, fn: (data: any) => Promise<any>) {
  if (!currentFlow) {
    throw new Error("You can't call `check` outside of a flow.");
  }
  const parentFlow = currentFlow;
  parentFlow.fns.push(async (data: any) => {
    log("CHECK: %s", name);
    const value = await fn ? fn(data) : data;
    parentFlow.assertions.push({name, snapshot: JSON.stringify(value)});
  });
}

export async function run() {
  for (const f of FLOWS) {
    // Reset assertions results
    f.assertions = [];

    log(" FLOW: %s", f.name);

    // Start with `null` as current value and thread returned results through
    // each subsequent `act` or `check` function.
    let result = null;
    for (const fn of f.fns) {
      result = await fn(result);
    }
  }

  return FLOWS;
}

const error4002 = {
  cause: "The request's URI points to a resource which does not exist.",
  code: 4002,
  message: "Requested resource not found",
};
const error5000 = {
  cause: "An unknown error occured while processing this request.",
  code: 5000,
  message: "Internal server error",
};

function renderJson(res: http.ServerResponse, statusCode: number, body: any) {
  res.setHeader("Content-Type", "application/json");
  res.statusCode = statusCode;
  res.end(JSON.stringify(body));
}

function log(...args: any[]) {
  // tslint:disable-next-line:no-console
  console.log(...args);
}
