NS._expandableClickFn = function(e) {
    var target  = e.currentTarget,
        force   = e.forceOpen,
        container,
        parent, selector;

    e.preventDefault();

    if ( target.getAttribute('data-target') ) {
        container = Y.one( target.getAttribute('data-target') );
    }
    else if ( target.getAttribute('href').indexOf('#') >= 0 ) {
        container = Y.one( target.getAttribute('href').substr( target.getAttribute('href').indexOf('#') ) );
    }

    if ( target.getData('parent') ) {
        Y.log('fetching parent: ' + target.getData('parent'), 'debug', 'Bootstrap.Expandable');
        parent = Y.one( target.getData('parent') );
        selector = '.collapse.in';
        Y.log('Got parent: ' + parent, 'debug', 'Bootstrap.Expandable');
    }

    if ( typeof force === 'undefined' ) {
        if ( parent ) {
            parent.all(selector).each( function(el) {
                el.addClass('out');
                el.removeClass('in');
            });
        }
        container.toggleClass('out');
        container.toggleClass('in');
    }
    else if ( force ) {
        container.removeClass('out');
        container.addClass('in');
    }
    else {
        container.addClass('out');
        container.removeClass('in');
    }
};

function ExpandablePlugin(config) {
    this._node = config.host;
    this._node.on('click', NS._dropdownClickFn);
}

ExpandablePlugin.NS = 'expandable';

ExpandablePlugin.prototype = {
    duration  : 0.25,
    easing    : 'ease-in',
    showClass : 'in',
    hideClass : 'out',
    transitioning: false,

    groupSelector : '> .accordion-group > .in',

    _getTarget: function() {
        var node = this._node,
            container;

        Y.log('_getTarget for node: ' + node, 'debug', 'Bootstrap.Expandable');
        Y.log('fetching expandable target, looking at data-target: ' + node.getData('target'), 'debug', 'Bootstrap.Expandable');
        if ( node.getData('target') ) {
            container = Y.one( node.getData('target') );
        }
        else if ( node.getAttribute('href').indexOf('#') >= 0 ) {
            Y.log('No target, looking at href: ' + node.getAttribute('href'), 'debug', 'Bootstrap.Expandable');
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
            group_selector = this.groupSelector;

        if ( this.transitioning ) {
            return;
        }

        if ( host.getData('parent') ) {
            Y.log('fetching parent: ' + host.getData('parent'), 'debug', 'Bootstrap.Expandable');
            parent = Y.one( host.getData('parent') );
            if ( parent ) {
                parent.all(group_selector).each( function(el) {
                    self._hideElement(el);
                });
            }
        }
        this._showElement(node);
    },

    toggle : function(force) {
        var target = this._getTarget();
        if ( target.hasClass( this.showClass ) ) {
            this.hide();
        } else {
            this.show();
        }
    },
    
    transition : function(node, method, startEvent, completeEvent) {
        var self        = this,
            // If we are hiding, then remove the show class.
            removeClass = method === 'hide' ? this.showClass : this.hideClass,
            // And if we are hiding, add the hide class.
            addClass    = method === 'hide' ? this.hideClass : this.showClass,

            to_height   = method === 'hide' ? 0 : null,

            complete = function() {
                node.removeClass(removeClass);
                node.addClass(addClass);
                self.transitioning = false;
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
            duration : this.duration,
            easing   : this.easing
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
};

NS.expandable_delegation = function() {
    Y.delegate('click', function(e) {
        e.preventDefault();

        var target = e.currentTarget;
        if ( ! target.expandable ) {
            target.plug( ExpandablePlugin );
        }
        target.expandable.toggle();
    }, document.body, '*[data-toggle=collapse]' );
};

NS.Expandable = ExpandablePlugin;

