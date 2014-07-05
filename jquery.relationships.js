/* http://keith-wood.name/relationships.html
   Relationships for jQuery v2.0.0.
   Written by Keith Wood (kwood{at}iinet.com.au) January 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // hide the namespace

	var pluginName = 'relationships';

	/** Create the relationships plugin.
		<p>Display matched items across two sets.</p>
		<p>Expects HTML like:</p>
		<pre>&lt;div>&lt;/div></pre>
		<p>Provide inline configuration like:</p>
		<pre>&lt;div data-relationships="name: 'value'">&lt;/div></pre>
	 	@module Relationships
		@augments JQPlugin
		@example var integers = {images: 'integers.png', imageSize: [25, 29],
     items: ['Number one', 'Number two', 'Number three', 'Number four']};
 var intTypes = {images: 'intTypes.png', imageSize: [27, 27],
     items: ['Odd numbers', 'Even numbers', 'Prime numbers']};
 var intLinks = [[0, 0], [1, 1], [1, 2], [2, 0], [2, 2], [3, 1]];
 $(selector).relationships({set1: integers, set2: intTypes,
     links: intLinks, description: 'Integers'}) */
	$.JQPlugin.createPlugin({

		/** The name of the plugin. */
		name: pluginName,
			
		/** Relationships select callback.
			Triggered when an icon is selected.
			@callback relationshipsSelect
			@param setNumber {number} 1 or 2 for which set the icon is in.
			@param index {number} the icon's index within that set.
			@param label {string} The icon's label. */

		/** Default settings for the plugin.
			@property [opacity=20] {number} Opacity of non-matching items, percentage.
			@property [set1={}] {object} Details about the first set of icons.
			@property [set2={}] {object} Details about the second set of icons.
			@property [links=[]] {number[][]} Links between the two sets based on indexes.
			@property [description=''] {string} The description of the sets as a whole.
			@property [onSelect=relationshipsSelect] {function} Callback when an icon is selected. */
		defaultOptions: {
			opacity: 20,
			set1: {},
			set2: {},
			links: [],
			description: '',
			onSelect: null
		},

		_descriptionClass: pluginName + '-description',
		_setClass: pluginName + '-set',

		_optionsChanged: function(elem, inst, options) {
			$.extend(inst.options, options);
			elem.html(this._generateHTML(inst));
		},

		_preDestroy: function(elem, inst) {
			elem.empty();
		},
	
		/** Generate the HTML to display the relationships widget.
			@private
			@param inst {object} The current instance settings.
			@return {jQuery} The widget content. */
		_generateHTML: function(inst) {
			return this._addSet(inst, 1).add(this._addSet(inst, 2)).
				add('<div class="' + this._descriptionClass + '">' +
					inst.options.description + '</div>');
		},
	
		/** Generate one of the sets.
			@private
			@param inst {object} The current instance settings.
			@param setId {number} The set index.
			@return {jQuery} The corresponding elements. */
		_addSet: function(inst, setId) {
			var set = inst.options['set' + setId];
			var html = '<div class="' + this._setClass + setId +
				'" style="height: ' + set.imageSize[1] + 'px;">';
			for (var i = 0; i < set.items.length; i++) {
				html += '<span style="width: ' + set.imageSize[0] + 'px; ' +
					'height: ' + set.imageSize[1] + 'px; ' +
					'background: transparent url(\'' + set.images + '\') no-repeat ' +
					'-' + ((set.items[i].imageIndex || i) * set.imageSize[0]) + 'px 0px;"></span>';
			}
			html = $(html + '</div>');
			var self = this;
			html.on('mouseenter', 'span', function(e) {
					self._showLinks(e.target, setId, inst);
				}).on('mouseleave', 'span', function(e) {
					self._showLinks(e.target, 0, inst);
				}).on('click', 'span', function(e) {
					if ($.isFunction(inst.options.onSelect)) {
						var itemId = $(this).index();
						var item = inst.options['set' + setId].items[itemId];
						inst.options.onSelect.apply(inst.elem[0],
							[setId, itemId, item.description || item]);
					}
				});
			return html;
		},
	
		/** Show the links for a selected item.
			@private
			@param elem {Element} The selected item.
			@param setId {number} The set to which it belongs.
			@param inst {object} The current instance settings. */
		_showLinks: function(elem, setId, inst) {
			elem = $(elem);
			var itemId = elem.index();
			var container = elem.closest('.' + inst.name);
			var description = inst.options.description;
			if (setId) {
				var set = inst.options['set' + setId];
				// Description for selected item
				description = set.items[itemId].description || set.items[itemId];
				// Highlight only the selected item in this set
				var highlightItems = [[], []];
				highlightItems[setId - 1] = [itemId];
				// Determine matching items in other set
				var links = inst.options.links || [];
				for (var i = 0; i < links.length; i++) {
					if (links[i][setId - 1] === itemId) {
						highlightItems[2 - setId][highlightItems[2 - setId].length] =
							links[i][2 - setId];
					}
				}
				// Highlight matched items
				var opacity = (inst.options.opacity || 20) / 100;
				container.find('.' + this._setClass + '1 span').
					css('opacity', function(i, value) {
						return ($.inArray(i, highlightItems[0]) > -1 ? '1.0' : opacity);
					});
				container.find('.' + this._setClass + '2 span').css('opacity', function(i, value) {
					return ($.inArray(i, highlightItems[1]) > -1 ? '1.0' : opacity);
				});
			}
			else {
				// Show all
				container.find('span').css('opacity', '1.0');
			}
			// Show selected item or default description
			container.find('.' + this._descriptionClass).text(description);
		}
	});

})(jQuery);
