export const overridePanelTemplate = (ctx) => {
  var __t,
    __p = "",
    __j = Array.prototype.join
  function print() {
    __p += __j.call(arguments, "")
  }

  __p += '<div class="mb-2 card border">\n  '
  if (!ctx.component.hideLabel || ctx.builder || ctx.component.collapsible || ctx.component.tooltip) {
    __p +=
      '\n  <div class="card-header ' +
      ((__t = ctx.transform("class", "bg-" + ctx.component.theme)) == null ? "" : __t) +
      '"\n    '
    if (ctx.component.collapsible) {
      __p += '\n    tabindex="0"\n    '
    }
    __p +=
      '\n    role="button"\n    aria-expanded="' +
      ((__t = ctx.component.collapsible ? !ctx.collapsed : true) == null ? "" : __t) +
      '"\n    aria-controls="' +
      ((__t = ctx.instance.id) == null ? "" : __t) +
      "-" +
      ((__t = ctx.component.key) == null ? "" : __t) +
      '"\n    ref="header"\n  >\n    <span class="mb-0 card-title '
    if (ctx.component.theme && ctx.component.theme !== "default") {
      __p += "text-light"
    }
    __p += '">\n      '
    if (ctx.component.collapsible) {
      __p +=
        '\n        <i class="formio-collapse-icon ' +
        ((__t = ctx.iconClass(ctx.collapsed ? "plus-square-o" : "minus-square-o")) == null ? "" : __t) +
        ' text-muted" data-title="Collapse Panel"></i>\n      '
    }
    __p += "\n      "
    if (!ctx.component.hideLabel || ctx.builder) {
      __p += "\n      " + ((__t = ctx.t(ctx.component.title, { _userInput: true })) == null ? "" : __t) + "\n      "
    }
    __p += "\n      "
    if (ctx.component.tooltip) {
      __p +=
        '\n        <i ref="tooltip" tabindex="0" class="' +
        ((__t = ctx.iconClass("question-sign")) == null ? "" : __t) +
        ' text-muted" data-tooltip="' +
        ((__t = ctx.component.tooltip) == null ? "" : __t) +
        '"></i>\n      '
    }
    __p += "\n    </span>\n  </div>\n  "
  }
  __p += "\n  "
  if (
    (!ctx.collapsed || ctx.builder) &&
    ((ctx.component?.description && ctx.component.description.length > 0) ||
      (ctx.component?.tip && ctx.component.tip.length > 0))
  ) {
    __p += `\n <div class="card-panel-addition">`
    if (ctx.component?.description) {
      __p += `\n <div class="requirement-block-description">${ctx.component?.description}</div>`
    }
    if (ctx.component?.tip) {
      __p += `\n <div class="tips"><h3 class="tips-header"><i class="ph-fill ph-seal-check"></i>Tip</h3>${ctx.component?.tip}</div><a href="${ctx.component?.helpLink}" target="_blank">${ctx.component?.helpLink}</a>`
    }
    __p += "\n  </div>\n  "
  }

  if (!ctx.collapsed || ctx.builder) {
    __p +=
      '\n  <div class="card-body" ref="' +
      ((__t = ctx.nestedKey) == null ? "" : __t) +
      '" id="' +
      ((__t = ctx.instance.id) == null ? "" : __t) +
      "-" +
      ((__t = ctx.component.key) == null ? "" : __t) +
      '">\n    ' +
      ((__t = ctx.children) == null ? "" : __t) +
      "\n  </div>\n  "
  }
  __p += "\n</div>\n"
  return __p
}
