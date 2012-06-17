var Ysub  = Y.Lang.sub,
    Yeach = Y.Array.each,

StarRatingWidget = function(config) {
    StarRatingWidget.superclass.constructor.apply(this, arguments);
};

Y.mix(StarRatingWidget, {
    NAME: 'StarRatingWidget',
    NS:   'star-widget',

    ATTRS: {
        'name':       { },
        'captionEl':  { },
        'caption':    { },
        'theme':      { },
        'min':        { value: 0 },
        'max':        { value: 5 },
        'allowClear': { value: true },
        'readOnly':   { value: false },
        'value': {
            value: null,
            validator: function(val) { return this._validateValue(val); }
        },
        'options': {
            value: []
        },
        'input': { value: null }
    }
});

Y.extend(StarRatingWidget, Y.Widget, {
    STAR_SELECTOR:        '.yui3-star',
    ACTIVE_STAR_CLASS:    'yui3-star-selected',
    HOVER_STAR_CLASS:     'yui3-star-hover',
    STAR_LIST_TEMPLATE:   '{stars}',
    STAR_CANCEL_TEMPLATE: '<label class="yui3-star-clear"><input type="radio" name="{name}" value=""><span>{label}</span></label>',
    STAR_ITEM_TEMPLATE:   '<label class="yui3-star"><input type="radio" name="{name}" value="{value}"><span>{label}</span></label>',

    initializer: function(config) {
        var options = this.get('options');
        if ( options.length < 1 ) {
            throw "No options is a terrible rating widget.";
        }
        this.set('max', options.length);
        /* Don't count the null option if there */
        if ( options[0][0] === null ) {
            this.set('max', options.length - 1);
        }

        if ( this.get('captionEl') && typeof this.get('captionEl') === 'function' ) {
            this.set('captionEl', this.get('captionEl').call(this) );
        }

        if ( this.get('readOnly') ) {
            this.set('allowClear', false);
        }

        return this;
    },

    renderUI: function() {
        var stars   = '',
            name    = this.get('name'),
            options = this.get('options'),
            value   = this.get('value'),
            clearLabel = 'Clear';

        if ( this.get('allowClear') ) {
            if ( options[0][0] === null ) {
                clearLabel = options[0][1];
            }
            stars += Ysub( this.STAR_CANCEL_TEMPLATE,
                {
                    label: clearLabel,
                    name:  name
                }
            );
        }

        Yeach( this.get('options'), function(option) {
            /* Null option is a 'Clear' */
            if ( option[0] !== null ) {
                stars += Ysub( this.STAR_ITEM_TEMPLATE,
                    {
                        name:  this.get('name'),
                        value: option[0],
                        label: option[1]
                    }
                );
            }
        }, this);

        this.get('contentBox').append(
            Ysub(this.STAR_LIST_TEMPLATE, { 'stars': stars } )
        );
    },

    bindUI: function() {
        var links  = this.get('contentBox').all('label'),
            stars  = this.get('contentBox').all('.yui3-star span');

        if (!this.get('readOnly')) {
            links.on('click',     this._defClickFn, this);
            stars.on('mouseover', this._defMouseOverFn, this);
            stars.on('mouseout',  this._defMouseOutFn, this);

            this.after('valueChange', this.syncUI, this);

            if ( this.get('captionEl') ) {
                this.after('captionChange', this.updateCaption, this);
            }
        }
    },

    syncUI: function() {
        var nodes       = this.get('contentBox').all(this.STAR_SELECTOR),
            enableClass = this.ACTIVE_STAR_CLASS,
            value       = this.get('value'),
            input       = this.get('input');
        nodes.removeClass(enableClass);
        if ( value !== null ) {
            nodes.each(
                function(el) {
                    var input  = el.one('input'),
                        el_val = this._valueFromElement(input);
                    input.set('checked', false);
                    input.removeAttribute('checked');
                    if ( Y.Lang.isNumber(el_val) && el_val <= value ) {
                        el.addClass(enableClass);
                        /* Make sure the markup element is selected */
                        if ( el_val === value ) {
                            input.set('checked',  true);
                            input.setAttribute('checked',  true);
                        }
                    }
                }, this
            );
        } else {
        }
    },

    updateCaption: function() {
        var element = this.get('captionEl'),
            caption = this.get('caption');
        if ( !element ) {
            return;
        }

        element.setContent( caption === null ? '' : caption );
    },

    _validateValue: function(val) {
        var min = this.get('min'),
            max = this.get('max');
        if ( val === null ) {
            return true;
        }

        return ( Y.Lang.isNumber(val) && val >= min && val <= max );
    },

    _defClickFn: function(e) {
        var value = this._valueFromElement(e.currentTarget);
        this.set('value', value);
    },

    _defMouseOverFn: function(e) {
        var nodes       = this.get('contentBox').all(this.STAR_SELECTOR),
            enableClass = this.HOVER_STAR_CLASS,
            value       = this._valueFromElement( e.currentTarget ),
            title       = e.currentTarget.getContent();

        nodes.removeClass(enableClass);
        nodes.each(
            function(el) {
                var el_val = this._valueFromElement( el.one('input') );
                if ( Y.Lang.isNumber(el_val) && el_val <= value ) {
                    el.addClass(enableClass);
                }
            }, this
        );
        if ( title ) {
            this.set('caption', title);
        }
    },

    _defMouseOutFn: function(e) {
        var nodes = this.get('contentBox').all(this.STAR_SELECTOR);
        nodes.removeClass(this.HOVER_STAR_CLASS);
        this.set('caption', null);
    },

    _valueFromElement: function(element) {
        if ( element.get('tagName') === 'SPAN' ) {
            element = element.ancestor('label');
        }
        if ( element.get('tagName') === 'LABEL' ) {
            element = element.one('input');
        }
        if ( element.get('tagName') === 'INPUT' ) {
            if ( element.get('value') === '' ) {
                return null;
            }
            return parseInt( element.get('value'), 10 );
        }
        return null;
        /*
        if ( href.indexOf('#clear') >= 0 ) {
            return null;
        }

        return parseInt( href.substr(href.indexOf('#') + 1), 10 );
        */
    }
});

Y.StarRating = StarRatingWidget;

/**
 * Provides a Star Rating widget by transforming a SELECT element into
 * a graphical, clickable Star rating.
 *
 * Based off the jQuery Stars plugin.
 *
 * @module gallery-star-rating
 * @requires plugin, node, event
*/
var StarRatingPlugin = function(config) {
    StarRatingPlugin.superclass.constructor.apply(this, arguments);
};

Y.mix(StarRatingPlugin, {
    NAME: 'StarRatingPlugin',
    NS:   'stars',
    ATTRS: {
        'captionEl'       : { },
        'theme'           : { value: 'jquery' },
        'target'          : { }
    }
});

Y.extend(StarRatingPlugin, Y.Plugin.Base, {
    widget: null,

    initializer: function(config) {
        var host       = this.get('host'),
            allowClear = false,
            setValue   = null,
            options    = [];

        host.all('option').each(
            function(el) {
                var value = el.getAttribute('value') === '' ? null : el.get('value');
                if ( value === null ) {
                    allowClear = true;
                }
                if ( el.getAttribute('selected') ) {
                    setValue = parseInt(value, 10);
                }
                options.push([ value, el.getContent() ]);
            },
            this
        );

        this.widget = new StarRatingWidget({
            name:       host.get('name'),
            captionEl:  this.get('captionEl'),
            options:    options,
            boundingBox: host.get('parentNode'),
            input:      host,
            value:      setValue,
            allowClear: allowClear,
            readOnly:   host.get('disabled')
        }).render();

        /* Disable the select, we don't want it to submit since we're replacing
           it with radio buttons
        */
        host.set('disabled', true);
        host.hide();
    }
});

Y.namespace('Plugin').StarRating = StarRatingPlugin;
