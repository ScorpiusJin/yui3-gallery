function TypeaheadPlugin(config) {
    this._node   = config.host;

    var cfg = Y.mix( config, this.defaults );

    delete cfg.host;

    cfg.source = this.prepareSource( cfg.source_attribute );

    if ( !config.resultTextLocator && this._node.getAttribute('data-' + cfg.text_locator_attr) ) {
        cfg.resultTextLocator = this.getData(cfg.text_locator_attr);
    }

    if ( !config.resultListLocator && this._node.getAttribute('data-' + cfg.list_locator_attr) ) {
        cfg.resultListLocator = this.getData(cfg.list_locator_attr);
    }

    if ( !config.resultFilters && this._node.getAttribute('data-' + cfg.filters_attr) ) {
        cfg.resultFilters = this.getData(cfg.filters_attr);
    }
    if ( typeof cfg.classNames === 'undefined' ) {
        cfg.classNames = [];
    }

    cfg.classNames.push('yui3-skin-sam');

    this._node.plug( Y.Plugin.AutoComplete, cfg );
}

TypeaheadPlugin.NS = 'typeahead';

TypeaheadPlugin.prototype = {
    defaults : {
        source_attribute : 'source',
        text_locator_attr: 'text-locator',
        list_locator_attr: 'list-locator',
        filters_attr     : 'filters',

        // Pass through configuration for the AutoComplete
        maxResults       : 4,
        resultFilters    : 'phraseMatch',
        resultHighlighter: 'phraseMatch',
        enableCache      : true,
        queryDelay       : 100
    },

    prepareSource : function(attr) {
        var data = this._node.getData( attr );
        // If it parses as JSON, then we will parse that and return it.
        // Otherwise it may be a URI.
        try {
            data = Y.JSON.parse(data);
        } catch(e) {
            /* Data is not JSON, just skip parsing it */
        }
        return data;
    },

    getData : function(attr) {
        return this._node.getData(attr);
    }
};

NS.Typeahead = TypeaheadPlugin;

