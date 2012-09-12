enyo.kind({
  name: "App",
  components: [
    { kind: "CharField", label: "Username", name: "username", helpText: "CharField between 5 and 10 characters long", initial: "John Doe", maxLength: 10, minLength: 5 },
    { kind: "IntegerField", label: "Age", name: "age", helpText: "Integer between 13 and 116", maxValue: 116, minValue: 13 }
  ]
});
