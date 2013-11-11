DocControl
==========

Highlights
----------
* runs on browser and node.js - writing one schema gets you client- and server-side validation
* validate flat or nested data structures - great for rdbms's and nosql
* dynamically generate html forms from your schema on the front-end with enyo
* incredibly flexible - you can validate any json structure, you don't have to use our widgets
* widget sets for enyo and onyx, with multiple styles for each, included. It's easy to add more
  styles or widget sets

Overview
--------
DocControl is a forms framework for Enyo and node.js. It allows you to quickly and easily
create forms that validate complex documents and get that data in a format that can
be manipulated on the front-end or serialized and sent to a back-end. Since you should never
trust client-side validation, you can simply load the serialized data back into the exact
same form in node.js to ensure it is valid. Write one schema to validate client side 
and server-side. DocControl is well suited to validating both flat data that is destined 
for a table in a RDBMS, or for nested data that is destined for a document database such 
as CouchDB or Mongo.

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

DocControl performs several common front-end and back-end controller tasks.

1. display a form with automatically generated widgets
2. Check inputted data against a set of validation rules.
3. Display error messages until the form conforms to the validation rules
4. Convert the form data to the relevant javascript data types
5. Convert the form data to an easily serializable format for storage or transmission to a server
6. deserialize the serialized data and enter it into the form for server-side validation

Overview
--------
The library deals with these concepts:

###Form
An Enyo kind that, when fed a schema, creates a fields structure and a widgets structure to represent
the schema. It then coordinates communication between the fields and widgets and ensures validation
 occurs when the value of the widgets change, in accordance with the validationStrategy.

###Widget
An Enyo kind that knows how to render a field, and get and set the value from/to that field. 

###Field
A javascript class that is responsible for doing validation (e.g. an EmailField that makes sure 
its data is a valid email address) as well as serialization and deserialization. It can run in either
the browser or in node.js.

###Collection
A special type of field that can contain other fields or collections. When validated, it ensures all
subfields are validated, when its value is retreived the value of all subfields are 
retreived.

###Validator
A small snippet of reusable code that is used by a field to perform most of the validation.

There are currently three types of fields that can contain subfields:
* `ListField`: contains an ordered array of an arbitrary number of identical subfields
* `ContainerField`: contains a hash of heterogeneous fields, each defined by a key, and so is
  useful for defining a document.
* `HashField`: a cross between a `ListField` and a `ContainerField` it contains a hash of an
  arbitrary number of identical subfields. I haven't found a usecase for an html representation
  of a `HashField`. It is there to assist with validating arbitrary json structures.

Short Example
-------------
The following will create a simple user field:

    var contactSchema = {
      name:"UserField",
      kind: "ContainerField",
      schema: [
        { name: "username",
          kind: "CharField",
          maxLength: 10, 
          minLength: 5, 
          widget: {
            label: "Username", 
            helpText: "CharField between 5 and 10 characters long", 
            initial: "John Doe" } },
        { name: "email", 
          kind: "EmailField", 
          widget: { label: "Email", } }
        { name: "age", 
          kind: "IntegerField", 
          maxValue: 116, 
          minValue: 13, 
          widget: { 
            label: "Age", 
            helpText: "Integer between 13 and 116" } } ],
      widget: { 
        label: "Users", 
        helpText: "Add as many users as you like" }
    }

    // To create a form kind to display the field on the frontend:

    enyo.kind({
      name: "contacts",
      kind: "widgets.Form",
      schema: contactSchema,  // point to the schema we created earlier
      skin: "horizontal",     // optional: define widget layout
      widgetSet: "onyx"       // optional: define widget set to use
    })

    // then insert the kind as you normally would into an enyo app.
    

    // To do backend validation on the backend:

    fields = require("doccontrol").fields
    fields.genField(contactSchema)

`getClean()` returns the `field`'s data in native javascript 
formats. `toJSON()` returns the data in a format suitable for serializing. 
both raise an error if the field is invalid. `isValid()` returns `true` or 
`false`. `setValue(val, {path: "path.to.field"})` to set a sub`field`'s value.

In the default configuration, validation will not occur until you call
one of the `UserField`'s `getClean`, `toJSON`, or `isValid` methods. Once one of 
these functions has been called once, validation will run very time data 
changes. You can override this validation behaviour by setting the widget's
`validationStrategy` to another predefined strategy or one written by yourself.


Installation
------------
###Backend:
Install DocControl into your project. From your project's root directory:

    npm install doccontrol

###Frontend:
If you don't already have DocControl for your backend, download or clone it from github 
(https://github.com/dgreisen/DocControl). You can immediately run the sample application by visiting `sample.html` in a browser. 

To include DocControl in your project, copy or link the `DocControl/source` directory in
your project's lib directory and add a reference to it in your project's `package.js` file. If you are using a different widgetSet, or any localized fields, you will need to include 
those files in your `package.js` as well. See `sample/package.js` for an example of how to
do it.

Development
-----------
Anything that can run on node.js, i.e. `Fields` and `Validators`, is written in coffeescript. Coffeescript source is kept in `/coffee`. You can compile the coffeescript by running:

    cake build

or you can watch the coffee directory and build on change by running:
    
    cake watch

in DocControl's root directory.

You can run both the field and widget jasmine tests by running:

    /SpecRunner/index.html

in your browser.

Finally, you can rebuild the fields API by running

    cake docs

The frontend widget api does not have to be compiled.


Feedback
--------

I greatly appreciate feedback. If you have a bug or feature request, please put it in the tracker. Anything else, including if you'd like to let me know you are using DocControl code in a project You can reach me at dgreisen@gmail.com.