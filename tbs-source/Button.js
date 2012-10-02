//* Button with bootstrap skinning
enyo.kind({ 
  name: "tbs.Button",
  kind: "enyo.Button",
  published: {
    //* choose from: "primary", "info", "success", "warning", "danger", "inverse", "link" (defaults to regular style)
    style: undefined,
    //* choose from: "large", "small", or "mini" (defaults to regular size)
    size: undefined
  },
  classes: "btn",
  create: function() {
    this.inherited(arguments);
    this.setStyle(this.style);
    this.setSize(this.size);
  },
  setStyle: function(val) {
    if (this.style) this.removeClass("btn-"+this.style);
    this.style = val;
    if (this.style) this.addClass("btn-"+this.style);
  },
  setSize: function(val) {
    if (this.size) this.removeClass("btn-"+this.size);
    this.size = val;
    if (this.size) this.addClass("btn-"+this.size);
  }
});