( function ($) {

	$.dataTracker = function ( array ) {
		if ( !this.bindObjects) {
			return new $.dataTracker( array );
		}
		var that = this;
		this._onDataChange = function( ev, eventData ) {
			$( that ).triggerHandler( "afterChange", { change: "change", item: this, path: eventData.path, value: eventData.value });
		};

		that.bindObjects( array );

		$([ array ]).bind( "arrayChange", function( ev, eventData ){
			switch( eventData.change ) {
				case "insert":
					that.bindObjects( eventData.items );
					break;

				case "remove":
					that.unbindObjects( eventData.items );
					break;

				case "refresh":
					var i = array.length, oldItems = eventData.oldItems;
					while ( i-- ) {
						if ( !$.inArray( array[i], oldItems )) {
							that.bindObjects( array[i] );
						}
					}
					i = oldItems.length;
					while ( i-- ) {
						if ( !$.inArray( oldItems[i], array )) {
							that.unbindObjects( oldItems[i] );
						}
					}
					break;
			}
			$( that ).triggerHandler( "afterChange", eventData );
		});
	};

	$.dataTracker.prototype = {
		bindObjects: function ( array ) {
			var that = this;
			$.each( array, function() {
				$( this ).bind( "propertyChange", that._onDataChange );
			});
		},
		unbindObjects: function ( array ) {
			var that = this;
			$.each( array, function() {
				$( this ).unbind( "propertyChange", that._onDataChange );
			});
		}
	};
})( jQuery )


// This should not be built-in, since it may need to treat adding and removing array properties, adding and removing structured properties, adding and removing items from array properties, and so on to any depth. But at least we need the observable events to provide new and previous values on refresh and on propertyChange.
// Look at bindAll feature, to address Brad's scenarios more generically.
