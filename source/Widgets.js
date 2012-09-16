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
    fieldName: undefined
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
  containerControl: undefined,
  generateComponents: function() {
    this.createComponents([this.labelKind, this.inputKind, this.helpKind]);
    if (this.containerControl) this.createComponent(this.containerControl);
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
  containerControl: undefined,
  generateComponents: function() {
    if (this.containerControl) this.createComponent(this.containerControl);
  },
  labelChanged: function() {
    this.$.label.setContent(this.label);
  },
  getFields: function() {
    return this.$.fields.$;
  },
  errorClass: "containererror",
  fieldNameChanged: function() { return; },
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
  getValue:  function() {
    var out = {};
    this.listFields().forEach(function(x) { out[x.getName()] = x.getValue(); });
    return out;
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
    return this.listFields().map(function(x) {return x.getValue();});
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
        fields[i].setValue(values[i]);
    }
    // remove extra fields
    fields.slice(values.length).forEach(function(x) {x.destroy();});
  },
  addField: function(value) {
    kind = enyo.clone(this._fieldKind);
    if (value) { kind.value = value; }
    this.$.fields.createComponent(kind);
    this.render();
  },
  removeField: function(index) {
    value = this.getValue();
    if (value.length > index) {
      value.splice(index, 1);
      this.setValue(value);
    }
  }
});