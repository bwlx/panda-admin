"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("crypto"),t=require("path");function s(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}require("fs");var o=s(e),n=s(t);const i="uni-cloud-s2s",r={code:5e4,message:"Config error"},c={code:51e3,message:"Access denied"};class a extends Error{constructor(e){super(e.message),this.errMsg=e.message||"",this.code=this.errCode=e.code,this.errSubject=e.subject,this.forceReturn=e.forceReturn||!1,this.cause=e.cause,Object.defineProperties(this,{message:{get(){return this.errMsg},set(e){this.errMsg=e}}})}toJSON(e=0){if(!(e>=10))return e++,{errCode:this.errCode,errMsg:this.errMsg,errSubject:this.errSubject,cause:this.cause&&this.cause.toJSON?this.cause.toJSON(e):this.cause}}}const d=Object.prototype.toString;const h=50002,u=Object.create(null);["string","boolean","number","null"].forEach((e=>{u[e]=function(t,s){if(function(e){return d.call(e).slice(8,-1).toLowerCase()}(t)!==e)return{code:h,message:`${s} is invalid`}}}));const f="Unicloud-S2s-Authorization";class g{constructor(e){const{config:t}=e||{};this.config=t;const{connectCode:s}=t||{};if(this.connectCode=s,!s||"string"!=typeof s)throw new a({subject:i,code:r.code,message:"Invalid connectCode in config"})}getHeadersValue(e={},t,s){const o=Object.keys(e||{}).find((e=>e.toLowerCase()===t.toLowerCase()));return o?e[o]:s}verifyHttpInfo(e){const t=this.getHeadersValue(e.headers,f,""),[s="",o=""]=t.split(" ");if(s.toLowerCase()==="CONNECTCODE".toLowerCase()&&o===this.config.connectCode)return!0;throw new a({subject:i,code:c.code,message:`Invalid CONNECTCODE in headers['${f}']`})}getSecureHeaders(e){return{[f]:`CONNECTCODE ${this.config.connectCode}`}}}function l(e){return function(t){const{content:s,signKey:n}=t||{};return o.default.createHash(e).update(s+"\n"+n).digest("hex")}}const p={md5:l("md5"),sha1:l("sha1"),sha256:l("md5"),"hmac-sha256":function(e){const{content:t,signKey:s}=e||{};return o.default.createHmac("sha256",s).update(t).digest("hex")}};function m(e){const{timestamp:t,data:s={},signKey:o,hashMethod:n="hmac-sha256"}=e||{},i=p[n],r=["number","string","boolean"],c=Object.keys(s).sort(),a=[];for(let e=0;e<c.length;e++){const t=c[e],o=s[t],n=typeof o;r.includes(n)&&a.push(`${t}=${o}`)}return i({content:`${t}\n${a.join("&")}`,signKey:o})}class w{constructor(e){const{config:t}=e||{};this.config=t;const{signKey:s,hashMethod:o="hmac-sha256",timeDiffTolerance:n=60}=t;if(!p[o])throw new a({subject:i,code:r.code,message:`Invalid hashMethod in config, expected "md5", "sha1", "sha256" or "hmac-sha256", got "${o}"`});if(!s||"string"!=typeof s)throw new a({subject:i,code:r.code,message:"Invalid signKey in config"});this.signKey=s,this.hashMethod=o,this.timeDiffTolerance=n}getHttpHeaders(e){return e.headers||{}}getHeadersValue(e,t,s){const o=Object.keys(e||{}).find((e=>e.toLowerCase()===t.toLowerCase()));return o?e[o]:s}getHttpData(e){const t=e.httpMethod.toLowerCase(),s=this.getHttpHeaders(e),o=this.getHeadersValue(s,"Content-Type","");if("get"===t)return e.queryStringParameters;if("post"!==t)throw new a({subject:i,code:c.code,message:`Invalid http method, expected "POST" or "get", got "${t}"`});if(0===o.indexOf("application/json"))return JSON.parse(e.body);if(0===o.indexOf("application/x-www-form-urlencoded"))return require("querystring").parse(e.body);throw new a({subject:i,code:c.code,message:`Invalid content type of POST method, expected "application/json" or "application/x-www-form-urlencoded", got "${o}"`})}verifyHttpInfo(e){const t=e.headers||{},s=this.getHeadersValue(t,"Unicloud-S2s-Timestamp","0");let[o,n]=this.getHeadersValue(t,"Unicloud-S2s-Signature","").split(" ");if(o=o.toLowerCase(),o!==this.hashMethod)throw new a({subject:i,code:c.code,message:`Invalid hash method, expected "${this.hashMethod}", got "${o}"`});const r=parseInt(s),d=Date.now();if(Math.abs(d-r)>1e3*this.timeDiffTolerance)throw new a({subject:i,code:c.code,message:`Invalid timestamp, server timestamp is ${d}, ${r} exceed max timeDiffTolerance(${this.timeDiffTolerance} seconds)`});return m({timestamp:r,data:this.getHttpData(e),signKey:this.signKey,hashMethod:this.hashMethod})===n}getSecureHeaders(e){const{data:t}=e||{},s=Date.now(),o=m({timestamp:s,data:t,signKey:this.signKey,hashMethod:this.hashMethod});return{"Unicloud-S2s-Timestamp":s+"","Unicloud-S2s-Signature":this.hashMethod+" "+o}}}const y=require("uni-config-center")({pluginId:i});class b{constructor(){this.config=y.config();const e=n.default.resolve(require.resolve("uni-config-center"),i,"config.json");if(!this.config)throw new a({subject:i,code:r.code,message:`${i} config required, please check your config file: ${e}`});if("connectCode"===this.config.type)this.verifier=new g({config:this.config});else{if(!function(e){return"sign"===e.type}(this.config))throw new a({subject:i,code:r.code,message:`Invalid ${i} config, expected policy is "code" or "sign", got ${this.config.policy}`});this.verifier=new w({config:this.config})}}verifyHttpInfo(e){if(!e)throw new a({subject:i,code:c.code,message:"Access denied, httpInfo required"});return this.verifier.verifyHttpInfo(e)}getSecureHeaders(e){return this.verifier.getSecureHeaders(e)}}exports.getSecureHeaders=function(e){return(new b).getSecureHeaders(e)},exports.verifyHttpInfo=function(e){const t=(new b).verifyHttpInfo(e);if(!t)throw new a({subject:i,code:c.code,message:c.message});return t};
