(function( $ ) {

$.widget( "ui.dataview", {
	defaultElement: null,
	options: {
		sort: [],
		paging: {
			limit: null,
			offset: 0
		},
		filter: null
	},

	output: [],

	_setOption: function( key, value ) {
		// reset offset to 0 when changing limit
		// TODO actually only necessary when offset > offset + new limit
		// in other words, when on a page that won't exist anymore after the limit change
		if ( key === "paging" && value.limit !== this.options.paging.limit ) {
			value.offset = 0;
		}

		if ( key === "sort" && value && !$.isArray( value ) ) {
			value = [value];
		}

		// remove filters when setting their value to null
		if ( key === "filter" ) {
			for ( var filter in value) {
				if ( value[ filter ] === null ) {
					delete value[ filter ];
				}
			}
			if ( $.isEmptyObject( value ) ) {
				value = null;
			}
		}
		this._super( "_setOption", key, value );
	},

	page: function( pageIndex ) {
		var limit = this.options.paging.limit;
		if ( pageIndex !== undefined ) {
			this.option( "paging.offset", pageIndex * limit - limit );
		}
		return Math.ceil( this.options.paging.offset / limit + 1 );
	},

	totalPages: function() {
		return Math.ceil( this.totalCount / this.options.paging.limit );
	},

	refresh: function() {
		var sortedItems = this._sort( this._filter( this.options.input ));
		this.totalCount = sortedItems.length;
		$.observable( this.output ).refresh( this._page( sortedItems ));
	}
});

}( jQuery ) );
