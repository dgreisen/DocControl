// APPLICATION
// ===========
enyo.kind({
  name: "App",
  classes: "enyo-fit",
  kind: "FittableRows",
  create: function() {
    this.inherited(arguments);
    this.$.getSchema.send();
    this.$.getHelp.send();
  },
  components: [
    // Top Toolbar
    // -----------
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
      {kind: "onyx.ToggleButton", value: false, onChange: "toggleInstant" }
    ]},
    // Application Panels
    { name: "appPanels",
      kind: "Panels",
      fit: true,
      arrangerKind: "CardArranger",
      draggable: false,
      wrap: false,
      components: [
        // Main sample panel
        // ------------------
        { name: "samplePanel", kind: "Scroller", components: [
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
        // Help panel
        { name: "helpPanel", kind: "Scroller", components: [
            { name: "help", allowHtml: true, content: "Please serve from a server such as Nginx or Apache to view help and source", classes: "main-content" }
        ]},
        // Source panel
        { name: "sourcePanel", kind: "Scroller", components: [
            { name: "source", tag: "pre", allowHtml: true, content: "Please serve from a server such as Nginx or Apache to view help and source" }
        ]}
    ]},
    // Bottom Toolbar
    // --------------
    { kind: "onyx.Toolbar", components: [
      {kind: "Group", onActivate:"onPanelSelect", style:"float:right;", defaultKind: "onyx.Button", highlander: true, components: [
        {content: "Sample", val: 0, active: true},
        {content: "Help", val: 1 },
        {content: "Schema", val: 2 }
      ]},
      { name: "submitBtn", kind: "onyx.Button", ontap: "onSubmit", content: "Submit"},
      { name: "resetBtn", kind: "onyx.Button", ontap: "onReset", content: "Reset"},
      { name: "errors"}
    ]},
    { name: "submitPop", kind: "onyx.Popup", centered: true, floating: true },
    { name: "getSchema", kind: "WebService", url: 'sample/schema.js', onResponse: "onSchema", handleAs: "text" },
    { name: "getHelp", kind: "WebService", url: 'sample/help.html', onResponse: "onHelp", handleAs: "text" }
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
  onSchema: function(inSender, inEvent) {
    data = inEvent.data;
    this.$.source.setContent(data);
  },
  onHelp: function(inSender, inEvent) {
    data = inEvent.data;
    this.$.help.setContent(data);
  },
  onPanelSelect: function(inSender, inEvent) {
    if (!inEvent.originator.getActive()) return;
    var i = inEvent.originator.val;
    this.$.appPanels.setIndex(i);
    this.$.submitBtn.setShowing(!i);
    this.$.resetBtn.setShowing(!i);
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