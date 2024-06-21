import { Http2ServerRequest } from "node:http2";
import { Readable } from "node:stream";
export class RequestError extends Error {
    static name = "RequestError";
    constructor(message, options) {
        super(message, options);
    }
}
export const toRequestError = (e) => {
    if (e instanceof RequestError) {
        return e;
    }
    return new RequestError(e.message, { cause: e });
};
export const GlobalRequest = global.Request;
export class Request extends GlobalRequest {
    constructor(input, options) {
        if (typeof input === "object" && getRequestCache in input) {
            input = input[getRequestCache]();
        }
        // Check if body is ReadableStream like. This makes it compatbile with ReadableStream polyfills.
        if (typeof options?.body?.getReader !== "undefined") {
            // node 18 fetch needs half duplex mode when request body is stream
            // if already set, do nothing since a Request object was passed to the options or explicitly set by the user.
            ;
            options.duplex ??= "half";
        }
        super(input, options);
    }
}
const newRequestFromIncoming = (method, url, incoming, abortController) => {
    const init = {
        method,
        headers: incoming.headers,
        signal: abortController.signal,
    };
    return new Request(url, init);
};
const getRequestCache = Symbol("getRequestCache");
const requestCache = Symbol("requestCache");
const incomingKey = Symbol("incomingKey");
const urlKey = Symbol("urlKey");
const abortControllerKey = Symbol("abortControllerKey");
export const getAbortController = Symbol("getAbortController");
const requestPrototype = {
    get method() {
        return this[incomingKey].method || "GET";
    },
    get url() {
        return this[urlKey];
    },
    [getAbortController]() {
        this[getRequestCache]();
        return this[abortControllerKey];
    },
    [getRequestCache]() {
        this[abortControllerKey] ||= new AbortController();
        return (this[requestCache] ||= newRequestFromIncoming(this["method"], this[urlKey], this[incomingKey], this[abortControllerKey]));
    },
};
[
    "body",
    "bodyUsed",
    "cache",
    "credentials",
    "destination",
    "headers",
    "integrity",
    "mode",
    "redirect",
    "referrer",
    "referrerPolicy",
    "signal",
    "keepalive",
].forEach((k) => {
    Object.defineProperty(requestPrototype, k, {
        get() {
            return this[getRequestCache]()[k];
        },
    });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
    Object.defineProperty(requestPrototype, k, {
        value: function () {
            return this[getRequestCache]()[k]();
        },
    });
});
Object.setPrototypeOf(requestPrototype, Request.prototype);
export const newRequest = (incoming, defaultHostname) => {
    const req = Object.create(requestPrototype);
    req[incomingKey] = incoming;
    const host = (incoming instanceof Http2ServerRequest
        ? incoming.authority
        : incoming.headers.host) || defaultHostname;
    if (!host) {
        throw new RequestError("Missing host header");
    }
    if (!incoming.url) {
        throw new RequestError("Missing URL");
    }
    const url = new URL(
    // Parity with node so we check incoming?.socket?.encrypted
    // `${incoming instanceof Http2ServerRequest || incoming?.socket && incoming?.socket?.encrypted ? "https" : "http"}://${host}${incoming.url}`
    incoming.url);
    if (url.hostname.length !== host.length &&
        url.hostname !== host.replace(/:\d+$/, "")) {
        throw new RequestError("Invalid host header");
    }
    req[urlKey] = url.href;
    return req;
};
export const getRequestListener = (fetchCallback, options = {}) => {
    if (options.overrideGlobalObjects !== false && global.Request !== Request) {
        Object.defineProperty(global, "Request", {
            value: Request,
        });
        // Object.defineProperty(global, "Response", {
        //   value: Response2
        // });
    }
    return async (errorHandler) => {
        return async (incoming, outgoing) => {
            let res, req;
            try {
                req = newRequest(incoming, options.hostname);
                res = fetchCallback(req, { incoming, outgoing });
                // if (cacheKey in res) {
                //   logger.info('Is there')
                //   return responseViaCache(res, outgoing);
                // }
                return res;
            }
            catch (e) {
                if (!res) {
                    if (errorHandler) {
                        return errorHandler(req ? e : toRequestError(e));
                    }
                }
            }
        };
    };
};
