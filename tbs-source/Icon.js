//* Button with bootstrap skinning
enyo.kind({ 
  name: "tbs.Icon",
  tag: "i",
  published: {
    //* choose from: "primary", "info", "success", "warning", "danger", "inverse", "link" (defaults to regular style)
    icon: undefined,
    //* choose from: "large", "small", or "mini" (defaults to regular size)
    white: false
  },
  create: function() {
    this.inherited(arguments);
    this.setIcon(this.icon);
    this.setWhite(this.white);
  },
  setStyle: function(val) {
    if (this.icon) this.removeClass("icon-"+this.icon);
    this.icon = val;
    if (this.icon) this.addClass("icon-"+this.icon);
  },
  setSize: function(val) {
    if (white) {
      this.addClass("icon-white");
    } else {
      this.removeClass("icon-white");
    }
  }
});