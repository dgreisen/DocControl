// SCHEMA
// ======

// Phone Field
// -----------
// schema for a phone entry. it includes a US phone number and a standardized label describing the number.
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
// schema for a single contact
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

// ContactsField
// ------------
// schema for a list of contacts
contactsSchema = {
  name: "contacts",
  field: "ListField",
  schema: contactSchema,
  widget: { kind: "widgets.ListWidget", labelKind: null, helpKind: null }
};

// INITIAL DATA
// ============
// the initial data loaded into the form.
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
