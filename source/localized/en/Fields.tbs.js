enyo.kind({
  name: "local.en.tbs.USZipCodeField",
  kind: "local.en.USZipCodeField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin", inputClasses:"input-mini" }
});

enyo.kind({
  name: "local.en.tbs.USPhoneNumberField",
  kind: "local.en.USPhoneNumberField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin", inputClasses:"input-medium" }
});

enyo.kind({
  name: "local.en.tbs.USSocialSecurityNumberField",
  kind: "local.en.USSocialSecurityNumberField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "local.en.tbs.USStateField",
  kind: "local.en.USStateField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "local.en.tbs.USStateChoiceField",
  kind: "local.en.USStateChoiceField",
  widget: {kind: "widgets.ChoiceWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "local.en.tbs.USPSChoicesField",
  kind: "local.en.USPSChoicesField",
  widget: {kind: "widgets.ChoiceWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "local.en.tbs.USAddressField",
  kind: "local.en.USAddressField",
  streetField: { name: "street", kind: "fields.tbs.CharField", maxLength: 200, widgetAttrs: { label: "Street" } },
  cityField: { name: "city", kind: "fields.tbs.CharField", maxLength: 50, widgetAttrs: { label: "City" } },
  zipField: { name: "zip", kind: "local.en.tbs.USZipCodeField", widgetAttrs: { label: "Zip" }},
  statePrefix: "local.en.tbs."
});