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
		this.element.delegate( "tbody > tr", "click", function( event ) {
			that._trigger( "select", event, {
				// TODO add item
			});
		});
		this._changeHandlerKey = ("gridDataChangeHandler" + Math.random()).replace( /\D/g, "" );
		var arrayChangeHandler = function( event, data ) {
			that._handleArrayChange( data );
		};
		$( [ this.options.source ] )
			.bind( "arrayChange", arrayChangeHandler )
			.data( this._changeHandlerKey, arrayChangeHandler );
		//this.refresh();
	},
	refresh: function() {
		var tbody = this.itemContainer,
			template = this.options.rowTemplate,
			that = this;

		$.each( tbody.children(), function () {
			// TODO: Reuse item elements from here whose items are still in our array.
			that._disposeItemEl( $( this ) );
		} );

		tbody.empty();

		// TODO try to replace $.each with passing an array to $.tmpl, produced by this.items.something()
		// TODO how to refresh a single row?
		$.each( this.options.source, function( unused, item ) {
			// TODO use item.toJSON() or a method like that to compute values to pass to tmpl
			var newEl = that._createElForItem( item ).appendTo( tbody );
			that._trigger( "rowAdded", null, newEl[0] );
		});
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
	},

	// Additional members for observability

	_destroy: function() {
		var array = $( [ this.options.source ] );
		array.unbind( "arrayChange", array.data( this._changeHandlerKey ) );
	},
	_handleArrayChange: function( eventData ) {
		// There is a non-trivial amount of code here devoted to "arrayChange/propertyChange" here
		// (change handling, event binding, etc).  The JsViews plug-in might be worthwhile here
		// as it does much of the same work we're doing below (to support incremental re-render).
		var tbody = this.itemContainer;
		switch ( eventData.change ) {
			case "insert":
				var that = this,
					newItemEls = $.map( eventData.items, function( item ) {
						return that._createElForItem( item )[0];
					} );
				if ( eventData.index === 0 ) {
					$( newItemEls ).prependTo( tbody );
				} else {
					$( newItemEls ).insertAfter( tbody.children().eq( eventData.index - 1 ) );
				}
				$.each( newItemEls, function() {
					that._trigger( "rowAdded", null, this[0] );
				} );
				break;

			case "remove":
				for (var i = 0; i < eventData.items.length; i++) {
					var itemEl = tbody.children().eq( eventData.index );
					this._disposeItemEl( itemEl );
					itemEl.remove();
				}
				break;

			case "move":
				var itemEls = tbody.children().eq( eventData.oldIndex )
					.nextUntil(":gt(" + eventData.oldIndex + eventData.items.length - 1 + ")").andSelf();
				// TODO: There's gotta be a better jQuery for the above.

				itemEls.detach();
				if ( eventData.newIndex === 0 ) {
					itemEl.prependTo( tbody );
				} else {
					itemEl.insertAfter( tbody.children().eq( eventData.newIndex - 1 ) );
				}
				break;

			case "refresh":
				this.refresh();
				break;
		}
	},
	_handlePropertyChange: function( item, eventData ) {
		var that = this,
			itemEls = this.itemContainer.children().filter( function() {
				return $( this ).tmplItem().data === item;
			} );
		$.each( itemEls, function() {
			// Here, we re-render the table row for a given property change.
			// This is a scenario where jQuery data-link would be better, to incrementally
			// fix up the previously rendered template rather than re-render.
			that._disposeItemEl( $( this ) );
			var newEl = that._createElForItem( item );
			$( this ).replaceWith( newEl );
			that._trigger( "rowAdded", null, newEl[0] );
		} );
	},
	_createElForItem: function( item ) {
		var that = this,
			propertyChangeHandler = function( event, data ) {
				that._handlePropertyChange( event.target, data );
			};
		$( item ).bind( "propertyChange", propertyChangeHandler );
		return $.tmpl( this.options.rowTemplate, item )
			.data( this._changeHandlerKey, propertyChangeHandler )
			.find( "td" ).addClass( "ui-widget-content" ).end();
	},
	_disposeItemEl: function( itemEl ) {
		$( itemEl.tmplItem().data ).unbind( "propertyChange", itemEl.data( this._changeHandlerKey ) );
	}
});

})( jQuery );
