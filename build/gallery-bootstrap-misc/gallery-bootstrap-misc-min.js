YUI.add("gallery-bootstrap-misc",function(b){b.Widget.ATTRS.classNames={valueFn:function(){return[];}};b.mix(b.Widget.prototype,{_addExtraClassNames:function(){var q=this.get("boundingBox");b.Array.each(this.get("classNames"),function(r){q.addClass(r);},this);},_renderUI:function(){this._renderBoxClassNames();this._addExtraClassNames();this._renderBox(this._parentNode);},toggleView:function(){return this.set("visible",!this.get("visible"));}},true);var e=b.namespace("Bootstrap");function d(r){d.superclass.constructor.apply(this,arguments);this.config=b.mix(r,this.defaults);var q=this.config.selector;this._node=r.host;this.publish("close",{preventable:true,defaultFn:this._dismissAlertFn});this._node.delegate("click",function(s){this.fire("close");},q,this);}d.NAME="Bootstrap.Alert";d.NS="alert";b.extend(d,b.Plugin.Base,{defaults:{duration:0.5,selector:".close",transition:true,destroy:true},close:function(){this.fire("close",{currentTarget:this._node.one(".close")});},_dismissAlertFn:function(v){var u=v.currentTarget,w,q,t,r,s;if(b.instanceOf(this,d)){w=this._node;q=this.config;t=this;}else{w=v.target.ancestor("div."+(u.getData("dismiss")||"alert"));q=d.prototype.defaults;}r=q.destroy?true:false;s=function(){if(r){this.remove();}w.fire("closed");if(t){t.fire("closed");}};if(w){v.preventDefault();if(q.transition&&w.hasClass("fade")){w.transition({duration:q.duration,opacity:0},s);}else{w.hide();s();}}}});e.Alert=d;e._dropdownClickFn=function(t){var s=t.currentTarget,r=t.forceOpen,q;t.preventDefault();if(s.getAttribute("data-target")){q=b.one(s.getAttribute("data-target"));}else{if(s.getAttribute("href").indexOf("#")>=0){q=b.one(s.getAttribute("href").substr(s.getAttribute("href").indexOf("#")));}}if(!q){q=s.ancestor(".dropdown");if(!q){q=s.ancestor(".btn-group");}}if(q){if(typeof r==="undefined"){q.once("clickoutside",function(){q.removeClass("open");});q.toggleClass("open");}else{if(r){q.once("clickoutside",function(){q.removeClass("open");});q.addClass("open");}else{q.removeClass("open");}}}};e.dropdown_delegation=function(){b.delegate("click",e._dropdownClickFn,document.body,"*[data-toggle=dropdown]");};function h(q){this._node=q.host;this._node.on("click",e._dropdownClickFn);}h.NS="dropdown";h.prototype={open:function(){this.toggle(true);},close:function(){this.toggle(false);},toggle:function(q){e._dropdownClickFn({currentTarget:this._node,preventDefault:function(){},forceOpen:q});}};e.Dropdown=h;function p(q){p.superclass.constructor.apply(this,arguments);}p.NAME="Bootstrap.Collapse";p.NS="collapse";b.extend(p,b.Plugin.Base,{defaults:{duration:0.25,easing:"ease-in",showClass:"in",hideClass:"out",groupSelector:"> .accordion-group > .in"},transitioning:false,initializer:function(q){this._node=q.host;this.config=b.mix(q,this.defaults);this.publish("show",{preventable:true,defaultFn:this.show});this.publish("hide",{preventable:true,defaultFn:this.hide});this._node.on("click",this.toggle,this);},_getTarget:function(){var r=this._node,q;if(r.getData("target")){q=b.one(r.getData("target"));}else{if(r.getAttribute("href").indexOf("#")>=0){q=b.one(r.getAttribute("href").substr(r.getAttribute("href").indexOf("#")));}}return q;},hide:function(){var q=this.config.showClass,s=this.config.hideClass,r=this._getTarget();if(this.transitioning){return;}if(r){this._hideElement(r);}},show:function(){var s=this.config.showClass,w=this.config.hideClass,u=this._getTarget(),t=this._node,q=this,r,v=this.config.groupSelector;if(this.transitioning){return;}if(t.getData("parent")){r=b.one(t.getData("parent"));if(r){r.all(v).each(function(x){q._hideElement(x);});}}this._showElement(u);},toggle:function(r){if(r&&b.Lang.isFunction(r.preventDefault)){r.preventDefault();}var q=this._getTarget();if(q.hasClass(this.config.showClass)){this.fire("hide");}else{this.fire("show");}},_transition:function(u,q){var A=this,t=this.config,v=t.duration,x=t.easing,z=q==="hide"?t.showClass:t.hideClass,w=q==="hide"?t.hideClass:t.showClass,y=q==="hide"?0:null,r=q==="hide"?"hidden":"shown",s=function(){u.removeClass(z);u.addClass(w);A.transitioning=false;this.fire(r);};if(y===null){y=0;u.all("> *").each(function(B){y+=B.get("scrollHeight");});}this.transitioning=true;u.transition({height:y+"px",duration:v,easing:x},s);},_hideElement:function(q){this._transition(q,"hide");},_showElement:function(q){this._transition(q,"show");}});e.Collapse=p;function m(r){this._node=r.host;var q=b.mix(r,this.defaults);delete q.host;q.source=this.prepareSource(q.source_attribute);if(!r.resultTextLocator&&this._node.getAttribute("data-"+q.text_locator_attr)){q.resultTextLocator=this.getData(q.text_locator_attr);}if(!r.resultListLocator&&this._node.getAttribute("data-"+q.list_locator_attr)){q.resultListLocator=this.getData(q.list_locator_attr);}if(!r.resultFilters&&this._node.getAttribute("data-"+q.filters_attr)){q.resultFilters=this.getData(q.filters_attr);}if(typeof q.classNames==="undefined"){q.classNames=[];}q.classNames.push("yui3-skin-sam");this._node.plug(b.Plugin.AutoComplete,q);}m.NS="typeahead";m.prototype={defaults:{source_attribute:"source",text_locator_attr:"text-locator",list_locator_attr:"list-locator",filters_attr:"filters",maxResults:4,resultFilters:"phraseMatch",resultHighlighter:"phraseMatch",enableCache:true,queryDelay:100},prepareSource:function(q){var r=this._node.getData(q);try{r=b.JSON.parse(r);}catch(s){}return r;},getData:function(q){return this._node.getData(q);}};e.Typeahead=m;var o="contentBox",l="boundingBox",a="hide",n="in",c="header",g="body",k="footer",i="modal-",f=b.Base.create("BootstrapPanel",b.Panel,[],{show:function(){this.get(o).removeClass(a);this.get(o).addClass(n);this.set("visible",true);},hide:function(){this.get(o).addClass(a);this.get(o).removeClass(n);this.set("visible",false);},_findStdModSection:function(r){var q=this.get(o).one("> ."+i+r);return q;},_uiSetDefaultButton:function(s,r){var q=this.CLASS_NAMES.primary;if(s){s.addClass(q);}if(r){r.removeClass(q);}}},{HTML_PARSER:{headerContent:function(q){return this._parseStdModHTML(c);
},bodyContent:function(q){return this._parseStdModHTML(g);},footerContent:function(q){return this._parseStdModHTML(k);},buttons:function(s){var q="button,.btn",t=["header","body","footer"],r=null;b.Array.each(t,function(x){var u=this.get(o).one("."+i+x),w=u&&u.all(q),v;if(!w||w.isEmpty()){return;}v=[];w.each(function(y){v.push({srcNode:y});});r||(r={});r[x]=v;},this);return r;}},SECTION_CLASS_NAMES:{header:i+c,body:i+g,footer:i+k},CLASS_NAMES:{button:"btn",primary:"btn-primary"},TEMPLATES:{header:'<div class="'+i+c+'"></div>',body:'<div class="'+i+g+'"></div>',footer:'<div class="'+i+k+'"></div>'}});function j(q){j.superclass.constructor.apply(this,arguments);}j.NAME="Bootstrap.Modal";j.NS="modal";b.extend(j,b.Plugin.Base,{defaults:{backdrop:"static",keyboard:true,modal:true,rendered:true,show:true,hideOn:[{eventName:"clickoutside"}]},initializer:function(s){this._node=s.host;this.config=b.mix(s,this.defaults);this.publish("show",{preventable:true,defaultFn:this.show});this.publish("hide",{preventable:true,defaultFn:this.hide});this.config.srcNode=this._node;this.config.visible=this.config.show;this.config.rendered=this.config.rendered;var r=b.ButtonCore.CLASS_NAMES.BUTTON;b.ButtonCore.CLASS_NAMES.BUTTON="btn";var q=this.panel=new f(this.config);b.ButtonCore.CLASS_NAMES.BUTTON=r;q.get("contentBox").delegate("click",function(v){var u=v.currentTarget,t=u.getData("dismiss");if(t&&t==="modal"){v.preventDefault();this.fire("hide");}},".btn",this);if(this.config.show){this.fire("show");}},hide:function(){this.panel.hide();},show:function(){this.panel.show();}});e.Modal=j;},"@VERSION@",{requires:["plugin","panel","anim","transition","widget","event","event-outside","event-delegate","autocomplete","autocomplete-filters","autocomplete-highlighters","json"]});