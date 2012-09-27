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
    //* <ul><li>`"defaultValidation"` strategy does not validate on value change until field's getClean() called.</li>
    //* <li>`"alwaysValidation"` strategy begins validating on widget creation.</li></ul>
    validationStrategy: "defaultValidation",
    //* whether to validate every time the value changes or only when the user finishes editing the field (onchange)
    validationInstant: false,
    //* whether to display the widget in its compact form TODO: only partially implemented
    compact: false,
    //* function for skinning this widget
    skin: "defaultSkin",
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
    this.setValue(this.value, true);
    this.helpTextChanged();
    this.errorMessageChanged();
    this.validChanged();
    this.fieldNameChanged();
  },
  //* @public
  //* useful for subclassing. The value to be stored when a null/undefined value is written to the field.
  nullValue: "",
  //* Useful for subclassing. The kind definition for the representation of the label. `name` must remain 'label'.
  labelKind: { name: "label", tag: "label" },
  //* useful for subclassing. The kind definition for the actual input component. You can use as much chrome as you like, but the input should be named `input` to use the default get/setValue machinery. You should also specify any handlers here. They should generally point to `onInputChange` for events equivalent to `onblur`, and to `onInputKey` for events equivalent to `onkeyup`
  inputKind: { name: "input", kind: "enyo.Input", onchange: "onInputChange", onkeyup: "onInputKey", onkeydown: "onInputKey" },
  //* useful for subclassing. The kind definition for the help text. `name` must remain 'helpText'.
  helpKind: { name: "helpText", tag: "p" },
  //* useful for subclassing. override this function to rearrange the order of the various kinds making up a widget.
  generateComponents: function() {
  this.labelKind = enyo.clone(this.labelKind);
  this.inputKind = enyo.clone(this.inputKind);
  this.helpKind = enyo.clone(this.helpKind);
  if (typeof(this.skin) == "string") {
      this[this.skin]();
    } else {
      this.skin.call(this);
    }
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
    if (typeof(this.validationStrategy) == "string") {
      this[this.validationStrategy]();
    } else {
      this.validationStrategy.call(this);
    }
  },
  labelChanged: function() {
    if (this.compact) {
      this.$.input.setPlaceholder(this.label);
    } else {
      this.$.label.setContent(this.label);
    }
  },
  helpTextChanged: function() {
    if (this.getValid()) this.$.helpText.setContent(this.helpText);
  },
  errorMessageChanged: function() {
    if (!this.getValid()) this.$.helpText.setContent(this.errorMessage);
  },
  errorClass: "error",
  validChanged: function() {
    if (this.valid) {
      this.removeClass(this.errorClass);
      this.$.helpText.setContent(this.helpText);
    } else {
      this.addClass(this.errorClass);
      this.$.helpText.setContent(this.errorMessage);
    }
  },
  fieldNameChanged: function() {
    this.$.input.setAttribute("name", this.fieldName);
    this.$.label.setAttribute("for", this.fieldName);
    this.render();
  },
  //* @public
  //* useful for subclassing.
  setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
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
  //* skin: default skin with simple display
  //* you must include `DocControl/skins/default` in your package.js
  defaultSkin: function() {
    this.createComponents([this.labelKind, this.inputKind, this.helpKind]);
    this.addClass('ctrlHolder');
    this.$.helpText.addClass('formHint');
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
  },
  inputKind: { name: "input", kind: "enyo.Select" },
  setValue: function(val) {
    val = (val === null || val === undefined) ? this.nullValue : val;
    this.value = val;
    if (this.choicesIndex && this.choicesIndex[val]) this.$.input.setSelected(this.choicesIndex[val]);
  },
  choicesIndex: undefined,
  setChoices: function(val) {
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
        parent.createComponent({ kind: "enyo.Option", content: x[1], value: x[0], active: v===x[0]});
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
