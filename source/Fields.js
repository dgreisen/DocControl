enyo.kind({
  name: "fields.Field",
  kind: "Control",
  published: {
    //* whether the current field is required
    required: true,
    //* the current value of the field
    value: undefined,
    //* the cleaned value accessed via `getClean()`; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. Use the toJSON() method to get a version appropriate for serialization.
    clean: undefined,
    //* list of validators; If overriding a parent class, you must include all parent class validators
    validators: [],
    //* kind definition for widget (eg { kind: "widget.Widget"})
    widget: "widgets.Widget",
    //* hash of attibutes to set on widget (eg `label`, `initial`)
    widgetAttrs: {},
    //* hash of error messages; If overriding a parent class, you must include all parent class errorMessages
    errorMessages: {
      required: _i('This field is required.')
    },
    //* display method.
    //*  <ul><li> `null` or `undefined`:  no widget</li>
    //* <li>"display": non-editable view of widget (not yet implemented) </li>
    //* <li>"visible": standard edit widget</li></ul>
    display: "visible"
  },
  //* the initial value of the field.
  initial: undefined,
  events: {
    //* @protected
    //* called on validation completed to pass validation information to parent container so it can properly set it's valid state
    onValidation: "",
    //* called on creation to register field with its container
    onFieldRegistration: ""
  },
  create: function() {
    // all fields were sharing the same validators list
    this.validators = enyo.cloneArray(this.validators);
    this.inherited(arguments);
    this.widget = (typeof(this.widget)=="string") ? { kind: this.widget } : enyo.clone(this.widget);
    this.setWidget(this.widget);
    this.requiredChanged();
    if (this.value !== undefined) this.setValue(this.value);
    this.widgetAttrs.fieldName = this.getName();
    // send event to register this field with it's container
    this.doFieldRegistration();
  },
  handlers: {
    //* a widget will request validation by sending an onRequestValidation event. 
    onRequestValidation: "onRequestValidation",
    //* a widget will request deletion of the field by sending an onDelete event.
    onDelete: "onDelete"
  },
  //* perform validation for the widget
  onRequestValidation: function() {
    this.isValid();
  },
  //* pass the onDelete event on to the container.
  onDelete: function(inSender, inEvent) {
    if (inEvent.originator instanceof Widget) {
      // we hijack inEvent.originator to point to the originating Field, not the originating widget.
      inEvent.originator = this;
    }
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
    this.doValidation({valid: valid});
    return valid;
  },
  getClean: function() {
    valid = this.isValid();
    if (!valid) {
      throw this.errors;
    }
    return this.clean;
  },
  setClean: function() { throw "clean not settable. use setValue, instead."; },
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
  setWidget: function(widget) {
    // this.inherited does not work; you must update setWidget of all subclasses.
    widget.name = "widget";
    widget.initial = this.initial;
    widget = enyo.mixin(widget, this.widgetAttrs);
    this.destroyComponents();
    this.createComponent(widget);
  },
  getWidget: function() {
    return this.$.widget;
  },
  setWidgetAttrs: function(attrs) {
    var k;
    for (k in attrs) {
      var v = attrs[k];
      k = "set" + k[0].toUpperCase()+k.substring(1);
      this.$.widget[k](v);
    }
  }
});







enyo.kind({
  name: "fields.CharField",
  kind: "fields.Field",
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
  name: "fields.IntegerField",
  kind: "fields.Field",
  published: {
    maxValue: undefined,
    minValue: undefined
  },
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a whole number.')
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
  name: "fields.FloatField",
  kind: "fields.IntegerField",
  published: {
    maxDecimals: undefined,
    minDecimals: undefined,
    maxDigits: undefined
  },
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a number.')
  },
  create: function() {
    this.inherited(arguments);
    if (this.maxDecimals !== undefined) {
      this.validators.push(new validators.MaxDecimalPlacesValidator(this.maxDecimals));
    }
    if (this.minDecimals !== undefined) {
      this.validators.push(new validators.MinDecimalPlacesValidator(this.minDecimals));
    }
    if (this.maxDigits !== undefined) {
      this.validators.push(new validators.MaxDigitsValidator(this.maxDigits));
    }
  },
  parseFn: parseFloat
});

enyo.kind({
  name: "fields.RegexField",
  kind: "fields.Field",
  published: {
    //* the compiled regex to test against.
    regex: undefined,
    //* the error message to display when the regex fails
    errorMessage: undefined
  },
  create: function() {
    this.inherited(arguments);
    this.validators.push(new RegexValidator(this.regex));
    if (this.errorMessage) {
      this.errorMessages.invalid = this.errorMessage;
    }
  }
});

enyo.kind({
  name: "fields.EmailField",
  kind: "fields.Field",
  widget: "widgets.EmailWidget",
  validators: [new validators.EmailValidator()]
});


enyo.kind({
  name: "fields.BaseTemporalField",
  kind: "fields.Field",
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a Date/Time.')
  },
  timeToJavascript: function(val) {
    re = /([012]?\d):?([012345]\d):?([012345]\d)?\s*(am|pm)?/i;
    var match = val.match(re);
    if (match && parseInt(match[1], 10) < 25) {
      var hour = parseInt(match[1], 10);
      hour = (match[4] == "pm" && hour < 12) ? hour+12 : hour;
      hour = (match[4] == "am" && hour == 12) ? 0 : hour;
      var minute = parseInt(match[2], 10);
      var second = (match[3]) ? parseInt(match[3], 10) : 0;
      var timezone = new Date().getTimezoneOffset();
      // TODO finish this function and dateToJavascript helper function

    } else {
      this.errors.push(this.errorMessages['invalid']);
    }
  }
});

enyo.kind({
  name: "fields.BooleanField",
  kind: "fields.Field",
  widget: "widgets.CheckboxWidget",
  toJavascript: function() {
    var value = this.getValue();
    if (typeof(value) == "string" && includes(["false", "0"], value.toLowerCase())) {
      value = false;
    } else {
      value = Boolean(value);
    }
    if (!value && this.required) {
      this.errors.push(this.errorMessages.required);
    }
    this.clean = value;
  }
});

enyo.kind({
  name: "fields.NullBooleanField",
  kind: "fields.Field",
  widget: "widgets.CheckboxWidget",
  toJavascript: function() {
    var value = this.getValue();
    if (includes([true, "True", "1"], value)) { value =  true; }
    else if (includes([false, "False", "0"], value)) { value = false; }
    else { value = null; }
    this.clean = value;
  },
  validate: function() {
    return;
  }
});

enyo.kind({
  name: "fields.ChoiceField",
  kind: "fields.Field",
  widget: "widgets.ChoiceWidget",
  errorMessages: {
    'invalidChoice': _i('Select a valid choice. %(value)s is not one of the available choices.')
  },
  published: {
    //* Array of 2-arrays specifying valid choices. if 2-arrays, first value is value, second is display. create optgroups by setting display If display value to a 2-array. MUST USE SETTER.
    choices: {}
  },
  setChoices: function(val) {
    choices = {};
    iterChoices = function(x) {
      if (x[1] instanceof Array) x[1].forEach(iterChoices);
      else choices[x[0]] = x[1];
    },
    val.forEach(iterChoices);
  },
  toJavascript: function() {
    var value = (validators.isEmpty(this.getValue())) ? "" : this.getValue();
    this.clean = value;
  },
  validate: function() {
    this.inherited();
    var value = this.getValue();
    if (value && !this.validValue(value))
      var message = this.errorMessages.invalidChoices;
      this.errors = [interpolate(message, [value])];
  },
  validValue: function(val) {
    if (val in this.choices) return true;
    return false;
  },
  getDisplay: function() {
    return this.choices[this.getClean()];
  }
});
