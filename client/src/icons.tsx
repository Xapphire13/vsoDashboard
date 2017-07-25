// Entypo pictograms by Daniel Bruce — www.entypo.com

declare var require: any;

import * as React from "react";

export enum Icon {
  mail,
  message
}

export function getIcon(icon: Icon): JSX.Element {
  const node = document.createElement("svg");
  node.innerHTML = require("../node_modules/entypo/dist/sprite.svg");
  const svgNode = node.querySelector(`[id=entypo-${Icon[icon]}]`);

  return <div className="icon">
    <svg dangerouslySetInnerHTML={{ __html: svgNode ? svgNode.innerHTML : ""}}></svg>
  </div>;
};
