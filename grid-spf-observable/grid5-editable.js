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
	render: function( data ) {
		var tbody = this.itemContainer,
			that = this,
			template = this.options.rowTemplate;

		tbody.html( $.render( template, data  ))
			.link( data, {
				afterChange: function( ev, eventData ) {
					//that._trigger( "dataChange", eventData );
					switch ( ev.type ) {
						case "arrayChange" :
							tbody.find( "td" ).addClass( "ui-widget-content" );
							that._trigger("render");
							break;
						case "propertyChange" :
							eventData.item = this.source;							
							eventData.change = "change";							
							break;
					}
					$( that ).triggerHandler( "afterChange", eventData );
				}
			})
			.find( "td" ).addClass( "ui-widget-content" );

		this._trigger("render");
		return this;
	},
	_create: function() {
		var that = this;
		this.itemContainer = this.element.find( "tbody" ); // TODO this code assumes a single tbody which is not a safe assumption
		this._columns();
		this._rowTemplate();
		this._editTemplate();
		this.element.addClass( "ui-widget" );
		this.element.find( "th" ).addClass( "ui-widget-header" );
	},
	_columns: function() {
		if ( this.options.columns ) {
			// TODO this code assumes any present th is a column header, but it may be a row header
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
		if ( !this.options.rowTemplate ) {
			var headers = this.element.find( "th" );
			var template = $.map( this.options.columns, function( field, index ) {
				// TODO how to specify a custom template using the columns option?
				// make columns array-of-objects (optional) to contain all the potential data attributes?
				// should then output those when generating the columns
				var customTemplate = headers.eq( index ).data( "template" );
				if ( customTemplate ) {
					return $(customTemplate).html();
				}
				return "<td data-getfrom='[" + field + "]' />";
			}).join( "" );
			template = "<tr>" + template + "</tr>";
			this.options.rowTemplate = template;
		}
		this.options.rowTemplate = $.template( this.options.rowTemplate ); // Compile the template, for better perf
	},
	_editTemplate: function() {
		// TODO refactor code as a function to avoid duplicate code between here and _rowTemplate
		// TODO add support for hierarchical data, array properties etc.
		if ( !this.options.editTemplate ) {
			var headers = this.element.find( "th" );
			var template = $.map( this.options.columns, function( field, index ) {
				// TODO how to specify a custom template using the columns option?
				// make columns array-of-objects (optional) to contain all the potential data attributes?
				// should then output those when generating the columns
				var customTemplate = headers.eq( index ).data( "edit-template" );
				if ( customTemplate ) {
					return $(customTemplate).html();
				}
				var label = field.replace(/^(.)(.*)$/, function(match, first, rest) {
					return first.toUpperCase() + rest.toLowerCase();
				});
				// TODO only include columns that have data-field attributes
				return "<input type='text' name='" + field + "' placeholder='" + label + "' value='${" + field + "}' title='" + label + "' />";
			}).join( "" );
			this.options.editTemplate = template;
		}
		this.options.editTemplate = $.template( this.options.editTemplate ); // Compile the template, for better perf
	}
});

})( jQuery );

