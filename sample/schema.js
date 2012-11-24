// SCHEMA
// ======

// Phone Field
// -----------
phoneSchema = {
  name: "phoneField",
  field: "ContainerField",
  widget: { noLabel: true, noHelpText: true },
  schema: [
    { name: "label",
      field: "ChoiceField",
      choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
      widget: { label: "Label", compact: true, noLabel: true, size:1 },
      inputClasses:"input-medium"
    },
    { name: "phone",
      field: "local.en.USPhoneNumberField",
      widget: { label: "Number", compact: true, noLabel: true, helpText: "enter 10 digit phone", size:2 }
    }]
};


// ContactField
// ------------
contactSchema = {
  name: "ContactField",
  field: "ContainerField",
  widget: { skin: "horizontal", noLabel: true, noHelpText: true },
  schema: [
    { name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    },
    { name: "phones",
      field: "ListField",
      schema: phoneSchema,
      widget: { label: "Phone Numbers", noHelpText: true }
    },
    { name: "address",
      field: "local.en.USAddressField",
      widget: { noLabel: true }
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
      schema: { kind: "fields.EmailField", widget: { label: "Email", compact: true, noLabel: true } },
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