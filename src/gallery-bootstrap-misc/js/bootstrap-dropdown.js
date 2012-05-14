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

