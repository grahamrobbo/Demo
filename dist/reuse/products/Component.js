sap.ui.define(["sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent","sap/ui/core/Component"],(function(t,e){return t.extend("sap.ui.core.sample.RoutingNestedComponent.reuse.products.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);var n=e.getOwnerComponentFor(this);n||this.attachEvent("toProduct",(function(t){var e=t.getParameter("productID");this.getRouter().navTo("detail",{id:e})}),this)}})}));