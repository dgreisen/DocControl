describe "widgets.Form", ->
  beforeEach ->
    @schema = {
      name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    }
    @listSchema = {
      name: "list",
      field: "ListField",
      schema: @schema
    }
    @val = "hello world"
    @listVal = ["hello", "world"]
    @listVal2 = ["goodnight", "moon"]
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
    @form = new widgets.Form(schema: @schema, value: @val)
    expect(@form.getValue()).toBe("hello world")
    expect(@form.widgets.getValue()).toBe("hello world")

  it "should pass field errors to widget", ->
    @form.isValid()
    expect(@form.widgets.getErrors()).toEqual(['This field is required.'])

  it "should listen for required changes and send to the widgets; also validate if indicated by validationStrategy", ->
    spyOn(@form, "onFieldRequiredChanged").andCallThrough()
    spyOn @form, "_validate"
    @form.getField('').setRequired(false)
    expect(@form.onFieldRequiredChanged).toHaveBeenCalled()
    expect(@form._validate).toHaveBeenCalled()
    
  it "shouldn't auto-validate until manually validated once with defaultValidation", ->
    expect(@form.fields.errors).toEqual([])
    @form.isValid()
    expect(@form.fields.errors).toEqual(['This field is required.'])
    @form.setValue("hello world")
    expect(@form.fields.errors).toEqual([])

  it "should always auto-validate with alwaysValidation", ->
    @form = new widgets.Form(schema: @schema, validationStrategy: "always", value: "")
    expect(@form.fields.errors).toEqual(['This field is required.'])
    @form.setValue("hello world")
    expect(@form.fields.errors).toEqual([])

  it "should handle list field creation and modification properly", ->
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    expect(@form.getValue()).toEqual(@listVal)
    expect(@form.getWidget("1").getValue()).toEqual("world")
    listVal2 = ["four", "items", "in", "list"]
    @form.setValue(listVal2)
    expect(@form.getValue()).toEqual(listVal2)
    expect(@form.getWidget("2").getValue()).toEqual("in")

  it "should handle list item addition by widget", ->
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    expect(@form.getValue()).toEqual(@listVal)
    @form.getWidget("").handleAdd()
    expect(@form.getWidget("")._widgets.length).toBe(3)

  it "should handle list item addition by field", ->
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    expect(@form.getValue()).toEqual(@listVal)
    @form.getField("").addField("new widget")
    expect(@form.fields.getFields().length).toBe(3)
    expect(@form.getWidget("2").getValue()).toBe("new widget")

  it "should handle list item deletion", ->
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    @form.setValue(["the", "quick", "brown", "fox"])
    @form.getWidget().$.widgets.children[1].handleDelete()
    expect(@form.getValue()).toEqual(["the", "brown", "fox"])
    expect(@form.getWidget("2").getValue()).toEqual("fox")

  it "should properly reset the schema when setSchema called with new schema", ->
    @form.setSchema(@listSchema)
    expect(@form._fields.length).toBe(1)
    expect(@form._fields[0] instanceof fields.ListField).toBe(true)
    expect(@form._widgets.length).toBe(1)
    expect(@form._widgets[0] instanceof widgets.ListWidget).toBe(true)

  it "should completely reset the fields and widgets if setValue called with forceReset==true and no path", ->
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    spyOn(@form, "onFieldAdded").andCallThrough()
    @form.setValue(@listVal2, forceReset: true)
    expect(@form.onFieldAdded).toHaveBeenCalled()
    expect(@form.getValue()).toEqual(@listVal2)

  it "shouldn't create a widget if widget=null", ->
    @schema.widget = null
    @form = new widgets.Form(schema: @schema, value: @val)
    expect(@form.widgets).toBeUndefined();
    
  it "shouldn't create a widget if the parent widget doesn't exist", ->
    @listSchema.widget = null
    @form = new widgets.Form(schema: @listSchema, value: @listVal)
    # expect(@form.widgets).not.toBeDefined()