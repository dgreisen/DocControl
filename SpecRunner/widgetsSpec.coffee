describe "genWidgetDef", ->
  beforeEach ->
    @schema = { 
      name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    }
    @output = {
      kind: 'widgets.Widget',
      fieldName: 'name',
      field: 'CharField',
      maxLength: 40,
      label: 'Name'
    }

  it "should create a widget kind definition from a schema", ->
    kind = _genWidgetDef(@schema)
    expect(kind).toEqual(@output)

  it "should override the defualt field widget when the widget kind is defined", ->
    @schema.widget.kind = "widgets.PasswordWidget"
    @output.kind = "widgets.PasswordWidget"
    kind = _genWidgetDef(@schema)
    expect(kind).toEqual(@output)

describe "widgets.Form", ->
  beforeEach ->
    @schema = { 
      name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    }
    @form = new widgets.Form(schema: @schema)

  it "should create a widget and a field given a schema", ->
    expect(@form.fields instanceof fields.Field).toBe(true)
    expect(@form.widgets instanceof widgets.Widget).toBe(true)