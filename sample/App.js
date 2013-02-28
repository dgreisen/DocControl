// SCHEMA
// ======

// Phone Field
// -----------
phoneSchema = {
  name: "phoneField",
  field: "ContainerField",
  widget: { labelKind: null, helpKind: null },
  schema: [
    { name: "label",
      field: "ChoiceField",
      choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
      widget: { label: "Label", compact: true, labelKind: null, size:1 },
      inputClasses:"input-medium"
    },
    { name: "phone",
      field: "local.en.USPhoneNumberField",
      widget: { label: "Number", compact: true, labelKind: null, helpText: "enter 10 digit phone", size:2 }
    }]
};


// ContactField
// ------------
contactSchema = {
  name: "ContactField",
  field: "ContainerField",
  widget: { labelKind: null, helpKind: null },
  schema: [
    { name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    },
    { name: "phones",
      field: "ListField",
      schema: phoneSchema,
      widget: { label: "Phone Numbers", helpKind: null }
    },
    { name: "address",
      field: "local.en.USAddressField",
      widget: { labelKind: null }
    },
    { name: "type",
      field: "ChoiceField",
      choices: [[0, "Friend"],[1, "Family"], [2, "Coworker"], [3, "Acquaintance"]],
      widget: { label: "Contact Type" }
    },
    { name: "private",
      field: "BooleanField",
      required: false,
      widget: { label: "Private", initial: true }
    },
    { name: "emails",
      field: "ListField",
      schema: { field: "EmailField", widget: { label: "Email", compact: true, labelKind: null } },
      widget: {
        label: "Emails",
        unnested: true
      }
    },
    { name: "children",
      field: "IntegerField",
      maxValue: 30,
      minValue: 0,
      widget: { label: "# of Children", initial: 0 }
    }
  ]
};

contactsSchema = {
  name: "contacts",
  field: "ListField",
  schema: contactSchema,
  widget: { kind: "widgets.ListWidget", labelKind: null, helpKind: null }
};

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
      {kind: "onyx.PickerDecorator", onSelect: "selectWidgetSet", components: [
        {},
        {kind: "onyx.Picker", components: [
          {content: "onyx", active: true},
          {content: "enyo"},
          {content: "none"}
        ]}
      ]},
      {content: "Spins:"},
      {kind: "onyx.PickerDecorator", onSelect: "selectSkin", components: [
        {},
        {kind: "onyx.Picker", components: [
          {content: "default", active: true},
          {content: "horizontal"}
        ]}
      ]},
      {content: "Validation Strategy:"},
      {kind: "onyx.PickerDecorator", onSelect: "selectValidationStrategy", components: [
        {},
        {kind: "onyx.Picker", components: [
          {content: "default", active: true},
          {content: "always"}
        ]}
      ]},
      {content: "Instant Validation:"},
      {kind: "onyx.ToggleButton", value: false, onChange: "toggleInstant" },
      {kind: "onyx.Button", content: "help", ontap: "displayHelp"}
    ]},
    { kind: "Scroller", fit: true, components: [
      { classes: "main-content", content: "You can inspect the contacts in the debugger by looking at 'window.contacts', even when there are no widgets"},
      { name: "contacts",
        kind: "widgets.Form",
        classes: "main-content",
        schema: contactsSchema,
        value: DATA,
        skin: "horizontal",
        widgetSet: "enyo"
      }
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
    if (this.$.contacts.isValid()) {
      this.$.submitPop.setContent('Successfull Contacts Submission');
    } else {
      this.$.submitPop.setContent('Submission Failure - invalid form');
    }
    this.$.submitPop.show();
  },
  onReset: function() {
    this.$.contacts.setValue(DATA);
  },
  startup: 2,
  toggleWidgets: function(inSender, inEvent) {
    if (this.startup-- > 0) return;
    this.$.contacts.setNoWidget(!inSender.value);
  },
  selectWidgetSet: function(inSender, inEvent) {
    this.$.contacts.setWidgetSet(inEvent.content);
  },
  selectSkin: function(inSender, inEvent) {
    this.$.contacts.setSkin(inEvent.content);
  },
  selectValidationStrategy: function(inSender, inEvent) {
    this.$.contacts.setValidationStrategy(inEvent.content);
  },
  toggleInstant: function(inSender, inEvent) {
    if (this.startup-- > 0) return;
    this.$.contacts.setInstantUpdate(inSender.value);
  },
  onValidation: function(inSender, inEvent) {
    if (inEvent.valid) {
      this.$.errors.setContent("");
    } else {
      this.$.errors.setContent("Please fix the indicated errors.");
    }
  }
});