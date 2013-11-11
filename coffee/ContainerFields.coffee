addFields = (fields) ->
  if exports?
    utils = require "./utils"
  else if window?
    utils = window.utils


  ###
  DocControl allows you to create arbitrarily nested forms, to validate arbitrary data structures.
  You do this by using ContainerFields. create a nested form by creating a containerField
  then adding subfields to the schema. See example in README.md.
  ###

  class BaseContainerField extends fields.Field
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
    # The schema used to generate the field and all its subfields
    schema: undefined
    # all subfields
    _fields: undefined
    errorMessages:
      required: utils._i('There must be at least one %s.')
      invalid: utils._i('Please fix the errors indicated below.')
    listeners:
      onValueChanged: "subfieldChanged"
      onValidChanged: "subfieldChanged"
      onRequiredChanged: "subfieldChanged"
    subfieldChanged: (inSender, inEvent) ->
      ### if an immediate subfield has changed, then we want to perform validation next time inValid called ###
      @_hasChanged = true
      return false
    isValid: (opts) ->
      ### custom isvalid method that validates all child fields as well. ###
      if opts?.path?.length then return @_applyToSubfield("isValid", opts)
      if not @_hasChanged then return @_valid
      # reset the errors array
      oldErrors = @errors
      @errors = []
      value = undefined
      utils.forEach @getFields(), (x) =>
        unless x.isValid() then @errors = [@errorMessages.invalid]
      if not @errors.length
        value = @_querySubfields("getClean")
        # run custom validation on the cleaned data
        value = @validate(value)
      # try again to get cleaned data if @validate modified subfields
      utils.forEach @getFields(), (x) =>
        unless x.isValid() then @errors = [@errorMessages.invalid]
      valid = not @errors.length
      if valid then value = @_querySubfields("getClean")
      @clean = if valid then value else undefined
      if valid != @_valid or (not valid and not utils.isEqual(oldErrors, @errors))
        @emit("onValidChanged", valid: valid, errors: @errors)
        @_valid = valid
      @_hasChanged = false
      return valid
    _querySubfields: (fn, args...) ->
      ### get data from each subfield `fn` and put it into the appropriate data structure ###
      return utils.map(@getFields(), (x) -> x[fn].apply(x, args))
    getFields: (opts) ->
      if opts?.path?.length then return @_applyToSubfield("getFields", opts)
      return @_fields
    getField: (path) ->
      ###
      return an arbitrarily deep subfield given a path. Path can be an array
      of indexes/names, or it can be a dot-delimited string
      ###
      if not path or path.length == 0 then return this
      if typeof path == "string" then path = path.split "."
      subfield = @_getField(path.shift())
      if not subfield? then return undefined
      return subfield.getField(path)
    resetFields: () ->
      # if there are already fields, store their values for later reconstruction
      @emit("onSubfieldsReset")
      if @_fields && @_fields.length then @value = @getValue()
      @_fields = []
    throwValidationError: () ->
      if not @isValid() then throw @errors
    getValue: (opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("getValue", opts)
      if @value != undefined then return @value
      return @_querySubfields("getValue")
    getClean: (opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("getClean", opts)
      @throwValidationError()
      return @clean
    toJSON: (opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("toJSON", opts)
      @throwValidationError()
      return @_querySubfields("toJSON")
    getErrors: (opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("getErrors", opts)
      @isValid()
      if not @errors.length then return null
      return @_querySubfields("getErrors")
    _addField: (definition, value) ->
      definition = utils.clone(definition)
      definition.parent = this
      if value? then definition.value = value
      # child pushes itself onto parent
      field = fields.genField(definition, this, value)
      return field
    _applyToSubfield: (fn, opts, args...) ->
      subfield =  @getField(opts.path)
      if not subfield then throw Error "Field does not exist: " + String(opts.path)
      delete opts.path
      args.push(opts)
      return subfield[fn].apply(subfield, args)
    _procOpts: (opts) ->
      opts ?= {}
      if typeof(opts) == "string" or opts instanceof Array then opts = {path: opts}
      return opts



  class ContainerField extends BaseContainerField
    ###
      A ContainerField contains a number of heterogeneous
      subfields. When data is extracted from it using `toJSON`, or `getClean`, the
      returned data is in a hash object where the key is the name of the subfield
      and the value is the value of the subfield.

      the schema for a ContainerField is an Array of kind definition objects such as
      `[{kind: "CharField", maxLength: 50 }, {kind:IntegerField }`.
      The ContainerField will contain the specified array of heterogenious fields.
    ###
    widget: "widgets.ContainerWidget"
    setValue: (val, opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("setValue", opts, val)
      origValue = @getValue()
      if val == undefined then val = utils.clone(@default) || {}
      if not val or utils.isEqual(val, origValue) or not @_fields then return
      if val not instanceof Object or val instanceof Array then throw JSON.stringify(val) + " must be a hash"
      @value = val
      _fields = @getFields()
      for field in _fields
        field.setValue(val[field.name])
      @value = if @value != null then undefined
      @emit("onValueChanged", value: @getValue(), original: origValue)
    _getField: (name) ->
      # get an immediate subfield by name
      for field in @getFields()
        if field.name == name then return field
    setSchema: (schema, opts) ->
      if opts?.path?.length then return @_applyToSubfield("setSchema", opts, schema)
      if not schema? or schema == @schema then return
      @schema = schema
      origValue = @getValue()
      @resetFields()
      if opts?.value? then @value = opts.value;
      for definition in schema
        value = if @value? then @value[definition.name]
        @_addField(definition, value)
      @value = if @value != null then undefined
      @emit("onValueChanged", value: @getValue(), original: origValue)
    validate: (value) ->
      return value
    _querySubfields: (fn, args...) ->
      out = {}
      utils.forEach(@getFields(), (x) -> out[x.name] = x[fn].apply(x, args))
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



  class HashField extends ContainerField
    ###
        A HashField contains an arbitrary number of identical subfields in a hash
        (javascript object). When data is extracted from it using `toJSON`, or 
        `getClean`, the returned data is in an object where each value is the value 
        of the subfield at the corresponding key.

        A HashField's `schema` consists of a single field definition, such as
        `{ kind: "email" }`.

        This doesn't really seem to have a use case for a widget, just for arbitrary
        json validation. so no widget is provided
    ###
    widget: null
    setSchema: (schema, opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("setSchema", opts, schema)
      if not schema? or schema == @schema then return
      @schema = schema
      @resetFields()
      @setValue(@value)
      @value = if @value != null then undefined
    setValue: (val, opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("setValue", opts, val)
      if val == undefined then val = utils.clone(@default) || []
      if not val or not @schema or utils.isEqual(val, @getValue()) then return
      if val not instanceof Object or val instanceof Array then throw JSON.stringify(val) + " must be a hash"
      @resetFields()
      @value = val
      for key, value of val
        schema = utils.clone(@schema)
        schema.name = key
        @_addField(schema, value)
      @value = if @value != null then undefined
      @emit("onValueChanged", value: @getValue(), original: @value)
    validate: (value) ->
      if utils.isEmpty(value) && @required
        message = @errorMessages.required
        @errors = [utils.interpolate(message, [@schema.name || (typeof(@schema.field) == "string" && @schema.field.slice(0,-5)) || "item"])]
        return value
    addField: (key, value) ->
      ### add the field at key with value ###
      schema = utils.clone(@schema)
      schema.name = key
      @_addField(schema, value)
    removeField: (index) ->
      ### remove the field at `index`. ###
      @_getField(index).emit("onFieldDelete")
      value = @getValue()
      value.splice(index, 1)
      @setValue(value)
      @emit("onValueChanged", value: @getValue(), original: value, op: "remove")


  class ListField extends BaseContainerField
    ###
        A ListField contains an arbitrary number of identical subfields in a
        list. When data is extracted from it using `toJSON`, or `getClean`, the
        returned data is in a list where each value is the value of the subfield at
        the corresponding index.

        A ListField's `schema` consists of a single field definition, such as
        `{ kind: "email" }`.
    ###
    widget: "widgets.ListWidget",
    setSchema: (schema, opts) ->
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("setSchema", opts, schema)
      if not schema? or schema == @schema then return
      @schema = schema
      @resetFields()
      @setValue(@value)
      @value = if @value != null then undefined
    setValue: (val, opts) ->
      ###
      accepts an array, where each element in the array is the value for a subfield.
      if the optional value `reset` is truthy, then validation state will be reset.
      ###
      opts = @_procOpts(opts)
      if opts?.path?.length then return @_applyToSubfield("setValue", opts, val)
      if val == undefined then val = utils.clone(@default) || []
      if not val or not @schema or utils.isEqual(val, @getValue()) then return
      if val not instanceof Array then throw JSON.stringify(val) + " must be an array"
      @resetFields()
      @value = val
      for value in val
        @_addField(@schema, value)
      @value = if @value != null then undefined
      @emit("onValueChanged", value: @getValue(), original: @value)
    addField: (value, index) ->
      if index? and index != @_fields.length then return
      @_addField(@schema, value)
    removeField: (index) ->
      ### remove the field at `index`. ###
      @_getField(index).emit("onFieldDelete")
      value = @getValue()
      value.splice(index, 1)
      @setValue(value)
      @emit("onValueChanged", value: @getValue(), original: value, op: "remove")
    _getField: (index) ->
      ### get an immediate subfield by index ###
      return @getFields()[index]
    validate: (value) ->
      if not value.length && @required
        message = @errorMessages.required
        @errors = [utils.interpolate(message, [@schema.name || (typeof(@schema.field) == "string" && @schema.field.slice(0,-5)) || "item"])]
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
  fields.HashField = HashField
  fields.ListField = ListField


if window?
  addFields(window.fields)
else if exports?
  module.exports = addFields
