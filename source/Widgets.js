enyo.kind({
  name: "Widget",
  kind: "Control",
  published: {
    //* whether this widget requires a value
    required: true,
    //* widget label
    label: "",
    //* the initial value of the widget
    initial: "",
    //* the current value of the widget
    value: "",
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
    compact: false
  },
  events: {
    onRequestValidation: "",
    onchange: ""
  },
  create: function() {
    this.inherited(arguments);
    this.labelChanged();
    this.setValue(this.initial);
    this.helpTextChanged();
    this.errorMessageChanged();
    this.validChanged();
    this.nameChanged();
  },
  components: [
    { name: "label", tag: "label" },
    { name: "helpText", tag: "p" },
    { kind: "onyx.InputDecorator", components: [
      { name: "input", kind: "onyx.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
    ]},
    { name: "errorMessage", tag: "p"}
  ],
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
  //* whether the field has been validated before - used by some validationStrategies
  validatedOnce: false,
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
  setValue: function() {
    this.$.input.setValue(this.value);
  },
  getValue: function() {
    return this.$.input.getValue();
  },
  helpTextChanged: function() {
    this.$.helpText.setContent(this.helpText);
  },
  errorMessageChanged: function() {
    this.$.errorMessage.setContent(this.errorMessage);
  },
  validChanged: function() {
    if (this.valid) {
      this.$.input.removeClass('error');
      this.$.errorMessage.hide();
    } else {
      this.$.input.addClass('error');
      this.$.errorMessage.show();
    }
  },
  nameChanged: function() {
    this.$.input.setAttribute("name", this.name);
    this.$.label.setAttribute("for", this.name);
    this.render();
  },
  initialChanged: function() {
    if (validators.isEmpty(this.$.input.getValue())) {
      this.$.input.setValue(this.initial);
    }
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