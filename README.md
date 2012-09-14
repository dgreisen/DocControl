DocControl
==========

DocControl is a controller framework for Enyo. It is heavily 
influenced by Django Forms, but is designed for a hierarchical 
document data structure rather than a flat database row. 

Basic Structure
---------------
Three object types work together to validate your data. A `Field`
represents the data and performs validation. A `Widget` displays the
data by creating enyo components. Finally, a `Field` will use one or
more `validators`, small reusable snippets of code, to perform the 
actual validation.

Fields can contain other fields, which allows for the validation
of highly nested data. It is possible to, create a
single DocControl to validate, for example, an entire contact document
including an arbitrary number of tagged emails, phone numbers, and 
other data.

There are currently two types of fields that can contain subfields:
`ContainerField` and `ListField`. A `ContainerField`'s schema defines
multiple heterogeneous fields, and so is useful for defining a 
document. A `ListField`'s schema takes a single field (which could be
a `ContainerField`). It is used for creating an arbitrary-length array 
of identical fields.

Basic Usage
-----------
The following will create a simple user field:

    enyo.kind({ name:"UserField", kind: "ContainerField", schema: [
        { name: "username", 
          kind: "CharField", 
          maxLength: 10, 
          minLength: 5, 
          widgetAttrs: { 
            label: "Username", 
            helpText: "CharField between 5 and 10 characters long", 
            initial: "John Doe" } },
        { name: "email", 
          kind: "EmailField", 
          widgetAttrs: { label: "Email", } }
        { name: "age", 
          kind: "IntegerField", 
          maxValue: 116, 
          minValue: 13, 
          widgetAttrs: { 
            label: "Age", 
            helpText: "Integer between 13 and 116" } } ],
      widgetAttrs: { 
        label: "Users", 
        helpText: "Add as many users as you like" }
    })

In the default configuration, validation will not occur until you call
the `UserField`'s `getClean`, `toJSON`, or `isValid`. Once one of 
these functions has been called once, validation will run very time data 
changes. `getClean` returns the `field`'s data in native javascript 
formats. `toJSON` returns the data in a format suitable for serializing. 
`isValid` returns `true` or `false`. `setValue` to set a `field`'s value.

Installation
------------
First, download or clone DocControl from github 
(https://github.com/dgreisen/DocControl). You can immediately run the
sample application by visiting `sample.html` in a browser. To include 
in your project, copy or link the `source` directory into project's lib directory and add a reference to it in your project's `package.js` file.

Development
-----------
Currently, validators are written in coffeescript. If you wish to 
modify the existing validators or add more to that file, you will need
coffeescript. You can easily compile the coffeescript by running:

    coffee -w -o ./source/ ./coffee/

in DocControl's root directory.

TODO
----
1. I would like to remove the coffeescript dependencies for two reasons:

  a. validators are directly ported from Django, complicating the license
  b. it is silly to require coffeescript to compile one file
