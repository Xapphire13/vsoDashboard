declare module "another-name-parser"{
    interface IParsedName{
        first: string;
        last: string;
        original: string;
    }
    export default function(input: string): IParsedName;
}