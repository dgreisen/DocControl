enyo.kind({
  name: "App",
  classes: "enyo-fit",
  kind: "Scroller",
  components: [
    { name: "userMessage", tag: "h3", style: "color:red;"},
    { name:"userForm", kind: "ListField", fields: [
      { name: "username", kind: "CharField", maxLength: 10, minLength: 5, widgetAttrs: { label: "Username", helpText: "CharField between 5 and 10 characters long", initial: "John Doe" } },
      { name: "age", kind: "IntegerField", maxValue: 116, minValue: 13, widgetAttrs: { label: "Age", helpText: "Integer between 13 and 116" } }
      ],
      widgetAttrs: { label: "Users", helpText: "Add as many users as you like" }

    },
    { kind: "onyx.Button", ontap: "onUserTap", content: "Submit"},
    { name: "loginMessage", tag: "h3", style: "color:red;"},
    { name:"loginForm", kind: "ListField", fields: [
      { name: "email", kind: "EmailField", widgetAttrs: { label: "Email" }},
      { name: "password", kind: "CharField", minLength: 8, widget: { kind: "PasswordWidget" }, widgetAttrs: { label: "Password" }}
    ]},
    { kind: "onyx.Button", ontap: "onLoginTap", content: "Submit"}
  ],
  onLoginTap: function() {
    if (this.$.loginForm.isValid())
      { this.$.loginMessage.setContent('Successfull Login Submission'); }
    else
      { this.$.loginMessage.setContent('No Login Submission - invalid form'); }
  },
  onUserTap: function() {
    if (this.$.userForm.isValid())
      { this.$.userMessage.setContent('Successfull User Submission'); }
    else
      { this.$.userMessage.setContent('No User Submission - invalid form'); }
  }
});
