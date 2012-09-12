enyo.kind({
  name: "Field",
  kind: "Control",
  published: {
    //* whether the current field is required
    required: true,
    //* the current value of the field; this should be used for setting ui elements.
    value: undefined,
    //* the cleaned value; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. You should use the toJSON() method to get a version appropriate for serialization.
    clean: undefined,
    //* list of validators
    validators: [],
    //* widget label
    label: "",
    //* the initial value of the widget
    initial: "",
    //* widget help text
    helpText: "",
    //* hash of error messages
    errorMessages: {
      required: _i('This field is required.')
    },
    //* the validation strategy for this widget.
    // - `"defaultValidation"` strategy does not validate on value change until getClean() called.
    validationStrategy: "defaultValidation",
    //* whether to validate every time the value changes or only when the user finishes editing (onchange)
    validationInstant: false,
    //* whether to display the widget in its compact form
    compact: false
  },
  create: function() {
    this.inherited(arguments);
    this.requiredChanged();
    this.setValue(this.value);
    this.labelChanged();
    this.initialChanged();
    this.helpTextChanged();
    this.validationStrategyChanged();
    this.validationInstantChanged();
    this.compactChanged();
  },
  components: [
    { name: "widget", kind: "Widget" }
  ],
  handlers: {
    onRequestValidation: "onRequestValidation"
  },
  onRequestValidation: function() {
    this.isValid();
  },
  toJavascript: function() {
    this.clean = this.getValue();
  },
  validate: function() {
    if (validators.isEmpty(this.getValue()) && this.required) {
      this.errors.push(this.errorMessages.required);
    }
  },
  runValidators: function() {
    var i;
    value = this.clean;
    if (validators.isEmpty(value)) return;
    for (i = 0; i < this.validators.length; i++) {
      v = this.validators[i];
      try {
        v.validate(value);
      }
      catch(e) {
        if (e.code && e.code in this.errorMessages) {
          message = this.errorMessages[e.code];
          if (e.params) interpolate(message, e.params);
          this.errors.push(message);
        } else {
          this.errors.push(e.message);
        }
      }
    }
  },
  isValid: function() {
    // reset the errors array
    this.errors = [];
    // call the various validators
    this.toJavascript();
    this.validate();
    this.runValidators();
    var valid = !Boolean(this.errors.length);
    this.$.widget.setErrorMessage(this.errors[0]);
    this.$.widget.setValid(valid);
    this.$.widget.validatedOnce = true;
    return valid;
  },
  getClean: function() {
    valid = this.isValid();
    if (!valid) {
      throw this.errors;
    }
    return this.clean;
  },
  toJSON: function() {
    return this.getClean();
  },
  requiredChanged: function() {
    this.$.widget.setRequired(this.required);
  },
  setValue: function(val) {
    this.$.widget.setValue(val);
  },
  getValue: function() {
    return this.$.widget.getValue();
  },
  labelChanged: function() {
    this.$.widget.setLabel(this.label);
  },
  initialChanged: function() {
    this.$.widget.setInitial(this.initial);
  },
  helpTextChanged: function() {
    this.$.widget.setHelpText(this.helpText);
  },
  validationStrategyChanged: function() {
    this.$.widget.setValidationStrategy(this.validationStrategy);
  },
  validationInstantChanged: function() {
    this.$.widget.setValidationInstant(this.validationInstant);
  },
  compactChanged: function() {
    this.$.widget.setCompact(this.compact);
  }
});

enyo.kind({
  name: "CharField",
  kind: "Field",
  published: {
    maxLength: undefined,
    minLength: undefined
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxLength !== undefined) {
      this.validators.push(new validators.MaxLengthValidator(this.maxLength));
    }
    if (this.minLength !== undefined) {
      this.validators.push(new validators.MinLengthValidator(this.minLength));
    }
  },
  toJavascript: function() {
    var value = (validators.isEmpty(this.getValue())) ? "" : this.getValue();
    this.clean = value;

  // TODO: need to be able to set widget attributes
  }
});

enyo.kind({
  name: "IntegerField",
  kind: "Field",
  published: {
    maxValue: undefined,
    minValue: undefined
  },
  errorMessages: {
    'invalid': _i('Enter a whole number.')
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxValue !== undefined) {
      this.validators.push(new validators.MaxValueValidator(this.maxValue));
    }
    if (this.minValue !== undefined) {
      this.validators.push(new validators.MinValueValidator(this.minValue));
    }
  },
  parseFn: parseInt,
  toJavascript: function() {
    value = this.getValue();
    var value = (validators.isEmpty(value)) ? undefined : this.parseFn(value, 10);
    if (value === undefined) {
      this.clean = undefined;
    } else if (isNaN(value)) {
      this.errors.push(this.errorMessages['invalid']);
    } else {
      this.clean = value;
    }
  }
});

enyo.kind({
  name: "FloatField",
  kind: "IntegerField",
  errorMessages: {
    'invalid': _i('Enter a number.')
  },
  parseFn: parseFloat
});

enyo.kind({
  errorMessages: {
    'invalid': _i('Enter a number.'),
    'max_value': _i('Ensure this value is less than or equal to %(limit_value)s.'),
    'min_value': _i('Ensure this value is greater than or equal to %(limit_value)s.'),
    'max_digits': _i('Ensure that there are no more than %s digits in total.'),
    'max_decimal_places': _i('Ensure that there are no more than %s decimal places.'),
    'max_whole_digits': _i('Ensure that there are no more than %s digits before the decimal point.')
  }
})
