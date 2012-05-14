YUI.add('gallery-bootstrap-misc', function(Y) {

/**

For all the small controls that Twitter Bootstrap has that don't warrant a
full module, we have Bootstrap Misc!

@module gallery-bootstrap-misc
**/

/**
Twitter's Bootstrap is a great starting place and has many convenient
JavaScript behaviors. The only problem is that they use jQuery. Worry
no more, as you can use this for all small controls and if you need the
larger controls, you have the option of using `gallery-bootstrap` or the
other individual pieces:

 * `gallery-bootstrap-tooltip`
 * `gallery-bootstrap-tabview`
 * `gallery-bootstrap-scrollspy`

See http://twitter.github.com/bootstrap/javascript.html for more
information.

You will need to include the Bootstrap CSS. This is only the JavaScript.

Note that we do not do anything with Overlays (or "Modals") as the Y.Panel
is featurefull enough with some css additions.  Also make sure to add
'btn' and 'btn-primary' classes to your `buttons` and everything will be
grand!

@example

    // You can plugin the Alert
    Y.all('div.alert').plug( Y.Bootstrap.Alert );

    // Or setup delegation:
    Y.Bootstrap.alert_delegation();

    // Also a JS method to dismiss
    var node = Y.one('div.alert');
    node.plug( Y.Bootstrap.Alert );
    node.alert.dismiss();

There are selectors you can use to narrow down and implement several tooltips
at once. The most sensible example is to match any link with a `rel="tooltip"`
attribute.

  new Y.Bootstrap.Tooltip({ selector : '*[rel=tooltip]' });

@class Bootstrap.Tooltip
**/

// We must extend Y.Widget to have extra class names.
Y.Widget.ATTRS.classNames = {
	valueFn: function () {
		return [];
	}
};

Y.mix(Y.Widget.prototype, {
	_addExtraClassNames: function () {
		var boundingBox = this.get('boundingBox');
		Y.Array.each(this.get('classNames'), function (className) {
			boundingBox.addClass(className);
		}, this);
	},
	_renderUI: function() {
		this._renderBoxClassNames();
		this._addExtraClassNames();
		this._renderBox(this._parentNode);
	},
	toggleView: function () {
		return this.set('visible', !this.get('visible'));
	}
}, true);


var NS = Y.namespace('Bootstrap');

NS._dismissAlertFn = function(e) {
    var target   = e.target,
        selector = target.getAttribute('data-dismiss') || 'alert',
        alert    = e.target.ancestor('div.' + selector);

    if ( alert ) {
        e.preventDefault();
        if ( alert.hasClass('fade') ) {
            alert.transition(
                {
                    duration : 0.5,
                    opacity  : 0
                },
                function() { this.remove(); }
            );
        } else {
            alert.remove();
        }
    }
};

NS.alert_delegation = function(selector) {
    if ( typeof selector === 'undefined' ) {
        selector = '*[data-dismiss]';
    }
    Y.delegate('click', NS._dismissAlertFn, document.body, selector);
};

function AlertPlugin(config) {
    var selector = config.selector || '.close';
    this._node = config.host;
    this._node.delegate('click', NS._dismissAlertFn, selector);
}

AlertPlugin.NS = 'alert';

AlertPlugin.prototype = {
    /* Add a dismiss entry as well */
    dismiss: function() {
        // Just a fake event facade.
        NS._dismissAlertFn({ target : this._node.one('.close'), preventDefault : function() { } });
    }
};

NS.Alert = AlertPlugin;

NS._dropdownClickFn = function(e) {
    var target = e.currentTarget,
        force  = e.forceOpen,
        container;

    e.preventDefault();

    if ( target.getAttribute('data-target') ) {
        container = Y.one( target.getAttribute('data-target') );
    }
    else if ( target.getAttribute('href').indexOf('#') >= 0 ) {
        container = Y.one( target.getAttribute('href').substr( target.getAttribute('href').indexOf('#') ) );
    }
    if ( !container ) {
        container = target.ancestor('.dropdown');
        if ( !container ) {
            container = target.ancestor('.btn-group');
        }
    }

    if ( container ) {
        // Default toggle behavior
        if ( typeof force === 'undefined' ) {
            container.once('clickoutside', function() {
                container.removeClass('open');
            });
            container.toggleClass('open');
        }
        else if ( force ) {
            container.once('clickoutside', function() {
                container.removeClass('open');
            });
            container.addClass('open');
        }
        else {
            container.removeClass('open');
        }
    }
};

NS.dropdown_delegation = function() {
    Y.delegate('click', NS._dropdownClickFn, document.body, '*[data-toggle=dropdown]' );
};

function DropdownPlugin(config) {
    this._node = config.host;
    this._node.on('click', NS._dropdownClickFn);
}

DropdownPlugin.NS = 'dropdown';

DropdownPlugin.prototype = {
    /* Add open and close methods */
    open: function() {
        this.toggle(true);
    },

    close: function() {
        this.toggle(false);
    },

    toggle : function(force) {
        NS._dropdownClickFn({ currentTarget : this._node, preventDefault : function() { }, forceOpen: force });
    }
};

NS.Dropdown = DropdownPlugin;

function ExpandablePlugin(config) {
    ExpandablePlugin.superclass.constructor.apply(this, arguments);
}

ExpandablePlugin.NAME = 'Bootstrap.Collapse';
ExpandablePlugin.NS   = 'collapse';

Y.extend(ExpandablePlugin, Y.Plugin.Base, {
    defaults : {
        duration  : 0.25,
        easing    : 'ease-in',
        showClass : 'in',
        hideClass : 'out',

        groupSelector : '> .accordion-group > .in'
    },

    transitioning: false,

    initializer : function(config) {
        this._node = config.host;

        this.config = Y.mix( config, this.defaults );

        this.publish('show', { preventable : true, defaultFn : this.show });
        this.publish('hide', { preventable : true, defaultFn : this.hide });

        this._node.on('click', this.toggle, this);
    },

    _getTarget: function() {
        var node = this._node,
            container;

        if ( node.getData('target') ) {
            container = Y.one( node.getData('target') );
        }
        else if ( node.getAttribute('href').indexOf('#') >= 0 ) {
            container = Y.one( node.getAttribute('href').substr( node.getAttribute('href').indexOf('#') ) );
        }
        return container;
    },

    /* Add open and close methods */
    hide: function() {
        var showClass = this.showClass,
            hideClass = this.hideClass,
            node      = this._getTarget();

        if ( this.transitioning ) {
            return;
        }

        if ( node ) {
            this._hideElement(node);
        }
    },

    show: function() {
        var showClass = this.showClass,
            hideClass = this.hideClass,
            node      = this._getTarget(),
            host      = this._node,
            self      = this,
            parent,
            group_selector = this.config.groupSelector;

        if ( this.transitioning ) {
            return;
        }

        if ( host.getData('parent') ) {
            parent = Y.one( host.getData('parent') );
            if ( parent ) {
                parent.all(group_selector).each( function(el) {
                    self._hideElement(el);
                });
            }
        }
        this._showElement(node);
    },

    toggle : function(e) {
        if ( e && Y.Lang.isFunction(e.preventDefault) ) {
            e.preventDefault();
        }

        var target = this._getTarget();

        if ( target.hasClass( this.showClass ) ) {
            this.fire('hide');
        } else {
            this.fire('show');
        }
    },
    
    transition : function(node, method, startEvent, completeEvent) {
        var self        = this,
            config      = this.config,
            duration    = config.duration,
            easing      = config.easing,
            // If we are hiding, then remove the show class.
            removeClass = method === 'hide' ? config.showClass : config.hideClass,
            // And if we are hiding, add the hide class.
            addClass    = method === 'hide' ? config.hideClass : config.showClass,

            to_height   = method === 'hide' ? 0 : null,
            event       = method === 'hide' ? 'hidden' : 'shown',

            complete = function() {
                node.removeClass(removeClass);
                node.addClass(addClass);
                self.transitioning = false;
                this.fire( event );
            };

        if ( to_height === null ) {
            to_height = 0;
            node.all('> *').each(function(el) {
                to_height += el.get('scrollHeight');
            });
        }

        this.transitioning = true;

        node.transition({
            height   : to_height +'px',
            duration : duration,
            easing   : easing
        }, complete);
    },

    _hideElement : function(node) {
        this.transition(node, 'hide');
/*
        var showClass = this.showClass,
            hideClass = this.hideClass;

        node.removeClass(showClass);
        node.addClass(hideClass);
*/
    },

    _showElement : function(node) {
        this.transition(node, 'show');
/*
        var showClass = this.showClass,
            hideClass = this.hideClass;
        node.removeClass(hideClass);
        node.addClass(showClass);
*/
    }
});

NS.expandable_delegation = function() {
    Y.delegate('click', function(e) {
        e.preventDefault();

        var target = e.currentTarget;
        if ( ! target.collapse ) {
            target.plug( ExpandablePlugin );
        }
        target.collapse.toggle();
    }, document.body, '*[data-toggle=collapse]' );
};

NS.Collapse = ExpandablePlugin;

function TypeaheadPlugin(config) {
    this._node   = config.host;

    var cfg = Y.mix( config, this.defaults );

    delete cfg.host;

    cfg.source = this.prepareSource( cfg.source_attribute );

    if ( !config.resultTextLocator && this._node.getAttribute('data-' + cfg.text_locator_attr) ) {
        cfg.resultTextLocator = this.getData(cfg.text_locator_attr);
    }

    if ( !config.resultListLocator && this._node.getAttribute('data-' + cfg.list_locator_attr) ) {
        cfg.resultListLocator = this.getData(cfg.list_locator_attr);
    }

    if ( !config.resultFilters && this._node.getAttribute('data-' + cfg.filters_attr) ) {
        cfg.resultFilters = this.getData(cfg.filters_attr);
    }
    if ( typeof cfg.classNames === 'undefined' ) {
        cfg.classNames = [];
    }

    cfg.classNames.push('yui3-skin-sam');

    this._node.plug( Y.Plugin.AutoComplete, cfg );
}

TypeaheadPlugin.NS = 'typeahead';

TypeaheadPlugin.prototype = {
    defaults : {
        source_attribute : 'source',
        text_locator_attr: 'text-locator',
        list_locator_attr: 'list-locator',
        filters_attr     : 'filters',

        // Pass through configuration for the AutoComplete
        maxResults       : 4,
        resultFilters    : 'phraseMatch',
        resultHighlighter: 'phraseMatch',
        enableCache      : true,
        queryDelay       : 100
    },

    prepareSource : function(attr) {
        var data = this._node.getData( attr );
        // If it parses as JSON, then we will parse that and return it.
        // Otherwise it may be a URI.
        try {
            data = Y.JSON.parse(data);
        } catch(e) {
            /* Data is not JSON, just skip parsing it */
        }
        return data;
    },

    getData : function(attr) {
        return this._node.getData(attr);
    }
};

NS.Typeahead = TypeaheadPlugin;



}, '@VERSION@' ,{requires:['anim','transition','widget','event','event-outside','event-delegate','autocomplete','autocomplete-filters','autocomplete-highlighters','json']});
