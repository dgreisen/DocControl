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

