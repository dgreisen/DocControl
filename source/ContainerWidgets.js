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
  create: function() {
    this.inherited(arguments);
    this.setSchema(this.schema);
  },
  components: [
    { name: "label", tag: "label" },
    { name: "helpText", tag: "p" },
    { name: "fields", tag: "div" }
  ],
  containerControl: undefined,
  generateComponents: function() {
    if (this.containerControlKind) this.createComponent(this.containerControlKind);
    if (this.itemControlKind) this.createComponent(this.itemControlKind);
  },
  labelChanged: function() {
    this.$.label.setContent(this.label);
  },
  getFields: function() {
    return this.$.fields.$;
  },
  getValue: function() {
    throw "BaseContainerWidget and its subclasses do not support getValue; call BaseContainerField.getValue()";
  },
  getClean: function() {
    throw "BaseContainerWidget and its subclasses do not support getClean; call BaseContainerField.getClean()";
  },
  toJSON: function() {
    throw "BaseContainerWidget and its subclasses do not support toJSON; call BaseContainerField.toJSON()";
  },


  errorClass: "containererror",
  fieldNameChanged: function() { return; }
});






enyo.kind({
  name: "ContainerWidget",
  kind: "BaseContainerWidget",
  setSchema: function(schema) {
    this.$.fields.destroyComponents();
    this.$.fields.createComponents(schema);
    this.setValidatedOnce(this.validatedOnce);
  },
  setValidatedOnce: function(val) {
    this.fields.forEach(function(x) {if (x.display) x.$.widget.setValidatedOnce(val);});
  },
  listFields: function() {
    return this.$.fields.children;
  }, 
  setValue: function(values) {}
});






enyo.kind({
  name: "BaseListWidget",
  kind: "BaseContainerWidget",
  create: function() {
    this.inherited(arguments);
    this.containerControlKind = enyo.clone(this.containerControlKind);
    this.itemControlKind = enyo.clone(this.itemControlKind);
  },
  // We copy the field definition from the field schema for later use.
  _fieldKind: undefined,
  setSchema: function(schema) {
    this._fieldKind = enyo.clone(schema);
    this._fieldKind.widgetAttrs = this._fieldKind.widgetAttrs || {};
    this._fieldKind.widgetAttrs.itemControlKind = this.itemControlKind;
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

    // remove existing fields.
    this.$.fields.destroyComponents();

    // add new fields with properly set `validatedOnce` and `value`
    var kinds = [];
    for (i = 0; i < values.length; i++) {
      kind = enyo.clone(this._fieldKind);
      kind = enyo.mixin(kind, {value: values[i], validatedOnce: this.validatedOnce});
      kinds.push(kind);
    }
    this.$.fields.createComponents(kinds);
  },
  addField: function(value) {
    kind = enyo.clone(this._fieldKind);
    kind.validatedOnce = this.validatedOnce;
    // if value is a component, then we are actually seeing inSender
    if (value && !(value instanceof enyo.Component)) { kind.value = value; }
    this.$.fields.createComponent(kind);
    this.validate();
    this.render();
  }
});







enyo.kind({
  name: "ListWidget",
  kind: "BaseListWidget",
  itemControlKind: { kind: "onyx.Button", content: "Delete", ontap: "handleDelete" },
  containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add" }
});