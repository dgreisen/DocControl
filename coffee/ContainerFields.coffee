if exports?
  utils = require "./utils"
  fields = require "./Fields"

###
  _fields.BaseContainerField_ is the baseKind for all container-type fields.
  DocControl allows you to create, validate and display arbitrarily complex
  nested data structures. container-type fields contain other fields. There
  are currently two types. A `ContainerField`, analogous to a hash of subfields,
  and a `ListField`, analogous to a list of subfields. container-type fields
  act in most ways like a regular field. You can set them, and all their subfields
  with `setValue`, you can get their, and all their subfields', data with
  `getClean` or `toJSON`.

  When a subfield is invalid, the containing field will also be invalid.

  You specify a container's subfields in the `schema` attribute. Each container type
  accepts a different format for the `schema`.

  DocControl schemas are fully recursive - that is, containers can contain containers,
  allowing you to model and validate highly nested datastructures like you might find
  in a document database.
###
class BaseContainerField extends fields.Field
  # The schema used to generate the field and all its subfields
  schema: undefined
  # all subfields
  _fields: undefined
  errorMessages:
    required: utils._i('There must be at least one %s.')
    invalid: utils._i('Please fix the errors indicated below.')
  constructor: (opts) ->
    super(opts)
    @_invalidFields = {}
    # we have to specifically set the value so because setValue before didn't work without having the schema set
    @value = @opts.value
    @setSchema(@opts.schema)
  handlers:
    validChanged: "onValidChanged"
    valueChanged: "onValueChanged"
  # hash of invalid subfields (to prevent duplication)
  _invalidFields: {}
  # false - never been validated
  # true - been validated in past
  # "validating" - currently in a validation cycle
  _validationState = false
  # add/remove the field from `invalidFields` depending on if the field is invalid or valid, respectively
  onValidChanged: (inSender, inEvent) ->
    console.log "onValidChanged"
    # only deal with events from immediate children and only if we've been validated before
    if not inSender == inEvent.originator or not @_validationState 
      return false
    if inEvent.valid
      delete @_invalidFields[inSender]
      @_hasChanged = true
      @isValid()
    else if inSender not of @_invalidFields
      @_invalidFields[inSender] = true
      @_hasChanged = true
      @isValid()
    # we don't want to call @isValid if all that has changed is an error message
    return false
  # custom isvalid method that validates all child fields as well.
  isValid: () ->
    if not @_hasChanged or @_validationState == "validating" then return @_valid
    # reset the errors array
    oldErrors = @errors
    @errors = []

    # If there are marked invalidFields or we are unable to get the cleaned data, set an error message
    if utils.isEmpty(@_invalidFields)
      try
        value = @_querySubfields("getClean")
      catch e
        @errors = [@errorMessages.invalid]
    else 
      @errors = [@errorMessages.invalid]

    # run custom validation on the cleaned data
    if not @errors.length then @validate(value)
    # try once more to get cleaned data, incase @validate modified subfields
    if not @errors.length
      try
        @clean = @_querySubfields("getClean")
      catch e
        @errors = [@errorMessages.invalid]

    valid = not @errors.length
    if valid != @_valid or not valid and not utils.isEqual(oldErrors, @errors)
      @emit("validChanged", valid: valid, errors: @errors)
      @_valid = valid
    @_hasChanged = false
    @_validationState = true
    return valid
  # get data from each subfield `fn` and put it into the appropriate data structure
  _querySubfields: (fn, args...) ->
    return utils.map(@getFields(), (x) -> x[fn].apply(x, args))
  getFields: () ->
    return @_fields
  resetFields: () ->
    # if there are already fields, store their values for later reconstruction
    if @_fields && @_fields.length then @value = @getValue()
    @_fields = []
  throwValidationError: () ->
    if not @isValid() then throw @errors
  getValue: () ->
    return @_querySubfields("getValue")
  getClean: () ->
    @throwValidationError()
    return @_querySubfields("getClean")
  toJSON: () ->
    @throwValidationError()
    return @_querySubfields("toJSON")
  getErrors: () ->
    @isValid()
    if not @errors.length then return null
    return @_querySubfields("getErrors")
  _addField: (definition, value) ->
    definition = utils.clone(definition)
    definition.parent = this
    if value? then definition.value = value
    field = utils.genField(definition, fields)
    @_fields.push(field)
    return field


###
  A ContainerField contains a number of heterogeneous
  subfields. When data is extracted from it using `toJSON`, or `getClean`, the
  returned data is in a hash object where the key is the name of the subfield
  and the value is the value of the subfield.

  the schema for a ContainerField is an Array of kind definition objects such as
  `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`.
  The ContainerField will contain the specified array of heterogenious fields.
###
class ContainerField extends BaseContainerField
  widget: "widgets.ContainerWidget"
  setValue: (values) ->
    origValue = @getValue()
    if not values or utils.isEqual(values, origValue) or not @_fields then return
    if values not instanceof Object or values instanceof Array then throw "values must be a hash"
    fields = @getFields()
    for field in fields
      field.setValue(values[field.name])
    @emit("valueChanged", value: values, original: origValue)
  # get an immediate subfield by name or path
  _getField: (val) ->
    for field in @getFields()
      if field.name == val then return field
  setSchema: (schema) ->
    if not schema? or schema == @schema then return
    @schema = schema
    @resetFields()
    for definition in schema
      value = if @value? then @value[definition.name]
      @_addField(definition, value)
    @value = undefined
  validate: (value) ->
    return value
  _querySubfields: (fn, args...) ->
    out = {}
    utils.forEach(@getFields(), (x) -> out[x.name] = x.getValue())
    return out
  getPath: (subfield) ->
    end = []
    if subfield
      end.push(subfield.name)
    # if no parent, then the path is siply the empty list
    if @parent
      return @parent.getPath(this).concat(end)
    else
      return end



###
    A ListField contains an arbitrary number of identical
    subfields. When data is extracted from it using `toJSON`, or `getClean`, the
    returned data is in a list where each value is the value of the subfield at
    the corresponding index.

    A ListField's `schema` consists of a single field definition, such as
    `{ kind: "email" }`. The ListField's `fields` attribute will then contain
    an array of subfields of that kind.
###
class ListField extends BaseContainerField
  widget: "widgets.ListWidget",
  setSchema: (schema) ->
    if not schema? or schema == @schema then return
    @schema = schema
    @resetFields()
    @setValue(@value)
    @value = undefined
  # accepts an array, where each element in the array is the value for a subfield.
  # if the optional value `reset` is truthy, then validation state will be reset.
  setValue: (values) ->
    if not values or not @schema or utils.isEqual(values, @getValue()) then return
    if values not instanceof Array then throw "values must be an array"
    @resetFields()
    for value in values
      @_addField(@schema, value)
    @emit("valueChanged", value: values, original: @value)
    @value = undefined
  # remove the field at `index`.
  addField: (definition, fields=fields) ->
    value = @getValue()
    @_addField(definition, fields)
    @emit("valueChanged", value: @getValue(), original: value)
  removeField: (index) ->
    value = @getValue()
    value.splice(index, 1)
    @setValue(value)
    @emit("valueChanged", value: @getValue(), original: value)
  # get an immediate subfield by index
  _getField: (val) ->
    return @_fields[val]
  validate: (value) ->
    if not value.length && @required
      message = @errorMessages.required
      @errors = [interpolate(message, [@schema.name || (typeof(@schema.field) == "string" && @schema.field.slice(0,-5)) || "item"])]
      return value
  getPath: (subfield) ->
    end = []
    if subfield
      end.push(@getFields().indexOf(subfield))
    # if no parent, then the path is siply the empty list
    if @parent
      return @parent.getPath(this).concat(end)
    else
      return end





fields.BaseContainerField = BaseContainerField
fields.ContainerField = ContainerField
fields.ListField = ListField

if window?
  window.fields = fields
else if exports?
  module.exports = fields