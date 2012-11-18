if exports?
  fields = require("../coffee/ContainerFields")
  utils = require("../coffee/utils")

describe "ListField", ->
  beforeEach ->
    @subSchema = {field: "CharField", name: "sub", minLength: 5}
    @vals = ["hello", "world"]
    @field = new fields.ListField(name:"test", schema: @subSchema, value: @vals)
  it "should store its schema in @schema", ->
    expect(@field.schema).toEqual(@subSchema)

  it "should create as many subfields as there are vals in the values array; subfield should have proper value and parent should be ListField", ->
    expect(@field.getFields().length).toBe(2)
    expect(@field.getFields()[0].getValue()).toEqual("hello")
    expect(@field.getFields()[1].getValue()).toEqual("world")
    expect(@field.getFields()[0].parent).toBe(@field)

  it "should generate path for subfield from index", ->
    expect(@field.getFields()[0].getPath()).toEqual([0])
    expect(@field.getFields()[1].getPath()).toEqual([1])

  it "should return getValue() as a list of subfield values", ->
    expect(@field.getValue()).toEqual(["hello", "world"])

  it "should set values (and emit valueChanged event if changed) when setValue called", ->
    @field.handlers.valueChanged = (inSender, inEvent) ->
    spyOn @field.handlers, "valueChanged"
    @field.setValue(@vals)
    @field.setValue(['the', 'quick', 'brown', 'fox'])
    expect(@field.getFields().length).toBe(4)
    # 4 subfields and one field valueChanged events from the second setValue call
    expect(@field.handlers.valueChanged.calls.length).toBe(5)
    
  it "should emit an error if setValue called with anything other than an Array of values", ->
    expect(=> @field.setValue('hello')).toThrow()
    expect(=> @field.setValue(a: 'hello')).toThrow()



describe "ContainerField", ->
  beforeEach ->
    @subSchema = [{field: "CharField", name: "sub", minLength: 5}, {field: "IntegerField", name: "sub2", minValue: 0}]
    @vals = {sub: "hello world", sub2: 5}
    @field = new fields.ContainerField(name:"test", schema: @subSchema, value: @vals)

  it "should immediately create subfields from schema with field as parent, and appropriate value", ->
    expect(@field.schema).toEqual(@subSchema)
    expect(@field.getFields()[0] instanceof fields.CharField).toBe(true)
    expect(@field.getFields()[1] instanceof fields.IntegerField).toBe(true)
    expect(@field.getFields()[0].getValue()).toEqual("hello world")
    expect(@field.getFields()[1].getValue()).toEqual(5)
    expect(@field.getFields()[0].parent).toBe(@field)

  it "should generate path for subfield from name", ->
    expect(@field.getFields()[0].getPath()).toEqual(["sub"])
    expect(@field.getFields()[1].getPath()).toEqual(["sub2"])

  it "should return getValue() as a hash of subfield values", ->
    expect(@field.getValue()).toEqual(sub:"hello world", sub2: 5)




describe "ListField Validation", ->
  beforeEach ->
    @subSchema = {field: "CharField", name: "sub", minLength: 5}
    @vals = ["hello", "worl"]
    @field = new fields.ListField(name:"test", schema: @subSchema, value: @vals)

  it "should not validate if a child is not valid", ->
    expect(@field.isValid()).toBe(false)

  it "should not call isValid automatically when a child emits validChanged before isValid manually called", ->
    spyOn(@field, "isValid").andCallThrough()
    @field.getFields()[0].setValue("hel")
    expect(@field.isValid).not.toHaveBeenCalled()
    @field.isValid()
    spyOn @field, "bubble"
    @field.getFields()[0].setValue("hello")
    console.log @field.bubble.calls
    expect(@field.isValid.calls.length).toBe(2)