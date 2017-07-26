/// <reference path="./string-format-obj.d.ts" />

declare module "sqlite/legacy" {
    export type Database = any;
    export function open(...args: any[]): any;
}
