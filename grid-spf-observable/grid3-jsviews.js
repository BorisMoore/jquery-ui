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
		this.itemContainer = this.element.find( "tbody" ); // TODO this code assumes a single tbody which is not a safe assumption
		this._columns();
		this._rowTemplate();
		this.element.addClass( "ui-widget" );
		this.element.find( "th" ).addClass( "ui-widget-header" );
	},
	render: function() {
		var tbody = this.itemContainer,
			that = this,
			template = this.options.rowTemplate,
			source = this.options.source;
		
		tbody.html( $.render( template, source ))
			.link( source, { 
				afterChange: function( ev, eventData ) {
					switch ( ev.type ) {
						case "arrayChange" :
							that._trigger("render");
							break;
					}
				}
			});
			
		this._trigger("render");
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
		if ( this.options.rowTemplate ) {
			return;
		}
		var headers = this.element.find( "th" );
		var template = $.map( this.options.columns, function( field, index ) {
			// TODO how to specify a custom template using the columns option?
			// make columns array-of-objects (optional) to contain all the potential data attributes?
			// should then output those when generating the columns
			var customTemplate = headers.eq( index ).data( "template" );
			if ( customTemplate ) {
				return $(customTemplate).html();
			}
			return "<td class='ui-widget-content' data-getfrom='[" + field + "]' />";
		}).join( "" );
		template = "<tr>" + template + "</tr>";
		this.options.rowTemplate = template;
	}
});

})( jQuery );
