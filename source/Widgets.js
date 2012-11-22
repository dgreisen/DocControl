// A kind could be given as a string, a function or as a hash. standardize it to a hash
_getKindHash = function(kind) {
  if (typeof(kind) == "string" || kind instanceof Function) return {kind: kind};
  return kind || {};
}
// generate a widget definition from a schema
_genWidgetDef = function(schema, parent, value) {
  var widget = enyo.clone(schema);
  // if our schema doesn't define a kind, get it from the field
  if (!schema.widget || !(typeof(schema.widget) == "string" || schema.widget.kind)) {
    var kind = window.fields[schema.field].prototype.widget;
    enyo.mixin(widget, _getKindHash(kind));
  }
  // update with widget attrs
  if (schema.widget) {
    enyo.mixin(widget, _getKindHash(schema.widget));
    delete widget.widget;
  }
  widget.fieldName = schema.name;
  delete widget.name;
  widget.parentWidget = parent;
  widget.value = (value === undefined) ? widget.value : value;
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
    validationStrategy: undefined
  },
  create: function() {
    this.inherited(arguments);
    var schema = enyo.clone(this.schema);
    schema.value = this.value;
    this.fields = utils.genField(this.schema, window.fields);
    this.schemaChanged();
  },
  events: {
    onValueChanged: "",
    onValidChanged: ""
  },
  //* listeners for field events
  listeners: {
    onValueChanged: "onFieldValueChanged",
    onValidChanged: "onFieldValidChanged"
  },
  // * handlers for widget events
  handlers: {
    onValueChanged: "onWidgetValueChanged"
  },
  onFieldValueChanged: function(inSender, inEvent) {
    this.widgets.setValue(inEvent.value, inEvent.originator.getPath());
    inEvent.field = inEvent.originator;
    this.doValueChanged(inSender, inEvent);
    // validate, if required by validationStrategy
    var validationStrategy = this.validationStrategy || "default";
    validationStrategy = (typeof(validationStrategy) == "string") ? this[validationStrategy+"Validation"]() : validationStrategy;
    if (validationStrategy()) this.isValid();
  },
  onFieldValidChanged: function(inSender, inEvent) {
    this.widgets.setErrors(inEvent.errors, inEvent.originator.getPath());
    inEvent.field = inEvent.originator;
  },
  onWidgetValueChanged: function(inSender, inEvent) {
    this.setValue(inEvent.value, {path: inEvent.path});
  },
  schemaChanged: function() {
    var widget = _genWidgetDef(this.schema);
    widget.name = "widget";
    this.destroyComponents();
    this.createComponent(widget);
    this.widgets = this.$.widget;
  },
  //* proxy field functions
  getField: function(path) {
    return this.fields.getField(path);
  },
  getValue: function(opts) {
    return this.fields.getValue(opts);
  },
  setValue: function(val, opts) {
    return this.fields.setValue(val, opts);
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
    return this.isValid(opts);
  },
  //* validation strategy: validate automatically on change only after validation has been called manually once.
  defaultValidation: function() {
    return this._validatedOnce;
  },
  //* validation strategy: validate automatically on change starting from widget creation
  alwaysValidation: function() {
    return true;
  },
  _bubble: function(eventName, inSender, inEvent) {
    var handler = this.listeners[eventName] || this.listeners["*"];
    handler = (handler instanceof Function) ? handler : this[handler];
    if (handler) handler.apply(this, [inSender, inEvent]);
  }
});





enyo.kind({
  name: "widgets.Widget",
  kind: "Control",
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
    //* whether or not to save room for a label.
    noLabel: undefined,
    //* whether or not to save room for helpText
    noHelpText: undefined,
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
    onValueChanged: ""
  },
  create: function() {
    this.inherited(arguments);
    this.generateComponents(); // generate the widget components
    this.labelChanged();
    this.requiredChanged();
    this.setValue(this.value);
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
  requiredKind: { name: "required", content: "*", allowHtml: true, classes:"widget-required" },
  generateComponents: function() {
    this.labelKind = enyo.clone(this.labelKind);
    this.inputKind = enyo.clone(this.inputKind);
    this.helpKind = enyo.clone(this.helpKind);
    // skin will actually generate the components
    var widgetSet = this.widgetSet || "";
    var skin = this[widgetSet+"_"+this.skin+"Skin"] || this[widgetSet+"_defaultSkin"] || this.defaultSkin;
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
    return Boolean(this.errors.length);
  },
  fieldNameChanged: function() {
    this.$.input.setAttribute("name", this.fieldName);
    if (this.$.label) this.$.label.setAttribute("for", this.fieldName);
    this.render();
  },
  //* set the value of the field, or a subfield specified by path
  //* Do Not Override - instead, override _setValue(val)
  setValue: function(val, path) {
    if (path && path.length) throw Error("widget does not exist");
    if ("_setValue" in this) {
      this._setValue(val);
    }
    else if (val !== this.value) {
      this.value = val;
      if ("valueChanged" in this) return this.valueChanged();
    }
    this.doValueChanged({value:this.getValue()});
  },
  //* @public
  //* useful for subclassing.
  valueChanged: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.$.input.setValue(val);
  },
  //* set the errors for this field, or a subfield specified by path
  //* Do Not Override - instead, override _setErrors(val)
  setErrors: function(val, path) {
    if (path && path.length) throw Error("widget does not exist");
    if ("_setErrors" in this) {
      this._setErrors(val);
    }
    else if (utils.isEqual(val, this.value)) {
      this.value = val;
      if ("errorsChanged" in this) return this.errorsChanged();
    }
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
  //* skin: default skin with no css
  defaultSkin: function() {
    var comps = [this.inputKind, this.requiredKind, this.helpKind];
    if (this.label && !this.compact) comps.unshift(this.labelKind);
    this.createComponents(comps);
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
    this.setValue(this.value);
  },
  inputKind: { name: "input", kind: "enyo.Select" },
  _setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.value = val;
    if (this.choicesIndex && this.choicesIndex[val]) this.$.input.setSelected(this.choicesIndex[val]);
  },
  labelChanged: function() {
    if (this.compact) {
      this.unchosenText = this.label;
      if (this.choicesIndex) this.setChoices(this.choices);
    } else if (this.$.label) {
      this.$.label.setContent(this.label);
    }
  },
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
        x[1].forEach(iterChoices);
        parent = parent.parent;
      } else {
        parent.createComponent({ kind: "enyo.Option", content: x[1], value: x[0] });
        choices[x[0]] = i++;
      }
    };
    val.forEach(iterChoices);
    this.choicesIndex = choices;
  },
  handlers: { onchange: "itemSelected" },
  itemSelected: function(inSender, inEvent) {
    this.validate();
  }
});
