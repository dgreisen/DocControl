// A kind could be given as a string, a function or as a hash. standardize it to a hash
_getKindHash = function(kind) {
  if (typeof(kind) == "string" || kind instanceof Function) return {kind: kind};
  return kind || {};
};
// generate a widget definition from a schema
_genWidgetDef = function(schema, opts) {
  // if widget set to null, then a widget should not be created
  if (schema.widget === null) return;
  if (!opts) opts = {};
  var widget = enyo.clone(schema);
  // if our schema doesn't define a kind, get it from the field
  if (!schema.widget || !(typeof(schema.widget) == "string" || schema.widget.kind)) {
    var kind = window.fields.getField(schema.field).prototype.widget;
    // if prototype.widget is null then a widget should not be created
    if (kind === null) return;
    enyo.mixin(widget, _getKindHash(kind));
  }
  // update with widget attrs
  if (schema.widget) {
    enyo.mixin(widget, _getKindHash(schema.widget));
    delete widget.widget;
  }
  widget.fieldName = schema.name;
  delete widget.name;
    opts.parentWidget = opts.parentWidget || opts.parent;
    delete opts.parent;
    enyo.mixin(widget, opts);
  if (widget.widgetSet)  {
      var widgetKind = widget.kind.split('.');
      widgetKind.splice(1,0, widget.widgetSet);
      var x = window;
      for (var i=0; x && i < widgetKind.length; i++) {x=x[widgetKind[i]];}
      if (x) widget.kind = widgetKind.join('.');
  }
  return widget;
};




enyo.kind({
  name: "widgets.Form",
  kind: "Control",
  published: {
    //* form schema
    schema: undefined,
    //* value of the form
    value: undefined,
    //* the validation strategy for this widget.
    //* <ul><li>`"default"` strategy does not validate on value change until field's getClean() called.</li>
    //* <li>`"always"` strategy begins validating on widget creation.</li></ul>
    validationStrategy: undefined,
    //* whether to update the corresponding field every time the widget changes or only when the user finishes editing the field (onchange)
    instantUpdate: undefined,
    //* a string designating a widget style. e.g. "onyx"
    widgetSet: "",
    //* the widgetSet skin to apply to the widget
    skin: "default"
  },
  create: function() {
    this.inherited(arguments);
    if (this.widgetSet) this.addClass("widgetset-" + this.widgetSet);
    this.addClass("skin-" + this.skin);
    this.schemaChanged();
    this._validate();
  },
  events: {
    onValueChanged: "",
    onValidChanged: "",
    onRequiredChanged: "",
    onFieldAdd: "",
    onFieldDelete: "",
    onSubfieldsReset: ""
  },
  //* listeners for field events
  listeners: {
    onValueChanged: "onFieldValueChanged",
    onValidChanged: "onFieldValidChanged",
    onRequiredChanged: "onFieldRequiredChanged",
    onFieldAdd: "onFieldAdded",
    onFieldDelete: "onFieldDeleted",
    onSubfieldsReset: "onSubfieldsReseted"
  },
  // * handlers for widget events
  handlers: {
    onValueChanged: "onWidgetValueChanged",
    onWidgetDelete: "onWidgetDelete",
    onWidgetAdd: "onWidgetAdd"
  },
  emit: function(fn, inEvent) {
    evnt = enyo.clone(inEvent);
    evnt.field = evnt.originator;
    delete evnt.originator;
    this[fn](evnt);
  },
  onFieldValueChanged: function(inSender, inEvent) {
    var path = inEvent.originator.getPath();
    var widget = this.getWidget(path);
    if (widget) widget.setValue(inEvent.value);
    this.emit("doValueChanged", inEvent);
    this._validate();
  },
  onFieldValidChanged: function(inSender, inEvent) {
    var path = inEvent.originator.getPath();
    var widget = this.getWidget(path);
    if (widget) widget.setErrors(inEvent.errors);
    this.emit("doValidChanged", inEvent);
  },
  onFieldRequiredChanged: function(inSender, inEvent) {
    var path = inEvent.originator.getPath();
    var widget = this.getWidget(path);
    if (widget) widget.setRequired(inEvent.required);
    this._validate();
    this.emit("doRequiredChanged", inEvent);
  },
  onFieldAdded: function(inSender, inEvent) {
    if (!this.noWidgets) {
      var path = inEvent.originator.getPath();
      var schema = enyo.clone(inEvent.schema);
      delete schema.parent;
      enyo.mixin(schema, {skin: this.skin, widgetSet: this.widgetSet, instantUpdate: this.instantUpdate});
      // if this is the root widget, add it to the form, otherwise add to parent widget
      if (!path.length) {
        schema = _genWidgetDef(schema, {parent: this});
        if (schema) this.widgets = this.createComponent(schema);
      } else {
        // get parent of added field and add subwidget
        path.pop();
        var widget = this.getWidget(path);
        if (widget && widget.addWidget) widget.addWidget(schema);
      }
    }
    if (!this.fields) this.fields = this._fields[0];
    this.emit("doFieldAdd", inEvent);
  },
  onFieldDeleted: function(inSender, inEvent) {
    this.emit("doFieldDelete", inEvent);
  },
  onSubfieldsReseted: function(inSender, inEvent) {
    var widget = this.getWidget(inEvent.originator.getPath());
    if (widget && widget.destroyWidgets) widget.destroyWidgets();
    this.emit("doSubfieldsReset", inEvent);
  },
  onWidgetValueChanged: function(inSender, inEvent) {
    if (!this.fields || inEvent.originator == this) return;
    this.setValue(inEvent.value, {path: inEvent.originator.getPath()});
  },
  onWidgetDelete: function(inSender, inEvent) {
    var path = inEvent.widget.getPath();
    var index = path.pop();
    this.fields.getField(path).removeField(index);
  },
  onWidgetAdd: function(inSender, inEvent) {
    var path = inEvent.originator.getPath();
    this.fields.getField(path).addField();
  },
  skinChanged: function(oldSkin) {
    if (oldSkin) this.removeClass("skin-" + oldSkin);
    this.addClass("skin-" + this.skin);
    this.value = this.getValue();
    this.schemaChanged();
  },
  widgetSetChanged: function(oldSet) {
    if (oldSet) this.removeClass("widgetset-" + oldSet);
    if (this.widgetSet) this.addClass("widgetset-" + this.widgetSet);
    this.value = this.getValue();
    this.schemaChanged();
  },
  schemaChanged: function() {
    this.schema = enyo.clone(this.schema);
    this._widgets = [];
    this._fields = [];
    this.widgets = undefined;
    this.fields = undefined;
    if (!this.noWidgets) this.destroyComponents();
    this.fields = fields.genField(this.schema, this, this.value);
    delete this.value;
  },
  //* proxy field methods
  instantUpdateChanged:function() { this.widgets.setInstantUpdate(this.instantUpdate); },
  //* proxy field methods
  getField: function(path) { return this.fields.getField(path); },
  getValue: function(opts) { return this.fields.getValue(opts); },
  setValue: function(val, opts) {
    if (opts && opts.forceReset && (!opts.path || !opts.path.length)) {
      this.value = val;
      this._validatedOnce = false;
      this.schemaChanged();
    } else {
      return this.fields.setValue(val, opts);
    }
  },
  getClean: function(opts) {
    this._validatedOnce = true;
    return this.fields.getClean(opts);
  },
  toJSON: function(opts) {
    this._validatedOnce = true;
    return this.fields.toJSON(opts);
  },
  getErrors: function(opts) {
    this._validatedOnce = true;
    return this.fields.getErrors(opts);
  },
  isValid: function(opts) {
    this._validatedOnce = true;
    return this.fields.isValid(opts);
  },
  _validate: function() {
    // field valueChanged events are emitted before the field has been assigned
    // to this.fields so we don't call if no this.fields, and call again when
    // assignment complete
    if (!this.fields) return;
    // validate, if required by validationStrategy
    var validationStrategy = this.validationStrategy || "default";
    validationStrategy = (typeof(validationStrategy) == "string") ? this[validationStrategy+"Validation"] : validationStrategy;
    if (validationStrategy.call(this)) this.isValid();
  },
  //* validation strategy: validate automatically on change only after validation has been called manually once.
  defaultValidation: function() {
    return this._validatedOnce;
  },
  //* validation strategy: validate automatically on change starting from widget creation
  alwaysValidation: function() {
    return true;
  },
  getPath: function() {
    return [];
  },
  _bubble: function(eventName, inSender, inEvent) {
    var handler = this.listeners[eventName] || this.listeners["*"];
    handler = (handler instanceof Function) ? handler : this[handler];
    if (handler) handler.apply(this, [inSender, inEvent]);
  },
  getWidget: function(path) {
    if (!this.widgets) return;
    if (!path) path = [];
    if (typeof path == "string") path = path.split(".");
    return this.widgets.getWidget(path);
  },
  _genWidgetDef: _genWidgetDef
});





enyo.kind({
  name: "widgets.Widget",
  kind: "Control",
  classes: "widget",
  published: {
    //* widget label
    label: "",
    //* the current value of the widget
    value: undefined,
    //* widget help text
    helpText: "",
    //* whether to update the corresponding field every time the widget changes or only when the user finishes editing the field (onchange)
    instantUpdate: undefined,
    //* whether to display the widget in its compact form TODO: only partially implemented
    compact: false,
    //* positive integer size. regular is 3. skin handles converting unitless size into actual size.
    size: 3,
    //* a string designating a widget style. e.g. "onyx"
    widgetSet: "",
    //* the widgetSet skin to apply to the widget
    skin: "default",
    //* @protected
    //* whether this widget requires a value; inherited from field
    required: true,
    //* the name of the field; set by field
    fieldName: undefined,
    //* whether the field has been validated before - used by some validationStrategies; set by field
    validatedOnce: false,
    //* list of error messages from field validation
    errors: []
  },
  //* the parent widget
  parentWidget: undefined,
  events: {
    //* triggered when the value changes
    onValueChanged: "",
    onRegistration: ""
  },
  create: function() {
    this.inherited(arguments);
    if (this.parentWidget) this.parentWidget._widgets.push(this);
    this.generateComponents(); // generate the widget components
    this.labelChanged();
    this.requiredChanged();
    this.valueChanged(undefined, true);
    this.writeHelpText();
    this.fieldNameChanged();
  },
  //* @public
  //* useful for subclassing. The value to be stored when a null/undefined value is written to the field.
  nullValue: "",
  //* Useful for subclassing. The kind definition for the representation of the label. `name` must remain 'label'.
  labelKind: { name: "label", classes: "widget-label" },
  //* useful for subclassing. The kind definition for the actual input component. You can use as much chrome as you like, but the input should be named `input` to use the default get/setValue machinery. You should also specify any handlers here. They should generally point to `onInputChange` for events equivalent to `onblur`, and to `onInputKey` for events equivalent to `onkeyup`
  inputKind: { name: "input", kind: "enyo.Input", type: "text", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" },
  //* useful for subclassing. The kind definition for the help text. `name` must remain 'helpText'.
  helpKind: { name: "helpText", classes: "widget-help", allowHtml: true },
  //* useful for subclassing. override this function to rearrange the order of the various kinds making up a widget.
  requiredKind: { name: "required", content: "*", allowHtml: true, classes: "widget-required" },
  generateComponents: function() {
    if (this.labelKind) this.labelKind = enyo.clone(this.labelKind);
    if (this.inputKind) this.inputKind = enyo.clone(this.inputKind);
    if (this.helpKind) this.helpKind = enyo.clone(this.helpKind);
    if (this.requiredKind) this.requiredKind = enyo.clone(this.requiredKind);
    if (this.containerControlKind) this.containerControlKind = enyo.clone(this.containerControlKind);


    // skin will actually generate the components
    var widgetSet = this.widgetSet || "";
    var skin = this[widgetSet+"_"+this.skin+"Skin"] || this[this.skin+"Skin"];
    skin.call(this);
  },
  // handler called by input kind when it has changed, and the user has finished inputing - for example on an `onchange` or `onblur`
  onInputChange: function() {
    this.setValue(this.$.input.getValue());
  },
  // handler called by input kind when it has made an instantaneous change - for example on an `onkeyup`
  onInputKey: function() {
    if (this.instantUpdate) this.setValue(this.$.input.getValue());
  },
  labelChanged: function() {
    if (this.compact) {
      this.$.input.setPlaceholder(this.label);
    } else if (this.$.label) {
      this.$.label.setContent(this.label);
    }
  },
  requiredChanged: function() {
    if (!this.$.required) return;
    this.$.required.setShowing(this.required);
  },
  helpTextChanged: function() {
    this.writeHelpText();
  },
  getValid: function() {
    return !this.errors.length;
  },
  fieldNameChanged: function() {
    this.$.input.setAttribute("name", this.fieldName);
    if (this.$.label) this.$.label.setAttribute("for", this.fieldName);
  },
  //* @public
  //* useful for subclassing.
  //* you must ensure doValueChanged is always called when value changes
  valueChanged: function() {
    var val = (this.value === null || this.value === undefined) ? this.nullValue : this.value;
    this.$.input.setValue(val);
    this.doValueChanged({value:this.value});
  },
  errorClass: "error",
  errorsChanged: function() {
    this.writeHelpText();
    if (this.getValid()) {
      this.removeClass(this.errorClass);
      if (this.$.helpText) this.$.helpText.setContent(this.helpText);
    } else {
      this.addClass(this.errorClass);
      if (this.$.helpText) this.$.helpText.setContent(this.errors[0]);
    }
  },
  writeHelpText: function() {
    if (!this.$.helpText) return;
    if (!this.getValid() || this.helpText) {
      this.$.helpText.removeClass("none");
      var txt = (this.errors.length) ? this.errors[0] : this.helpText;
      this.$.helpText.setContent(txt);
    } else {
      this.$.helpText.setContent("");
      this.$.helpText.addClass("none");
    }
  },
  getWidget: function(path) {
    if (path.length > 0) return undefined;
    return this;
  },
  getPath: function() {
    // if no parent, then the path is simply the empty list
    return (this.parentWidget) ? this.parentWidget.getPath(this) : [];
  },
    _genWidgetDef: _genWidgetDef,
  //* skin: default skin
  defaultSkin: function() {
    var comps = [this.inputKind];
    if (this.requiredKind) comps.push(this.requiredKind);
    if (this.helpKind) comps.push(this.helpKind);
    if (this.labelKind) comps.unshift(this.labelKind);
    this.createComponents(comps);
  },
  horizontalSkin: function() {
    var comps = [this.inputKind];
    if (this.requiredKind) comps.push(this.requiredKind);
    if (this.helpKind) {
      var helpKind = enyo.clone(this.helpKind);
      helpKind.fit = true;
      comps.push(helpKind);
    }
    if (this.labelKind) comps.unshift(this.labelKind);

    var comp = {
      kind: "FittableColumns",
      components: comps
    };
    this.createComponents([comp]);
//    if (this.size) this.$.input.addStyles("width:"+(this.size*70-10)+"px;");
  }

});




enyo.kind({
  name: "widgets.PasswordWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { name: "input", kind: "enyo.Input", type: "password", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
});

enyo.kind({
  name: "widgets.EmailWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { name: "input", kind: "enyo.Input", type: "email", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" }
});

//* @public
enyo.kind({
  name: "widgets.CheckboxWidget",
  kind: "widgets.Widget",
  //* @protected
  inputKind: { name: "input", kind: "enyo.Checkbox", onchange: "onInputChange" }
});

//* @public
enyo.kind({
  name: "widgets.ChoiceWidget",
  kind: "widgets.Widget",
  nullValue: "",
  published: {
    //* Text to show corresponding to undefined/null
    //* will not be a choice if (1) initial value is present and (2) field is required.
    unchosenText: "Pick One..."
  },
  //* @protected
  create: function() {
    this.inherited(arguments);
    this.setChoices(this.choices);
    this.valueChanged();
  },
  inputKind: { name: "input", kind: "enyo.Select" },
  valueChanged: function(oldVal) {
    val = this.getValue();
    val = (val === null || val === undefined) ? this.nullValue : val;
    if (this.choicesIndex && this.choicesIndex[val]) {
      this.$.input.setSelected(this.choicesIndex[val]);
      this.doValueChanged({value:this.getValue()});
    }
  },
  labelChanged: function() {
    if (this.compact) {
      this.unchosenText = this.label;
      if (this.choicesIndex) this.setChoices(this.choices);
    } else if (this.$.label) {
      this.$.label.setContent(this.label);
    }
  },
  // a hash of all choice values and their index
  choicesIndex: undefined,
  setChoices: function(val) {
    val = enyo.clone(val);
    this.choices = enyo.clone(val);
    // destroy any existing components
    if (this.choicesIndex) {
      this.value = this.getValue();
      this.$.input.destroyComponents();
    }
    // add unchosen choice if applicable
    if (!this.required || !this.initial) val.unshift([this.nullValue, this.unchosenText]);
    var v = this.value;
    var choices = {};
    var parent = this.$.input;
    var i = 0;
    iterChoices = function(x) {
      if (x[1] instanceof Array) {
        parent = parent.createComponent({ tag: "optgroup", attributes: {label: x[0]} });
        enyo.forEach(x[1], iterChoices);
        parent = parent.parent;
      } else {
        parent.createComponent({ kind: "enyo.Option", content: x[1], value: x[0] });
        choices[x[0]] = i++;
      }
    };
    enyo.forEach(val, iterChoices);
    this.choicesIndex = choices;
  },
  handlers: { onchange: "itemSelected" },
  itemSelected: function(inSender, inEvent) {
    this.setValue(this.$.input.getValue());
  }
});
