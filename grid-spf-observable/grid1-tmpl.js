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
			that._trigger( "select", event, {
				// TODO add item
			});
		});
		$(this.options.source.element).bind("datasourceresponse", function() {
			that.refresh();
		});
	},
	refresh: function() {
		// TODO this code assumes a single tbody which is not a safe assumption
		var tbody = this.element.find( "tbody" ).empty();

		// TODO To refresh a single row, call tmplItem.update() in tmpl, or view.render() in JsViews.
		//(But JsViews does it for you when adding items are added  to data array).
		$.tmpl( this.options.rowTemplate, this.options.source.toArray() ).appendTo( tbody );

		tbody.find( "td" ).addClass( "ui-widget-content" );
		this._trigger("refresh");
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
				return "<td>${" + field + "}</td>";
			}).join( "" );
			template = "<tr>" + template + "</tr>";
			this.options.rowTemplate = template;
		}
		this.options.rowTemplate = $.template( this.options.rowTemplate ); // Compile the template, for better perf
	}
});

})( jQuery );
