const TOKEN='https://auth.lsk-prod.app/realms/k-series/protocol/openid-connect/token';
const AUTH='https://auth.lsk-prod.app/realms/k-series/protocol/openid-connect/auth';
const BASE='https://api.lsk.lightspeed.app';
// Demo storage: Netlify Functions are stateless. For a real persistent deployment, bind a durable store
// (Netlify Blobs, KV, database) and replace loadTokens/saveTokens below. Never put CLIENT_SECRET in index.html.
let memoryTokens=null;
const env=k=>process.env[k];
const reply=(statusCode,body,headers={})=>({statusCode,headers:{'Content-Type':'application/json',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
const basic=()=>Buffer.from(`${env('LS_CLIENT_ID')}:${env('LS_CLIENT_SECRET')}`).toString('base64');
async function token(body){const r=await fetch(TOKEN,{method:'POST',headers:{Authorization:`Basic ${basic()}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(body)});const d=await r.json();if(!r.ok)throw new Error(d.error_description||d.error||'Token request failed');return d}
async function loadTokens(){return memoryTokens}
async function saveTokens(t){memoryTokens={...t,expires_at:Date.now()+(t.expires_in*1000)}}
async function access(){let t=await loadTokens();if(!t)throw new Error('Not connected');if(Date.now()>t.expires_at-60000){t=await token({grant_type:'refresh_token',refresh_token:t.refresh_token});await saveTokens(t)}return t.access_token}
async function ls(path,opt={}){const a=await access();const r=await fetch(BASE+path,{...opt,headers:{Authorization:`Bearer ${a}`,'Content-Type':'application/json',...(opt.headers||{})}});const txt=await r.text();let d;try{d=JSON.parse(txt)}catch{d={raw:txt}}if(!r.ok)throw new Error(d.message||d.error||`Lightspeed HTTP ${r.status}`);return d}
exports.handler=async(event)=>{try{const q=event.queryStringParameters||{}, action=q.action;const redirect=env('LS_REDIRECT_URI');if(action==='login'){const u=new URL(AUTH);u.searchParams.set('response_type','code');u.searchParams.set('client_id',env('LS_CLIENT_ID'));u.searchParams.set('redirect_uri',redirect);u.searchParams.set('scope','orders-api staff-api offline_access');return {statusCode:302,headers:{Location:u.toString()},body:''}}
if(action==='callback'||q.code){const t=await token({grant_type:'authorization_code',code:q.code,redirect_uri:redirect});await saveTokens(t);return {statusCode:302,headers:{Location:'/?connected=1'},body:''}}
if(action==='session')return reply(200,{connected:!!(await loadTokens())});
if(action==='businesses')return reply(200,await ls('/o/op/data/businesses'));
if(action==='devices'){const id=q.businessLocationId;if(!id)return reply(400,{error:'businessLocationId required'});const d=await ls(`/staff/v1/businessLocations/${encodeURIComponent(id)}/shift?page=1&size=100&sort=date,desc`);const shifts=d?.data?.shifts||[];const map=new Map();for(const s of shifts){if(s.deviceId&&!map.has(String(s.deviceId)))map.set(String(s.deviceId),{deviceId:s.deviceId,staffId:s.staffId,lastSeen:s.dateInUTC})}return reply(200,[...map.values()])}
if(action==='send'&&event.httpMethod==='POST'){const b=JSON.parse(event.body||'{}');if(!b.businessLocationId||!b.message)return reply(400,{error:'Location and message required'});const d=await ls(`/o/op/1/printMsg?businessLocationId=${encodeURIComponent(b.businessLocationId)}`,{method:'POST',body:JSON.stringify({message:b.message,alsoToPrinter:false})});return reply(200,d)}
return reply(404,{error:'Unknown action'});}catch(e){return reply(500,{error:e.message})}}
