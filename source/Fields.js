// string interpolation (thanks http://djangosnippets.org/snippets/2074/)
interpolate = function(s, args) {
  i = 0;
  return s.replace(
    /%(?:\(([^)]+)\))?([%diouxXeEfFgGcrs])/g,
    function (match, v, t) {
      if (t == "%") return "%";
      return args[v || i++];
  });
};

ValidationError = function() {
  return {message: arguments[0], code: arguments[1], data: arguments.slice(2) };
};


enyo.kind({
  name: "Field",
  kind: "Control",
  published: {
    //* the current value of the field; this should be used for setting ui elements.
    value: undefined,
    //* the cleaned value; raises error if invalid; this will be a javascript datatype and should be used for any calculations, etc. You should use the toJSON() method to get a version appropriate for serialization.
    clean: undefined,
    //* list of validators
    validators: []
  },
  toJavascript: function() {
    this.clean = this.value;
  },
  validate: function() {
    return;
  },
  runValidators: function() {
    var i;
    value = this.clean;
    if (validators.EMPTY_VALUES.indexOf(value) > -1) return;
    for (i = 0; i < this.validators.length; i++) {
      v = this.validators[i];
      try {
        v(value);
      }
      catch(e) {
        if (e.code && this.error_messages.indexOf(e.code) > -1) {
          message = this.error_messages[e.code];
          if (e.params) interpolate(message, e.params);
          this.errors.push(message);
        } else {
          errors.extend(e.messages);
        }
      }
    }
  },

  getClean: function() {
    // reset the errors array
    this.errors = [];
    // call the various validators
    this.toJavascript();
    this.validate();
    this.runValidators();
    // if there are errors, raise validation error with first error, otherwise, return clean
    if (this.errors) {
      throw this.errors;
    } else {
      return this.clean;
    }

  },
  toJSON: function() {
    return this.getClean();
  }
});