sap.ui.define(["sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent"],(function(e){return e.extend("sap.ui.core.sample.RoutingNestedComponent.Component",{metadata:{manifest:"json"},eventMappings:{suppliersComponent:[{name:"toProduct",route:"products",componentTargetInfo:{products:{route:"detail",parameters:{id:"productID"}}}}],productsComponent:[{name:"toSupplier",route:"suppliers",componentTargetInfo:{suppliers:{route:"detail",parameters:{id:"supplierID"},componentTargetInfo:{products:{route:"list",parameters:{basepath:"supplierKey"}}}}}},{name:"toCategory",route:"categories",componentTargetInfo:{categories:{route:"detail",parameters:{id:"categoryID"},componentTargetInfo:{products:{route:"list",parameters:{basepath:"categoryKey"}}}}}},{name:"toProduct",route:"products",componentTargetInfo:{products:{route:"detail",parameters:{id:"productID"}}}}],categoriesComponent:[{name:"toProduct",route:"products",componentTargetInfo:{products:{route:"detail",parameters:{id:"productID"}}}}]},init:function(){e.prototype.init.apply(this,arguments)}})}));