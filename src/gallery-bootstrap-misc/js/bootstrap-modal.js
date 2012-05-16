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
            Y.log('Finding content section: ' + section);
            var node = this.get(CONTENT_BOX).one("> ." + PREFIX + section);
            Y.log(node);
            return node;
        },
        _uiSetDefaultButton: function (newButton, oldButton) {
            var primaryClassName = this.CLASS_NAMES.primary;
            Y.log('_uiSetDefaultButton: ' + primaryClassName); 
            newButton && newButton.addClass(primaryClassName);
            oldButton && oldButton.removeClass(primaryClassName);
        }
    },
    {
        HTML_PARSER : {
            headerContent : function(contentBox) {
                Y.log('parse header: ' + HEADER);
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
                    Y.log('Finding buttons in ' + section);
                    var container = this.get(CONTENT_BOX).one('.' + PREFIX + section),
                        buttons   = container && container.all(buttonSelector),
                        sectionButtons;
                    Y.log(container);
                    Y.log(buttons);
                    if ( !buttons || buttons.isEmpty() ) { return; }

                    sectionButtons = [];
                    Y.log(this.get('classNames'));
                    buttons.each( function(button) {
                        Y.log(button.get('className'));
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
        Y.log('hide that panel, all day long.');
        this.panel.hide();
    },

    show: function() {
        this.panel.show();
    }
});

NS.Modal = ModalPlugin;

