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
  create: function() {
    this.invalidFields = {};
    this.inherited(arguments);
    this.schemaChanged();
    // this.setValue(this.value);
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
    var field = inEvent.originator;
    if (field != this) {
      // set initial values (registration occurs before subfield creation)
      this.initializeSubfield(field);
      // add the field to index of subfields
      this.getFields().push(field);
      return true;
    }
  },
  //set initial values of subfields; registration of a subfield, when this function is called, occurs before subfield creation, so we can modify the field as much as we want here.
  initializeSubfield: function(field) {
    field.validatedOnce = this.validatedOnce;
    field.parentField = this;
    field.inherit("widgetSet");
    field.inherit("widgetAttrs");
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
  prepareWidget: function(widget) {
    widget.schema = this.schema;
    return widget;
  },
  // custom isvalid method that validates all child fields as well.
  isValid: function() {
    // reset the errors array
    this.errors = [];
    var value = this.getValue();
    value = this.validate(value);
    valid = this.getFields().reduce(function(x, y) {return y.isValid() && x;}, true);
    this.clean = (valid) ? value : undefined;
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
    // if there are already fields, store their values for later reconstruction
    if (this.fields && this.fields.length) this.value = this.getValue();
    this.fields = [];
    if (this.$.widget) {
      this.$.widget.fields = this.fields;
      this.$.widget.$.fields.destroyComponents();
    }
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
  //* get the errors for all subfields. if a subfield has no errors, it is not listed; subfields
  //* are returned as a hash of subfield name keys and error values.
  getErrors: function() {
    if (!this.errors.length) return null;
    var out = {};
    this.getFields().forEach(function(x) { if (x.getErrors()) out[x.getName()] = x.getErrors(); });
    return out;
  },
  //* get a subfield by name
  getField: function(val) {
    for (var i=0; i < this.fields.length; i++) { if (this.fields[i].name == val) return this.fields[i]; }
  },
  //* @protected
  //* reset validation state of this field and all subfields.
  reset: function() {
    this.inherited(arguments);
    this.getFields().forEach(function(x) {x.reset();});
  },
  initializeSubfield: function(field) {
    this.inherited(arguments);
    if (this.value) field.value = this.value[field.name];
  },
  schemaChanged: function() {
    this.resetFields();
    // create the schema in the widget, if it exists; otherwise direct on field.
    var parent = (this.$.widget) ? this.$.widget.$.fields : this;
    parent.destroyComponents();
    parent.createComponents(this.schema);
  },
  validate: function(value) { return value; },
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
  widget: "widgets.ListWidget",
  //* accepts an array, where each element in the array is the value for a subfield.
  //* if the optional value `reset` is truthy, then validation state will be reset.
  setValue: function(values, reset) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    if (reset) {
      this.validatedOnce = false;
      this.reset();
    }
    this.resetFields();
    // add each field to widget, if it exists, or to field
    var that = (this.$.widget) ? this.$.widget : this;
    values.forEach(function(x) {that.addField(x);});
    if (this.$.widget) {
      this.$.widget.render();
      this.$.widget.validate();
    }
  },
  //* append a subfield to the ListField. If value is not specified, an empty subfield will be created
  addField: function(value) {
    if (this.$.widget) {
      this.$.widget.addField(value);
    } else {
      var kind = enyo.clone(this.schema);
      // if value is a component, then we are actually seeing inSender
      if (value && !(value instanceof enyo.Component)) { kind.value = value; }
      this.createComponent(kind);
    }
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
  //* get all subfield errors. returns a list of subfield error values. if a subfield has no errors, the error value at it's index is null.
  getErrors: function() {
    if (!this.errors.length) return null;
    return this.getFields().map(function(x) {return x.getErrors();});
  },
  //* get a subfield by index
  getField: function(val) {
    return this.fields[val];
  },
  //* @protected
  widgetChanged: function() {
    this.resetFields();
    this.inherited(arguments);
    this.setValue(this.value);
  },
  validate: function(value) {
    if (!value.length && this.required) {
      var message = this.errorMessages.required;
      this.errors = [interpolate(message, [this.schema.name || (typeof(this.schema.kind) == "string" && this.schema.kind.slice(0,-5)) || "item"])];
      return value;
    }
  },
  schemaChanged: function() {
    this.resetFields();
    if (this.$.widget) this.$.widget.setSchema(this.schema);
    this.setValue(this.value);
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
