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



}, '@VERSION@' ,{requires:['anim','transition','widget','event','event-outside','event-delegate']});
