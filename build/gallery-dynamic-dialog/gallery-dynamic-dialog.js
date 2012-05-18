YUI.add('gallery-dynamic-dialog', function(Y) {

/**

A wrapper around common Dialog controls and how they interact with forms.
Supports inline template-style dialogs as well as remote dialogs from a remote
URI.

@module gallery-dynamic-dialog
**/

/**
A wrapper around common Dialog controls and how they interact with forms.
Supports inline template-style dialogs as well as remote dialogs from a remote
URI.

The idea is that you can install event delegates on a page, and open up
additional single panels in a dialog (loaded asynchronously) or just simply
show a dialog from a template on the page.

    var dialogs = new Y.DynamicDialog();

    // These are the defaults. Any link with open-dialog as a class
    // will find a node from the href="#dialog-template-id" and open it.
    dialogs.setupDelegates({
       'a.open-dialog':   'click',
       // This will fetch the href and display the results in the dialog.
       // Your backend will have to know how to send partial renders out.
       'a.remote-dialog': 'click'
    });

    dialog.on('show', function(e) {
      // Immediately close it! This is absurd!
      e.dialog.hide();
    });

@class DynamicDialog
**/
var DynamicDialog,

    Panel    = Y.Panel,

    Lang     = Y.Lang,
    sub      = Lang.sub,
    isValue  = Lang.isValue,
    isString = Lang.isString,
    Oeach    = Y.Object.each;

DynamicDialog = Y.Base.create('dynamicDialog', Y.Base, [], {
    /**
    @property container
    @type Node
    @default document.body
    **/
    container: Y.one(document.body),
    /**
    @property panels
    @type Object
    @default {}
    **/
    panels: {},

    /**
    What events are setup. They're handled via delegation. Defaults to handle
    either the open-dialog or remote-dialog, and what event to bind to. The
    event must be an event that bubbles so event delegation works.
    @property DEFAULT_EVENTS
    @type Object
    @default { 'a.open-dialog' : 'click', 'a.remote-dialog' : 'click' }
    **/
    DEFAULT_EVENTS: {
        'a.open-dialog':   'click',
        'a.remote-dialog': 'click'
    },

    /**
    Sets up event handlers and default events

    @method initializer
    **/
    initializer: function() {
        this.publish('submit', {
            defaultFn: this._defSubmitFn,
            preventable: true
        });

        this.publish('getSuccess', {
            defaultFn: this._triggerEventFn,
            preventable: true
        });

        this.publish('getFailure', {
            defaultFn: this._triggerEventFn,
            preventable: true
        });

        this.publish('show', { preventable: false });
    },

    /**
    Attachs all event listeners to the <code>container</code>

    @method setupDelegates
    **/
    setupDelegates: function() {
        var container = this.container,
            events    = this.DEFAULT_EVENTS,
            triggerFn = Y.bind(this._triggerEventFn, this);

        Oeach( events,
            function(value, key) {
                container.delegate(value, triggerFn, key);
            }
        );
    },

    /**
    For a remote dialog, this makes a call via <code>Y.io</code> and will set
    the Panel content based on the server response.

    On success, fires the getSuccess event.
    On failure, will fire the getFailure event.

    @method _fetchDialogContent
    @protected
    **/
    _fetchDialogContent: function(e) {
        var target   = e.currentTarget,
            source   = target.get('tagName') === 'A' ?
                        target.get('href') : target.get('target'),
            async    = target.getAttribute('data-async') === 'true',
            title    = (target.getAttribute('title') || ''),
            dialog   = this,
            error    = dialog.get('remoteFailureText'),
            cfg      = {
                method: 'GET',
                arguments: {
                    dialog: dialog
                },
                on: {
                    success: function(id, o, args) {
                        e.args = args;
                        e.response = o;

                        var fragment = Y.one(Y.config.doc.createDocumentFragment());
                        fragment.append('<div>' + o.responseText + '</div>');
                        fragment = fragment.one('div');

                        fragment.setAttribute('data-async', async);
                        fragment.setAttribute('title', title);

                        e.dialogId = target.get('id');
                        e.template = fragment;
                        e.domTarget = e.currentTarget;

                        dialog.fire('getSuccess', e);
                    },
                    failure: function(id, o, args) {
                        e.args = args;
                        e.response = o;

                        var fragment = Y.one(Y.config.doc.createDocumentFragment());
                        fragment.append('<div>' + error + '</div>');
                        fragment = fragment.one('div');

                        fragment.setAttribute('data-async', async);
                        fragment.setAttribute('title', title);

                        e.dialogId = target.get('id');
                        e.template = fragment;
                        e.domTarget = e.currentTarget;

                        dialog.fire('getFailure', e);
                    }
                }
            };
        Y.io( source, cfg );
    },

    /**
    @method open
    @param selector {String} Open the dialog that matches on <code>Y.one(selector)</code>
    **/
    open: function(selector) {
        var node = Y.one(selector),
            e    = {
                currentTarget:  node,
                preventDefault: function() { },
                halt:           function() { }
            };
        return this._dialogFromNode(e);
    },

    /**
    Calls _dialogFromNode based on an event to open a panel.

    @method _triggerEventFn
    @protected
    **/
    _triggerEventFn: function(e) {
        this._dialogFromNode(e);
    },

    /**
    From a target (from an event, perhaps) extract all the properties to
    open the panel with. If the node has a remote overlay class, it will
    initiate the fetch from the remote location.

    @method _dialogFromNode
    @protected
    **/
    _dialogFromNode: function(e) {
        var target   = e.domTarget ? e.domTarget : e.currentTarget,
            source   = target.get('tagName') === 'A' ?
                        target.get('href') : target.get('target'),
            attrs    = {},
            id       = e.dialogId || source.substr( source.indexOf('#') ),
            template = e.template || Y.one(id),
            async    = template ? template.getAttribute('data-async') === 'true' : false,
            overlay  = this.panels[id],

            dom_attrs  = target.get('attributes'),
            data_attrs = [];

        /* If we don't have a template, fetch it! */
        if ( target.hasClass( this.get('remoteClass') ) && !template ) {
            /* Now we pause. The contents of the dialog are not from the template
               but from an XHR call.
            */
            e.preventDefault();
            return this._fetchDialogContent(e);
        }

        dom_attrs.each( function(el) {
            var name = el.get('name');
            if ( name.match(/^data-/) ) {
                var value = target.getAttribute(name);
                // We have a value, so remove the data- prefix and stuff it
                // into the attrs objject.
                if ( value !== null ) {
                    attrs[ name.substr(5) ] = value;
                }
            }
        });

        /* If we have an overlay or a template, do stuff */
        if ( overlay || template ) {
            e.preventDefault();
            if ( !overlay ) {
                overlay = this._setupDialog(target, template, attrs);
            }
            else if ( template ) {
                overlay.setStdModContent(
                    Y.WidgetStdMod.BODY,
                    sub( template.getContent(), attrs )
                );
            }

            var form = overlay.get('contentBox').one('form');
            if ( form ) {
                var submitFn = Y.bind( this._defSubmitButtonFn, this );

                /* Detach previously used form listener and replace it */
                if ( overlay.formListener ) {
                    overlay.formListener.detach();
                }
                overlay.formListener = form.on('submit', function(e) {
                    e.preventDefault();

                    e.async   = async;
                    e.dialog  = this;
                    e.trigger = target;

                    /* We find the form again, since the content may be replaced */
                    e.form = this.get('contentBox').one('form');
                    if ( !e.form ) {
                        throw "Form disappeared, was the dialog content replaced incorrectly?";
                    }

                    submitFn(e);
                }, overlay);
            }

            overlay.trigger = target;
            overlay.show();
            this.fire('show', { dialog: overlay, trigger: target });
        }

        return overlay;
    },

    /**
    Setup the Panel object and render it into the container.

    @method _setupDialog
    @param element {Node}
    @param template {String}
    @param attrs {Object}
    **/
    _setupDialog: function(element, template, attrs) {
        var self    = this,
            title   = element.getAttribute('title') || template.getAttribute('title') || '',
            content = sub( template.getContent(), attrs ),
            modal   = element.getAttribute('data-modal') || template.getAttribute('data-modal') || this.get('modal'),
            zIndex  = element.getAttribute('data-zindex') || this.get('zIndex'),
            panel   = null,
            async   = template.getAttribute('data-async') === 'true',
            submitFn   = Y.bind( this._defSubmitButtonFn, this ),
            closeLabel = this.get('closeLabel'),
            contentBox = null,
            form       = null;
        panel = new Panel({
            headerContent:  title,
            bodyContent:    content,
            modal:          modal,
            centered:       true,
            zIndex:         zIndex,
            buttons       : [
                {
                    value: closeLabel,
                    section: Y.WidgetStdMod.HEADER,
                    classNames: [ 'closer' ],
                    action: function(e) { this.hide(); }
                }
            ]
        });

        panel.render( this.container );
        // XX The classes are based on the listed classes, but we want to add
        // this in. Didn't see a way via the API in Widget.js.
        panel.get('boundingBox').addClass('yui3-dynamic-dialog');

        var dialogClasses = template.getAttribute('data-dialog-class');
        if (dialogClasses) {
            panel.get('boundingBox').addClass(dialogClasses.split(' '));
        }

        contentBox = panel.get('contentBox');
        form       = contentBox.one('form');

        /* If we have a form, setup form buttons */
        if ( form ) {
            var cancelClasses = template.getAttribute('data-cancel-class') || '';
            panel.addButton({
                value: template.getAttribute('data-cancel-label') || this.get('cancelLabel'),
                classNames: [ 'yui3-dynamic-dialog-cancel', cancelClasses.split(' ')],
                action: function(e) { e.preventDefault(); this.hide(); },
                section: Y.WidgetStdMod.FOOTER
            });

            var submitClasses = template.getAttribute('data-submit-class') || '';
            panel.addButton({
                value: template.getAttribute('data-submit-label') || this.get('submitLabel'),
                classNames: [ 'yui3-dynamic-dialog-submit', submitClasses.split(' ') ],
                action: function(e) {
                    e.preventDefault();
                    e.async   = async;
                    e.dialog  = this;
                    e.trigger = this.trigger;

                    /* We find the form again, since the content may be replaced */
                    e.form = this.get('contentBox').one('form');
                    if ( !e.form ) {
                        throw "Form disappeared, was the dialog content replaced incorrectly?";
                    }

                    submitFn(e);
                },
                section: Y.WidgetStdMod.FOOTER
            });

        }
        /* Otherwise, just a simple Hide button */
        else {
            var okClasses = template.getAttribute('data-ok-class') || '';

            panel.addButton({
                value: template.getAttribute('data-ok-label') || this.get('okLabel'),
                classNames: [ 'yui3-dynamic-dialog-ok', okClasses.split(' ') ],
                action: function(e) { e.preventDefault(); this.hide(); },
                section: Y.WidgetStdMod.FOOTER
            });
        }

        /* How should we align? */
        panel.on('visibleChange', function(e) {
            this.fire('visibleChange', {
                event: e,
                panel: panel
            });
        }, this);

        this.panels[ '#' + template.get('id') ] = panel;

        return panel;
    },

    /**
    Handle an event of the primary button being clicked, which fires a submit
    event. This attempts to emulate, within sanity, of a standard form.

    @method _defSubmitButtonFn
    @protected
    **/
    _defSubmitButtonFn: function(e) {
        this.fire('submit', {
            dialog:  e.dialog,
            trigger: e.trigger,
            form:    e.form,
            async:   e.async || false
        });
    },

    /**
    Submit the dialog, if applicable. If it's asynchronous, it will do it
    via `Y.io` using form serialization (`io-form`).

    @method defSubmitFn
    **/
    _defSubmitFn: function(e) {
        var dialog  = e.dialog,
            form    = e.form,
            async   = e.async,
            trigger = e.trigger || dialog.trigger,
            action  = form.getAttribute('action'),
            method  = form.getAttribute('method') || 'POST',
            cfg     = {};

        if ( !async ) {
            dialog.hide();
            form.submit();
            return;
        }


        cfg.method  = method.toUpperCase();
        cfg.form    = { id: form };
        cfg.context = this;
        cfg.arguments = {
            dialog         : dialog,
            form           : form,
            trigger        : trigger,
            preventDefault : e.preventDefault
        };
        cfg.on = {
            success: this._ioSuccess,
            failure: this._ioFailure
        };

        Y.io( action, cfg );
    },

    /**
    Handle a successful `Y.io` call, hides the dialog and fires the `ioSuccess`
    event.

    @method _ioSuccess
    **/
    _ioSuccess: function(id, o, args) {
        args.dialog.hide();
        args.response = o;
        this.fire( 'ioSuccess', args );
    },

    /**
    Handle a failed `Y.io` call (usually a bad request made to the
    backend), will not close the dialog but fire the `ioFailure` event.

    Will add the ioFailureClass to the bounding box of the panel in question.

    Will potentially shake the node to provide a visual indication of failure.

    @method _ioFailure
    **/
    _ioFailure: function(id, o, args) {
        var dialog    = args.dialog,
            form      = args.form,
            bounding  = dialog.get('boundingBox'),
            className = this.get('ioFailureClass');

        args.response = o;
        this.fire('ioFailure', args);

        bounding.addClass(className);

        this._shakeNode(bounding,
            Y.bind( function() {
                this.removeClass( className );
            }, bounding )
        );

        /* After a bit, remove the class automatically? */
        if ( o.responseText ) {
            dialog.setStdModContent( Y.WidgetStdMod.BODY, o.responseText );
        }
    },

    /**
    Shakes the node back and forth as a visual indication of failure, drawing
    attention to the dialog.

    @method _shakeNode
    @param node {Node} Node to shake
    @param callback {Function} Function to execute after the node is shaken.
    **/
    _shakeNode: function(node, callback) {
        var curX = node.getX(),
            curY = node.getY(),
            forwardX = curX + 5,
            anim;

        node.get('clientX');
        anim = new Y.Anim({
            node: node,
            to: {
                xy: [ forwardX, curY ]
            },
            duration: 0.01,
            iterations: 10,
            direction: 'alternate'
        });
        if ( callback && typeof callback === 'function' ) {
            anim.on('end', callback);
        }

        anim.run();

        return anim;
    }

}, {
    ATTRS: {
        /**
        Whether panels should be modal.

        @attribute modal
        @type boolean
        @default false
        **/
        modal             : { value: false },
        /**
        At what zIndex to create the Panels for.

        @attribute zIndex
        @type Number
        @default 1
        **/
        zIndex            : { value: 1 },
        /**
        What text should be used for the close indicator on the Panels
        @attribute closeLabel
        @type string
        @default \u2715
        **/
        closeLabel        : { value: "\u2715" },
        /**
        What text for the "Ok" button.
        @attribute okLabel
        @type String
        @default Ok
        **/
        okLabel           : { value: 'OK' },
        /**
        What text for the "Cancel" button.
        @attribute cancelLabel
        @type String
        @default Cancel
        **/
        cancelLabel       : { value: 'Cancel' },
        /**
        What text for the "Submit" button (if the dialog is a form).
        @attribute submitLabel
        @type String
        @default Submit
        **/
        submitLabel       : { value: 'Submit' },
        /**
        What to display if the backend fails (a 500 error, etc)
        @attribute remoteFailureText
        @type String
        @default `&lt;p&gt;There was a problem fetching the dialog content. Sorry&lt;/p&gt;`
        **/
        remoteFailureText : { value: '<p>There was a problem fetching the dialog content. Sorry.</p>' },
        /**
        Class to look for to determine if a dialog is merely `open` vs. `remote`
        @attribute dialogClass
        @type String
        @default open-dialog
        **/
        dialogClass       : { value: 'open-dialog' },
        /**
        Class to look for to determine if a dialog should load remote content.
        @attribute remoteClass
        @type String
        @default remote-dialog
        **/
        remoteClass       : { value: 'remote-dialog' },
        /**
        What class to apply to the dialog if a remote request fails.
        @attribute ioFailureClass
        @type String
        @default yui3-dynamic-dialog-io-failure
        **/
        ioFailureClass    : { value: 'yui3-dynamic-dialog-io-failure' }
    }
});

Y.DynamicDialog = DynamicDialog;



}, '@VERSION@' ,{requires:['anim','substitute','widget','base','panel','io','io-form','event-delegate']});
