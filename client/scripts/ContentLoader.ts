export class ContentLoader {
  public static loadStylesheets(stylesheetNames: string[]): void {
    stylesheetNames.forEach(stylesheetName => {
      if($(`#${stylesheetName}-stylesheet`).length > 0) {
        return; // Stylesheet already loaded
      }

      let link = $(`<link id='${stylesheetName}-stylesheet' rel="stylesheet" type="text/css" href="/styles/${stylesheetName}.css"/>`);
      $("head").append(link);
    });
  }

  public static loadHtmlTemplates(templateNames: string[]): Q.Promise<any> {
    let promises = templateNames.map(templateName => {
      if($(`#${templateName}-template`).length > 0) {
        return Q(); // Template already loaded
      }

      let script = $(`<script id='${templateName}-template' type='text/html'></script>`);
      let def = Q.defer<any>();
      script.load(`/templates/${templateName}.html`, () => {
        // If nothing beat us to it
        if($(`#${templateName}-template`).length <= 0) {
          $("body").append(script);
        }
        def.resolve();
      });

      return def.promise;
    });

    return Q.all(promises);
  }
}
