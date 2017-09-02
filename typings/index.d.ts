declare module "another-name-parser" {
    interface IParsedName{
        first: string;
        last: string;
        original: string;
    }

    export default function(input: string): IParsedName;
}

declare module "string-format-obj";

declare module "find-up" {
    interface Options {
        cwd: string;
    }

    function findUp(filename: string | string[], options?: Options): Promise<string>;

    namespace findUp {
        export function sync(filename: string | string[], options?: Options): string;
    }

    export = findUp;
}
