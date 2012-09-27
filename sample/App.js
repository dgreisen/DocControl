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
    widgetAttrs: { unchosenText: "label..." }
  },
  { name: "phone",
    kind: "local.en.USPhoneNumberField",
    widgetAttrs: {label: "Phone"}
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
      widgetAttrs: { label: "Name" }
    },
    { name: "phones",
      kind: "fields.ListField",
      widget: "widgets.ListWidget",
      schema: { kind: phoneField },
      widgetAttrs: { label: "Phone Numbers" }
    },
    { name: "address",
      kind: "local.en.USAddressField"
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
      widget: "widgets.ListWidget",
      schema: { kind: "fields.EmailField", widgetAttrs: { label: "Email" }},
      widgetAttrs: {
        containerControlKind: { kind: "enyo.Button", ontap: "addField", content: "Add Email" }
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
      { name: "contactsForm", kind: "fields.ListField",
        schema: { kind: "ContactField" },
        widget: "widgets.ListWidget",
        value: DATA,
        widgetAttrs: {
          label: "Contacts",
          helpText: "Add as many contacts as you like",
          containerControlKind: { kind: "enyo.Button", ontap: "addField", content: "Add Contact" }
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