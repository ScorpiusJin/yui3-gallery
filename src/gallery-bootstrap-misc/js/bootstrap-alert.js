NS._dismissAlertFn = function(e) {
    var target   = e.target,
        selector = target.getData('dismiss') || 'alert',
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
        selector = '*[data-dismiss=alert]';
    }
    Y.delegate('click', NS._dismissAlertFn, document.body, selector);
};

function AlertPlugin(config) {
    var selector = config.selector || '.close';
    this._node = config.host;
    this._node.delegate('click', NS._dismissAlertFn, selector);
}

<<<<<<< Updated upstream
AlertPlugin.NS = 'alert';
=======
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
>>>>>>> Stashed changes

AlertPlugin.prototype = {
    /* Add a dismiss entry as well */
    dismiss: function() {
        // Just a fake event facade.
        NS._dismissAlertFn({ target : this._node.one('.close'), preventDefault : function() { } });
    }
};

NS.Alert = AlertPlugin;

