//* Basekind for all containers. Not for direct use.
enyo.kind({
  name: "widgets.BaseContainerWidget",
  kind: "widgets.Widget",
  //* @protected
  published: {
    // whether this widget has a fixed height. If `true`, then a scroller is provided.
    // fixedHeight: false,
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
  generateComponents: function() {},
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





//* widget for _fields.ContainerField_
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




//* @public
//* default widget for _fields.ListWidget_. This kind implements a bare-bones list of subfields. it provides no
//* controls for adding/removing subfields.
enyo.kind({
  name: "widgets.BaseListWidget",
  kind: "widgets.BaseContainerWidget",
  //* protected
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





//* @public
//* widget for _fields.ListWidget_. Provides a wrapper around each subfield for list controls such as move/delete.
//* also provides list controls, such as add
enyo.kind({
  name: "widgets.ListWidget",
  kind: "widgets.BaseListWidget",
  //* @private
  create: function() {
    this.inherited(arguments);
    this.containerControlKind = enyo.clone(this.containerControlKind);
    this.itemKind = enyo.clone(this.itemKind);
  },
  generateComponents: function() {
    if (this.containerControlKind) this.createComponent(this.containerControlKind);
  },
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    var i;

    // remove existing fields.
    this.$.fields.destroyComponents();

    var that = this;
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
  //* @public
  //* kind definition for the itemKind wrapper around each subfield. Defaults to a
  //* _widgets.ListItem_, but can be any kind. the subfield will created created within the
  //* control named "_content".
  itemKind: { kind: "widgets.ListItem" },
  //* kind definition for list controls. defaults to an add button
  containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add" }
});


//* @public
//* wrapper for subfields of a _widgets.ListWidget_. You can subclass and specify it in `ListWidget.itemKind`.
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
});
