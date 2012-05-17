YUI.add('gallery-bootstrap', function(Y) {

/**

This sets up the Twitter Bootstrap Data API automatically, and loads all
Twitter Bootstrap components.

@module gallery-bootstrap
**/

/**
Twitter Bootstrap is a nice scaffolding for building applications that
function well and consistently, without needing to do a lot
yourself. This module handles that, and doesn't require any JavaScript.

See http://jshirley.github.com/bootstrap/javascript.html for more
information on this fork.

You will need to include the Bootstrap CSS. This is only the JavaScript.

@example

    YUI().use('gallery-bootstrap');

@class Bootstrap
**/

var NS = Y.namespace('Bootstrap');

NS.initializer = function(e) {

    //var tooltip = new NS.Tooltip({ selector : '*[rel=tooltip]' });

    NS.dropdown_delegation();
    NS.alert_delegation();
    NS.expandable_delegation();

    Y.all('*[data-provide=typeahead]').plug( NS.Typeahead );

    Y.all('*[data-toggle=tab]').each( function(node) {
        var tabview = new NS.TabView({ node: node });
    } );

    Y.one('body').delegate(
        'click',
        function(e) {
            var target    = e.currentTarget,
                options   = target.getData(),
                direction = options.slide,
                carousel_id,
                carousel;

            carousel_id = Y.one( this.getData('target') );
            if ( !carousel_id ) {
                carousel_id = this.get('href');
                if ( carousel_id ) {
                    carousel_id = carousel_id.replace(/.*(?=#[^\s]+$)/, '');
                    carousel = Y.one( carousel_id );
                }
            }
            if ( carousel ) {
                // Only prevent if there is actually a carousel
                e.preventDefault();

                if ( ! carousel.carousel ) {
                    carousel.plug( NS.Carousel, options );
                }
                carousel.carousel[direction]();
            }
        },
        '*[data-slide]'
    );

    Y.one('body').delegate(
        'click',
        function(e) {
            var target    = e.currentTarget,
                options   = target.getData(),
                id,
                node,

                type = 'modal';

            id = Y.one( this.getData('target') );
            if ( !id ) {
                id = this.get('href');
                if ( id ) {
                    id = id.replace(/.*(?=#[^\s]+$)/, '');
                    node = Y.one( id );
                }
            }
            if ( node ) {
                // Only prevent if there is actually a carousel
                e.preventDefault();

                if ( ! node[type] ) {
                    node.plug( NS.Modal, options );
                }
                node[type].show();
            }
        },
        '*[data-toggle=modal]'
    );
};

Y.on('domready', NS.initializer);



}, '@VERSION@' ,{requires:['gallery-bootstrap-misc','gallery-bootstrap-tooltip','gallery-bootstrap-tabview']});
