/*
 * Grid
 *
 * Depends on:
 * tmpl
 * datastore
 *
 * Optional:
 * extractingDatasource
 */
(function( $ ) {

$.widget( "ui.grid", {
	options: {
		columns: null,
		rowTemplate: null
	},
	_create: function() {
		var that = this;

		this._columns();
		this._rowTemplate();
		this.element.addClass( "ui-widget" );
		this.element.find( "th" ).addClass( "ui-widget-header" );
		this.element.delegate( "tbody > tr", "click", function( event ) {
			if ( that.options.selectMode === "single" ) { //TODO add support for multiselect
				that.select( $.view( this ));
			}
		});
		this.refresh();
	},
	_setOption: function( key, value ) {
	 	switch (key) {
			case "selectedItem":
				if ( typeof value !== "object" ) { // support either viewItem or index as value
					value = this.options.viewItems[ value ]; // treat as an index	(string or number)
				}
				var selectedViewItem = this.options.selectedItem;
				if ( selectedViewItem != value ) {
					if ( selectedViewItem ) {
						$( selectedViewItem.nodes ).removeClass( "grid-selected-row");
					}
					if (value) {
						$( value.nodes ).addClass( "grid-selected-row");
					}
					// Trigger a specific select event (in addition to the generic objectChange event for selectedItem).
					this._super( "_setOption", key, value );
					this._trigger( "select", null, {
						selectedItem: value
					});
				}
			default:
				this._super( "_setOption", key, value );
		}
		// TODO - consider overriding/replacing base widget implementation
		$( this.options ).triggerHandler( "objectChange", { path: key, value: value }); // Make all options changes observable
	},
	refresh: function() {
		var tbody = this.element.find( "tbody" ).empty(),
			template = this.options.rowTemplate,
			source = this.options.source,
			that = this;

		this.options.viewItems = tbody
			.empty()
			.append( $.render( template, source ))
			.dataLink( source )
			.view().views[0].views;

		$([ source ]).bind( "arrayChange", function( event, args ){
			switch( args.change ) {
				case "remove":
					if ( args.oldItems[0] === that.selectedData() ) {
						that.select();
					}
			}
		});
		if ( this.options.selectedItem ) {
			this.select( this.options.selectedItem );
		}
	},

	select: function( viewItem ) { // accept index or viewItem
		this._setOption( "selectedItem", viewItem );
	},

	selectedData: function() { // accept index or viewItem
		return this.options.selectedItem && this.options.selectedItem.data;
	},

	_columns: function() {
		if ( this.options.columns ) {
			if ( !this.element.find( "th" ).length ) {
				// TODO improve this
				var head = this.element.find("thead");
				$.each( this.options.columns, function(index, column) {
					$("<th>").attr("data-field", column).text(column).appendTo(head)
				});
			}
			return;
		}
		this.options.columns = this.element.find( "th" ).map(function() {
			var field = $( this ).data( "field" );
			if ( !field ) {
				// generate field name if missing
				field = $( this ).text().toLowerCase().replace(/\s|[^a-z0-9]/g, "_");
			}
			return field;
		}).get();
	},

	_rowTemplate: function() {
		if ( this.options.rowTemplate ) {
			return;
		}
		var template = $.map( this.options.columns, function( field ) {
			return "<td class='ui-widget-content' data-jq-linkfrom='" + field + "'>${" + field + "}</td>";
		}).join( "" );
		template = "<tr>" + template + "</tr>";
		this.options.rowTemplate = $.template( template );  // Compiled template
	}
});

})( jQuery );
