(function ($) {

$.widget( "ui.datasource", {
	defaultElement: null,
	options: {
		sort: [],
		paging: {
			limit: null,
			offset: 0
		},
		filter: null
	},
	toArray: function() {
		return this.options.data;
	},
	_setOption: function(key, value) {
		// reset offset to 0 when changing limit
		// TODO actually only necessary when offset > offset + new limit
		// in other words, when on a page that won't exist anymore after the limit change
		if ( key === "paging" && value.limit != this.options.paging.limit ) {
			value.offset = 0;
		}
		if ( key === "sort" && value && !$.isArray( value ) ) {
			value = [value];
		}
		// remove filters when setting their value to null
		if ( key === "filter" ) {
			var filter;
			for ( filter in value) {
				if (value[ filter ] === null) {
					delete value[ filter ];
				}
			}
			if ( $.isEmptyObject( value) ) {
				value = null;
			}
		}
		this._super( "_setOption", key, value );
	},
	page: function(pageIndex) {
		var limit = this.options.paging.limit;
		if (pageIndex !== undefined) {
			this.options.paging.offset = pageIndex * limit - limit;
		}
		return Math.ceil( this.options.paging.offset / limit + 1 );
	},
	totalPages: function() {
		return Math.ceil(this.totalCount / this.options.paging.limit)
	},
	refresh: function( callback ) { // TODO Not using callback...
		this._trigger( "request" );

		var request = $.extend({}, this.options, {
			page: this.page()
		});
		var that = this;
        this.options.source( request, function( data, totalCount ) {
			$.observable( that ).setField( "totalCount", totalCount );
			$.observable( that.options.data ).replace( data );
			that._trigger( "response" );
		});

	}
});

})(jQuery);
