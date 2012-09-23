enyo.kind({
  name: "local.en.USZipCodeField",
  kind: "fields.RegexField",
  //* @protected
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a zip code in the format XXXXX or XXXXX-XXXX.')
  },
  regex: /^\d{5}(?:-\d{4})?$/
});

//* @public
enyo.kind({
  name: "local.en.USPhoneNumberField",
  kind: "fields.Field",
  //* @protected
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Phone numbers must be in XXX-XXX-XXXX format.')
  },
  regex: /^(?:1-?)?(\d{3})[-\.]?(\d{3})[-\.]?(\d{4})$/,
  validate: function(value) {
    this.inherited(arguments);
    if (validators.isEmpty(value)) return this.nullValue;
    value = value.replace(/(\(|\)|\s+)/g, '');
    match = value.match(this.regex);
    if (match) {
      value = interpolate("%s-%s-%s", match.slice(1));
      this.clean = value;
      this.setValue(value);
    } else {
      this.errors.push(this.errorMessages['invalid']);
    }
    return value;
  }
});

//* @public
/**
A United States Social Security number.

Checks the following rules to determine whether the number is valid:

    * Conforms to the XXX-XX-XXXX format.
    * No group consists entirely of zeroes.
    * The leading group is not "666" (block "666" will never be allocated).
    * The number is not in the promotional block 987-65-4320 through
      987-65-4329, which are permanently invalid.
    * The number is not one known to be invalid due to otherwise widespread
      promotional use or distribution (e.g., the Woolworth's number or the
      1962 promotional number).
*/
enyo.kind({
  name: "local.en.USSocialSecurityNumberField",
  kind: "fields.Field",
  //* @protected
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a valid U.S. Social Security number in XXX-XX-XXXX format.')
  },
  regex: /^(\d{3})[-\ ]?(\d{2})[-\ ]?(\d{4})$/,
  validate: function(value) {
    this.inherited(arguments);
    var match = value.match(this.regex);
    var invalidEM = this.errorMessages['invalid'];
    if (!match) this.errors.push(invalidEM);
    var area = match[1];
    var group = match[2];
    var serial = match[3];
    // no blocks of all zeroes
    if (area == '000' || group == '00' || serial =='0000') this.errors.push(invalidEM);
    // no promotional or otherwise permanently invalid numbers.
    if (area == '666' ||
        (area == '987' && group == '65' && 4320 <= int(serial) && int(serial) <= 4329) ||
        value == '078-05-1120' ||
        value == '219-09-9999') this.errors.push(invalidEM);
    value = interpolate('%s-%s-%s', [area, group, serial]);
    this.clean = value;
    this.setValue(value);
    return value;
  }
});

//* @public
/**
A form field that validates its input is a U.S. state name or abbreviation.
It normalizes the input to the standard two-leter postal service
abbreviation for the given state.

`"localized/en/us_states.js"` must be in your packages.js file.
*/
enyo.kind({
  name: "local.en.USStateField",
  kind: "fields.Field",
  //* @protected
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Enter a U.S. state or territory.')
  },
  validate: function(value) {
    this.inherited(arguments);
    value = strip(value).toLowerCase();
    value = us_states.STATES_NORMALIZED[value];
    if (value) {
      this.clean = value;
      this.setValue(value);
    }
    else {
      this.errors.push(this.errorMessages.invalid);
    }
    return value;
  }

});

//* @public
//* A Select widget that uses a list of U.S. states/territories as its choices.
//* `"localized/en/us_states.js"` must be in your packages.js file.
enyo.kind({
  name: "local.en.USStateChoiceField",
  kind: "fields.ChoiceField",
  choices: us_states.STATE_CHOICES
});

//* @public
//* A Select widget that uses a list of US Postal Service codes as its choices
//* `"localized/en/us_states.js"` must be in your packages.js file.
enyo.kind({
  name: "local.en.USPSChoicesField",
  kind: "fields.ChoiceField",
  choices: us_states.USPS_CHOICES
});

//* @public
//* a us address field. can specify the number of addresses and the type of state field.
enyo.kind({
  name: "local.en.USAddressField",
  kind: "fields.ContainerField",
  //* the type of state widget:
  //* <ul><li>`"USStateField"` (default)</li>
  //* <li>`"USStateSelect"`</li>
  //* <li>`"USPSSelect"</li></ul>
  stateFieldType: "USStateField",
  //* number of street lines (default: 1)
  streetLines: 1,
  //* @protected
  errorMessages: {
    invalid: _i('Enter a valid address.')
  },
  streetField: { name: "street", kind: "fields.CharField", maxLength: 200, widgetAttrs: { label: "Street" } },
  cityField: { name: "city", kind: "fields.CharField", maxLength: 50, widgetAttrs: { label: "City" } },
  zipField: { name: "zip", kind: "local.en.USZipCodeField", widgetAttrs: { label: "Zip" }},
  create: function() {
    this.schema = [];
    for (var i=0; i<this.streetLines; i++) {
      var street = enyo.clone(this.streetField);
      street.name = street.name+i;
      var label = (i>1) ? " "+ i : "";
      street.widgetAttrs.label = street.widgetAttrs.label + label;
      this.schema.push(street);
    }
    this.schema.push(this.cityField);
    this.schema.push({ name: "state", kind: "local.en." + this.stateFieldType,  widgetAttrs: { label: "State" } });
    this.schema.push(this.zipField);
    this.inherited(arguments);
  }
});
