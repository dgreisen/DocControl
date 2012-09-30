enyo.kind({
  name: "widgets.onyx.Widget",
  kind: "widgets.Widget",
  inputKind: { kind: "onyx.InputDecorator", components: [
    { name: "input", kind: "onyx.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

enyo.kind({
  name: "widgets.onyx.PasswordWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
        { name: "input", kind: "onyx.Input", type:"password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.onyx.EmailWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.onyx.CheckboxWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { name: "input", kind: "onyx.Checkbox", onchange: "onInputChange" }
});

//* @public
enyo.kind({
  name: "widgets.onyx.ChoiceWidget",
  kind: "widgets.ChoiceWidget",
  //* @protected
  create: function() {
    this.inherited(arguments);
    this.setChoices(this.choices);
  },
  inputKind: {kind: "onyx.PickerDecorator", components: [
    {},
    { name: "input",
      kind: "onyx.Picker",
      components: []
    }
  ]},
  getValue: function() {
    return this.value;
  },
  choicesIndex: undefined,
  setChoices: function(val) {
    if (this.choicesIndex) {
      for (var k in this.choicesIndex) {
        this.choicesIndex[k].destroy();
      }
      this.choicesIndex = undefined;
    }
    // add unchosen choice if applicable
    if (!this.required || !this.initial) val.unshift([this.nullValue, this.unchosenText]);
    var that = this;
    var choices = {};
    iterChoices = function(x) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else {
        choices[x[0]] = that.$.input.createComponent({ content: x[1], value: x[0], active: that.value===x[0]});
      }
    };
    val.forEach(iterChoices);
    this.choicesIndex = choices;
  },
  handlers: { onSelect: "itemSelected" },
  itemSelected: function(inSender, inEvent) {
    this.value = inEvent.originator.value;
    this.validate();
  }
});