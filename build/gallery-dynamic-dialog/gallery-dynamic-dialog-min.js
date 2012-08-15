YUI.add("gallery-dynamic-dialog",function(h){var e,d=h.Panel,c=h.Lang,b=c.sub,g=c.isValue,a=c.isString,f=h.Object.each;e=h.Base.create("dynamicDialog",h.Base,[],{container:h.one(document.body),panels:{},DEFAULT_EVENTS:{"a.open-dialog":"click","a.remote-dialog":"click"},initializer:function(){this.publish("submit",{defaultFn:this._defSubmitFn,preventable:true});this.publish("getSuccess",{defaultFn:this._triggerEventFn,preventable:true});this.publish("getFailure",{defaultFn:this._triggerEventFn,preventable:true});this.publish("show",{preventable:false});},setupDelegates:function(){var i=this.container,j=this.DEFAULT_EVENTS,k=h.bind(this._triggerEventFn,this);f(j,function(m,l){i.delegate(m,k,l);});},_fetchDialogContent:function(m){var n=m.currentTarget,i=n.get("tagName")==="A"?n.get("href"):n.get("target"),j=n.getAttribute("data-async")==="true",q=(n.getAttribute("title")||""),o=this,p=o.get("remoteFailureText"),k=this.get("cacheBust"),l={method:"GET",arguments:{dialog:o},on:{success:function(u,t,s){m.args=s;m.response=t;var r=h.one(h.config.doc.createDocumentFragment());r.append("<div>"+t.responseText+"</div>");r=r.one("div");r.setAttribute("data-async",j);r.setAttribute("title",q);m.dialogId=n.get("id");m.template=r;m.domTarget=m.currentTarget;o.fire("getSuccess",m);},failure:function(u,t,s){m.args=s;m.response=t;var r=h.one(h.config.doc.createDocumentFragment());r.append("<div>"+p+"</div>");r=r.one("div");r.setAttribute("data-async",j);r.setAttribute("title",q);m.dialogId=n.get("id");m.template=r;m.domTarget=m.currentTarget;o.fire("getFailure",m);}}};if(k){i=i+(i.indexOf("?")>=0?"&":"?")+k+"="+(new Date().getTime());}h.io(i,l);},open:function(i){var j=h.one(i),k={currentTarget:j,preventDefault:function(){},halt:function(){}};return this._dialogFromNode(k);},_triggerEventFn:function(i){this._dialogFromNode(i);},_dialogFromNode:function(p){var q=p.domTarget?p.domTarget:p.currentTarget,i=q.get("tagName")==="A"?q.get("href"):q.get("target"),t={},k=p.dialogId||i.substr(i.indexOf("#")),s=p.template||h.one(k),m=s?s.getAttribute("data-async")==="true":false,n=this.panels[k],o=q.get("attributes"),r=[];if(q.hasClass(this.get("remoteClass"))&&!s){p.preventDefault();return this._fetchDialogContent(p);}o.each(function(v){var u=v.get("name");if(u.match(/^data-/)){var w=q.getAttribute(u);if(w!==null){t[u.substr(5)]=w;}}});if(n||s){p.preventDefault();if(!n){n=this._setupDialog(q,s,t);}else{if(s){n.setStdModContent(h.WidgetStdMod.BODY,b(s.getContent(),t));}}var j=n.get("contentBox").one("form");if(j){var l=h.bind(this._defSubmitButtonFn,this);if(n.formListener){n.formListener.detach();}n.formListener=j.on("submit",function(u){u.preventDefault();u.async=m;u.dialog=this;u.trigger=q;u.form=this.get("contentBox").one("form");if(!u.form){throw"Form disappeared, was the dialog content replaced incorrectly?";}l(u);},n);}n.trigger=q;n.show();this.fire("show",{dialog:n,trigger:q});}return n;},_setupDialog:function(j,y,r){var p=this,z=j.getAttribute("title")||y.getAttribute("title")||"",s=b(y.getContent(),r),v=j.getAttribute("data-modal")||y.getAttribute("data-modal")||this.get("modal"),q=j.getAttribute("data-zindex")||this.get("zIndex"),n=null,k=y.getAttribute("data-async")==="true",w=h.bind(this._defSubmitButtonFn,this),x=this.get("closeLabel"),o=null,i=null;n=new d({headerContent:z,bodyContent:s,modal:v,centered:true,zIndex:q,buttons:[{value:x,section:h.WidgetStdMod.HEADER,classNames:["closer"],action:function(A){this.hide();}}]});n.render(this.container);n.get("boundingBox").addClass("yui3-dynamic-dialog");var m=y.getAttribute("data-dialog-class");if(m){n.get("boundingBox").addClass(m.split(" "));}o=n.get("contentBox");i=o.one("form");if(i){var u=j.getAttribute("data-cancel-class")||y.getAttribute("data-cancel-class")||"";n.addButton({value:j.getAttribute("data-cancel-label")||y.getAttribute("data-cancel-label")||this.get("cancelLabel"),classNames:["yui3-dynamic-dialog-cancel",u.split(" ")],action:function(A){A.preventDefault();this.hide();},section:h.WidgetStdMod.FOOTER});var l=j.getAttribute("data-submit-class")||y.getAttribute("data-submit-class")||"";n.addButton({value:j.getAttribute("data-submit-label")||y.getAttribute("data-submit-label")||this.get("submitLabel"),classNames:["yui3-dynamic-dialog-submit",l.split(" ")],action:function(A){A.preventDefault();A.async=k;A.dialog=this;A.trigger=this.trigger;A.form=this.get("contentBox").one("form");if(!A.form){throw"Form disappeared, was the dialog content replaced incorrectly?";}w(A);},section:h.WidgetStdMod.FOOTER});}else{var t=j.getAttribute("data-ok-class")||y.getAttribute("data-ok-class")||"";n.addButton({value:j.getAttribute("data-ok-label")||y.getAttribute("data-ok-label")||this.get("okLabel"),classNames:["yui3-dynamic-dialog-ok",t.split(" ")],action:function(A){A.preventDefault();this.hide();},section:h.WidgetStdMod.FOOTER});}n.on("visibleChange",function(A){this.fire("visibleChange",{event:A,panel:n,template:y});},this);this.panels["#"+y.get("id")]=n;return n;},_defSubmitButtonFn:function(i){this.fire("submit",{dialog:i.dialog,trigger:i.trigger,form:i.form,async:i.async||false});},_defSubmitFn:function(o){var k=o.dialog,m=o.form,l=o.async,j=o.trigger||k.trigger,n=m.getAttribute("action"),p=m.getAttribute("method")||"POST",i={};if(!l){k.hide();m.submit();return;}i.method=p.toUpperCase();i.form={id:m};i.context=this;i.arguments={dialog:k,form:m,trigger:j,preventDefault:o.preventDefault};i.on={success:this._ioSuccess,failure:this._ioFailure};h.io(n,i);},_ioSuccess:function(k,j,i){i.dialog.hide();i.response=j;this.fire("ioSuccess",i);},_ioFailure:function(p,m,i){var j=i.dialog,l=i.form,n=j.get("boundingBox"),k=this.get("ioFailureClass");i.response=m;this.fire("ioFailure",i);n.addClass(k);this._shakeNode(n,h.bind(function(){this.removeClass(k);},n));if(m.responseText){j.setStdModContent(h.WidgetStdMod.BODY,m.responseText);}},_shakeNode:function(l,n){var k=l.getX(),j=l.getY(),i=k+5,m;l.get("clientX");m=new h.Anim({node:l,to:{xy:[i,j]},duration:0.01,iterations:10,direction:"alternate"});
if(n&&typeof n==="function"){m.on("end",n);}m.run();return m;}},{ATTRS:{modal:{value:false},zIndex:{value:1},closeLabel:{value:"\u2715"},okLabel:{value:"OK"},cancelLabel:{value:"Cancel"},submitLabel:{value:"Submit"},remoteFailureText:{value:"<p>There was a problem fetching the dialog content. Sorry.</p>"},dialogClass:{value:"open-dialog"},remoteClass:{value:"remote-dialog"},ioFailureClass:{value:"yui3-dynamic-dialog-io-failure"},cacheBust:{value:null,setter:function(i){if(i&&!h.Lang.isString(i)){i="t";}return i;}}}});h.DynamicDialog=e;},"@VERSION@",{requires:["anim","substitute","widget","base","panel","io","io-form","event-delegate"]});