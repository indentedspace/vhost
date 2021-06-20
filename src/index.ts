import express from "express";

interface VHostData {
  host: string;
  hostname: string;
  length: number;
  [key: number]: string;
}

interface VHostHandler {
  (
    req: express.Request<Record<string, string>, any, { vhost: VHostData }>,
    res: express.Response,
    next: express.NextFunction
  ): void;
}

const ASTERISK_REGEXP = /\*/g;
const ASTERISK_REPLACE = "([^.]+)";
const END_ANCHORED_REGEXP = /(?:^|[^\\])(?:\\\\)*\$$/;
const ESCAPE_REGEXP = /([.+?^=!:${}()|[\]/\\])/g;
const ESCAPE_REPLACE = "\\$1";

const vhost = (
  hostname: string | RegExp,
  handle: VHostHandler
): express.Handler => {
  if (!hostname) {
    throw new TypeError("argument hostname is required");
  }

  if (!handle) {
    throw new TypeError("argument handle is required");
  }

  if (typeof handle !== "function") {
    throw new TypeError("argument handle must be a function");
  }

  // create regular expression for hostname
  const regexp = hostregexp(hostname);

  return (req, res, next) => {
    const vhostdata = vhostof(req, regexp);

    if (!vhostdata) {
      return next();
    }

    // populate
    req.body.vhost = vhostdata;

    // handle
    handle(req, res, next);
  };
};

const hostnameof = (req: express.Request) => {
  const host = req.headers.host;

  if (!host) {
    return;
  }

  const offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
  const index = host.indexOf(":", offset);

  return index !== -1 ? host.substring(0, index) : host;
};

const isregexp = (val: string | RegExp): val is RegExp => {
  return Object.prototype.toString.call(val) === "[object RegExp]";
};

const hostregexp = (val: string | RegExp) => {
  let source = !isregexp(val)
    ? String(val)
        .replace(ESCAPE_REGEXP, ESCAPE_REPLACE)
        .replace(ASTERISK_REGEXP, ASTERISK_REPLACE)
    : val.source;

  // force leading anchor matching
  if (source[0] !== "^") {
    source = "^" + source;
  }

  // force trailing anchor matching
  if (!END_ANCHORED_REGEXP.test(source)) {
    source += "$";
  }

  return new RegExp(source, "i");
};

const vhostof = (
  req: express.Request,
  regexp: RegExp
): VHostData | undefined => {
  const host = req.headers.host;
  const hostname = hostnameof(req);

  if (!hostname) {
    return;
  }

  const match = regexp.exec(hostname);

  if (!match) {
    return;
  }

  let obj = Object.create(null);

  obj.host = host;
  obj.hostname = hostname;
  obj.length = match.length - 1;

  for (var i = 1; i < match.length; i++) {
    obj[i - 1] = match[i];
  }

  return obj;
};

export default vhost;
