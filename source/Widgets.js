enyo.kind({
  name: "Widget",
  kind: "Control",
  published: {
    //* whether this widget requires a value
    required: true,
    //* widget label
    label: "",
    //* the current value of the widget
    value: undefined,
    //* the value to be stored when a null/undefined value is written to the field.
    nullValue: "",
    //* widget help text
    helpText: "",
    //* whether the current widget is in valid state. IMPORTANT: just because `valid` is true, doesn't mean value passes field's validation method. Just specifies whether widget displays error messages or not.
    valid: true,
    //* error message to display
    errorMessage: "",
    //* the validation strategy for this widget.
    // - `"defaultValidation"` strategy does not validate on value change until field's getClean() called.
    validationStrategy: "defaultValidation",
    //* whether to validate every time the value changes or only when the user finishes editing (onchange)
    validationInstant: false,
    //* whether to display the widget in its compact form
    compact: false,
    //* the name of the field
    fieldName: undefined,
    //* display method.
    //  - null or undefined:  no widget
    //  - "display": non-editable view of widget
    //  - "visible": standard edit widget
    display: "visible",
    //* whether the field has been validated before - used by some validationStrategies
    validatedOnce: false
  },
  //* the initial value of the widget (generally set by field)
  initial: "",
  events: {
    onRequestValidation: "",
    onchange: "",
    onDelete: ""
  },
  create: function() {
    this.inherited(arguments);
    this.generateComponents();
    this.labelChanged();
    var initialVal = (this.value === undefined ) ? this.initial : this.value;
    this.setValue(initialVal);
    this.helpTextChanged();
    this.errorMessageChanged();
    this.validChanged();
    this.fieldNameChanged();
  },
  labelKind: { name: "label", tag: "label" },
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]},
  helpKind: { name: "helpText", tag: "p" },
  itemControlKind: undefined,
  generateComponents: function() {
    this.createComponents([this.labelKind, this.inputKind, this.helpKind]);
    if (this.itemControlKind) this.createComponent(this.itemControlKind);
  },
  onInputChange: function() {
    this.value = this.$.input.getValue();
    this.doChange();
    this.validate();
    return true;
  },
  onInputKey: function() {
    this.value = this.$.input.getValue();
    this.doChange();
    if (this.validationInstant) {
      this.validate();
    }
    return true;
  },
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleDelete: function() {
    this.doDelete();
  },
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
  setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.$.input.setValue(val);
  },
  getValue: function() {
    return this.$.input.getValue();
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
  //* validation strategies
  defaultValidation: function() {
    if (this.validatedOnce) {
      this.doRequestValidation();
    }
  },
  alwaysValidation: function() {
    this.doRequestValidation();
  }
});

enyo.kind({
  name: "PasswordWidget",
  kind: "Widget",
  inputKind: { kind: "onyx.InputDecorator", components: [
        { name: "input", kind: "onyx.Input", type:"password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

enyo.kind({
  name: "EmailWidget",
  kind: "Widget",
  inputKind: { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]}
});

enyo.kind({
  name: "CheckboxWidget",
  kind: "Widget",
  inputKind: { name: "input", kind: "onyx.Checkbox", onchange: "onInputChange" }
});

enyo.kind({
  name: "ChoiceWidget",
  kind: "Widget",
  inputKind: { name: "input", kind: "onyx." }
});