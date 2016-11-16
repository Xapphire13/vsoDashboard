/// <reference path="../typings/index.d.ts" />

String.prototype.format = function(...args: any[]) {
  let output = this as string;

  args.forEach((arg, index) => {
    output = output.replace(`{${index}}`, arg);
  })

  return output;
}
