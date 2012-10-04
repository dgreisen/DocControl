// SCHEMA
// ======

// Phone Field
// -----------
enyo.kind({
  name: "phoneField",
  kind: "fields.ContainerField",
  widgetAttrs: { noLabel: true, noHelpText: true },
  schema: [
  { name: "label",
    kind: "fields.ChoiceField",
    choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
    widgetAttrs: { label: "Label", compact: true, noLabel: true, size:1 },
    inputClasses:"input-medium"
  },
  { name: "phone",
    kind: "local.en.USPhoneNumberField",
    widgetAttrs: { label: "Number", compact: true, noLabel: true, helpText: "enter 10 digit phone", size:2 }
  }]
});

// ContactField
// ------------
enyo.kind({
  name: "ContactField",
  kind: "fields.ContainerField",
  widgetAttrs: { skin: "horizontal", noLabel: true, noHelpText: true },
  schema: [
    { name: "name",
      kind: "fields.CharField",
      maxLength: 40,
      widgetAttrs: { label: "Name" }
    },
    { name: "phones",
      kind: "fields.ListField",
      schema: { kind: phoneField },
      widgetAttrs: { label: "Phone Numbers", noHelpText: true }
    },
    { name: "address",
      kind: "local.en.USAddressField",
      widgetAttrs: { noLabel: true }
    },
    { name: "type",
      kind: "fields.ChoiceField",
      choices: [[0, "Friend"],[1, "Family"], [2, "Coworker"], [3, "Acquaintance"]],
      widgetAttrs: { label: "Contact Type" }
    },
    { name: "private",
      kind: "fields.BooleanField",
      required: false,
      widgetAttrs: { label: "Private", initial: true }
    },
    { name: "emails",
      kind: "fields.ListField",
      schema: { kind: "fields.EmailField", widgetAttrs: { label: "Email", compact: true, noLabel: true } },
      widgetAttrs: {
        label: "Emails",
        unnested: true
      }
    },
    { name: "children",
      kind: "fields.IntegerField",
      maxValue: 30,
      minValue: 0,
      widgetAttrs: { label: "# of Children", initial: 0 }
    }
  ]
});

// INITIAL DATA
// ============
DATA = [
  { name: "John Doe",
    "private": true,
    emails: ["jdoe@example.com"],
    phones: [{ label: "h", phone: "403-555-9832" }],
    address: {
      street1: "1 Mulberry Ln.",
      city: "Springfield",
      state: "ND",
      zip: "00093"
    },
    type: 0,
    children:3
  }
];

// APPLICATION
// ===========
enyo.kind({
  name: "App",
  classes: "enyo-fit",
  kind: "FittableRows",
  components: [
    { name: "topTB", kind: "onyx.Toolbar", components: [
      {content: "Widgets:"},
      {kind: "onyx.ToggleButton", value: true, onChange: "toggleWidgets" },
      {content: "Validation Strategy:"},
      {kind: "onyx.PickerDecorator", onSelect: "selectValidationStrategy", components: [
        {},
        {kind: "onyx.Picker", components: [
          {content: "Default", active: true},
          {content: "Always"}
        ]}
      ]},
      {content: "Instant Validation:"},
      {kind: "onyx.ToggleButton", value: false, onChange: "toggleInstant" },
      {kind: "onyx.Button", content: "help", ontap: "displayHelp"}
    ]},
    { kind: "Scroller", fit: true, components: [
      { classes: "main-content", content: "You can inspect the contacts in the debugger by looking at 'window.contacts', even when there are no widgets"},
      { name: "contactsForm", kind: "fields.ListField", classes: "main-content form-horizontal",
        schema: { kind: "ContactField" },
        widget: "widgets.ListWidget",
        value: DATA,
        widgetSet: "onyx",
        widgetAttrs: {
          noLabel: true, noHelpText: true
      }}
    ]},
    { kind: "onyx.Toolbar", components: [
      { kind: "onyx.Button", ontap: "onSubmit", content: "Submit"},
      { kind: "onyx.Button", ontap: "onReset", content: "Reset"},
      { name: "errors" }
    ]},
    { name: "submitPop", kind: "onyx.Popup", centered: true, floating: true }
  ],
  handlers: {
    onValidation: "onValidation"
  },
  onSubmit: function() {
    if (this.$.contactsForm.isValid()) {
      this.$.submitPop.setContent('Successfull Contacts Submission');
    } else {
      this.$.submitPop.setContent('Submission Failure - invalid form');
    }
    this.$.submitPop.show();
  },
  onReset: function() {
    this.$.contactsForm.setValue(DATA, true);
  },
  startup: 2,
  toggleWidgets: function(inSender, inEvent) {
    if (this.startup-- > 0) return;
    this.$.contactsForm.setNoWidget(!inSender.value);
  },
  selectValidationStrategy: function(inSender, inEvent) {
    console.log('x');
    this.$.contactsForm.setWidgetAttrs({validationStrategy: inEvent.content.toLowerCase()});
  },
  toggleInstant: function(inSender, inEvent) {
    if (this.startup-- > 0) return;
    this.$.contactsForm.setWidgetAttrs({validationInstant: inSender.value});
  },
  onValidation: function(inSender, inEvent) {
    if (inEvent.valid) {
      this.$.errors.setContent("");
    } else {
      this.$.errors.setContent("Please fix the indicated errors.");
    }
  }
});