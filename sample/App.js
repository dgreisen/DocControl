// SCHEMA
// ======

// Phone Field
// -----------
enyo.kind({
  name: "phoneField",
  kind: "fields.ContainerField",
  schema: [
  { name: "label",
    kind: "fields.ChoiceField",
    choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
    widgetAttrs: { label: "Label", compact: true },
    inputClasses:"input-medium"
  },
  { name: "phone",
    kind: "local.en.USPhoneNumberField",
    widgetAttrs: { label: "Number", compact: true }
  }]
});

// ContactField
// ------------
enyo.kind({
  name: "ContactField",
  kind: "fields.ContainerField",
  schema: [
    { name: "name",
      kind: "fields.CharField",
      maxLength: 40,
      widgetAttrs: { label: "Name", style: "horizontal" }
    },
    { name: "phones",
      kind: "fields.ListField",
      schema: { kind: phoneField },
      widgetAttrs: { label: "Phone Numbers", style: "horizontal" }
    },
    { name: "address",
      kind: "local.en.USAddressField",
      widgetAttrs: { style: "horizontal" }
    },
    { name: "type",
      kind: "fields.ChoiceField",
      choices: [[0, "Friend"],[1, "Family"], [2, "Coworker"], [3, "Acquaintance"]],
      widgetAttrs: { label: "Contact Type", style: "horizontal" }

    },
    { name: "private",
      kind: "fields.BooleanField",
      required: false,
      widgetAttrs: { label: "Private", initial: true, style: "horizontal" }
    },
    { name: "emails",
      kind: "fields.ListField",
      schema: { kind: "fields.EmailField", widgetAttrs: { label: "Email", compact: true } },
      widgetAttrs: {
        label: "Emails",
        containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add Email" },
        style: "horizontal"
      }
    },
    { name: "children",
      kind: "fields.IntegerField",
      maxValue: 30,
      minValue: 0,
      widgetAttrs: { label: "# of Children", initial: 0, style: "horizontal" }
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
      {content: "Skin:"},
      {kind: "onyx.PickerDecorator", components: [
        {},
        {kind: "onyx.Picker", components: [
          {content: "Enyo"},
          {content: "Bootstrap", active: true},
          {content: "Onyx"}
        ]}
      ]}
    ]},
    { kind: "Scroller", fit: true, components: [
      { name: "contactsForm", kind: "fields.ListField", classes: "main-content form-horizontal",
        schema: { kind: "ContactField" },
        widget: "widgets.ListWidget",
        value: DATA,
        skin: "tbs",
        widgetAttrs: {
          label: "Contacts",
          helpText: "Add as many contacts as you like",
          containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add Contact" }
      }}
    ]},
    { kind: "onyx.Toolbar", components: [
      { kind: "onyx.Button", ontap: "onSubmit", content: "Submit"},
      { kind: "onyx.Button", ontap: "onReset", content: "Reset"}
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
  onValidation: function(inSender, inEvent) {
    if (inEvent.valid) {
      this.$.topTB.setContent("");
    } else {
      this.$.topTB.setContent(this.$.contactsForm.errors[0]);
    }
    console.log("validation", inEvent);
  }
});