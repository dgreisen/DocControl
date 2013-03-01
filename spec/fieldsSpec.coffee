if exports?
  utils = require("../coffee/utils")
  fields = require("../coffee/Fields")

describe "events", ->
  beforeEach ->
    @parent = {
      _bubble: (@event, @args) ->
    }
    @field = new fields.Field()
    @field.parent = @parent
    spyOn @parent, "_bubble"

  it """
     should call _bubble when emit is called; adding a 
     null sender and originator to the arguments
     """, ->
    spyOn @field, "_bubble"
    @field.emit "onTestEvent", a:1, b:2
    expect(@field._bubble).toHaveBeenCalledWith("onTestEvent", null, originator: @field, a:1, b:2)

  it "should call event handler specific to event if it exists", ->
    @field.listeners =
      onTestEvent: (inSender, inEvent) ->
      "*": (inSender, inEvent) ->
    spyOn @field.listeners, "onTestEvent"
    spyOn @field.listeners, "*"
    @field.emit "onTestEvent", a:1, b: 2
    expect(@field.listeners.onTestEvent).toHaveBeenCalledWith(null, {originator: @field, a:1, b:2})
    expect(@field.listeners["*"]).not.toHaveBeenCalled()

  it "should call wildcard handler if exists and specific handler doesn't", ->
    @field.listeners = "*": (inSender, inEvent) ->
    spyOn @field.listeners, "*"
    @field.emit "onTestEvent", a:1, b:2
    expect(@field.listeners["*"]).toHaveBeenCalledWith(null, originator: @field, a:1, b:2)
    
  it "should call method identified by handler if handler is a string", ->
    @field.handler = (inSender, inEvent) ->
    @field.listeners = onTestEvent: "handler"
    spyOn @field, "handler"
    @field.emit "onTestEvent", a:1, b:2
    expect(@field.handler).toHaveBeenCalled()

  it "should stop bubbling event if handler returns true", ->
    @field.listeners = onTestEvent: (inSender, inEvent) ->
      return true
    @field.emit "onTestEvent", a:1, b:2
    expect(@parent._bubble).not.toHaveBeenCalled()

  it "should call any listeners and stop bubbling event if no parent", ->
    @field.parent = undefined
    @field.listeners = onTestEvent: (inSender, inEvent) ->
    spyOn @field.listeners, "onTestEvent"
    @field.emit "onTestEvent", a:1, b:2
    expect(@field.listeners.onTestEvent).toHaveBeenCalled()

  it "should _bubble event if handler returns true, updating inSender to itself", ->
    @field.listeners = onTestEvent: (inSender, inEvent) ->
      return false
    @field.emit "onTestEvent", a:1, b:2
    expect(@parent._bubble).toHaveBeenCalledWith("onTestEvent", @field, originator: @field, a:1, b:2)

  it "should _bubble event if no handler, updating inSender to itself", ->
    @field.listeners = onTestEvent: (inSender, inEvent) ->
      return false
    @field.emit "onTestEvent", a:1, b:2
    expect(@parent._bubble).toHaveBeenCalledWith("onTestEvent", @field, originator: @field, a:1, b:2)

  it "should call any handler defined on each superclass, oldest superclass first", ->
    out = []
    class subcls extends fields.Field
      listeners: onTestEvent: "onTestEvent"
      onTestEvent: () ->  out.push(0)

    class subcls2 extends subcls
      listeners: 
        onTestEvent: () -> out.push(1)
        "*": () -> out.push("error")

    class subcls3 extends subcls2
      listeners: 
        "*": () -> out.push(2)

    field = new subcls3()
    out = []
    field.emit "onTestEvent"
    expect(out).toEqual([0,1,2])

    out = []
    field.listeners = 
      onTestEvent: () -> 
        out.push(3)
    field.emit "onTestEvent"
    expect(out).toEqual([0,1,2,3])

  it "should let its listeners be updated through the schema", ->
    schema = 
      listeners: onTestEvent: "onTestEvent"
    field = new fields.Field(schema)
    expect(field.listeners.onTestEvent).toEqual("onTestEvent")


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

  it "should emit a onValidChanged event, with any errors, when its valid status changes or when the errors list changes, but not otherwise", ->
    @field = new fields.CharField(name: "test", minLength:5)
    @field.listeners.onValidChanged = (inSender, inEvent) ->
    spyOn @field.listeners, "onValidChanged"
    expect(@field.isValid()).toBe(false)
    expect(@field.listeners.onValidChanged).toHaveBeenCalledWith(null, originator: @field, valid: false, errors: ['This field is required.'])    
    @field.setValue("a")
    expect(@field.isValid()).toBe(false)
    expect(@field.listeners.onValidChanged).toHaveBeenCalledWith(null, originator: @field, valid: false, errors: ['Ensure this value has at least 5 characters (it has 1).'])
    @field.setValue("hello")
    expect(@field.isValid()).toBe(true)
    expect(@field.listeners.onValidChanged).toHaveBeenCalledWith(null, originator: @field, valid: true, errors: [])
    @field.setValue("hello world")
    expect(@field.isValid()).toBe(true)
    expect(@field.listeners.onValidChanged.calls.length).toEqual(3)

  it "should emit an onRequiredChanged event when required has changed", ->
    @field.listeners.onRequiredChanged = (inSender, inEvent) ->
    spyOn @field.listeners, "onRequiredChanged"
    expect(@field.required).toBe(true)
    @field.setRequired(false)
    expect(@field.listeners.onRequiredChanged).toHaveBeenCalled()

  it "should throw an error when getClean is called and it is not valid", ->
    expect(=> @field.getClean()).toThrow()


describe "genField() - field creation", ->
  it "should create a field from a schema", ->
    schema = {field: "CharField", name: "test", minLength: 5}
    field = fields.genField(schema, undefined, undefined)
    expect(field instanceof fields.CharField).toBe(true)

describe "field", ->
  beforeEach ->
    @field = new fields.IntegerField(name:"test", value: 5, minValue: 0)

  it "should emit onFieldAdd with value, then onValueChanged when created", ->
    parent = 
      _bubble: () ->
    spyOn parent, "_bubble"
    @field = new fields.IntegerField(name:"test", value: 5, minValue: 0, parent: parent)
    expect(parent._bubble.calls[0].args[0]).toBe("onFieldAdd")
    expect(parent._bubble.calls[0].args[2].value).toBe(5)
    expect(parent._bubble.calls[1].args[0]).toBe("onValueChanged")

  it "should emit onValueChanged only when its value changes", ->
    @field.listeners.onValueChanged = (inSender, inEvent) ->
    spyOn @field.listeners, "onValueChanged"
    @field.setValue(5)
    expect(@field.listeners.onValueChanged).not.toHaveBeenCalled()
    @field.setValue(6)
    expect(@field.listeners.onValueChanged).toHaveBeenCalledWith(null, originator: @field, value: 6, original: 5)
    @field.setValue()

  it "should emit onValueChanged if it is created with a value", ->
    parent = _bubble: ->
    spyOn parent, "_bubble"
    @field = new fields.Field(name:"test", value: 5, parent: parent)
    @field.setValue(6)

  it "should return list of all errors", ->
    @field.setValue(-4)
    expect(@field.getErrors()).toEqual(['Ensure this value is greater than or equal to 0.'])

  it "should allow passing in error messages through the schema", ->
    field = new fields.IntegerField(name:"test", errorMessages: {invalid: "Invalid"}, minValue: 0)
    expect(field.errorMessages).toEqual(required: 'This field is required.', invalid: "Invalid")

  it "should, on creation, put passed initial and/or value in @initial and @value", ->
    expect(@field.initial).toBe(5)
    expect(@field.value).toBe(5)
    @field = new fields.IntegerField(name:"test", initial: 5, minValue: 0)
    expect(@field.initial).toBe(5)
    expect(@field.value).toBe(5)
    @field = new fields.IntegerField(name:"test", value: 10, initial: 5, minValue: 0)
    expect(@field.initial).toBe(5)
    expect(@field.value).toBe(10)
    
