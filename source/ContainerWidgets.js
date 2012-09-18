enyo.kind({
  name: "widgets.BaseContainerWidget",
  kind: "widgets.Widget",
  published: {
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
  containerControlKind: undefined,
  generateComponents: function() {
    if (this.containerControlKind) this.createComponent(this.containerControlKind);
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
  name: "widgets.ContainerWidget",
  kind: "widgets.BaseContainerWidget",
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
  name: "widgets.BaseListWidget",
  kind: "widgets.BaseContainerWidget",
  create: function() {
    this.inherited(arguments);
    this.containerControlKind = enyo.clone(this.containerControlKind);
    this.itemKind = enyo.clone(this.itemKind);
  },
  // We copy the field definition from the field schema for later use.
  _fieldKind: undefined,
  setSchema: function(schema) {
    this._fieldKind = enyo.clone(schema);
  },
  listFields: function() {
    return this.$.fields.children;
  },
  getValue: function() {
    return this.listFields().map(function(x) {return x.getValue();});
  },
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    var i;

    // remove existing fields.
    this.$.fields.destroyComponents();

    var kinds = [];
    // add new fields with properly set `validatedOnce` and `value`
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
  name: "widgets.ListWidget",
  kind: "widgets.BaseListWidget",
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    var i;

    // remove existing fields.
    this.$.fields.destroyComponents();

    that = this;
    values.forEach(function(x) {that.addField(x);});
  },
  addField: function(value) {
    kind = enyo.clone(this.itemKind);
    item = this.$.fields.createComponent(kind);

    kind = enyo.clone(this._fieldKind);
    kind.validatedOnce = this.validatedOnce;
    // if value is a component, then we are actually seeing inSender
    if (value && !(value instanceof enyo.Component)) { kind.value = value; }
    item.$._content.createComponent(kind);
    this.validate();
    this.render();
  },
  itemKind: { kind: "widgets.ListItem" },
  containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add" }
});



enyo.kind({
  name: "widgets.ListItem",
  kind: "enyo.Control",
  events: {
    onDelete: ""
  },
  components: [
    { name: "_content", kind: "enyo.Control" },
    { kind: "onyx.Button", content: "Delete", ontap: "handleDelete" }
  ],
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleDelete: function() {
    this.doDelete({field: this.$._content.children[0]});
  }
})