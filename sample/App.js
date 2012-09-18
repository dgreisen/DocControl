enyo.kind({
  name: "ContactField",
  kind: "fields.ContainerField",
  schema: [
    { name: "name",
      kind: "fields.CharField",
      maxLength: 40,
      widgetAttrs: { label: "Name" }
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
        containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add Email" }
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


enyo.kind({
  name: "App",
  classes: "enyo-fit",
  kind: "Scroller",
  components: [
    { name: "contactsForm", kind: "fields.ListField",
      schema: { kind: "ContactField" },
      widget: "widgets.ListWidget",
      value: [{name: "John Doe", children: 3}, {name: "Sally Smith", children: 2}],
      widgetAttrs: {
        label: "Contacts",
        helpText: "Add as many contacts as you like",
        containerControlKind: { kind: "onyx.Button", ontap: "addField", content: "Add Contact" }
    }},
    { name: "contactsMessage", tag: "h3", style: "color:red;"},
    { kind: "onyx.Button", ontap: "onContactTap", content: "Submit"}
  ],
  onContactTap: function() {
    if (this.$.contactsForm.isValid())
      { this.$.contactsMessage.setContent('Successfull Contacts Submission'); }
    else
      { this.$.contactsMessage.setContent('Submission Failure - invalid form'); }
  }
});
