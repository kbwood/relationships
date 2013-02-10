/* http://keith-wood.name/relationships.html
   Relationships for jQuery v1.3.0.
   Written by Keith Wood (kwood{at}iinet.com.au) January 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

/* Display matched items across two sets.
   Attach it with options like:
   var integers = {images: 'integers.png', imageSize: [25, 29],
     items: ['Number one', 'Number two', 'Number three', 'Number four']};
   var intTypes = {images: 'intTypes.png', imageSize: [27, 27],
     items: ['Odd numbers', 'Even numbers', 'Prime numbers']};
   var intLinks = [[0, 0], [1, 1], [1, 2], [2, 0], [2, 2], [3, 1]];
   $('div selector').attachRelationships({set1: integers,
     set2: intTypes, links: intLinks, description: 'Integers'});
*/

(function($) { // Hide scope, no $ conflict

/* Relationships manager. */
function Relationships() {
	this._defaults = {
		opacity: 20, // Opacity of non-matching items, percentage
		set1: {}, // Details about the first set of icons
		set2: {}, // Details about the second set of icons
		links: [], // Links between the two sets based on indexes
		description: '' // The description of the sets as a whole
	};
}

$.extend(Relationships.prototype, {
	/* Class name added to elements to indicate already configured with relationships. */
	markerClassName: 'hasRelationships',
	/* Name of the data property for instance settings. */
	propertyName: 'relationships',

	/* Override the default settings for all relationships instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (Relationships) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Attach the relationships widget to a div.
	   @param  target   (element) the control to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {options: $.extend({}, this._defaults)};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		this._optionPlugin(target, options);
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		$.extend(inst.options, options);
		target.html(this._generateHTML(inst));
	},

	/* Remove the plugin functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).
			removeData(this.propertyName).empty();
	},
	
	/* Generate the HTML to display the relationships widget.
	   @param  inst  (object) the current instance settings
	   @return  (jQuery) the widget content */
	_generateHTML: function(inst) {
		return this._addSet(inst, 1).add(this._addSet(inst, 2)).
			add('<div class="' + this.propertyName + '_description">' +
				inst.options.description + '</div>');
	},
	
	/* Generate one of the sets.
	   @param  inst   (object) the current instance settings
	   @param  setId  (number) the set index
	   @return  (jQuery) the corresponding elements */
	_addSet: function(inst, setId) {
		var set = inst.options['set' + setId];
		var html = '<div class="' + this.propertyName + '_set' + setId + '" style="height: ' +
			set.imageSize[1] + 'px;">';
		for (var i = 0; i < set.items.length; i++) {
			html += '<span class="' + this.propertyName + '_item" style="width: ' +
				set.imageSize[0] + 'px; ' + 'height: ' + set.imageSize[1] + 'px; ' +
				'background: transparent url(\'' + set.images + '\') ' +
				'no-repeat -' + ((set.items[i].imageIndex || i) * set.imageSize[0]) + 'px 0px;"></span>';
		}
		html = $(html + '</div>');
		html.find('.' + this.propertyName + '_item').hover(function() {
				plugin._showLinks(this, setId);
			}, function() {
				plugin._showLinks(this, 0);
			});
		return html;
	},
	
	/* Show the links for a selected item.
	   @param  target  (element) the selected item
	   @param  setId   (number) the set to which it belongs */
	_showLinks: function(target, setId) {
		target = $(target);
		var itemId = target.index();
		var container = target.closest('.' + plugin.markerClassName);
		var inst = container.data(plugin.propertyName);
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
				if (links[i][setId - 1] == itemId) {
					highlightItems[2 - setId][highlightItems[2 - setId].length] = links[i][2 - setId];
				}
			}
			// Highlight matched items
			var opacity = (inst.options.opacity || 20) / 100;
			container.find('.' + plugin.propertyName + '_set1 span').css('opacity', function(i, value) {
				return ($.inArray(i, highlightItems[0]) > -1 ? '1.0' : opacity);
			});
			container.find('.' + plugin.propertyName + '_set2 span').css('opacity', function(i, value) {
				return ($.inArray(i, highlightItems[1]) > -1 ? '1.0' : opacity);
			});
		}
		else {
			// Show all
			container.find('span').css('opacity', '1.0');
		}
		// Show selected item or default description
		container.find('.' + plugin.propertyName + '_description').text(description);
	}
});

// The list of commands that return values and don't permit chaining
var getters = [''];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the relationship functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.relationships = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

/* Initialise the relationships functionality. */
var plugin = $.relationships = new Relationships(); // Singleton instance

})(jQuery);
