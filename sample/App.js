// SCHEMA
// ======

// Phone Field
// -----------
enyo.kind({
  name: "phoneField",
  kind: "fields.ContainerField",
  schema: [
  { name: "label",
    kind: "fields.tbs.ChoiceField",
    choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
    widgetAttrs: { label: "Label", compact: true },
    inputClasses:"input-medium"
  },
  { name: "phone",
    kind: "local.en.tbs.USPhoneNumberField",
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
      kind: "fields.tbs.CharField",
      maxLength: 40,
      widgetAttrs: { label: "Name", style: "horizontal" }
    },
    { name: "phones",
      kind: "fields.tbs.ListField",
      schema: { kind: phoneField },
      widgetAttrs: { label: "Phone Numbers", style: "horizontal" }
    },
    { name: "address",
      kind: "local.en.tbs.USAddressField",
      widgetAttrs: { style: "horizontal" }
    },
    { name: "type",
      kind: "fields.tbs.ChoiceField",
      choices: [[0, "Friend"],[1, "Family"], [2, "Coworker"], [3, "Acquaintance"]],
      widgetAttrs: { label: "Contact Type", style: "horizontal" }

    },
    { name: "private",
      kind: "fields.tbs.BooleanField",
      required: false,
      widgetAttrs: { label: "Private", initial: true, style: "horizontal" }
    },
    { name: "emails",
      kind: "fields.tbs.ListField",
      schema: { kind: "fields.tbs.EmailField", widgetAttrs: { label: "Email", compact: true } },
      widgetAttrs: {
        label: "Emails",
        containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add Email" },
        style: "horizontal"
      }
    },
    { name: "children",
      kind: "fields.tbs.IntegerField",
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
    { name: "topTB", kind: "onyx.Toolbar" },
    { kind: "Scroller", fit: true, components: [
      { name: "contactsForm", kind: "fields.ListField", classes: "main-content form-horizontal",
        schema: { kind: "ContactField" },
        widget: "widgets.ListWidget",
        value: DATA,
        widgetAttrs: {
          label: "Contacts",
          helpText: "Add as many contacts as you like",
          containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add Contact" }
      }}
    ]},
    { kind: "onyx.Toolbar", components: [
      { kind: "onyx.Button", ontap: "onContactTap", content: "Submit"}
    ]},
    { name: "submitPop", kind: "onyx.Popup", centered: true, floating: true }
  ],
  handlers: {
    onValidation: "onValidation"
  },
  onContactTap: function() {
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