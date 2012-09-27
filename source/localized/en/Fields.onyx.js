enyo.kind({
  name: "local.en.onyx.USZipCodeField",
  kind: "local.en.USZipCodeField",
  widget: "widgets.onyx.Widget"
});

enyo.kind({
  name: "local.en.onyx.USPhoneNumberField",
  kind: "local.en.USPhoneNumberField",
  widget: "widgets.onyx.Widget"
});

enyo.kind({
  name: "local.en.onyx.USSocialSecurityNumberField",
  kind: "local.en.USSocialSecurityNumberField",
  widget: "widgets.onyx.Widget"
});

enyo.kind({
  name: "local.en.onyx.USStateField",
  kind: "local.en.USStateField",
  widget: "widgets.onyx.Widget"
});

enyo.kind({
  name: "local.en.onyx.USStateChoiceField",
  kind: "local.en.USStateChoiceField",
  widget: "widgets.onyx.ChoiceWidget"
});

enyo.kind({
  name: "local.en.onyx.USPSChoicesField",
  kind: "local.en.USPSChoicesField",
  widget: "widgets.onyx.ChoiceWidget"
});

enyo.kind({
  name: "local.en.onyx.USAddressField",
  kind: "local.en.USAddressField",
  streetField: { name: "street", kind: "fields.onyx.CharField", maxLength: 200, widgetAttrs: { label: "Street" } },
  cityField: { name: "city", kind: "fields.onyx.CharField", maxLength: 50, widgetAttrs: { label: "City" } },
  zipField: { name: "zip", kind: "local.en.onyx.USZipCodeField", widgetAttrs: { label: "Zip" }},
  statePrefix: "local.en.onyx."
});