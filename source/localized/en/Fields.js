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

enyo.kind({
  name: "local.en.USPhoneNumberField",
  kind: "fields.Field",
  regex: /^(?:1-?)?(\d{3})[-\.]?(\d{3})[-\.]?(\d{4})$/,
  errorMessages: {
    required: _i('This field is required.'),
    invalid: _i('Phone numbers must be in XXX-XXX-XXXX format.')
  },
  validate: function() {
    this.inherited(arguments);
    var value = this.getValue();
    if (validators.isEmpty(value)) return this.nullValue;
    value = value.replace(/(\(|\)|\s+)/g, '');
    match = value.match(this.regex);
    if (match) {
      this.setValue(interpolate("%s-%s-%s", match.slice(1)));
    } else {
      this.errors.push(this.errorMessages['invalid']);
    }
  }
});

ssn_re = /^(\d{3})[-\ ]?(\d{2})[-\ ]?(\d{4})$/
