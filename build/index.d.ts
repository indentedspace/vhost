import express from "express";
interface VHostData {
    host: string;
    hostname: string;
    length: number;
    [key: number]: string;
}
interface VHostHandler {
    (req: express.Request<Record<string, string>, any, {
        vhost: VHostData;
    }>, res: express.Response, next: express.NextFunction): void;
}
declare const vhost: (hostname: string | RegExp, handle: VHostHandler) => express.Handler;
export default vhost;
