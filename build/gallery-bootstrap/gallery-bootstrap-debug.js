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
    Y.log('initializer!');

    new NS.Tooltip({ selector : '*[rel=tooltip]' });

    NS.dropdown_delegation();
    NS.alert_delegation();
    NS.expandable_delegation();

    Y.all('*[data-provide=typeahead]').plug( NS.Typeahead );

    Y.all('*[data-toggle=tab]').each( function(node) {
        Y.log('Creating a Bootstrap.TabView: ' + node);
        new NS.TabView({ node: node })
    } );
};

Y.on('domready', NS.initializer);



}, '@VERSION@' ,{requires:['gallery-bootstrap-misc','gallery-bootstrap-tooltip','gallery-bootstrap-tabview']});
