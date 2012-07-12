YUI.add("gallery-radial-progress",function(d){var b=d.Lang.isNumber,a=d.Array.each,c;c=d.Base.create("radialProgress",d.Widget,[],{graphic:null,outline:null,slice:null,renderUI:function(){var j=this.get("contentBox"),g=j.getXY(),i=g[0],h=g[1],f=new d.Graphic({autoSize:true}),m=this.get("size"),l=this.get("colorstops"),e,k;e=this.outline=f.addShape({type:d.Circle,radius:m,x:i,y:h,stroke:{weight:1,color:l[0].outline},fill:{color:l[0].progress}});k=this.slice=f.addShape({type:"pieslice",radius:m-1,startAngle:-90,x:i+m,y:h+m,fill:{color:l[0].background},stroke:{weight:0}});f.render(j);this.graphic=f;return this;},bindUI:function(){this.after("progressChange",this._updateProgress,this);},syncUI:function(){this._updateProgress();},increment:function(e){if(b(e)&&e>0){e=parseFloat(e,10);}else{e=1;}this.set("progress",this.get("progress")+e);return this;},decrement:function(e){if(b(e)&&e>0){e=parseFloat(e,10);}else{e=1;}this.set("progress",this.get("progress")-e);return this;},update:function(e){if(b(e)){return this.set("progress",parseFloat(e,10));}throw"Invalid update, must pass in a number\n";},_updateProgress:function(){var g=this.outline,j=this.slice,i=this.get("colorstops"),e=this.get("progress"),f=Math.ceil(e*3.6),h=false;if(f>=360||f<=-360){this.fire("complete");return;}a(i,function(k){if(f>=k.from&&!h){j.set("fill",{"color":k.progress});g.set("fill",{"color":k.background});g.set("stroke",{weight:1,color:k.outline});h=true;return;}});j.set("arc",f);}},{ATTRS:{progress:{value:0},size:{value:60},colorstops:{value:[{from:0,background:"#eee",outline:"#ccc",progress:"#fff"}]}}});d.RadialProgress=c;},"@VERSION@",{requires:["widget","base","graphics"]});