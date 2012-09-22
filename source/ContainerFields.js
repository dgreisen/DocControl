/**
    _fields.BaseContainerField_ is the baseKind for all container-type fields.
    DocControl allows you to create, validate and display arbitrarily complex
    nested data structures. container-type fields contain other fields. There
    are currently two types. A `ContainerField`, analogous to a hash of subfields,
    and a `ListField`, analogous to a list of subfields. container-type fields
    act in most ways like a regular field. You can set them, and all their subfields
    with `setValue`, you can get their, and all their subfields', data with
    `getClean` or `toJSON`.

    When a subfield is invalid, the containing field will also be invalid.

    You specify a container's subfields in the `schema` attribute. Each container type
    accepts a different format for the `schema`.

    DocControl schemas are fully recursive - that is, containers can contain containers,
    allowing you to model and validate highly nested datastructures like you might find
    in a document database.
*/
enyo.kind({
  name: "fields.BaseContainerField",
  kind: "fields.Field",
  published: {
    //* A kind definition object of the same form as would be given to a `components` attribute, such as `{kind: "CharField", maxLength: 50 }`
    schema: undefined,
    //* the list of subfields. This should *never* be set directly, but can be accessed via `getFields`.
    fields: undefined
  },
  //* @protected
  errorMessages: {
    required: _i('There must be at least one %s.'),
    invalid: _i('Please fix the errors indicated below.')
  },
  handlers: {
    //* when an `onValidation` event is received we update the container's state to reflect it's subfield's validation state
    onValidation: "onValidation",
    //* when an `onFieldRegistration` event is received we add the field to the `fields` list
    onFieldRegistration: "handleFieldRegistration"
  },
  // add the field to `fields`.
  handleFieldRegistration: function(inSender, inEvent) {
    if (!this.fields) this.resetFields();
    field = inEvent.originator;
    if (field != this) {
      this.getFields().push(field);
      return true;
    }
  },
  // hash of invalid subfields (to prevent duplication)
  invalidFields: {},
  // add/remove the field from `invalidFields` depending on if the field is invalid or valid, respectively
  onValidation: function(inSender, inEvent) {
    if (inSender == this) return false; // if this field sent the event, let parent field handle it.
    if (inEvent.valid && inSender in this.invalidFields) {
      delete this.invalidFields[inSender];
    } else if (!inEvent.valid) {
      this.invalidFields[inSender] = true;
    }
    this.errors = (isEmpty(this.invalidFields)) ? [] : [this.errorMessages.invalid];
    return true;
  },
  prepareWidget: function() {
    this.widget.schema = this.schema;
  },
  // custom isvalid method that validates all child fields as well.
  isValid: function() {
    // reset the errors array
    this.errors = [];
    this.validate();
    valid = this.getFields().reduce(function(x, y) {return y.isValid() && x;}, true);
    if (!valid) {
      this.errors = [this.errorMessages.invalid];
    }
    valid = !this.errors.length;
    if (this.display) {
      this.$.widget.setErrorMessage(this.errors[0]);
      this.$.widget.setValid(valid);
      this.$.widget.validatedOnce = true;
    }
    this.doValidation({valid: valid});
    return valid;
  },
  getFields: function() {
    return this.fields;
  },
  setFields: function(val) {
    throw "setFields not supported";
  },
  resetFields: function() {
    this.fields = [];
    if (this.display) this.$.widget.fields = this.fields;
  },
  schemaChanged: function() {
    this.resetFields();
    if (this.display) this.$.widget.setSchema(this.schema);
  },
  //* reset validation state of this field and all subfields.
  reset: function() {
    this.inherited(arguments);
    this.getFields().forEach(function(x) {x.reset();});
  },
  throwValidationError: function() {
    // test for validity, throw error if not valid
    if (!this.isValid()) { throw this.errors; }
  }
});




//* @public
/**
    A ContainerField contains a number of heterogeneous
    subfields. When data is extracted from it using `toJSON`, or `getClean`, the
    returned data is in a hash object where the key is the name of the subfield
    and the value is the value of the subfield.

    the schema for a ContainerField is an Array of kind definition objects such as
    `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`.
    The ContainerField will contain the specified array of heterogenious fields.

    TODO: make ContainerField work without widget
*/
enyo.kind({
  name: "fields.ContainerField",
  kind: "fields.BaseContainerField",
  widget: "widgets.ContainerWidget",
  //* setValue accepts a hash of values, each key corresponding to the name of a subfield, each value the value for that subfield.
  //* if the optional value `reset` is truthy, then validation state will be reset.
  setValue: function(values, reset) {
    if (!values) return;
    if (!(values instanceof Object) || (values instanceof Array)) throw "values must be a hash";
    var fields = this.getFields();
    var k;
    for (var i=0; i < fields.length; i++) {
      var field = fields[i];
      var name = field.getName();
      field.setValue(values[name]);
    }
    if (reset) this.reset();
  },
  //* @protected
  create: function() {
    this.inherited(arguments);
    // unlike all other fields, we cannot set values on widgets and subfields prior to creation. so we must do it after.
    this.setValue(this.value);
  },
  validate: function() {},
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





//* @public
/**
    A ListField contains an arbitrary number of identical
    subfields. When data is extracted from it using `toJSON`, or `getClean`, the
    returned data is in a list where each value is the value of the subfield at
    the corresponding index.

    A ListField's `schema` consists of a single field definition, such as
    `{ kind: "email" }`. The ListField's `fields` attribute will then contain
    an array of subfields of that kind.

    TODO: make ListField function without a widget
*/
enyo.kind({
  name: "fields.ListField",
  kind: "fields.BaseContainerField",
  widget: "widgets.BaseListWidget",
  //* accepts an array, where each element in the array is the value for a subfield.
  //* if the optional value `reset` is truthy, then validation state will be reset.
  setValue: function(values, reset) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    this.resetFields();
    this.$.widget.setValue(values);
    if (reset) this.reset();
  },
  //* append a subfield to the ListField. If value is not specified, an empty subfield will be created
  addField: function(value) {
    this.$.widget.addField(value);
  },
  //* remove the field at `index`.
  removeField: function(index) {
    var value = this.getValue();
    value.splice(index, 1);
    this.setValue(value);
  },
  //* event handler that will delete the field specified by `inEvent.field`. Used by the ListWidget`s delete button. see _widgets.ListWidget_.
  onDelete: function(inSender, inEvent) {
    // delete the field at inEvent.field.
    var i = this.getFields().indexOf(inEvent.field);
    if (i < 0) throw "Field to delete not found";
    this.removeField(i);
    return true;
  },
  //* @protected
  validate: function() {
    if (!this.getFields().length && this.required) {
      var message = this.errorMessages.required;
      this.errors = [interpolate(message, [this.schema.name || (typeof(this.schema.kind) == "string" && this.schema.kind.slice(0,-5)) || "item"])];
      return;
    }
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
  }
});
