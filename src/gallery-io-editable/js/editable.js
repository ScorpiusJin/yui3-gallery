/**
 * Provides a conduit for replacing an element inline with something, typically
 * a form, handling the submit via XHR and the success or failure responses.
 *
 * @module gallery-io-editable
 * @requires io, io-form, plugin, node, event
*/

var IOEditable = function(config) {
    IOEditable.superclass.constructor.apply(this, arguments);

};

Y.mix(IOEditable, {
    NS: 'io_editable',
    ATTRS: {
        'srcNode'         : { },
        'bodyContent'     : { },
        'ioCfg'           : { value: { } }, 
        'replaceContent'  : { value: false },
        'successClass'    : { value: 'success' },
        'failureClass'    : { value: 'failure' },
        'autohide'        : { value: true }
    }
});

Y.extend(IOEditable, Y.Plugin.Base, {
    ACTIVE_CLASS:        'yui3-editable-active',
    USE_DISABLED:        false,
    REMOVE_STATUS_DELAY: 1000,
    previousContent:     null,
    isActive:            false,

    initializer: function(config) {
        var host = this.get('host');

        host.on('click', this._defClickFn, this);
        if ( this.get('autohide') === true ) {
            host.on(['focusoutside', 'clickoutside'],
                function() {
                    if ( this.isActive )
                        this.deactivate();
                },
                this
            );
        }
    },

    handlePost: function(e) {
        e.preventDefault();
        var form = e.currentTarget;

        var uri = form.get('action'),
            cfg = {
                method: form.get('method') || 'POST',
                context: this,
                form: {
                    id: form,
                    useDisabled: this.USE_DISABLED
                },
                on: {
                    success: this._submitSuccessFn,
                    failure: this._submitFailureFn
                }
            };
        Y.mix( cfg, this.get('ioCfg'), true );
        Y.io(uri, cfg);
    },

    activate: function() {
        var host = this.get('host'),
            form = null;

        this.isActive = true;
        this.previousContent = host.getContent();

        host.addClass(this.ACTIVE_CLASS);
        var content = this.get('bodyContent');
        if ( this.get('srcNode') ) {
            content = Y.one( this.get('srcNode') ).getContent();
        }
        host.setContent( content );

        form = host.one('form');
        if ( form ) {
            this.formListener = form.on('submit', this.handlePost, this );
        }

        host.fire('editableActive');
    },

    deactivate: function() {
        var host = this.get('host');
        this.isActive = false;
        if ( this.formListener )
            host.one('form').detach( this.formListener );
        host.setContent( this.previousContent );
        this.previousContent = null;
        host.removeClass(this.ACTIVE_CLASS);
        host.fire('editableDeactive');
    },

    _defClickFn: function(e) {
        if ( this.get('host').hasClass(this.ACTIVE_CLASS) )
            return;

        this.activate();
    },

    _submitSuccessFn: function(id, o) {
        var success = this.get('successClass');
        if ( success )
            this.get('host').addClass( success );

        if ( this.get('replaceContent') )
            this.previousContent = o.responseText;

        Y.later( this.REMOVE_STATUS_DELAY, this.get('host'),
            function(classname) { this.removeClass(classname) },
            success
        );
        this.deactivate();
    },

    _submitFailureFn: function(id, o) {
        var failure = this.get('failureClass');
        if ( failure )
            this.get('host').addClass( failure );
        Y.later( this.REMOVE_STATUS_DELAY, this.get('host'),
            function(classname) { this.removeClass(classname) },
            success
        );
    }
});

Y.namespace('Plugin').IOEditable = IOEditable;
