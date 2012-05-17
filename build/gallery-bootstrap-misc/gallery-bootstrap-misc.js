YUI.add('gallery-bootstrap-misc', function(Y) {

/**

For all the small controls that Twitter Bootstrap has that don't warrant a
full module, we have Bootstrap Misc!

@module gallery-bootstrap-misc
**/

/**

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

/**
A Plugin which provides fading Alert behaviors on a Node with compatible syntax
and markup from Twitter's Bootstrap project.

@module gallery-bootstrap-alert
**/

/**
A Plugin which provides fading Alert behaviors on a Node with compatible syntax
and markup from Twitter's Bootstrap project.

This makes it possible to have dynamic behaviors without incorporating any
JavaScript. However, it can be manually plugged into any node or node list.

    var node = Y.one('.someNode');
    // Duration is in seconds
    node.plug( Y.Bootstrap.Alert, { duration : 5 } );

    node.alert.close();

@class Bootstrap.Alert
**/

function AlertPlugin(config) {
    AlertPlugin.superclass.constructor.apply(this, arguments);

    this.config = Y.mix( config, this.defaults );

    var selector = this.config.selector;

    this._node = config.host;

    /**
    Fires when the close method is called, or when any close item has been
    clicked

    @event close
    @preventable _dismissAlertFn
    **/
    this.publish('close', { preventable : true, defaultFn : this._dismissAlertFn });

    this._node.delegate('click', function(e) { this.fire('close'); }, selector, this);
}

AlertPlugin.NAME = 'Bootstrap.Alert';
AlertPlugin.NS   = 'alert';

Y.extend(AlertPlugin, Y.Plugin.Base, {
    /**
    @property defaults
    @type Object
    @default { duration : 0.5, selector : '.close', transition : true, destroy : true }
    **/
    defaults : {
        duration     : 0.5,
        selector     : '.close',
        transition   : true,
        destroy      : true
    },

    /**
    @method close
    @description Closes the alert target (the host) and removes the node.
    **/
    close: function() {
        // Just a fake event facade.
        this.fire('close', { currentTarget : this._node.one('.close') });
    },

    /**
    @method _dismissAlertFn
    @description Internal method to handle the transitions and fire the
    closed event
    @protected
    **/
    _dismissAlertFn: function(e) {
        // This could be called from directly inside the plugin or just
        // violating encapsulation entirely. I didn't want to go through
        // instantiation overhead for what really will amount to a single and
        // direct call.
        var target = e.currentTarget,
            alert,
            config,
            is_plugin,
            destroy,
            completed;

        // If we have a node, use that. If not, find an ancestor that matches.
        if ( Y.instanceOf( this, AlertPlugin ) ) {
            alert     = this._node;
            config    = this.config;
            is_plugin = this;
        } else {
            alert  = e.target.ancestor('div.' + ( target.getData('dismiss') || 'alert' ) );
            config = AlertPlugin.prototype.defaults;
        }

        destroy = config.destroy ? true : false;

        completed = function() {
            if ( destroy ) { this.remove(); };
            alert.fire('closed');
            if ( is_plugin ) {
                is_plugin.fire('closed');
            }
        };

        if ( alert ) {
            e.preventDefault();
            if ( config.transition && alert.hasClass('fade') ) {
                alert.transition(
                    {
                        duration : config.duration,
                        opacity  : 0
                    },
                    completed
                );
            } else {
                alert.hide();
                completed();
            }
        }
    }
});

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

/**
A Plugin which provides Expandable behaviors on a Node with compatible syntax
and markup from Twitter's Bootstrap project.

@module gallery-bootstrap-expandable
**/

/**
A Plugin which provides Expandable behaviors on a Node with compatible syntax
and markup from Twitter's Bootstrap project.

It possible to have dynamic behaviors without incorporating any
JavaScript by setting <code>data-toggle=collapse</code> on any element.

However, it can be manually plugged into any node or node list.

@example

    var node = Y.one('.someNode');
    node.plug( Y.Bootstrap.Collapse, config );

    node.collapse.show();

@class Bootstrap.Collapse
**/

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

    /**
    * @method hide
    * @description Hide the collapsible target, specified by the host's
    * <code>data-target</code> or <code>href</code> attribute.
    */
    hide: function() {
        var showClass = this.config.showClass,
            hideClass = this.config.hideClass,
            node      = this._getTarget();

        if ( this.transitioning ) {
            return;
        }

        if ( node ) {
            this._hideElement(node);
        }
    },

    /**
    * @method show
    * @description Show the collapsible target, specified by the host's
    * <code>data-target</code> or <code>href</code> attribute.
    */
    show: function() {
        var showClass = this.config.showClass,
            hideClass = this.config.hideClass,
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

    /**
    @method toggle
    @description Toggle the state of the collapsible target, specified
    by the host's <code>data-target</code> or <code>href</code>
    attribute. Calls the <code>show</code> or <code>hide</code> method.
    **/
    toggle : function(e) {
        if ( e && Y.Lang.isFunction(e.preventDefault) ) {
            e.preventDefault();
        }

        var target = this._getTarget();

        if ( target.hasClass( this.config.showClass ) ) {
            this.fire('hide');
        } else {
            this.fire('show');
        }
    },

    /**
    @method _transition
    @description Handles the transition between showing and hiding.
    @protected
    @param node {Node} node to apply transitions to
    @param method {String} 'hide' or 'show'
    **/
    _transition : function(node, method) {
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

    /**
    @method _hideElement
    @description Calls the <code>_transition</code> method to hide a node.
    @protected
    @param node {Node} node to hide.
    **/
    _hideElement : function(node) {
        this._transition(node, 'hide');
/*
        var showClass = this.showClass,
            hideClass = this.hideClass;

        node.removeClass(showClass);
        node.addClass(hideClass);
*/
    },

    /**
    @method _showElement
    @description Calls the <code>_transition</code> method to show a node.
    @protected
    @param node {Node} node to show.
    **/
    _showElement : function(node) {
        this._transition(node, 'show');
/*
        var showClass = this.showClass,
            hideClass = this.hideClass;
        node.removeClass(hideClass);
        node.addClass(showClass);
*/
    }
});

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

var CONTENT_BOX   = 'contentBox',
    BOUNDING_BOX  = 'boundingBox',
    HIDDEN_CLASS  = 'hide',
    SHOWING_CLASS = 'in',
    HEADER        = 'header',
    BODY          = 'body',
    FOOTER        = 'footer',
    PREFIX        = 'modal-',

BootstrapPanel = Y.Base.create('BootstrapPanel', Y.Panel, [],
    {
        show: function() {
            this.get(CONTENT_BOX).removeClass( HIDDEN_CLASS );
            this.get(CONTENT_BOX).addClass( SHOWING_CLASS );
            this.set('visible', true);
        },

        hide: function() {
            this.get(CONTENT_BOX).addClass( HIDDEN_CLASS );
            this.get(CONTENT_BOX).removeClass( SHOWING_CLASS );
            this.set('visible', false);
        },

        _findStdModSection: function(section) {
            var node = this.get(CONTENT_BOX).one("> ." + PREFIX + section);
            return node;
        },
        _uiSetDefaultButton: function (newButton, oldButton) {
            var primaryClassName = this.CLASS_NAMES.primary;
            if ( newButton ) { newButton.addClass(primaryClassName); }
            if ( oldButton ) { oldButton.removeClass(primaryClassName); }
        }
    },
    {
        HTML_PARSER : {
            headerContent : function(contentBox) {
                return this._parseStdModHTML( HEADER );
            },
            bodyContent : function(contentBox) {
                return this._parseStdModHTML( BODY );
            },
            footerContent : function(contentBox) {
                return this._parseStdModHTML( FOOTER );
            },
            buttons : function(srcNode) {
                var buttonSelector = 'button,.btn',
                    sections       = [ 'header', 'body', 'footer' ],
                    buttonsConfig  = null;
                Y.Array.each( sections, function(section) {
                    var container = this.get(CONTENT_BOX).one('.' + PREFIX + section),
                        buttons   = container && container.all(buttonSelector),
                        sectionButtons;
                    if ( !buttons || buttons.isEmpty() ) { return; }

                    sectionButtons = [];
                    buttons.each( function(button) {
                        sectionButtons.push({ srcNode: button });
                    });
                    buttonsConfig || ( buttonsConfig = {} );
                    buttonsConfig[section] = sectionButtons;
                }, this);

                return buttonsConfig;
            }
        },

        SECTION_CLASS_NAMES : {
            header : PREFIX + HEADER,
            body   : PREFIX + BODY,
            footer : PREFIX + FOOTER
        },

        CLASS_NAMES : {
            button  : 'btn',
            primary : 'btn-primary'
        },

        TEMPLATES : {
            header : '<div class="' + PREFIX + HEADER + '"></div>',
            body   : '<div class="' + PREFIX + BODY + '"></div>',
            footer : '<div class="' + PREFIX + FOOTER + '"></div>'
        }
    }
);

function ModalPlugin(config) {
    ModalPlugin.superclass.constructor.apply(this, arguments);
}

ModalPlugin.NAME = 'Bootstrap.Modal';
ModalPlugin.NS   = 'modal';

Y.extend(ModalPlugin, Y.Plugin.Base, {
    defaults : {
        backdrop  : 'static',
        keyboard  : true,
        modal     : true,
        rendered  : true,
        show      : true,
        hideOn    : [
            { eventName : 'clickoutside' }
        ]
    },

    initializer : function(config) {
        this._node = config.host;

        this.config = Y.mix( config, this.defaults );

        this.publish('show', { preventable : true, defaultFn : this.show });
        this.publish('hide', { preventable : true, defaultFn : this.hide });

        this.config.srcNode = this._node;
        this.config.visible = this.config.show;
        this.config.rendered = this.config.rendered;

        var oldClass = Y.ButtonCore.CLASS_NAMES.BUTTON;
        Y.ButtonCore.CLASS_NAMES.BUTTON = 'btn';
        var panel = this.panel = new BootstrapPanel(this.config);
        Y.ButtonCore.CLASS_NAMES.BUTTON = oldClass;

        panel.get('contentBox').delegate('click',
            function(e) {
                var target = e.currentTarget,
                    action = target.getData('dismiss');
                if ( action && action === 'modal' ) {
                    e.preventDefault();
                    this.fire('hide');
                }
            },
            '.btn', this
        );

        if ( this.config.show ) {
            this.fire('show');
        }
    },

    /* Add open and close methods */
    hide: function() {
        this.panel.hide();
    },

    show: function() {
        this.panel.show();
    }
});

NS.Modal = ModalPlugin;



}, '@VERSION@' ,{requires:['panel','anim','transition','widget','event','event-outside','event-delegate','autocomplete','autocomplete-filters','autocomplete-highlighters','json']});
