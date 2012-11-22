//* Basekind for all containers. Not for direct use.
enyo.kind({
  name: "widgets.BaseContainerWidget",
  kind: "widgets.Widget",
  //* @protected
  published: {
    //* the schema used to generate subfields
    schema: undefined
    // whether this widget has a fixed height. If `true`, then a scroller is provided.
    // fixedHeight: false,
  },
  create: function() {
    this.inherited(arguments);
    this.schemaChanged();
  },
  inputKind: { name: "fields", tag: "div" },
  labelKind: { style: "padding-top:15px;", components: [{ name: "label", classes: "widget-label" }] },
  labelChanged: function() {
    if (this.$.label) this.$.label.setContent(this.label);
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
  fieldNameChanged: function() { return; },
  setValue: function(values) {}
});




//* @public
//* widget for _fields.ContainerField_
enyo.kind({
  name: "widgets.ContainerWidget",
  kind: "widgets.BaseContainerWidget",
  schemaChanged: function() {
    
  }
});




//* @public
//* default widget for _fields.ListWidget_. This kind implements a bare-bones list of subfields. it provides no
//* controls for adding/removing subfields.
enyo.kind({
  name: "widgets.BaseListWidget",
  kind: "widgets.BaseContainerWidget",
  //* @protected
  listFields: function() {
    return this.$.fields.children;
  },
  getValue: function() {
    return this.listFields().map(function(x) {return x.getValue();});
  },
  addField: function(value) {
    var kind = enyo.clone(this.schema);
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
  addField: function(value) {
    var kind = enyo.clone(this.itemKind);
    var item = this.$.fields.createComponent(kind);

    kind = enyo.clone(this.schema);
    kind.validatedOnce = this.validatedOnce;
    // if value is a component, then we are actually seeing inSender
    if (value !== undefined && !(value instanceof enyo.Component)) { kind.value = value; }
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
  containerControlKind: { kind: "enyo.Button", ontap: "addField", content: "Add" }
});


//* @public
//* wrapper for subfields of a _widgets.ListWidget_. You can subclass and specify it in `ListWidget.itemKind`.
enyo.kind({
  name: "widgets.ListItem",
  kind: "enyo.FittableColumns",
  events: {
    onDelete: ""
  },
  components: [
    { name: "_content", kind: "enyo.Control", fit: true },
    { kind: "enyo.Button", content: "Delete", ontap: "handleDelete" }
  ],
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleDelete: function() {
    this.doDelete({field: this.$._content.children[0]});
  }
});
