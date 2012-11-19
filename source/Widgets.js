enyo.kind({
  name: "fields.enyo",
  kind: "Control",
  published: {
    //* kind definition for widget (eg { kind: "widget.Widget"})
    widget: "widgets.Widget",
    //* hash of attibutes to set on widget (eg `{label: ..., initial: ...}`)
    widgetAttrs: {},
    //* a string designating a widget style. e.g. "onyx", or "tbs"
    widgetSet: undefined,
    //* display method.
    //* <li>"view": non-editable view of widget (not yet implemented) </li>
    //* <li>"edit": standard edit widget (default)</li></ul>
    display: undefined,
    //* whether a widget should be created for this field
    noWidget: undefined
  },
  create: function() {
    this.inherited(arguments);
    this.widgetChanged();
  },
  //* @protected
  widgetChanged: function() {
    // destroy existing widget
    if (this.$.widget) this.destroyComponents();
    // if no widget, return early
    if (this.getNoWidget() || !this.getWidget()) return;
    //prepare widget by creating or cloning the widget kind
    var widget = enyo.clone((typeof(this.widget)=="string") ? { kind: this.widget } : this.widget);
    
    // replace the specified widget with a widget of the widgetSet type, if it exists
    if (this.getWidgetSet()) {
      var kind = widget.kind.split('.');
      kind.splice(1,0, this.getWidgetSet());
      var x = window;
      for (var i=0; x && i < kind.length; i++) {x=x[kind[i]];}
      if (x) widget.kind = kind.join('.');
    }
    // then add widget attributes
    var widgetAttrs = enyo.mixin(enyo.clone(this.getWidgetAttrs()), {name: "widget", required: this.required, value: this.value, fieldName: this.getName(), widgetSet: this.getWidgetSet() });
    widget = enyo.mixin(widget, widgetAttrs);
    // call prepareWidget, which is implemented by subclasses.
    widget = this.prepareWidget(widget);
    // create the component
    this.createComponent(widget);
  },

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
    //* the validation strategy for this widget.
    //* <ul><li>`"default"` strategy does not validate on value change until field's getClean() called.</li>
    //* <li>`"always"` strategy begins validating on widget creation.</li></ul>
    validationStrategy: undefined,
    //* whether to validate every time the value changes or only when the user finishes editing the field (onchange)
    validationInstant: undefined,
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
    //* error message to display; set by field
    errorMessage: "",
    //* whether the current widget is in valid state. IMPORTANT: just because `valid` is true, doesn't mean value passes field's validation method. Just specifies whether widget displays error messages or not. set by field
    valid: true
  },
  //* the initial value of the widget; set by field
  initial: "",
  events: {
    //* request that the parent field perform validation
    onRequestValidation: ""
  },
  create: function() {
    this.inherited(arguments);
    this.generateComponents(); // generate the widget components
    this.labelChanged();
    this.requiredChanged();
    this.value = (this.value === undefined) ? this.initial : this.value;
    this.setValue(this.value);
    this.writeHelpText();
    this.validChanged();
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
    this.value = this.$.input.getValue();
    this.validate();
    return true;
  },
  // handler called by input kind when it has made an instantaneous change - for example on an `onkeyup`
  onInputKey: function() {
    this.value = this.$.input.getValue();
    if (this.validationInstant) {
      this.validate();
    }
    return true;
  },
  //* @private
  //* validates the widget in accordance with the validation strategy.
  validate: function() {
    var validationStrategy = this.validationStrategy || "default";
    if (typeof(validationStrategy) == "string") {
      this[validationStrategy+"Validation"]();
    } else {
      validationStrategy.call(this);
    }
  },
  labelChanged: function() {
    if (this.compact) {
      this.$.input.setPlaceholder(this.label);
    } else if (this.$.label) {
      this.$.label.setContent(this.label);
    }
  },
  writeHelpText: function() {
    if (!this.$.helpText) return;
    if (this.errorMessage || this.helpText) {
      this.$.helpText.removeClass("none");
      this.$.helpText.setContent(this.errorMessage || this.helpText);
    } else {
      this.$.helpText.addClass("none");
    }
  },
  helpTextChanged: function() {
    this.writeHelpText();
  },
  requiredChanged: function() {
    this.validate();
    if (!this.$.required) return;
    if (this.required) {
      this.$.required.show();
    } else {
      this.$.required.hide();
    }
  },
  errorMessageChanged: function() {
    this.writeHelpText();
  },
  errorClass: "error",
  validChanged: function() {
    if (this.valid) {
      this.removeClass(this.errorClass);
      if (this.$.helpText) this.$.helpText.setContent(this.helpText);
    } else {
      this.addClass(this.errorClass);
      if (this.$.helpText) this.$.helpText.setContent(this.errorMessage);
    }
  },
  fieldNameChanged: function() {
    this.$.input.setAttribute("name", this.fieldName);
    if (this.$.label) this.$.label.setAttribute("for", this.fieldName);
    this.render();
  },
  //* @public
  //* useful for subclassing.
  setValue: function(val) {
    var val = (val === null || val === undefined) ? this.nullValue : val;
    this.$.input.setValue(val);
  },
  //* useful for subclassing.
  getValue: function() {
    return this.$.input.getValue();
  },
  //* validation strategy: validate automatically on change only after validation has been called manually once.
  defaultValidation: function() {
    if (this.validatedOnce) {
      this.doRequestValidation();
    }
  },
  //* validation strategy: validate automatically on change starting from widget creation
  alwaysValidation: function() {
    this.doRequestValidation();
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
  setValue: function(val) {
    var val = (val === null || val === undefined) ? this.nullValue : val;
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
    var val = enyo.clone(val);
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
