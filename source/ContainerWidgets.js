//* Basekind for all containers. Not for direct use.
enyo.kind({
  name: "widgets.BaseContainerWidget",
  kind: "widgets.Widget",
  //* @protected
  create: function() {
    this._widgets = [];
    if (this.containerControlKind) this.containerControlKind = enyo.clone(this.containerControlKind);
    if (this.itemKind) this.itemKind = enyo.clone(this.itemKind);
    this.inherited(arguments);
  },
  inputKind: { name: "widgets", tag: "div" },
  labelKind: { style: "padding-top:15px;", components: [{ name: "label", classes: "widget-label" }] },
  //* kind definition for the itemKind wrapper around each subwidget. Defaults to a
  //* _widgets.ListItem_, but can be any kind. the subwidget will created created within the
  //* control named "_content".
  itemKind: undefined,
  //* kind definition for list controls. defaults to an add button
  containerControlKind: undefined,
  labelChanged: function() {
    if (this.$.label) this.$.label.setContent(this.label);
  },
  addWidget: function(schema) {
    if (!schema) return;
    var parentWidget = this;
    if (this.itemKind) {
      var kind = enyo.clone(this.itemKind);
      parentWidget = this.$.widgets.createComponent(kind);
      parentWidget = parentWidget.$._content;
    }
    widget = this._genWidgetDef(schema, {parent: this});
    if (widget) parentWidget.createComponent(widget);
    this.render();
  },
  errorClass: "containererror",
  fieldNameChanged: function() { return; },
  getWidget: function(path) {
    if (!path.length) return this;
    path = enyo.clone(path);
    subwidget = this._getWidget(path.shift());
    if (!subwidget) return undefined;
    return subwidget.getWidget(path);
  },
  valueChanged: function() {},
  destroyWidgets: function() {
    this._widgets = [];
    this.$.widgets.destroyComponents();
  },
  instantUpdateChanged:function() {
    var that = this;
    enyo.forEach(this._widgets, function(x) {x.setInstantUpdate(that.instantUpdate);});
  }

});




//* @public
//* widget for _fields.ContainerField_
enyo.kind({
  name: "widgets.ContainerWidget",
  kind: "widgets.BaseContainerWidget",
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
    onWidgetAdd: ""
  },
  //* @protected
  // this function is here to be set as a handler on widget chrome in this.containerControl
  handleAdd: function(inSender, inEvent) {
    this.doWidgetAdd();
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
    onWidgetDelete: ""
  },
  components: [
    { name: "_content", kind: "enyo.Control", fit: true },
    { kind: "enyo.Button", content: "Delete", ontap: "handleDelete" }
  ],
  // this function is here to be set as a handler on widget chrome in ListItem
  handleDelete: function() {
    this.doWidgetDelete({widget: this.$._content.children[0]});
  }
});




//* @public
//* widget for _fields.ListWidget_. Provides a wrapper around each subwidget for list controls such as move/delete.
//* also provides list controls, such as add
enyo.kind({
  name: "widgets.ListWidget",
  kind: "widgets.BaseListWidget",
  //* @private
  itemKind: { kind: "widgets.ListItem" },
  containerControlKind: { kind: "enyo.Button", ontap: "handleAdd", content: "Add" }
});
