/// <reference path="./string-format-obj.d.ts" />
/// <reference path="./another-name-parser.d.ts" />

declare module "sqlite/legacy" {
    export type Database = any;
    export function open(...args: any[]): any;
}
