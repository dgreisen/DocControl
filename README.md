DocControl
==========

DocControl is a controller framework for Enyo. It allows you to quickly and easily
create forms that validate complex documents and get that data in a format that can
be manipulated on the front-end or serialized and sent to a back-end. DocControl is
well suited to validating both flat data that is destined for a table in a RDBMS, or
for nested data that is destined for a document database such as CouchDB or Mongo.

Much of DocControl is a port to javascript of 
[Django Forms](https://docs.djangoproject.com/en/1.4/topics/forms/), and these docs 
borrow heavily from the Django docs. The ported Django code has been extended to 
allow you to create nested forms that can validate and produce almost any json
object you desire.

Sample Application
------------------
A sample application is [hosted here](http://dgreisen.github.com/DocControl/sample.html) 
and is available in the repository by opening `sample.html` in a browser.

API
---
The api is [hosted here](http://dgreisen.github.com/DocControl/api/index.html) and 
is available in the repository by opening `api/index.html` in a browser. To 
work properly, you must serve the `api`  directory from your favorite web server. The 
easiest way is to create a symlink in your `www` directory to the `api` directory.

What it Does
------------

DocControl performs several common front-end controller tasks.

1. display a form with automatically generated widgets
2. Check inputted data against a set of validation rules.
3. Display error messages until the form conforms to the validation rules
4. Convert the form data to the relevant javascript data types
5. Convert the form data to an easily serializable format for storage or transmission to a server

Overview
--------
The library deals with these concepts:

###Widget
A kind that knows how to render a field, and get and set the value from/to that field. 
It also ensures validation occurs when the value of the field changes, in accordance 
with the validationStrategy 

###Field
A class that is responsible for doing validation, e.g. an EmailField that makes sure 
its data is a valid email address, as well as serialization.

###Collection
A special type of field that can contain other fields or collections. When validated, it ensures all
subfields are validated, when its value is retreived the value of all subfields are 
retreived.

###Validator
A small snippet of reusable code that is used by field to perform most of the validation.

There are currently two types of fields that can contain subfields:
`ContainerField` and `ListField`. A `ContainerField`'s schema defines
multiple heterogeneous fields, and so is useful for defining a 
document. A `ListField`'s schema takes a single field (which could be
a `ContainerField`). It is used for creating an arbitrary-length array 
of identical fields.

Short Example
-------------
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

`getClean()` returns the `field`'s data in native javascript 
formats. `toJSON()` returns the data in a format suitable for serializing. 
both raise an error if the field is invalid. `isValid()` returns `true` or 
`false`. `setValue(val)` to set a `field`'s value.

In the default configuration, validation will not occur until you call
one of the `UserField`'s `getClean`, `toJSON`, or `isValid` methods. Once one of 
these functions has been called once, validation will run very time data 
changes. You can override this validation behaviour by setting the widget's
`validationStrategy` to another predefined strategy or one written by yourself.


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
1. I would like to remove the coffeescript dependencies because it is silly
    to require coffeescript to compile one file
2. I hope to convince the Enyo team to make Enyo core compatible with node,
   then you can write a control once for both the front-end and backend.
3. I hope to write a django ./manage.py function that will automatically 
   create DocControl schema from django forms, so you don't have to rewrite
   controllers for the front-end.