"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
// Ordered list of registered Flow's
const FLOWS = [];
// Flow currently being defined, must be a global so that top-level
// `act` and `check` can know on which Flow to add their functions & assertions
let currentFlow = null;
function flow(name, fn) {
    if (currentFlow) {
        throw new Error("You can't nest flows. Do not call `flow` within an other `flow` definition.");
    }
    // Setup globals
    currentFlow = { name, fns: [] };
    FLOWS.push(currentFlow);
    // Call callback which in turn will be calling act and check
    fn();
    // Clear globals so the `flow` can be called again
    currentFlow = null;
}
exports.flow = flow;
function act(name, fn) {
    if (!currentFlow) {
        throw new Error("You can't call `act` outside of a flow.");
    }
    currentFlow.fns.push((data) => __awaiter(this, void 0, void 0, function* () {
        log("  ACT: %s", name);
        return yield fn(data);
    }));
}
exports.act = act;
function check(name, fn) {
    if (!currentFlow) {
        throw new Error("You can't call `check` outside of a flow.");
    }
    const parentFlow = currentFlow;
    parentFlow.fns.push((data) => __awaiter(this, void 0, void 0, function* () {
        log("CHECK: %s", name);
        const value = (yield fn) ? fn(data) : data;
        parentFlow.assertions.push({ name, snapshot: JSON.stringify(value) });
    }));
}
exports.check = check;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const f of FLOWS) {
            // Reset assertions results
            f.assertions = [];
            log(" FLOW: %s", f.name);
            // Start with `null` as current value and thread returned results through
            // each subsequent `act` or `check` function.
            let result = null;
            for (const fn of f.fns) {
                result = yield fn(result);
            }
        }
        return FLOWS;
    });
}
exports.run = run;
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
function renderJson(res, statusCode, body) {
    res.setHeader("Content-Type", "application/json");
    res.statusCode = statusCode;
    res.end(JSON.stringify(body));
}
function start() {
    const env = process.env.NODE_ENV || "development";
    const port = process.env.PORT || "3000";
    const server = http.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        if (env !== "test") {
            log("%s %s", req.method, req.url);
        }
        // Hande 404s
        if (req.url !== "/") {
            return renderJson(res, 404, error4002);
        }
        // Handle page (GET /)
        if (req.method !== "POST") {
            return renderJson(res, 200, {});
        }
        // Run flows
        try {
            const flows = yield run();
            renderJson(res, 200, flows.map((f) => ({
                assertions: f.assertions,
                name: f.name,
            })));
        }
        catch (e) {
            log("error", e);
            return renderJson(res, 500, error5000);
        }
    }));
    server.listen(parseInt(port, 10));
    log("automated-qa worker listening on port %s", port);
}
exports.start = start;
function log(...args) {
    // tslint:disable-next-line:no-console
    console.log(...args);
}
//# sourceMappingURL=index.js.map