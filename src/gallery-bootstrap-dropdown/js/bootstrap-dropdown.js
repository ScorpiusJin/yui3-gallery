/**
A Plugin which provides dropdown behaviors for dropdown buttons and menu
groups. This utilizes the markup from the Twitter Bootstrap Project.

@module gallery-bootstrap-dropdown
**/

/**
A Plugin which provides dropdown behaviors for dropdown buttons and menu
groups. This utilizes the markup from the Twitter Bootstrap Project.

To automatically gain this functionality, you can simply add the
<code>data-toggle=dropdown</code> attribute to any element.

It can also be plugged into any node or node list.

@example

  var node = Y.one('.someNode');
  node.plug( Y.Bootstrap.Dropdown );
  node.dropdown.show();

@class Bootstrap.Dropdown
**/

function DropdownPlugin(config) {
  DropdownPlugin.superclass.constructor.apply(this, arguments);
}

DropdownPlugin.NAME = 'Bootstrap.Dropdown';
DropdownPlugin.NS   = 'dropdown';

Y.extend( DropdownPlugin, Y.Plugin.Base, {
    defaults : {
        className : 'open',
        target    : 'target',
        selector  : ''
    },
    initializer : function(config) {
        this._node = config.host;

        this.config = Y.mix( config, this.defaults );

        this.publish('show', { preventable : true, defaultFn : this.show });
        this.publish('hide', { preventable : true, defaultFn : this.hide });

        this._node.on('click', this.toggle, this);
    },

    toggle : function() {
        this.getTarget().toggleClass( this.config.className );
    },

    show : function() {
        this.getTarget().addClass( this.config.className );
    },
    hide : function() {
        this.getTarget().removeClass( this.config.className );
    },
    open : function() {
        this.getTarget().addClass( this.config.className );
    },
    close : function() {
        this.getTarget().removeClass( this.config.className );
    },

    /**
    @method getTarget
    @description Fetches a Y.NodeList or Y.Node that should be used to modify class names
    **/ 
    getTarget : function() {
        var node     = this._node,
            selector = node.getData( this.config.target ),
            target;

        if ( !selector ) {
            selector = node.getAttribute('href');
            selector = target && target.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        target = Y.all(selector);
        if ( target.size() === 0 ) {
            target = node.get('parentNode');
        }

        return target;
    }
});

Y.namespace('Bootstrap').Dropdown = DropdownPlugin;


