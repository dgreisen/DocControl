enyo.kind({
  name: "BaseContainerField",
  kind: "Field",
  published: {
    //* A single instance of a kind definition object, such as `{kind: "CharField", maxLength: 50 }`, the list will consist of an arbitrary number of a single kind of that field
    schema: undefined,
    fields: undefined
  },
  errorMessages: {
    required: _i('There must be at least one %s.'),
    invalid: _i('Please fix the errors indicated below.')
  },
  handlers: {
    onValidation: "onValidation",
    onFieldRegistration: "handleFieldRegistration"
  },
  handleFieldRegistration: function(inSender, inEvent) {
    if (!this.fields) this.setFields([]);
    field = inEvent.originator;
    if (field != this) {
      this.getFields().push(field);
      return true;
    }
  },
  // number of invalid subfields
  validCounter: 0,
  // hash of invalid subfields (to prevent duplication)
  invalidFields: {},
  setWidget: function(widget) {
    // this.inherited does not work - get "Uncaught TypeError: Cannot read property '_inherited' of undefined"
    widget.name = "widget";
    widget.initial = this.initial;
    widget.schema = this.schema;
    widget = enyo.mixin(widget, this.widgetAttrs);
    this.destroyComponents();
    this.createComponent(widget);
  },
  onValidation: function(inSender, inEvent) {
    if (inEvent.valid && inSender in this.invalidFields) {
      delete this.invalidFields[inSender];
      if (!--this.validCounter) {
        this.errors = [];
      }
    } else if (!inEvent.valid) {
      this.invalidFields[inSender] = true;
      this.errors = [this.errorMessages.invalid];
    }
  },
  isValid: function() {
    // reset the errors array
    this.errors = [];
    this.validate();
    valid = this.getFields().reduce(function(x, y) {return y.isValid() && x;}, true);
    if (!valid) {
      this.errors = [this.errorMessages.invalid];
    }
    valid = !this.errors.length;
    this.$.widget.setErrorMessage(this.errors[0]);
    this.$.widget.setValid(valid);
    this.$.widget.validatedOnce = true;
    return valid;
  },
  getFields: function() {
    return this.fields;
  },
  setFields: function(val) {
    this.fields = val;
    this.$.widget.fields = this.fields;
  },
  schemaChanged: function() {
    this.setFields([]);
    return this.$.widget.setSchema(this.schema);
  },
  throwValidationError: function() {
    // test for validity, throw error if not valid
    if (!this.isValid()) { throw this.errors; }
  }
});






enyo.kind({
  name: "ContainerField",
  kind: "BaseContainerField",
  published: {
    //* A list of kind definition objects such as `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`. It will contain the specified list of heterogenious fields.
    schema: undefined
  },
  widget: "ContainerWidget",
  validate: function() {},
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Object) || (values instanceof Array)) throw "values must be a hash";
    var fields = this.getFields();
    var k;
    for (var i=0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.getName();
      field.setValue(values[name]);
    }
  },
  getValue: function() {
    var out = {};
    this.getFields().forEach(function(x) { out[x.getName()] = x.getValue(); });
    return out;
  },
  getClean: function() {
    this.throwValidationError();
    var out = {};
    this.getFields().forEach(function(x) { out[x.getName()] = x.getClean(); });
    return out;
  },
  toJSON: function() {
    this.throwValidationError();
    var out = {};
    this.getFields().forEach(function(x) { out[x.getName()] = x.toJSON(); });
    return out;
  }
});






enyo.kind({
  name: "ListField",
  kind: "BaseContainerField",
  widget: "BaseListWidget",
  validate: function() {
    if (!this.getFields().length && this.required) {
      var message = this.errorMessages.required;
      this.errors = [interpolate(message, [this.schema.name || this.schema.kind.slice(0,-5)])];
      return;
    }
  },
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    this.setFields([]);
    this.$.widget.setValue(values);
  },
  getValue: function() {
    return this.getFields().map(function(x) {return x.getValue();});
  },
  getClean: function() {
    this.throwValidationError();
    return this.getFields().map(function(x) {return x.getClean();});
  },
  toJSON: function() {
    this.throwValidationError();
    return this.getFields().map(function(x) {return x.toJSON();});
  },
  addField: function(value) {
    this.$.widget.addField(value);
  },
  removeField: function(index) {
    var value = this.getValue();
    value.splice(index, 1);
    this.setValue(value);
  },
  onDelete: function(inSender, inEvent) {
    if (inEvent.originator instanceof Widget) {
      // we hijack the originator to point to the originating field not the originating widget
      inEvent.originator = this;
    }
    else {
      // delete the field at inEvent.originator.
      var i = this.getFields().indexOf(inEvent.originator);
      if (i < 0) throw "Field to delete not found";
      this.removeField(i);
      return true;
    }
  }
});
