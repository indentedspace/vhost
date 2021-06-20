"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ASTERISK_REGEXP = /\*/g;
var ASTERISK_REPLACE = "([^.]+)";
var END_ANCHORED_REGEXP = /(?:^|[^\\])(?:\\\\)*\$$/;
var ESCAPE_REGEXP = /([.+?^=!:${}()|[\]/\\])/g;
var ESCAPE_REPLACE = "\\$1";
var vhost = function (hostname, handle) {
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
    var regexp = hostregexp(hostname);
    return function (req, res, next) {
        var vhostdata = vhostof(req, regexp);
        if (!vhostdata) {
            return next();
        }
        // populate
        req.body.vhost = vhostdata;
        // handle
        handle(req, res, next);
    };
};
var hostnameof = function (req) {
    var host = req.headers.host;
    if (!host) {
        return;
    }
    var offset = host[0] === "[" ? host.indexOf("]") + 1 : 0;
    var index = host.indexOf(":", offset);
    return index !== -1 ? host.substring(0, index) : host;
};
var isregexp = function (val) {
    return Object.prototype.toString.call(val) === "[object RegExp]";
};
var hostregexp = function (val) {
    var source = !isregexp(val)
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
var vhostof = function (req, regexp) {
    var host = req.headers.host;
    var hostname = hostnameof(req);
    if (!hostname) {
        return;
    }
    var match = regexp.exec(hostname);
    if (!match) {
        return;
    }
    var obj = Object.create(null);
    obj.host = host;
    obj.hostname = hostname;
    obj.length = match.length - 1;
    for (var i = 1; i < match.length; i++) {
        obj[i - 1] = match[i];
    }
    return obj;
};
exports.default = vhost;
