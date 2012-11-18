if exports?
  fields = require("../coffee/ContainerFields")
  utils = require("../coffee/utils")

describe "events", ->
  beforeEach ->
    @parent = {
      bubble: (@event, @args) ->
    }
    @field = new fields.Field()
    @field.parent = @parent
    spyOn @parent, "bubble"

  it """
     should call bubble when emit is called; adding a 
     null sender and originator to the arguments
     """, ->
    spyOn @field, "bubble"
    @field.emit "testEvent", a:1, b:2
    expect(@field.bubble).toHaveBeenCalledWith("testEvent", null, originator: @field, a:1, b:2)

  it "should call event handler specific to event if it exists", ->

    @field.handlers =
      testEvent: (inSender, inEvent) ->
      "*": (inSender, inEvent) ->
    spyOn @field.handlers, "testEvent"
    spyOn @field.handlers, "*"
    @field.emit "testEvent", a:1, b: 2
    expect(@field.handlers.testEvent).toHaveBeenCalledWith(null, {originator: @field, a:1, b:2})
    expect(@field.handlers["*"]).not.toHaveBeenCalled()

  it "should call wildcard handler if exists and specific handler doesn't", ->
    @field.handlers = "*": (inSender, inEvent) ->
    spyOn @field.handlers, "*"
    @field.emit "testEvent", a:1, b:2
    expect(@field.handlers["*"]).toHaveBeenCalledWith(null, originator: @field, a:1, b:2)
    
  it "should call method identified by handler if handler is a string", ->
    @field.handler = (inSender, inEvent) ->
    @field.handlers = testEvent: "handler"
    spyOn @field, "handler"
    @field.emit "testEvent", a:1, b:2
    expect(@field.handler).toHaveBeenCalled()

  it "should stop bubbling event if handler returns true", ->
    @field.handlers = testEvent: (inSender, inEvent) ->
      return true
    @field.emit "testEvent", a:1, b:2
    expect(@parent.bubble).not.toHaveBeenCalled()

  it "should call any handlers and stop bubbling event if no parent", ->
    @field.parent = undefined
    @field.handlers = testEvent: (inSender, inEvent) ->
    spyOn @field.handlers, "testEvent"
    @field.emit "testEvent", a:1, b:2
    expect(@field.handlers.testEvent).toHaveBeenCalled()

  it "should bubble event if handler returns true, updating inSender to itself", ->
    @field.handlers = testEvent: (inSender, inEvent) ->
      return false
    @field.emit "testEvent", a:1, b:2
    expect(@parent.bubble).toHaveBeenCalledWith("testEvent", @field, originator: @field, a:1, b:2)

  it "should bubble event if no handler, updating inSender to itself", ->
    @field.handlers = testEvent: (inSender, inEvent) ->
      return false
    @field.emit "testEvent", a:1, b:2
    expect(@parent.bubble).toHaveBeenCalledWith("testEvent", @field, originator: @field, a:1, b:2)




describe "class inheritence", ->
  it "should preserve errorMessages of superclass when none are added", ->
    field = new fields.CharField()
    expect(field.errorMessages).toEqual(required: utils._i('This field is required.'))

  it "should add class error messages to superclass messages", ->
    field = new fields.IntegerField()
    expect(field.errorMessages).toEqual({required: utils._i('This field is required.'), invalid: utils._i('Enter a whole number.')})

  it "should properly update attributes defined by either superclass or class from passed options", ->
    field = new fields.CharField(required: false, minLength: 5)
    expect(field.required).toBe(false)
    expect(field.minLength).toBe(5)

  it "should override superclass error messages with subclass messages", ->
    field = new fields.ListField()
    expect(field.errorMessages).toEqual({required: utils._i('There must be at least one %s.'), invalid: utils._i('Please fix the errors indicated below.')})




describe "validation", ->
  beforeEach ->
    @field = new fields.Field(name:"test")

  it "defaults to required", ->
    @expect(@field.required).toBe(true)

  it "should not validate if required and no value", ->
    @expect(@field.value).toBe(undefined)
    @expect(@field.isValid()).toBe(false)
    @expect(@field.errors).toEqual(['This field is required.'])
    @field.setValue("")
    @expect(@field.isValid()).toBe(false)
    @field.setValue(null)
    @expect(@field.isValid()).toBe(false)

  it "should validate if required and value", ->
    @field.setValue(0)
    @expect(@field.value).toBe(0)
    @expect(@field.isValid()).toBe(true)
    @expect(@field.errors).toEqual([])
    
  it "should validate if not required and no value", ->
    @field.required = false
    @expect(@field.isValid()).toBe(true)

  it "should not perform revalidation if nothing has changed", ->
    @field.setValue(0)
    @field.isValid()
    spyOn @field, "validate"
    @field.setValue(0)
    @field.isValid()
    expect(@field.validate).not.toHaveBeenCalled()

  it "should perform revalidation if value has changed", ->
    @field.setValue(0)
    @field.isValid()
    spyOn @field, "validate"
    @field.setValue(1)
    @field.isValid()
    expect(@field.validate).toHaveBeenCalled()

  it "should perform revalidation if the required value has changed", ->
    @field.isValid()
    spyOn @field, "validate"
    @field.setRequired(false)
    @field.isValid()
    expect(@field.validate).toHaveBeenCalled()

  it "should emit a validChanged event, with any errors, when its valid status changes or when the errors list changes, but not otherwise", ->
    @field = new fields.CharField(name: "test", minLength:5)
    @field.handlers.validChanged = (inSender, inOriginator, valid, errors) ->
    spyOn @field.handlers, "validChanged"
    expect(@field.isValid()).toBe(false)
    expect(@field.handlers.validChanged).toHaveBeenCalledWith(null, originator: @field, valid: false, errors: ['This field is required.'])    
    @field.setValue("a")
    expect(@field.isValid()).toBe(false)
    expect(@field.handlers.validChanged).toHaveBeenCalledWith(null, originator: @field, valid: false, errors: ['Ensure this value has at least 5 characters (it has 1).'])
    @field.setValue("hello")
    expect(@field.isValid()).toBe(true)
    expect(@field.handlers.validChanged).toHaveBeenCalledWith(null, originator: @field, valid: true, errors: [])
    @field.setValue("hello world")
    expect(@field.isValid()).toBe(true)
    expect(@field.handlers.validChanged.calls.length).toEqual(3)




describe "genField() - field creation", ->
  it "should create a field from a schema", ->
    schema = {field: "CharField", name: "test", minLength: 5}
    field = utils.genField(schema, fields)
    expect(field instanceof fields.CharField).toBe(true)

describe "field", ->
  beforeEach ->
    @field = new fields.Field(name:"test", value: 5)
  it "should emit valueChanged only when its value changes", ->
    @field.handlers.valueChanged = (inSender, inEvent) ->
    spyOn @field.handlers, "valueChanged"
    @field.setValue(5)
    expect(@field.handlers.valueChanged).not.toHaveBeenCalled()
    @field.setValue(6)
    expect(@field.handlers.valueChanged).toHaveBeenCalledWith(null, originator: @field, value: 6, original: 5)
    @field.setValue()
  it "should emit valueChanged if it is created with a value", ->
    parent = bubble: ->
    spyOn parent, "bubble"
    @field = new fields.Field(name:"test", value: 5, parent: parent)
    @field.setValue(6)