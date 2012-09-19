// this will eventually be i18n support
// _ is already taken by underscore.js
_i = function (s) { return s; };


// string interpolation (thanks http://djangosnippets.org/snippets/2074/)
interpolate = function(s, args) {
  var i = 0;
  return s.replace(
    /%(?:\(([^)]+)\))?([%diouxXeEfFgGcrs])/g,
    function (match, v, t) {
      if (t == "%") return "%";
      return args[v || i++];
  });
};

ValidationError = function() {
  return {message: arguments[0], code: arguments[1], data: Array.prototype.slice.call(arguments, 2) };
};

includes = function(a, s) {
  return a.indexOf(s) > -1;
};

