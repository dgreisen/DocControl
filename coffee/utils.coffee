if exports?
  _ = require "underscore"

# this will eventually be i18n support
# _ is already taken by underscore.js
_i = (s) -> return s


# string interpolation (thanks http:#djangosnippets.org/snippets/2074/)
interpolate = (s, args) ->
  i = 0
  return s.replace(
    /%(?:\(([^)]+)\))?([%diouxXeEfFgGcrs])/g,
    (match, v, t) ->
      if (t == "%") then return "%"
      return args[v || i++]
  )

ValidationError = (message, code, args...) ->
  return {message: message, code: code, data: args }

includes = (a, s) ->
  return a.indexOf(s) > -1

isEmpty = (obj) ->
  for i of obj
    return false
  return true

# a very naive comparison of two objects - will only work with the equivalent of json
isEqual = (v1, v2) ->
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
  return String(str).replace(/^\s*|\s*$/g, '')

# generate a field from its schema
genField = (schema, fields) ->  
  return new fields[schema.field](schema)

utils = 
  _i: _i
  interpolate: interpolate
  ValidationError: ValidationError
  includes: includes
  isEmpty: isEmpty
  isEqual: isEqual
  strip: strip
  genField: genField
  forEach: if enyo? then enyo.forEach else _.forEach
  map: if enyo? then enyo.map else _.map
  cloneArray: if enyo? then enyo.cloneArray else _.clone
  mixin: if enyo? then enyo.mixin else _.extend
  clone: if enyo? then enyo.clone else _.clone

if window?
  window.utils = utils
else if exports?
  module.exports = utils