export class ContentLoader {
  public static loadStylesheets(...stylesheetPaths: string[]): void {
    stylesheetPaths.forEach(stylesheetPath => {
      let stylesheetName = (/\/([^/]*)\.css/gi).exec(stylesheetPath)[1];
      if($(`#${stylesheetName}-stylesheet`).length > 0) {
        return; // Stylesheet already loaded
      }

      let link = $(`<link id='${stylesheetName}-stylesheet' rel="stylesheet" type="text/css" href="${stylesheetPath}"/>`);
      $("head").append(link);
    });
  }

  public static loadHtmlTemplate(templatePath: string): Q.Promise<string> {
    let templateName = (/\/([^/]*)\.html/gi).exec(templatePath)[1];
    if($(`#${templateName}-template`).length > 0) {
      return Q($(`#${templateName}-template`)[0].innerHTML); // Template already loaded
    }

    let script = $(`<script id='${templateName}-template' type='text/html'></script>`);
    let def = Q.defer<string>();
    script.load(templatePath, () => {
      // If nothing beat us to it
      if($(`#${templateName}-template`).length <= 0) {
        $("body").append(script);
      }
      def.resolve(script[0].innerHTML);
    });

    return def.promise;
  }
}
