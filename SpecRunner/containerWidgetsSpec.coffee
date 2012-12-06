describe "widgets.ContainerWidget", ->
  beforeEach ->
    @subschema = {field: "CharField", name: "sub1", value: "hello", minLength: 5}
    @subschema2 = {field: "CharField", name: "sub2", minLength: 5}
    @vals = { sub1: "hello", sub2: "moon" }
    @schema = {
      field: "ContainerField",
      name: "container",
      value: @vals
    }
    _genWidgetDef = widgets.Form.prototype._genWidgetDef
    @widget = new widgets.ContainerWidget(_genWidgetDef(@schema))
    # @form = new widgets.Form(schema: @schema)

  it "should create child widget, add to _widgets, and set value and parentWidget, when addWidget", ->
    @widget.addWidget(@subschema)
    expect(@widget._widgets.length).toBe(1)
    expect(@widget._widgets[0].parentWidget).toBe(@widget)

describe "widgets.ListWidget", ->
  beforeEach ->
    @subschema = {field: "CharField", minLength: 5}
    @vals = ["hello", "moon"]
    @schema = {
      field: "ListField",
      name: "container",
      schema: @subschema,
      value: @vals
    }

    _genWidgetDef = widgets.Form.prototype._genWidgetDef
    @widget = new widgets.ListWidget(_genWidgetDef(@schema))

  it "should create child widgets, add to _widgets, and set value and parentWidget when addWidget called", ->
    @subschema.value = @vals[0]
    @widget.addWidget(@subschema)
    @subschema.value = @vals[1]
    @widget.addWidget(@subschema)
    expect(@widget._widgets.length).toBe(2)
    expect(@widget._widgets[0].parentWidget).toBe(@widget)
    expect(@widget._widgets[0].value).toBe("hello")


  it "shouldn't create subwidget when the subwidget is null", ->
    @schema.widget = null
    _genWidgetDef = widgets.Form.prototype._genWidgetDef
    @widget = new widgets.ListWidget(_genWidgetDef(@schema))


describe "widget traversal", ->
  beforeEach -> 
    @vals = {firstList: [{secondList:["hello", "moon"]}]}
    @schema = {
      field: "ContainerField"
      name: "firstContainer"
      value: @vals
      schema: [
        field: "ListField"
        name: "firstList"
        schema: {
          field: "ContainerField"
          name: "secondContainer"
          schema: [
            field: "ListField"
            name: "secondList"
            schema: {
              field: "CharField"
              name: "text"
              minLength: 5
            }
          ]
        }
      ]
    }
    @form = new widgets.Form(schema: @schema)
    @widget = @form.widgets

  it "should create nested fields from nested schema", ->
    expect(@widget.getValue()).toEqual(@vals)

  it "should be able to get any widget by path; path can only be an array b/c it should only be called by widgets.Form that converts strings to arrays.", ->
    expect(@widget.getWidget([]).fieldName).toBe("firstContainer")
    expect(@widget.getWidget(["firstList", 0, "secondList", 1]).getValue()).toBe("moon")

  it "should return path of any widget", ->
    expect(@widget.getPath()).toEqual([])
    path = ["firstList", 0, "secondList", 1]
    expect(@widget.getWidget(path).getPath()).toEqual(path)