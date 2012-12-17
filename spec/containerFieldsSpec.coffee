if exports?
  fields = require("../coffee/Fields")
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
    @field.listeners.onValueChanged = (inSender, inEvent) ->
    spyOn @field.listeners, "onValueChanged"
    @field.setValue(@vals)
    @field.setValue(['the', 'quick', 'brown', 'fox'])
    expect(@field.getFields().length).toBe(4)
    # 4 subfields and one field valueChanged events from the second setValue call
    expect(@field.listeners.onValueChanged.calls.length).toBe(5)
    
  it "should throw an error if setValue called with anything other than an Array of values", ->
    expect(=> @field.setValue('hello')).toThrow()
    expect(=> @field.setValue(a: 'hello')).toThrow()

  it "should be able to get immediate child by index", ->
    expect(@field._getField(0).getValue()).toBe("hello")

  it "should create a new child with the given value when addField is called", ->
    @field.addField("three");
    expect(@field.getValue()).toEqual(["hello", "world", "three"])

  it "should only create a new child with the given value when addField is called with an index that is exactly equal to the current number of fields", ->
    @field.addField("three", 1);
    expect(@field.getValue()).toEqual(["hello", "world"])
    @field.addField("three", 3);
    expect(@field.getValue()).toEqual(["hello", "world"])
    @field.addField("three", 2);
    expect(@field.getValue()).toEqual(["hello", "world", "three"])

  it "should getValue of listField when path is empty", ->
    expect(@field.getValue(path: "")).toEqual(@field.getValue())
    expect(@field.getValue(path: [])).toEqual(@field.getValue())

  it "should return the proper value when getValue() called, even when it hasn't finished creating all subfields", ->
    @field = new fields.ListField(name:"test", schema: @subSchema)
    @field.listeners.onFieldAdd = (inSender, inEvent) =>
      if inSender then expect(inEvent.originator.parent.getValue()).toEqual(@vals)
    @field.setValue(@vals)

  xit "should return an empty list if value passed is undefined; it should return null if value passed is null", ->
    @field = new fields.ListField(name:"test", schema: @subSchema)
    expect(@field.getValue()).toEqual([])
    @field = new fields.ListField(name:"test", schema: @subSchema, value: null)
    expect(@field.getValue()).toEqual(null)


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

  it "should be able to get immediate child by name", ->
    expect(@field._getField("sub").getValue()).toBe("hello world")

  it "should throw an error if setValue called with anything other than a hash of values", ->
    expect(=> @field.setValue('hello')).toThrow()
    expect(=> @field.setValue(['hello'])).toThrow()

  it "should getValue of Containerfield when path is empty", ->
    expect(@field.getValue(path: "")).toEqual(@field.getValue())
    expect(@field.getValue(path: [])).toEqual(@field.getValue())

  it "should call setValue(undefined) on each subfield when called with setValue(undefined)", ->
    expect(@field.getValue()).toEqual(sub: "hello world", sub2: 5)
    @field.setValue()
    expect(@field.getValue()).toEqual(sub: undefined, sub2: undefined)

describe "HashField", ->
  beforeEach ->
    @subSchema = {field: "CharField", name: "sub", minLength: 5}
    @vals = hello: "world", goodnight: "moon"
    @field = new fields.HashField(name:"test", schema: @subSchema, value: @vals)

  it "should store its schema in @schema", ->
    expect(@field.schema).toEqual(@subSchema)

  it "should create as many subfields as there are vals in the values object; subfield should have proper value and parent should be HashField", ->
    expect(@field.getFields()[0].getValue()).toEqual("world")
    expect(@field.getFields()[1].getValue()).toEqual("moon")    
    expect(@field.getFields()[0].parent).toBe(@field)

  it "should generate path for subfield from key", ->
    expect(@field.getFields()[0].getPath()).toEqual(["hello"])
    expect(@field.getFields()[1].getPath()).toEqual(["goodnight"])

  it "should return getValue() as a hash of subfield values", ->
    expect(@field.getValue()).toEqual({hello: "world", goodnight: "moon"})

  it "should set values (and emit valueChanged event if changed) when setValue called", ->
    @field.listeners.onValueChanged = (inSender, inEvent) ->
    spyOn @field.listeners, "onValueChanged"
    @field.setValue(@vals)
    vals2 = {the: "cat", in: "the hat"}
    @field.setValue(vals2)
    expect(@field.getFields().length).toBe(2)
    expect(@field.getValue()).toEqual(vals2)
    # 4 subfields and one field valueChanged events from the second setValue call
    expect(@field.listeners.onValueChanged.calls.length).toBe(3)

  it "should throw an error if setValue called with anything other than a hash of values", ->
    expect(=> @field.setValue('hello')).toThrow()
    expect(=> @field.setValue(['hello'])).toThrow()

  it "should be able to get immediate child by index", ->
    expect(@field._getField("hello").getValue()).toBe("world")

  it "should create a new child with the given value at the specified key when addField is called", ->
    @field.addField("four", "score");
    expect(@field.getValue()).toEqual(hello: "world", goodnight: "moon", four: "score")

  it "should return the proper value when getValue() called, even when it hasn't finished creating all subfields", ->
    @field = new fields.HashField(name:"test", schema: @subSchema)
    @field.listeners.onFieldAdd = (inSender, inEvent) =>
      if inSender then expect(inEvent.originator.parent.getValue()).toEqual(@vals)
    @field.setValue(@vals)

  xit "should return an empty list if value passed is undefined; it should return null if value passed is null", ->
    @field = new fields.HashField(name:"test", schema: @subSchema)
    expect(@field.getValue()).toEqual({})
    @field = new fields.HashField(name:"test", schema: @subSchema, value: null)
    expect(@field.getValue()).toEqual(null)


describe "ListField Validation", ->
  beforeEach ->
    @subSchema = {field: "CharField", name: "sub", minLength: 5}
    @vals = ["hello", "moon"]
    @field = new fields.ListField(name:"test", schema: @subSchema, value: @vals)

  it "should perform revalidation if subfield value has changed", ->
    @field.isValid()
    spyOn @field, "validate"
    @field.getFields()[1].setValue("world")
    @field.isValid()
    expect(@field.validate).toHaveBeenCalled()

  it "should perform revalidation if subfield required has changed", ->
    @field.setValue('world', {path:"1"})
    @field.isValid()
    spyOn @field, "validate"
    expect(@field.getFields()[1].required).toBe(true)
    @field.getFields()[1].setRequired(false)
    @field.isValid()
    expect(@field.validate).toHaveBeenCalled()

  it "should be valid only if children are valid", ->
    expect(@field.isValid()).toBe(false)
    @field.getFields()[1].setValue('world')
    expect(@field.isValid()).toBe(true)
    @field.getFields()[1].setValue('worl')
    expect(@field.isValid()).toBe(false)

  it "should validate every subfield", ->
    @field.setValue("hi", "0")
    @field.isValid()
    expect(@field.getField('0').errors.length).toBe(1)
    expect(@field.getField('1').errors.length).toBe(1)

describe "ContainerField Validation", ->
  beforeEach ->
    @subSchema = [{field: "CharField", name: "sub", minLength: 5}, {field: "IntegerField", name: "sub2", minValue: 0}]
    @vals = {sub: "hello world", sub2: -5}
    @field = new fields.ContainerField(name:"test", schema: @subSchema, value: @vals)

  it "should perform revalidation if value has changed", ->
    @field.isValid()
    spyOn @field, "validate"
    @field.getFields()[1].setValue(5)
    @field.isValid()
    expect(@field.validate).toHaveBeenCalled()

  it "should be valid only if children are valid", ->
    expect(@field.getFields()[1].isValid()).toBe(false)
    expect(@field.isValid()).toBe(false)
    @field.getFields()[1].setValue(5)
    expect(@field.isValid()).toBe(true)
    @field.getFields()[1].setValue(-5)
    expect(@field.isValid()).toBe(false)

describe "field traversal", ->
  beforeEach -> 
    @schema = [{
      field: "ListField",
      name: "firstList",
      schema: {
        field: "ContainerField",
        name: "secondContainer",
        schema: [{
          field: "ListField",
          name: "secondList",
          schema: {
            field: "CharField",
            name: "text",
            minLength: 5
          }
        }]
      }
    }]
    @vals = {firstList: [{secondList:["hello", "moon"]}]}
    @field = new fields.ContainerField(name:"firstContainer", schema: @schema, value: @vals)

  it "should recursively input values and create subfield", ->
    expect(@field.getValue()).toEqual({ firstList : [ { secondList : [ 'hello', 'moon' ] } ] })

  it "should return itself if no path given, or path is null/undefined", ->
    expect(@field.getField()).toBe(@field)
    expect(@field.getField("")).toBe(@field)

  it "should return a subfield given a string path", ->
    expect(@field.getField("firstList.0.secondList.1").getValue()).toBe("moon")

  it "should return a subfield given an array path", ->
    expect(@field.getField(["firstList", 0, "secondList", 1]).getValue()).toBe("moon")

  it "should return undefined if getField is passed an invalid path", ->
    expect(@field.getField("noField")).toBe(undefined)
    expect(@field.getField("firstList.22")).toBe(undefined)

  it "should get isValid for specific field if passed opts.path", ->
    expect(@field.isValid(path: "firstList.0.secondList.1")).toBe(false)

  it "should setValue of specific field, and getValue and json for specific field if passed opts.path", ->
    @field.setValue("world", path: "firstList.0.secondList.1")
    expect(@field.getValue(path: "firstList.0.secondList")).toEqual(["hello", "world"])
    expect(@field.toJSON(path: "firstList.0.secondList")).toEqual(["hello", "world"])
    expect(@field.getClean(path: "firstList.0.secondList")).toEqual(["hello", "world"])

  it "should get errors for specific field if passed opts.path", ->
    expect(@field.getErrors(path: "firstList.0.secondList.1")).toEqual(['Ensure this value has at least 5 characters (it has 4).'])

  it "should convert opts arguments that are strings to an opts object with a path equal to the string", ->
    @field.setValue("world", "firstList.0.secondList.1")
    expect(@field.getValue("firstList.0.secondList")).toEqual(["hello", "world"])

  it "should convert opts arguments that are an array to an opts object with a path equal to the array", ->
    @field.setValue("world", ["firstList",0,"secondList",1])
    expect(@field.getValue(["firstList",0,"secondList"])).toEqual(["hello", "world"])