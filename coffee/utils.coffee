###
These function are used throughout the library. Many provide cross-platform (server and browser)
support for frequently-used functions.
###

if exports?
  _ = require "underscore"

# this will eventually be i18n support
# _ is already taken by underscore.js
_i = (s) -> return s


interpolate = (s, args) ->
  ###
  simple string interpolation (thanks http:#djangosnippets.org/snippets/2074/)
  interpolate("%s %s", ["hello", "world"]) returns "hello world"
  ###
  i = 0
  return s.replace(
    /%(?:\(([^)]+)\))?([%diouxXeEfFgGcrs])/g,
    (match, v, t) ->
      if (t == "%") then return "%"
      return args[v || i++]
  )

ValidationError = (message, code, args...) ->
  ###
  raised by fields during validation
   * `message`:  the default error message to display
   * `code`: the code used to look up an overriding message in the `errorMessages` hash
   * `args...`: arguments used for interpolation with the error message.
  ###
  return {message: message, code: code, data: args }

includes = (a, s) ->
  return a.indexOf(s) > -1

isEmpty = (obj) ->
  for i of obj
    return false
  return true

isEqual = (v1, v2) ->
  ### a very naive comparison of two objects - will only work with the equivalent of json ###
  if v1 instanceof Array
    if v2 not instanceof Array or v1.length != v2.length then return false
    for item, i in v1
      if not isEqual(item, v2[i]) then return false
  else if v1 instanceof Object
    if v2 not instanceof Object then return false
    for item of v1
      if not isEqual(v1[item], v2[item]) then return false
    for item of v2
      if v2[item] != undefined and v1[item] == undefined then return false
  else if v1 != v2
    return false
  return true


strip = (str) ->
  ### remove leading and trailing white space ###
  return String(str).replace(/^\s*|\s*$/g, '')

utils = 
  _i: _i
  interpolate: interpolate
  ValidationError: ValidationError
  includes: includes
  isEmpty: isEmpty
  isEqual: isEqual
  strip: strip
  forEach: if enyo? then enyo.forEach else _.forEach
  map: if enyo? then enyo.map else _.map
  cloneArray: if enyo? then enyo.cloneArray else _.clone
  mixin: if enyo? then enyo.mixin else _.extend
  clone: if enyo? then enyo.clone else _.clone

if window?
  window.utils = utils
else if exports?
  module.exports = utils