// bootstrap skins

widgets.Widget.prototype.tbs_defaultSkin = function() {
  var comps = [this.inputKind, this.helpKind];
  if (this.label && !this.compact) comps.unshift(this.labelKind);
  this.createComponents(comps);
  if (this.$.helpText) this.$.helpText.addClass("help-block");
  this.addClass("control-group");
  if (this.$.label) this.$.label.addClass("control-label");
};

widgets.Widget.prototype.tbs_horizontalSkin = function() {
  var comps = [this.inputKind, this.helpKind];
  comps = (!this.unnested) ? [{ tag:"div", classes:"controls", components: comps }] : comps;
  if (this.label && !this.compact) comps.unshift(this.labelKind);
  this.createComponents(comps);
  if (this.$.helpText) this.$.helpText.addClass("help-inline");
  this.addClass("control-group");
  if (this.$.label) this.$.label.addClass("control-label");
};


widgets.ContainerWidget.prototype.tbs_horizontalSkin = function() {
  this.addClass("horizontal-form");
  if (!this.label) this.children[0].removeClass('controls');
  this.createComponent(this.containerControlKind);
};


//* skin: skin with twitter bootstrap. you must include a copy of the twitter bootstrap base css.
widgets.ListWidget.prototype.tbs_defaultSkin = function() {
  this.containerControlKind = { kind: "tbs.Button", ontap: "addField", content: "Add" };
  widgets.Widget.prototype.tbs_defaultSkin.call(this);
};
widgets.ListWidget.prototype.tbs_horizontalSkin = function() {
  this.containerControlKind = { kind: "tbs.Button", ontap: "addField", content: "Add" };
  
  var comps = [this.helpKind, this.inputKind, this.containerControlKind];
  comps = (!this.unnested) ? [{ tag:"div", classes:"controls", components: comps }] : comps;
  if (this.label && !this.compact) comps.unshift(this.labelKind);
  this.createComponents(comps);
  if (this.$.helpText) this.$.helpText.addClass("help-inline");
  this.addClass("control-group");
  if (this.$.label) this.$.label.addClass("control-label");

  this.createComponent(this.containerControlKind);
};

enyo.kind({
  name: "widgets.tbs.ListWidget",
  kind: "widgets.ListWidget",
  itemKind: { kind: "widgets.tbs.ListItem" },
  containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add" }
});

enyo.kind({
  name: "widgets.tbs.ListItem",
  kind: "widgets.ListItem",
  components: [
    { tag: "hr" },
    { kind: "tbs.Button", content: "Delete", ontap: "handleDelete", style: "float:right;"},
    { name: "_content", kind: "enyo.Control" }
  ]
});

enyo.kind({
  name: "widgets.tbs.ContainerWidget",
  kind: "widgets.ContainerWidget",
  published: {
    //* form style. can be: "search", "inline", "horizontal" (defaults to standard form styling)
    style: undefined
  },
  setStyle: function(val) {
    if (this.style) this.removeClass("form-"+this.style);
    this.style = val;
    if (this.style) this.addClass("form-"+this.style);
  }
});




/*
enyo.kind({
  name: "widgets.tbs.Widget",
  kind: "widgets.Widget",
  skin: "tbsSkin",
  inputKind: { kind: "div", classes: "controls", components: [
    { name: "input", kind: "enyo.Input", type: "text", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
  ]}
});

enyo.kind({
  name: "widgets.tbs.PasswordWidget",
  kind: "widgets.Widget",
  //* @protected
  skin: "tbsSkin",
  inputKind: { kind: "div", classes: "controls", components: [
    { name: "input", kind: "enyo.Input", type: "password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
  ]}
});

//* @public
enyo.kind({
  name: "widgets.tbs.EmailWidget",
  kind: "widgets.Widget",
  //* @protected
  skin: "tbsSkin",
  inputKind: { kind: "div", classes: "controls", components: [
    { name: "input", kind: "enyo.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
  ]}
});

//* @public
enyo.kind({
  name: "widgets.tbs.CheckboxWidget",
  kind: "widgets.Widget",
  //* @protected
  skin: "tbsSkin",
  inputKind: { kind: "div", classes: "controls", components: [
    { name: "input", kind: "enyo.Checkbox", onchange: "onInputChange" }
  ]}
});

//* @public
enyo.kind({
  name: "widgets.tbs.ChoiceWidget",
  kind: "widgets.Widget",
  //* @protected
  skin: "tbsSkin",
  inputKind: { kind: "div", classes: "controls", components: [
    { name: "input", kind: "enyo.Select" }
  ]}
});


enyo.kind({
  name: "widgets.tbs.ListItem",
  kind: "widgets.ListItem",
  components: [
    { kind: "enyo.Button", content: "Delete", ontap: "handleDelete", style: "float:right;"},
    { name: "_content", kind: "enyo.Control" },
    { tag: "hr" }
  ]
});

*/

