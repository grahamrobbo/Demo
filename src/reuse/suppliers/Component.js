sap.ui.define(
	["sap/ui/core/sample/RoutingNestedComponent/base/BaseComponent"],
	function (BaseComponent) {
		return BaseComponent.extend(
			"sap.ui.core.sample.RoutingNestedComponent.reuse.suppliers.Component",
			{
				metadata: {
					manifest: "json",
				},
				eventMappings: {
					productsComponent: [
						{
							name: "toProduct",
							forward: "toProduct",
						},
					],
				},
			}
		)
	}
)
