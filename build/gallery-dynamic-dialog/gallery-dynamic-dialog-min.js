YUI.add("gallery-dynamic-dialog",function(h){var e,d=h.Panel,c=h.Lang,b=c.sub,g=c.isValue,a=c.isString,f=h.Object.each;e=h.Base.create("dynamicDialog",h.Base,[],{DIALOG_CLASS:"open-dialog",REMOTE_CLASS:"remote-dialog",REMOTE_FAILURE_TEXT:"<p>There was a problem fetching the dialog content. Sorry.</p>",IO_FAILURE_CLASS:"yui3-dynamic-dialog-io-failure",BUTTONS:{OK:"Ok",CANCEL:"Cancel",SUBMIT:"Submit"},container:h.one(document.body),panels:{},DEFAULT_EVENTS:{"a.open-dialog":"click","a.remote-dialog":"click"},initializer:function(){this.publish("submit",{defaultFn:this._defSubmitFn,preventable:true});},setupDelegates:function(){var i=this.container,j=this.DEFAULT_EVENTS,k=h.bind(this._triggerEventFn,this);f(j,function(m,l){i.delegate(m,k,l);});},_fetchDialogContent:function(n){var m=n.currentTarget,l=m.get("tagName")==="A"?m.get("href"):m.get("target"),k=m.getAttribute("data-async")==="true",o=(m.getAttribute("title")||""),p=h.bind(this._triggerEventFn,this),j=this.REMOTE_FAILURE_TEXT,i={method:"GET",on:{success:function(s,r){var q=h.one(h.config.doc.createDocumentFragment());q.append("<div>"+r.responseText+"</div>");q=q.one("div");q.setAttribute("data-async",k);q.setAttribute("title",o);n.dialogId=m.get("id");n.template=q;n.preventDefault=function(){};p(n);},failure:function(s,r){var q=h.one(h.config.doc.createDocumentFragment());q.append("<div>"+j+"</div>");q=q.one("div");q.setAttribute("data-async",k);q.setAttribute("title",o);n.dialogId=m.get("id");n.template=q;n.preventDefault=function(){};p(n);}}};h.io(l,i);},_triggerEventFn:function(p){var q=p.currentTarget,i=q.get("tagName")==="A"?q.get("href"):q.get("target"),t={},k=p.dialogId||i.substr(i.indexOf("#")),s=p.template||h.one(k),m=s?s.getAttribute("data-async")==="true":false,n=this.panels[k],o=q.get("attributes"),r=[];if(q.hasClass(this.REMOTE_CLASS)&&!s){p.preventDefault();return this._fetchDialogContent(p);}o.each(function(v){var u=v.get("name");if(u.match(/^data-/)){var w=q.getAttribute(u);if(w!==null){t[u.substr(5)]=w;}}});if(n||s){p.preventDefault();if(!n){n=this._setupDialog(q,s,t);}else{if(s){n.setStdModContent(h.WidgetStdMod.BODY,b(s.getContent(),t));}}var j=n.get("contentBox").one("form");if(j){var l=h.bind(this._defSubmitButtonFn,this);if(n.formListener){n.formListener.detach();}n.formListener=j.on("submit",function(u){u.preventDefault();u.async=m;u.dialog=this;u.trigger=q;u.form=this.get("contentBox").one("form");if(!u.form){throw"Form disappeared, was the dialog content replaced incorrectly?";}l(u);},n);}n.trigger=q;n.show();}},_setupDialog:function(m,s,t){var u=this,q=m.getAttribute("title")||s.getAttribute("title")||"",n=b(s.getContent(),t),r=m.getAttribute("data-modal")||s.getAttribute("data-modal")||this.get("modal"),i=null,p=this.BUTTONS,l=s.getAttribute("data-async")==="true",k=h.bind(this._defSubmitButtonFn,this),o=null,j=null;i=new d({headerContent:q,bodyContent:n,modal:r,centered:true});i.render(this.container);i.get("boundingBox").addClass("yui3-dynamic-dialog");o=i.get("contentBox");j=o.one("form");if(j){i.addButton({value:p.CANCEL,classNames:["yui3-dynamic-dialog-cancel"],action:function(v){v.preventDefault();this.hide();},section:h.WidgetStdMod.FOOTER});i.addButton({value:p.SUBMIT,classNames:["yui3-dynamic-dialog-submit"],action:function(v){v.preventDefault();v.async=l;v.dialog=this;v.trigger=this.trigger;v.form=this.get("contentBox").one("form");if(!v.form){throw"Form disappeared, was the dialog content replaced incorrectly?";}k(v);},section:h.WidgetStdMod.FOOTER});}else{i.addButton({value:p.OK,classNames:["yui3-dynamic-dialog-ok"],action:function(v){v.preventDefault();this.hide();},section:h.WidgetStdMod.FOOTER});}this.panels["#"+s.get("id")]=i;return i;},_defSubmitButtonFn:function(i){this.fire("submit",{dialog:i.dialog,trigger:i.trigger,form:i.form,async:i.async||false});},_defSubmitFn:function(o){var k=o.dialog,m=o.form,l=o.async,j=o.trigger||k.trigger,n=m.getAttribute("action"),p=m.getAttribute("method")||"POST",i={};if(!l){k.hide();m.submit();return;}i.method=p.toUpperCase();i.form={id:m};i.context=this;i.arguments={dialog:k,form:m,trigger:j};i.on={success:this._ioSuccess,failure:this._ioFailure};h.io(n,i);},_ioSuccess:function(k,j,i){i.dialog.hide();i.response=j;this.fire("ioSuccess",i);},_ioFailure:function(p,m,i){var j=i.dialog,l=i.form,n=j.get("boundingBox"),k=this.IO_FAILURE_CLASS;i.response=m;this.fire("ioFailure",i);n.addClass(k);this._shakeNode(n,h.bind(function(){this.removeClass(k);},n));if(m.responseText){j.setStdModContent(h.WidgetStdMod.BODY,m.responseText);}},_shakeNode:function(l,n){var k=l.getX(),j=l.getY(),i=k+5,m;l.get("clientX");m=new h.Anim({node:l,to:{xy:[i,j]},duration:0.01,iterations:10,direction:"alternate"});if(n&&typeof n==="function"){m.on("end",n);}m.run();return m;}},{ATTRS:{modal:{value:false}}});h.DynamicDialog=e;},"@VERSION@",{requires:["anim","substitute","widget","base","panel","io","io-form","event-delegate"]});