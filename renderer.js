// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var area = document.createElement("div");
NodeList.prototype.forEach = Array.prototype.forEach;

function main() {
  setupUI();
}
main();

function setupUI() {
  area.id = "ta-main";
  area.className = "ta-main";
  area.contentEditable = true;
  area.addEventListener("keyup", e => parseKeyUp(e), false);
  area.addEventListener("keydown", e => parseKeyDown(e), false);
  // area.addEventListener("paste", e => parse(e.target), false);
  document.body.appendChild(area);
}

function parseKeyUp(e) {
  var pos = getCaret();
  parse(e.target);
}

function moveCaret(e) {
  var pos = getCaret();
  console.log(pos.offset);
  switch (e.keyCode) {
    case 37:
      return pos.offset == 0 ? moveLeft() : false;
  }
}

function nextParentWithPrevSibling(node) {
  while (node.id != "ta-main") {
    if (node.previousSibling) return node;
    node = node.parentNode;
  }
  return null;
}

function moveLeft() {
  var pos = getCaret();
  var rightThres = Array.from(pos.node.parentNode.childNodes).indexOf(pos.node);
  var newNode = checkParentForTextNode(pos.node, 0);
  // console.log(pos, newNode);
  setCaret(newNode, newNode.length);
  return true;
}

function checkParentForTextNode(node, rightThres) {
  if (node == area.parentNode) {
    return null;
  }
  var res = checkChildrenForTextNode(node, rightThres);
  if (res) {
    return res;
  } else {
    rightThres = Array.from(node.parentNode.childNodes).indexOf(node);
    return checkParentForTextNode(node.parentNode, rightThres);
  }
}

function checkChildrenForTextNode(node, rightThres) {
  var children = node.childNodes;
  console.dir(node);
  rightThres = rightThres == -1 ? children.length : rightThres;
  for (var i = rightThres - 1; i >= 0; i--) {
    if (children[i].nodeType != 3) {
      return checkChildrenForTextNode(children[i], -1);
    }
    console.log(children[i]);
    return children[i];
  }
  return null;
}

function parseKeyDown(e) {
  var pos = getCaret();

  // if ([37, 38, 39, 40].includes(e.keyCode)) {
  //   if (moveCaret(e)) {
  //     e.stopPropagation();
  //     e.preventDefault();
  //   }
  // }

  var par = nextParentWithClass(pos.node, "wrapper");
  if (e.which == 8) {
    if (par != null) {
      if (pos.offset == 0) {
        // e.preventDefault();
        // e.stopPropagation();
      }
    }
  }
  if (e.which == 13 && par) {
    var newLine = document.createElement("div");
    newLine.innerHTML = "<br/>";
    console.log(par);
    // var wrapper = nextParentThatIsChildOfNodeWithClass(pos.node, "ta-main");
    insertAfter(newLine, par);
    setCaret(newLine, 0);
    e.preventDefault();
    e.stopPropagation();
  }
}

function nextParentThatIsChildOfNodeWithClass(node, className) {
  while (node.parentNode) {
    if (hasClass(node.parentNode, className)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function nextParentWithClass(node, className) {
  while (node.parentNode) {
    if (hasClass(node, className)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function parse(node) {
  var text = (node.nodeValue || "").replace(/\s/g, " ");
  var pattern = "- ";
  var indeces = getIndicesOf(pattern, text);
  indeces.forEach(index => {
    if (index != 0) return;
    node.nodeValue = text.replace("- ", "");
    setCaret(node, index);
    var task = document.createElement("div");
    task.className = "wrapper";
    task.innerHTML = `<div class="task"><div contenteditable="false"><input type="checkbox"/></div><div><br/></div></div>`;
    insertNodeAtCursor(task);
    setCaret(task, 1);
    task.focus();
  });
  node.childNodes.forEach(function(child) {
    parse(child);
  });
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index,
    indices = [];
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
}

function setCaret(node, offset) {
  var sel;
  var range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    range.setStartAfter(node);
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function getCaret() {
  var sel, range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    return {node: sel.anchorNode, offset: range.startOffset};
  }
}

function hasClass(node, className) {
  return (" " + node.className + " ").indexOf(" " + className + " ") > -1;
}

function insertNodeAtCursor(node) {
  var sel, range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    range.insertNode(node);
    range.setStartAfter(node.firstChild || node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}
