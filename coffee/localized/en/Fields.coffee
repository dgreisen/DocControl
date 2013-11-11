###
Validators specific to United States
###


addFields = (fields) ->
  if exports?
    utils = require "../../utils"
    fields = require "./Fields"
    validators = require "./Validators"
  else if window?
    utils = window.utils
    fields = window.fields

  ValidationError = utils.ValidationError

  class USZipCodeField extends fields.RegexField
    errorMessages:
      invalid: utils._i('Enter a zip code in the format XXXXX or XXXXX-XXXX.')
    regex: /^\d{5}(?:-\d{4})?$/

  class USPhoneNumberField extends fields.Field
    errorMessages:
      invalid: utils._i('Phone numbers must be in XXX-XXX-XXXX format.')
    regex: /^(?:1-?)?(\d{3})[-\.]?(\d{3})[-\.]?(\d{4})$/
    validate: (value) ->
      value = super(value)
      value = value.replace(/(\(|\)|\s+)/g, '')
      match = value.match(this.regex)
      if match
        value = utils.interpolate("%s-%s-%s", match.slice(1))
        this.setValue(value)
      else
        throw ValidationError(@errorMessages.invalid, "invalid")
      return value

  # @public
  class USSocialSecurityNumberField extends fields.Field
    ###
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
    ###
    errorMessages:
      invalid: utils._i('Enter a valid U.S. Social Security number in XXX-XX-XXXX format.')
    regex: /^(\d{3})[-\ ]?(\d{2})[-\ ]?(\d{4})$/
    validate: (value) ->
      value = super(value)
      match = value.match(this.regex)
      invalidEM = this.errorMessages['invalid']
      if not match then throw ValidationError(@errorMessages.invalid, "invalid")
      area = match[1]
      group = match[2]
      serial = match[3]
      # no blocks of all zeroes
      if area == '000' or group == '00' or serial =='0000' then throw ValidationError(@errorMessages.invalid, "invalid")
      # no promotional or otherwise permanently invalid numbers.
      if area == '666' or
          (area == '987' and group == '65' and 4320 <= int(serial) and int(serial) <= 4329) or
          value == '078-05-1120' or
          value == '219-09-9999' then throw ValidationError(@errorMessages.invalid, "invalid")
      value = utils.interpolate('%s-%s-%s', [area, group, serial])
      this.setValue(value)
      return value

  # @public

  class USStateField extends fields.Field
    ###
    A form field that validates its input is a U.S. state name or abbreviation.
    It normalizes the input to the standard two-leter postal service
    abbreviation for the given state.

    `"localized/en/us_states.js"` must be in your packages.js file.
    ###
    errorMessages:
      invalid: utils._i('Enter a U.S. state or territory.')
    validate: (value) ->
      value = super(value)
      if @errors.length then return value
      value = utils.strip(value).toLowerCase()
      value = us_states.STATES_NORMALIZED[value]
      if value
        this.setValue(value)
      else
        throw ValidationError(@errorMessages.invalid, "invalid")
      return value

  # @public
  
  class USStateChoiceField extends fields.ChoiceField
    # A Select widget that uses a list of U.S. states/territories as its choices.
    # `"localized/en/us_states.js"` must be in your packages.js file.
    choices: us_states.STATE_CHOICES

  # @public
  class USPSChoicesField extends fields.ChoiceField
    # A Select widget that uses a list of US Postal Service codes as its choices
    # `"localized/en/us_states.js"` must be in your packages.js file.
    choices: us_states.USPS_CHOICES

  # @public
  class USAddressField extends fields.ContainerField
    # a us address field. can specify the number of addresses and the type of state field.
    # the type of state widget:
    # <ul><li>`"USStateField"` (default)</li>
    # <li>`"USStateSelect"`</li>
    # <li>`"USPSSelect"</li></ul>
    stateFieldType: "USStateField",
    # number of street lines (default: 1)
    streetLines: 1,
    # @protected
    errorMessages:
      invalid: utils._i('Enter a valid address.')
    streetField: { name: "street", field: "CharField", maxLength: 200, widget: { label: "Street", size: 4 } },
    cityField: { name: "city", field: "CharField", maxLength: 50, widget: { label: "City", size: 2 } },
    zipField: { name: "zip", field: "local.en.USZipCodeField", widget: { label: "Zip", size: 1 }},
    statePrefix: "local.en.",
    constructor: (opts) ->
      opts.schema = []
      for i in [1..@streetLines]
        street = utils.clone(this.streetField)
        street.name = street.name+(i)
        label = if i>1 then " "+ i else ""
        street.widget.label = street.widget.label + label
        opts.schema.push(street)
      opts.schema.push(this.cityField)
      opts.schema.push({ name: "state", field: this.statePrefix + this.stateFieldType,  widget: { label: "State", size: 1 } })
      opts.schema.push(this.zipField)
      super(opts)

  if not fields.local? then fields.local = {}
  fields.local.en =
    USZipCodeField: USZipCodeField
    USPhoneNumberField: USPhoneNumberField
    USSocialSecurityNumberField: USSocialSecurityNumberField
    USStateField: USStateField
    USStateChoiceField: USStateChoiceField
    USPSChoicesField: USPSChoicesField
    USAddressField: USAddressField


if window?
  addFields(window.fields)
else if exports?
  module.exports = addFields
