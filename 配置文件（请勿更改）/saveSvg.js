var prefix = {
  xmlns: "http://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",
  svg: "http://www.w3.org/2000/svg"
};

var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';


function GetSvgXml() {


  window.URL = (window.URL || window.webkitURL);

  var body = document.body,
    emptySvg;

  var documents = [window.document],
    res = [];

  iframes = document.querySelectorAll("iframe"),
    objects = document.querySelectorAll("object");

  // add empty svg element
  var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
  window.document.body.appendChild(emptySvg);
  var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

  [].forEach.call(iframes, function (el) {
    try {
      if (el.contentDocument) {
        documents.push(el.contentDocument);
      }
    } catch (err) {
      console.log(err);
    }
  });

  [].forEach.call(objects, function (el) {
    try {
      if (el.contentDocument) {
        documents.push(el.contentDocument);
      }
    } catch (err) {
      console.log(err)
    }
  });

  documents.forEach(function (doc) {
    var newSources = getSources(doc, emptySvgDeclarationComputed);
    // because of prototype on NYT pages
    for (var i = 0; i < newSources.length; i++) {
      res.push(newSources[i].source.toString());
    }
  });

  //求最大字符串大小
  var maxLength = 0;
  for (let index = 0; index < res.length; index++) {
    const element = res[index];
    if (maxLength < element.length) {
      maxLength = element.length;
    }
  }

  for (let index = 0; index < res.length; index++) {
    const element = res[index];
    if (element.length == maxLength) {
      return element;
    }
  }

}

function getSources(doc, emptySvgDeclarationComputed) {
  var svgInfo = [],
    svgs = doc.querySelectorAll("svg");

  [].forEach.call(svgs, function (svg) {

    svg.setAttribute("version", "1.1");

    // removing attributes so they aren't doubled up
    svg.removeAttribute("xmlns");
    svg.removeAttribute("xlink");

    // These are needed for the svg
    if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
      svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
    }

    if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
      svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
    }

    setInlineStyles(svg, emptySvgDeclarationComputed);

    var source = (new XMLSerializer()).serializeToString(svg);
    var rect = svg.getBoundingClientRect();
    svgInfo.push({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      class: svg.getAttribute("class"),
      id: svg.getAttribute("id"),
      name: svg.getAttribute("name"),
      childElementCount: svg.childElementCount,
      source: [doctype + source]
    });
  });
  return svgInfo;
}

function setInlineStyles(svg, emptySvgDeclarationComputed) {

  function explicitlySetStyle(element) {
    var cSSStyleDeclarationComputed = getComputedStyle(element);
    var i, len, key, value;
    var computedStyleStr = "";
    for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
      key = cSSStyleDeclarationComputed[i];
      value = cSSStyleDeclarationComputed.getPropertyValue(key);
      if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
        computedStyleStr += key + ":" + value + ";";
      }
    }
    element.setAttribute('style', computedStyleStr);
  }
  function traverse(obj) {
    var tree = [];
    tree.push(obj);
    visit(obj);
    function visit(node) {
      if (node && node.hasChildNodes()) {
        var child = node.firstChild;
        while (child) {
          if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
            tree.push(child);
            visit(child);
          }
          child = child.nextSibling;
        }
      }
    }
    return tree;
  }
  // hardcode computed css styles inside svg
  var allElements = traverse(svg);
  var i = allElements.length;
  while (i--) {
    explicitlySetStyle(allElements[i]);
  }
}

