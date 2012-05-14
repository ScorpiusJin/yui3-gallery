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

        Y.log('_getTarget for node: ' + node, 'debug', 'Bootstrap.Collapse');
        Y.log('fetching collapse target, looking at data-target: ' + node.getData('target'), 'debug', 'Bootstrap.Collapse');
        if ( node.getData('target') ) {
            container = Y.one( node.getData('target') );
        }
        else if ( node.getAttribute('href').indexOf('#') >= 0 ) {
            Y.log('No target, looking at href: ' + node.getAttribute('href'), 'debug', 'Bootstrap.Collapse');
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
            Y.log('fetching parent: ' + host.getData('parent'), 'debug', 'Bootstrap.Collapse');
            parent = Y.one( host.getData('parent') );
            if ( parent ) {
                Y.log('Using selector ' + group_selector, 'debug', 'Bootstrap.Collapse');
                parent.all(group_selector).each( function(el) {
                    Y.log('Hiding element: ' + el, 'debug', 'Bootstrap.Collapse');
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

