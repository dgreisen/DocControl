enyo.kind({
  name: "widgets.Widget",
  kind: "Control",
  published: {
    //* widget label
    label: "",
    //* the current value of the widget
    value: undefined,
    //* widget help text
    helpText: "",
    //* the validation strategy for this widget.
    //* <ul><li>`"defaultValidation"` strategy does not validate on value change until field's getClean() called.</li>
    //* <li>`"alwaysValidation"` strategy begins validating on widget creation.</li></ul>
    validationStrategy: "defaultValidation",
    //* whether to validate every time the value changes or only when the user finishes editing the field (onchange)
    validationInstant: false,
    //* whether to display the widget in its compact form TODO: only partially implemented
    compact: false,
    //* @protected
    //* whether this widget requires a value; inherited from field
    required: true,
    //* the name of the field; set by field
    fieldName: undefined,
    //* whether the field has been validated before - used by some validationStrategies; set by field
    validatedOnce: false,
    //* error message to display; set by field
    errorMessage: "",
    //* whether the current widget is in valid state. IMPORTANT: just because `valid` is true, doesn't mean value passes field's validation method. Just specifies whether widget displays error messages or not. set by field
    valid: true
  },
  //* the initial value of the widget; set by field
  initial: "",
  events: {
    //* request that the parent field perform validation
    onRequestValidation: ""
  },
  create: function() {
    this.inherited(arguments);
    this.generateComponents(); // generate the widget components
    this.labelChanged();
    this.setValue(this.value, true);
    this.helpTextChanged();
    this.errorMessageChanged();
    this.validChanged();
    this.fieldNameChanged();
  },
  //* @public
  //* useful for subclassing. The value to be stored when a null/undefined value is written to the field.
  nullValue: "",
  //* Useful for subclassing. The kind definition for the representation of the label. `name` must remain 'label'.
  labelKind: { name: "label", tag: "label" },
  //* useful for subclassing. The kind definition for the actual input component. You can use as much chrome as you like, but the input should be named `input` to use the default get/setValue machinery. You should also specify any handlers here. They should generally point to `onInputChange` for events equivalent to `onblur`, and to `onInputKey` for events equivalent to `onkeyup`
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]},
  //* useful for subclassing. The kind definition for the help text. `name` must remain 'helpText'.
  helpKind: { name: "helpText", tag: "p" },
  //* useful for subclassing. override this function to rearrange the order of the various kinds making up a widget.
  generateComponents: function() {
    this.createComponents([this.labelKind, this.inputKind, this.helpKind]);
  },
  // handler called by input kind when it has changed, and the user has finished inputing - for example on an `onchange` or `onblur`
  onInputChange: function() {
    this.value = this.$.input.getValue();
    this.validate();
    return true;
  },
  // handler called by input kind when it has made an instantaneous change - for example on an `onkeyup`
  onInputKey: function() {
    this.value = this.$.input.getValue();
    if (this.validationInstant) {
      this.validate();
    }
    return true;
  },
  //* @private
  //* validates the widget in accordance with the validation strategy.
  validate: function() {
    if (typeof(this.validationStrategy) == "string") {
      this[this.validationStrategy]();
    } else {
      this.validationStrategy.call(this);
    }
  },
  labelChanged: function() {
    if (this.compact) {
      this.$.input.setPlaceholder(this.label);
    } else {
      this.$.label.setContent(this.label);
    }
  },
  helpTextChanged: function() {
    if (this.getValid()) this.$.helpText.setContent(this.helpText);
  },
  errorMessageChanged: function() {
    if (!this.getValid()) this.$.helpText.setContent(this.errorMessage);
  },
  errorClass: "error",
  validChanged: function() {
    if (this.valid) {
      this.removeClass(this.errorClass);
      this.$.helpText.setContent(this.helpText);
    } else {
      this.addClass(this.errorClass);
      this.$.helpText.setContent(this.errorMessage);
    }
  },
  fieldNameChanged: function() {
    this.$.input.setAttribute("name", this.fieldName);
    this.$.label.setAttribute("for", this.fieldName);
    this.render();
  },
  //* @public
  //* useful for subclassing.
  setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.$.input.setValue(val);
  },
  //* useful for subclassing.
  getValue: function() {
    return this.$.input.getValue();
  },
  //* validation strategy: validate automatically on change only after validation has been called manually once.
  defaultValidation: function() {
    if (this.validatedOnce) {
      this.doRequestValidation();
    }
  },
  //* validation strategy: validate automatically on change starting from widget creation
  alwaysValidation: function() {
    this.doRequestValidation();
  }
});





enyo.kind({
  name: "widgets.PasswordWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
        { name: "input", kind: "onyx.Input", type:"password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.EmailWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

//* @public
enyo.kind({
  name: "widgets.CheckboxWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { name: "input", kind: "onyx.Checkbox", onchange: "onInputChange" }
});

//* @public
enyo.kind({
  name: "widgets.ChoiceWidget",
  kind: "widgets.Widget",
  nullValue: "",
  published: {
    //* Text to show corresponding to undefined/null
    //* will not be a choice if (1) initial value is present and (2) field is required.
    unchosenText: "Pick One..."
  },
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
  setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.value = val;
    if (this.choicesIndex && this.choicesIndex[val]) this.$.input.setSelected(this.choicesIndex[val]);
  },
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
  }
});