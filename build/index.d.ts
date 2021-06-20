import express from "express";
export interface VHostData {
    host: string;
    hostname: string;
    length: number;
    [key: number]: string;
}
export interface VHostRequest extends express.Request {
    vhost: VHostData;
}
export interface VHostHandler {
    (req: VHostRequest, res: express.Response, next: express.NextFunction): void;
}
declare const vhost: (hostname: string | RegExp, handle: VHostHandler) => express.Handler;
export default vhost;
