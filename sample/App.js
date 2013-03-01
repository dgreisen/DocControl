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
      {content: "Skins:"},
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
      { classes: "main-content", content: "You can inspect the contacts in the debugger by looking at 'window.form', even when there are no widgets"},
      { name: "contacts",
        kind: "widgets.Form",
        classes: "main-content",
        schema: contactsSchema,
        value: DATA,
        skin: "default",
        widgetSet: "onyx"
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
    this.$.contacts.setValue(DATA, {forceReset: true});
  },
  startup: 1,
  toggleWidgets: function(inSender, inEvent) {
    if (this.startup-- > 0) return;
    this.$.contacts.setNoWidget(!inSender.value);
  },
  selectWidgetSet: function(inSender, inEvent) {
    if (inEvent.content == "none") return this.$.contacts.setShowing(false);
    this.$.contacts.setShowing(true);
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