//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/classes/bignumber [rev. #4]
//Minified with https://jscompress.com/
//Used to handle Long type because js is retarded.

with(BigNumber=function(a,b,c){var e,d=this;if(a instanceof BigNumber){for(e in{precision:0,roundType:0,_s:0,_f:0})d[e]=a[e];return void(d._d=a._d.slice())}for(d.precision=isNaN(b=Math.abs(b))?BigNumber.defaultPrecision:b,d.roundType=isNaN(c=Math.abs(c))?BigNumber.defaultRoundType:c,d._s="-"==(a+="").charAt(0),d._f=((a=a.replace(/[^\d.]/g,"").split(".",2))[0]=a[0].replace(/^0+/,"")||"0").length,e=(a=d._d=(a.join("")||"0").split("")).length;e;a[--e]=+a[e]);d.round()},{$:BigNumber,o:BigNumber.prototype})$.ROUND_HALF_EVEN=($.ROUND_HALF_DOWN=($.ROUND_HALF_UP=($.ROUND_FLOOR=($.ROUND_CEIL=($.ROUND_DOWN=($.ROUND_UP=0)+1)+1)+1)+1)+1)+1,$.defaultPrecision=40,$.defaultRoundType=$.ROUND_HALF_UP,o.add=function(a){if(this._s!=(a=new BigNumber(a))._s)return a._s^=1,this.subtract(a);var g,h,b=new BigNumber(this),c=b._d,d=a._d,e=b._f,f=a._f,a=Math.max(e,f);for(e!=f&&((f=e-f)>0?b._zeroes(d,f,1):b._zeroes(c,-f,1)),g=(e=c.length)==(f=d.length)?c.length:((f=e-f)>0?b._zeroes(d,f):b._zeroes(c,-f)).length,h=0;g;h=(c[--g]=c[g]+d[g]+h)/10>>>0,c[g]%=10);return h&&++a&&c.unshift(h),b._f=a,b.round()},o.subtract=function(a){if(this._s!=(a=new BigNumber(a))._s)return a._s^=1,this.add(a);var i,j,b=new BigNumber(this),c=b.abs().compare(a.abs())+1,d=c?b:a,e=c?a:b,f=d._f,g=e._f,h=f;for(d=d._d,e=e._d,f!=g&&((g=f-g)>0?b._zeroes(e,g,1):b._zeroes(d,-g,1)),i=(f=d.length)==(g=e.length)?d.length:((g=f-g)>0?b._zeroes(e,g):b._zeroes(d,-g)).length;i;){if(d[--i]<e[i]){for(j=i;j&&!d[--j];d[j]=9);--d[j],d[i]+=10}e[i]=d[i]-e[i]}return c||(b._s^=1),b._f=h,b._d=e,b.round()},o.multiply=function(a){var i,j,k,b=new BigNumber(this),c=b._d.length>=(a=new BigNumber(a))._d.length,d=(c?b:a)._d,e=(c?a:b)._d,f=d.length,g=e.length,h=new BigNumber;for(i=g;i;c&&k.unshift(c),h.set(h.add(new BigNumber(k.join("")))))for(k=new Array(g- --i).join("0").split(""),c=0,j=f;j;c+=d[--j]*e[i],k.unshift(c%10),c=c/10>>>0);return b._s=b._s!=a._s,b._f=((c=f+g-b._f-a._f)>=(j=(b._d=h._d).length)?this._zeroes(b._d,c-j+1,1).length:j)-c,b.round()},o.divide=function(a){if("0"==(a=new BigNumber(a)))throw new Error("Division by 0");if("0"==this)return new BigNumber;var i,j,k,b=new BigNumber(this),c=b._d,d=a._d,e=c.length-b._f,f=d.length-a._f,g=new BigNumber,h=0,l=1,m=0,n=0;for(g._s=b._s!=a._s,g.precision=Math.max(b.precision,a.precision),g._f=+g._d.pop(),e!=f&&b._zeroes(e>f?d:c,Math.abs(e-f)),a._f=d.length,d=a,d._s=!1,d=d.round(),a=new BigNumber;"0"==c[0];c.shift());a:do{for(k=m=0,"0"==a&&(a._d=[],a._f=0);h<c.length&&a.compare(d)==-1;++h){if(k=h+1==c.length,(!l&&++m>1||(n=k&&"0"==a&&"0"==c[h]))&&(g._f==g._d.length&&++g._f,g._d.push(0)),"0"==c[h]&&"0"==a||(a._d.push(c[h]),++a._f),n)break a;if(k&&a.compare(d)==-1&&(g._f==g._d.length&&++g._f,1)||(k=0))for(;g._d.push(0),a._d.push(0),++a._f,a.compare(d)==-1;);}if(l=0,a.compare(d)==-1&&!(k=0))for(;k?g._d.push(0):k=1,a._d.push(0),++a._f,a.compare(d)==-1;);for(j=new BigNumber,i=0;a.compare(y=j.add(d))+1&&++i;j.set(y));a.set(a.subtract(j)),!k&&g._f==g._d.length&&++g._f,g._d.push(i)}while((h<c.length||"0"!=a)&&g._d.length-g._f<=g.precision);return g.round()},o.mod=function(a){return this.subtract(this.divide(a).intPart().multiply(a))},o.pow=function(a){var c,b=new BigNumber(this);if(0==(a=new BigNumber(a).intPart()))return b.set(1);for(c=Math.abs(a);--c;b.set(b.multiply(this)));return a<0?b.set(new BigNumber(1).divide(b)):b},o.set=function(a){return this.constructor(a),this},o.compare=function(a){var g,h,b=this,c=this._f,d=new BigNumber(a),e=d._f,f=[-1,1];if(b._s!=d._s)return b._s?-1:1;if(c!=e)return f[c>e^b._s];for(c=(b=b._d).length,e=(d=d._d).length,g=-1,h=Math.min(c,e);++g<h;)if(b[g]!=d[g])return f[b[g]>d[g]^b._s];return c!=e?f[c>e^b._s]:0},o.negate=function(){var a=new BigNumber(this);return a._s^=1,a},o.abs=function(){var a=new BigNumber(this);return a._s=0,a},o.intPart=function(){return new BigNumber((this._s?"-":"")+(this._d.slice(0,this._f).join("")||"0"))},o.valueOf=o.toString=function(){var a=this;return(a._s?"-":"")+(a._d.slice(0,a._f).join("")||"0")+(a._f!=a._d.length?"."+a._d.slice(a._f).join(""):"")},o._zeroes=function(a,b,c){var d=["push","unshift"][c||0];for(++b;--b;a[d](0));return a},o.round=function(){if("_rounding"in this)return this;var d,e,f,g,a=BigNumber,b=this.roundType,c=this._d;for(this._rounding=!0;this._f>1&&!c[0];--this._f,c.shift());for(d=this._f,e=this.precision+d,f=c[e];c.length>d&&!c[c.length-1];c.pop());return g=(this._s?"-":"")+(e-d?"0."+this._zeroes([],e-d-1).join(""):"")+1,c.length>e&&(f&&b!=a.DOWN&&(b==a.UP||(b==a.CEIL?!this._s:b==a.FLOOR?this._s:b==a.HALF_UP?f>=5:b==a.HALF_DOWN?f>5:b==a.HALF_EVEN&&(f>=5&&1&c[e-1])))&&this.add(g),c.splice(e,c.length-e)),delete this._rounding,this};