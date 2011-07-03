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
		selected = this._selected = [];
		this._columns();
		this._rowTemplate();
		this.element.addClass( "ui-widget" );
		this.element.find( "th" ).addClass( "ui-widget-header" );
		this.element.selectable({
			filter: "tbody tr",
			start: function( ev, eventArgs ) {
				if ( !ev.ctrlKey ) {
					// If ctrlKey not true, remove any other items in selected - which may be on other pages than the current one.
					$.observable( selected ).remove( 0, selected.length );
				}
			},
			selected: function( ev, eventArgs ) {
				var dataItem = $.view( eventArgs.selected ).data;
				index = $.inArray( dataItem, selected );
				if ( index == -1 ) {
					$.observable( selected ).insert( selected.length, dataItem );
				}
			},
			unselected: function( ev, eventArgs ) {
				var index = $.inArray( $.view( eventArgs.unselected ).data, selected );
				if ( index >= 0 ) {
					$.observable( selected ).remove( index );
				}
			}
		});
		$([ selected ]).bind( "arrayChange", function() { that._refreshSelection(); });
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
							that._refreshSelection();
							that._trigger("render");
							break;
					}
				}
			});

		this._trigger("render");
	},
	selected: function( items ) {
		var selected = this._selected;
		if ( items !== undefined ) {
			$.observable( selected ).refresh( items )
		}
		return selected;
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
				return "<td class='ui-widget-content' data-getfrom='[" + field + "]' />";
			}).join( "" );
			template = "<tr>" + template + "</tr>";
			this.options.rowTemplate = template;
		}
		this.options.rowTemplate = $.template( this.options.rowTemplate ); // Compile the template, for better perf
	},
	_refreshSelection: function() {
		this.element.find( "tbody tr" ).addClass( function( index, currentClass ) {
			if ( $.inArray( $.view( this ).data, selected ) >= 0) {
				return "ui-selected";
			} else {
				$( this ).removeClass( "ui-selected" );
			}
		});
	}
});

})( jQuery );
