enyo.kind({
  name: "ContactField",
  kind: "ContainerField",
  schema: [
    { name: "name",
      kind: "CharField",
      maxLength: 40,
      widgetAttrs: { label: "Name" }
    },
    { name: "private",
      kind: "BooleanField",
      required: false,
      widgetAttrs: { label: "Private", initial: true }
    },
    { name: "emails",
      kind: "ListField",
      widget: "ListWidget",
      schema: { kind: "EmailField", widgetAttrs: { label: "Email" }},
      widgetAttrs: {
        containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add Email" }
      }
    },
    { name: "children",
      kind: "IntegerField",
      maxValue: 30,
      minValue: 0,
      widgetAttrs: { label: "# of Children", initial: 0 }
    }
  ]
});


enyo.kind({
  name: "App",
  classes: "enyo-fit",
  kind: "Scroller",
  components: [
    { name: "contactsMessage", tag: "h3", style: "color:red;"},
    { name: "contactsForm", kind: "ListField",
      schema: { kind: "ContactField" },
      widget: "ListWidget",
      value: [{name: "John Doe", children: 3}, {name: "Sally Smith", children: 2}],
      widgetAttrs: {
        label: "Contacts",
        helpText: "Add as many contacts as you like",
        containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add Contact" }
    }},
    { kind: "onyx.Button", ontap: "onContactTap", content: "Submit"},

    { name: "loginMessage", tag: "h3", style: "color:red;"},
    { name:"loginForm", kind: "ContainerField", schema: [
      { name: "email", kind: "EmailField", widgetAttrs: { label: "Email" }},
      { name: "password", kind: "CharField", minLength: 8, widget: { kind: "PasswordWidget" }, widgetAttrs: { label: "Password" }}
    ]},
    { kind: "onyx.Button", ontap: "onLoginTap", content: "Submit"}
  ],
  onLoginTap: function() {
    if (this.$.loginForm.isValid())
      { this.$.loginMessage.setContent('Successfull Login Submission'); }
    else
      { this.$.loginMessage.setContent('No Login Submission - invalid form'); }
  },
  onContactTap: function() {
    if (this.$.contactsForm.isValid())
      { this.$.contactsMessage.setContent('Successfull Contacts Submission'); }
    else
      { this.$.contactsMessage.setContent(' invalid form'); }
  },
  onAddTap: function() {
    this.$.contactsForm.addField();
  }
});
