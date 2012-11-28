//* Basekind for all containers. Not for direct use.
enyo.kind({
  name: "widgets.BaseContainerWidget",
  kind: "widgets.Widget",
  //* @protected
  published: {
    //* the schema used to generate subwidgets
    schema: undefined
    // whether this widget has a fixed height. If `true`, then a scroller is provided.
    // fixedHeight: false,
  },
  create: function() {
    this._widgets = [];
    this.inherited(arguments);
    this.schemaChanged();
    this.valueChanged();
  },
  handlers: {
    //* handle registration of subwidgets
    onRegistration: "onRegistration"
  },
  onRegistration: function(inSender, inEvent) {
    if (inSender == this) return;
    this._widgets.push(inEvent.originator);
    return true;
  },
  inputKind: { name: "widgets", tag: "div" },
  labelKind: { style: "padding-top:15px;", components: [{ name: "label", classes: "widget-label" }] },
  labelChanged: function() {
    if (this.$.label) this.$.label.setContent(this.label);
  },
  errorClass: "containererror",
  fieldNameChanged: function() { return; },
  getWidget: function(path) {
    if (!path.length) return this;
    path = enyo.clone(path);
    subwidget = this._getWidget(path.shift());
    if (!subwidget) return undefined;
    return subwidget.getWidget(path);
  }
});




//* @public
//* widget for _fields.ContainerField_
enyo.kind({
  name: "widgets.ContainerWidget",
  kind: "widgets.BaseContainerWidget",
  schemaChanged: function() {
    var that = this;
    var widgets = enyo.map(this.schema, function(x) {return that._genWidgetDef(x, {parent: that, skin: that.skin, widgetSet: that.widgetSet});});
    this.$.widgets.destroyComponents();
    this.$.widgets.createComponents(widgets);
  },
  valueChanged: function() {

    if (!this._widgets) return;
    var values = this.value || {};
    enyo.forEach(this._widgets, function(x) {x.setValue(values[x.fieldName]);});
  },
  _getWidget: function(name) {
    for (var i in this._widgets) {
      if (this._widgets[i].fieldName == name) return this._widgets[i];
    }
  },
  getPath: function(subwidget) {
    var end = [];
    if (subwidget) end.push(subwidget.fieldName);
    // if no parent, then the path is simply the empty list
    return (this.parentWidget) ? this.parentWidget.getPath(this).concat(end) : end;
  }
});




//* @public
//* default widget for _fields.ListWidget_. This kind implements a bare-bones list of subwidgets. it provides no
//* controls for adding/removing subwidgets.
enyo.kind({
  name: "widgets.BaseListWidget",
  kind: "widgets.BaseContainerWidget",
  events: {
    onAddListSubWidget: ""
  },
  schemaChanged: function(index) {
    this.$.widgets.destroyComponents();
    this._widgets = [];
    this.schema = this._genWidgetDef(this.schema, {parent: this, skin: this.skin, widgetSet: this.widgetSet});
  },
  valueChanged: function() {
    if (!this.schema.parentWidget) return;
    var that = this;
    this.$.widgets.destroyComponents();
    this._widgets = [];
    enyo.forEach(this.value, function(x) {that.addWidget(x);});
  },
  //* @protected
  addWidget: function(value, index, silent) {
    if (typeof(index) == "number" && index != this._widgets.length) return;
    if (!silent) this.doAddListSubWidget({value: value, index: this._widgets.length});
    var kind = enyo.clone(this.schema);
    // if value is a component, then we are actually seeing inSender
    if (value !== undefined) kind.value = value;
    this.$.widgets.createComponent(kind);
    this.render();
  },
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleAdd: function(inSender, inEvent) {
    this.addWidget();
  },
  _getWidget: function(index) {
    return this._widgets[index];
  },
  getPath: function (subwidget) {
    var end = [];
    if (subwidget) end.push(this._widgets.indexOf(subwidget));
    // if no parent, then the path is simply the empty list
    return (this.parentWidget) ? this.parentWidget.getPath(this).concat(end) : end;
  }
});






//* @public
//* wrapper for subwidgets of a _widgets.ListWidget_. You can subclass and specify it in `ListWidget.itemKind`.
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
  // this function is here to be set as a handler on widget chrome in ListItem
  handleDelete: function() {
    this.doDelete({widget: this.$._content.children[0]});
  }
});




//* @public
//* widget for _fields.ListWidget_. Provides a wrapper around each subwidget for list controls such as move/delete.
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
  addWidget: function(value, index, silent) {
    if (typeof(index) == "number" && index != this._widgets.length) return;
    if (!silent) this.doAddListSubWidget({value: value, index: this._widgets.length});
    var kind = enyo.clone(this.itemKind);
    var item = this.$.widgets.createComponent(kind);

    kind = enyo.clone(this.schema);
    if (value !== undefined) kind.value = value;
    item.$._content.createComponent(kind);
    this.render();
  },
  //* @public
  //* kind definition for the itemKind wrapper around each subwidget. Defaults to a
  //* _widgets.ListItem_, but can be any kind. the subwidget will created created within the
  //* control named "_content".
  itemKind: { kind: "widgets.ListItem" },
  //* kind definition for list controls. defaults to an add button
  containerControlKind: { kind: "enyo.Button", ontap: "handleAdd", content: "Add" }
});
