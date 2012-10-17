YUI.add("gallery-bt-slidetab",function(e){var a="widthChange",b="labelWidthChange",c="bst_",f={SLIDE:c+"slide",INDEX:c+"index",TAB:c+"tab"},d=e.Base.create("btslidetab",e.Widget,[e.WidgetStdMod,e.Bottle.SyncScroll],{initializer:function(){this.set("syncScrollMethod",this._updateSlide);this._bstEventHandlers=new e.EventHandle([this.after(b,this._updateSlide),e.once("btNative",this._nativeScroll,this)]);},destructor:function(){this._bstEventHandlers.detach();delete this._bstEventHandlers;},renderUI:function(){var i=this.get("slideNode"),g=e.Node.create('<div class="bst_slidebox"></div>'),h=new e.ScrollView({srcNode:i.replace(g)}).plug(e.zui.RAScroll);h.unplug(e.Plugin.ScrollViewScrollbars);h.render(g);h.get("boundingBox").setStyles({margin:"0 auto",width:this._percentWidth()+"px"}).addClass(f.INDEX);h.plug(e.zui.ScrollSnapper);h.pages.on("indexChange",function(j){if(j.newVal>-1){this.set("selectedIndex",j.newVal);}},this);this.set("scrollView",h);this._updateSlide();},_nativeScroll:function(){this.get("scrollView")._prevent={move:false,start:false,end:false};},_percentWidth:function(h){var g=h||this.get("labelWidth");return Math.floor(g*this.get("boundingBox").get("offsetWidth")/100);},_showNeighbors:function(h){var g=this.get("scrollView");if(g){g.get("boundingBox").setStyles({overflow:h?"visible":"hidden"});}},_updateSlide:function(){var i=this.get("scrollView"),j=this.get("showNeighbors"),h=i.pages.get("total"),g=this._percentWidth();this.get("labelNode").set("offsetWidth",g);if(i){if(j){this._showNeighbors(false);}i.set("width",g);if(h){i.pages.scrollTo(i.pages.get("index"),-1);}if(j){this._showNeighbors(true);}}}},{ATTRS:{selectedIndex:{value:0,lazyAdd:false,setter:function(h){var i=this.get("tabNode").get("children"),k=this.get("selectedIndex"),g=i.item(k),j=i.item(h);if(j&&(g!==j)){j.addClass("on");if(g){g.removeClass("on");}this.syncScroll();return h*1;}return k;}},scrollView:{writeOnce:true},slideNode:{lazyAdd:false,writeOnce:true,setter:function(g){return this.get("contentBox").one(g).addClass(f.SLIDE);}},labelNode:{lazyAdd:false,writeOnce:true,setter:function(g){return this.get("slideNode").all(g);}},labelWidth:{lazyAdd:false,validator:function(g){return(g>0)&&(g<=100);},setter:function(g){return g*1;}},showNeighbors:{lazyAdd:false,validator:e.Lang.isBoolean,setter:function(g){this._showNeighbors(g);return g;}},tabNode:{lazyAdd:false,writeOnce:true,setter:function(g){return this.get("contentBox").one(g).addClass(f.TAB);}}},HTML_PARSER:{slideNode:function(g){return g.getData("slide-node")||"> ul";},labelNode:function(g){return g.getData("label-node")||"> li";},labelWidth:function(g){return g.getData("label-width")||30;},showNeighbors:function(g){return(g.getData("show-neighbors")!=="false");},tabNode:function(g){return g.getData("tab-node")||"> div";},selectedIndex:function(g){return g.getData("selected-index")||0;}}});e.namespace("Bottle").SlideTab=d;},"@VERSION@",{requires:["gallery-bt-syncscroll","widget-stdmod","gallery-zui-rascroll","gallery-zui-scrollsnapper"]});