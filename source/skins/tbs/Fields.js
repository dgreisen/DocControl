enyo.kind({
  name: "fields.tbs.Field",
  kind: "fields.Field",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.CharField",
  kind: "fields.CharField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.IntegerField",
  kind: "fields.IntegerField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.FloatField",
  kind: "fields.FloatField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.RegexField",
  kind: "fields.RegexField",
  widget: {kind: "widgets.Widget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.EmailField",
  kind: "fields.EmailField",
  widget: {kind: "widgets.EmailWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.BooleanField",
  kind: "fields.BooleanField",
  widget: {kind: "widgets.CheckboxWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.NullBooleanField",
  kind: "fields.NullBooleanField",
  widget: {kind: "widgets.CheckboxWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.ChoiceField",
  kind: "fields.ChoiceField",
  widget: {kind: "widgets.ChoiceWidget", skin: "tbsSkin" }
});

enyo.kind({
  name: "fields.tbs.ListField",
  kind: "fields.ListField",
  widget: {kind: "widgets.ListWidget", skin: "tbsSkin", itemKind: { kind: "widgets.tbs.ListItem" }, containerControlKind: { kind: "tbs.Button", ontap: "addField", content: "Add" } }
});

enyo.kind({
  name: "widgets.tbs.ListItem",
  kind: "widgets.ListItem",
  components: [
    { tag: "hr" },
    { kind: "tbs.Button", content: "Delete", ontap: "handleDelete", style: "float:right;"},
    { name: "_content", kind: "enyo.Control" }
  ]
});

enyo.kind({
  name: "widgets.tbs.ContainerWidget",
  kind: "widgets.ContainerWidget",
  published: {

  }
});

