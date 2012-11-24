describe "widgets.Form", ->
  beforeEach ->
    @schema = {
      name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    }
    @val = "hello world"
    @form = new widgets.Form(schema: @schema)

  it "should create a widget and a field given a schema", ->
    expect(@form.fields instanceof fields.Field).toBe(true)
    expect(@form.widgets instanceof widgets.Widget).toBe(true)

  it "should set widget and field parentWidget/parent to the form", ->
    expect(@form.fields.parent).toBe(@form)
    expect(@form.widgets.parentWidget).toBe(@form)

  it "should be able to get a field by path", ->
    expect(@form.getField('').name).toEqual("name")

  it "should be able to get a widget by path", ->
    expect(@form.getWidget('').fieldName).toEqual("name")

  it "should be able to set the field value", ->
    @form.setValue("hello world")
    @expect(@form.getValue()).toEqual("hello world")

  it "should listen for value changes to the fields and send to the widgets.", ->
    spyOn(@form, "onFieldValueChanged").andCallThrough()
    @form.setValue('hello world')
    expect(@form.onFieldValueChanged).toHaveBeenCalled()

  it "should set value of both widget and field when initial value provided", ->
    schema = enyo.clone(@schema)
    console.log(schema)
    @form = new widgets.Form(schema: @schema, value: @val)
    console.log 1
    expect(@form.getValue()).toBe("hello world")
#    expect(@form.widgets.getValue()).toBe("hello world")