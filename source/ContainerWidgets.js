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
  inputKind: { name: "fields", tag: "div" },
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
});




//* @public
//* widget for _fields.ContainerField_
enyo.kind({
  name: "widgets.ContainerWidget",
  kind: "widgets.BaseContainerWidget",
  //* @protected
  // we must explicitly set the schema, which will create all subfields based on schema.
  create: function() {
    this.inherited(arguments);
    this.setSchema(this.schema);
  },
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
  // the value should always be set by the field. cannot set value at creation b/c no way to know what value goes with
  // which field until the fields are created and registered.
  setValue: function(values) {}
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
  setValue: function(val) {
    if (!val) return;
    if (!(val instanceof Array)) throw "val must be an array";
    var i;

    // remove existing fields.
    this.$.fields.destroyComponents();

    var kinds = [];
    // add new fields with properly set `validatedOnce` and `value`
    for (i = 0; i < val.length; i++) {
      kind = enyo.clone(this.schema);
      kind = enyo.mixin(kind, {value: val[i], validatedOnce: this.validatedOnce});
      kinds.push(kind);
    }
    this.$.fields.createComponents(kinds);
    this.validate();
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
  setValue: function(values) {
    if (!values) return;
    if (!(values instanceof Array)) throw "values must be an array";
    var i;

    // remove existing fields.
    this.$.fields.destroyComponents();

    var that = this;
    values.forEach(function(x) {that.addField(x);});
    this.validate();
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
  containerControlKind: { kind: "enyo.Button", ontap: "addField", content: "Add" },
  //* skin: skin with twitter bootstrap. you must include a copy of the twitter bootstrap base css.
  tbsSkin: function() {
    this.containerControlKind = { kind: "tbs.Button", ontap: "addField", content: "Add" };
    var comps = [this.helpKind, this.inputKind, this.containerControlKind];
    if (this.style == "horizontal") comps = [{ tag:"div", classes:"controls", components: comps }];
    if (this.label && !this.compact) comps.unshift(this.labelKind);
    this.createComponents(comps);
    this.addClass("control-group");
    if (this.$.helpText) this.$.helpText.addClass("help-block");
    if (this.$.label) this.$.label.addClass("control-label");
  }
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
    { kind: "enyo.Button", content: "Delete", ontap: "handleDelete" }
  ],
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleDelete: function() {
    this.doDelete({field: this.$._content.children[0]});
  }
});
