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
    fieldName: undefined
  },
  events: {
    onRequestValidation: "",
    onchange: ""
  },
  create: function() {
    this.inherited(arguments);
    this.generateComponents();
    this.labelChanged();
    this.setValue(this.value || this.initial);
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
  generateComponents: function() {
    this.createComponents([this.labelKind, this.inputKind, this.helpKind]);
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
  name: "BaseContainerWidget",
  kind: "Widget",
  published: {
    //* either a single instance of, or a list of, kind definition object. If a single object, such as `{kind: "CharField", maxLength: 50 }`, then the list will consist of an arbitrary number of a single kind of that field. If a list, such as `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`, it will contain the specified list of heterogenious fields.
    fields: [],
    //* whether this widget has a fixed height. If `true`, then a scroller is provided.
    fixedHeight: false,
    value: undefined
  },
  components: [
    { name: "label", tag: "label" },
    { name: "helpText", tag: "p" },
    { name: "fields", tag: "div" }
  ],
  generateComponents: function() {
    return;
  },
  labelChanged: function() {
    this.$.label.setContent(this.label);
  },
  getFields: function() {
    return this.$.fields.$;
  },
  getValue: function() {
    throw "ListWidget does not support getValue()";
  },
  errorClass: "containererror",
  fieldNameChanged: function() { return; },
  initialChanged: function() { return; }
});

enyo.kind({
  name: "ContainerWidget",
  kind: "BaseContainerWidget",
  setFields: function(fields) {
    this.$.fields.destroyComponents();
    this.$.fields.createComponents(fields);
  },
  listFields: function() {
    return this.$.fields.children;
  },
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Object) || (values instanceof Array)) throw "values must be a hash";
    var fields = this.listFields();
    var k;
    for (var i=0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.getName();
      field.setValue(values[name]);
    }
  }
});

enyo.kind({
  name: "ListWidget",
  kind: "BaseContainerWidget",

  // We copy the field definition from the field schema for later use.
  _fieldKind: undefined,
  setFields: function(fields) {
      this._fieldKind = fields;
  },
  listFields: function() {
    return this.$.fields.children;
  },
  getValue: function() {

  },
  setValue: function(values) {
    if (!values) return;
    var fields = this.listFields();
    if (!(values instanceof Array)) throw "values must be an array";
    var i;

    // add any needed fields
    var kind = this._fieldKind;
    var kinds = [];
    var quantity = Math.max(values.length-fields.length, 0);
    for (i = 0; i < quantity; i++) { kinds.push(kind); }
    this.$.fields.createComponents(kinds);
    // set validatedOnce, if necessary
    if (quantity && this.validatedOnce) {
      fields.slice(fields.length-quantity).forEach(function(x) {x.validatedOnce = true;});
    }
    // update values for existing fields
    for (i=0; i < values.length; i++) {
        fields[i].setValue(values[0]);
    }
    // remove extra fields
    fields.slice(values.length).forEach(function(x) {x.destroy();});
  },
  addField: function(value) {

  },
  removeField: function(index) {

  }
});