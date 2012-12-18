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

  it "should return undefined if no widget should be created", ->
    @schema.widget = null
    kind = _genWidgetDef(@schema)
    expect(kind).toEqual(undefined)

describe "widgets", ->
  beforeEach ->
    @schema = { 
      name: "name",
      field: "CharField",
      maxLength: 40,
      widget: { label: "Name" }
    }
    _genWidgetDef = widgets.Form.prototype._genWidgetDef
    @widget = new widgets.Widget(_genWidgetDef(@schema))

  it "should set its value in the input", ->
    @widget.setValue("hello world")
    expect(@widget.$.input.getValue()).toBe("hello world")

  it "should set input value to this.nullValue if null or undefined", ->
    @widget.setValue(null)
    expect(@widget.$.input.getValue()).toBe("")

  it "should not reset its value when render is called", ->
    @widget.setValue("hello world")
    @widget.render()
    expect(@widget.getValue()).toBe("hello world")


describe "widgets.ChoiceWidget", ->
  beforeEach ->
    @schema = {
      name: "label",
      field: "ChoiceField",
      choices: [['h', 'Home'], ['w', 'Work'], ['m', 'Mobile']],
      widget: { label: "Label", compact: true, noLabel: true, size:1 },
      inputClasses:"input-medium"
    }
    _genWidgetDef = widgets.Form.prototype._genWidgetDef
    @widget = new widgets.Widget(_genWidgetDef(@schema))

  it "should set its value in the input", ->
    @widget.setValue("w")
    expect(@widget.$.input.getValue()).toBe("w")

  it "should update its value when input changes", ->
    @widget.$.input.setValue('w')
    expect(@widget.$.input.getValue()).toBe("w")