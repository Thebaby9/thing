(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))o(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&o(d)}).observe(document,{childList:!0,subtree:!0});function n(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function o(a){if(a.ep)return;a.ep=!0;const i=n(a);fetch(a.href,i)}})();const U="todo-tasks-v2",F={high:{label:"高",color:"#ef4444",soft:"#fef2f2"},medium:{label:"中",color:"#f59e0b",soft:"#fffbeb"},low:{label:"低",color:"#16a34a",soft:"#f0fdf4"}},I={life:{label:"生活",icon:"🏠",color:"#0d9488",soft:"#f0fdfa"},work:{label:"工作",icon:"💼",color:"#2563eb",soft:"#eff6ff"},study:{label:"学习",icon:"📚",color:"#7c3aed",soft:"#f5f3ff"},health:{label:"健康",icon:"💪",color:"#ea580c",soft:"#fff7ed"},other:{label:"其他",icon:"📌",color:"#64748b",soft:"#f8fafc"}},q=["今天要做什么?","比如: 喝一杯水 💧","比如: 运动 30 分钟 🏃","比如: 回一封重要邮件 📧","比如: 计划明天的小目标 🎯"],M=5*60*1e3,X=10*60*1e3,l=document.querySelector("#app"),S=!!window.Capacitor&&window.Capacitor.isNativePlatform();let s=ee(),f="all",E="all",v=null,$=null,p=null;function R(e){return Math.abs(Math.floor(e.id))%2e9}function G(e=new Date){return`${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`}function C(e){const t=new Date(e.remindAt),n=new Date;return n.setHours(t.getHours(),t.getMinutes(),0,0),n}function z(e){return e.daily?C(e).getTime():new Date(e.remindAt).getTime()}function j(e){return!e.remindAt||e.done?!1:Date.now()>z(e)+X}function Z(){try{navigator.vibrate&&navigator.vibrate([300,150,300,150,500])}catch{}if(S)try{window.Capacitor.Plugins.Haptics.vibrate({duration:800})}catch{}}async function J(e){if(!(!S||!e.remindAt))try{const{LocalNotifications:t}=window.Capacitor.Plugins;await t.requestPermissions();const n=R(e),o=[];if(e.daily){const a=new Date(e.remindAt),i=new Date(a.getTime()+M);o.push({id:n,title:"待办提醒",body:e.text,schedule:{on:{hour:a.getHours(),minute:a.getMinutes()},allowWhileIdle:!0,repeats:!0}}),o.push({id:n+1,title:"再次提醒 ⏰",body:e.text,schedule:{on:{hour:i.getHours(),minute:i.getMinutes()},allowWhileIdle:!0,repeats:!0}})}else{const a=new Date(e.remindAt).getTime();o.push({id:n,title:"待办提醒",body:e.text,schedule:{at:new Date(a),allowWhileIdle:!0}});const i=a+M;i>Date.now()&&o.push({id:n+1,title:"再次提醒 ⏰",body:e.text,schedule:{at:new Date(i),allowWhileIdle:!0}})}await t.schedule({notifications:o})}catch{}}async function O(e){if(!(!S||!e.remindAt))try{const{LocalNotifications:t}=window.Capacitor.Plugins,n=R(e);await t.cancel({notifications:[{id:n},{id:n+1}]})}catch{}}function ee(){try{const e=localStorage.getItem(U);return(e?JSON.parse(e):[]).map(n=>({...n,priority:F[n.priority]?n.priority:"medium",category:I[n.category]?n.category:"life",daily:!!n.daily}))}catch{return[]}}function g(){localStorage.setItem(U,JSON.stringify(s))}function te(e,t,n,o,a){s.unshift({id:Date.now()+Math.random(),text:e,done:!1,priority:t,category:o,daily:a,remindAt:n||null,notified:!1,reNotified:!1,firedDay:null,alert2:!1,lastDoneDay:null}),g(),c()}function W(e){const t=s.find(n=>n.id===e);t&&(t.done=!t.done,t.done?(O(t),t.daily&&(t.lastDoneDay=G())):(t.lastDoneDay=null,t.remindAt&&(t.notified=!1,t.reNotified=!1,t.firedDay=null,t.alert2=!1,(t.daily||z(t)>Date.now())&&J(t))),g(),c())}function ie(e){const t=s.find(n=>n.id===e);t&&O(t),s=s.filter(n=>n.id!==e),g(),c()}function K(e,t,n){const o=s.find(a=>a.id===e);o&&(o.text=t,o.priority=n,g()),v=null,c()}function ne(){for(const e of s)e.done&&O(e);s=s.filter(e=>!e.done),g(),c()}function oe(){for(const e of s)O(e);s=[],$=null,g(),c()}function ae(e){const t=F[e];return`<span class="priority-badge" style="background:${t.soft};color:${t.color}">${t.label}</span>`}function le(e){const t=I[e];return`<span class="cat-badge" style="background:${t.soft};color:${t.color}">${t.icon} ${t.label}</span>`}function re(e){var a;const t=new Date(e);if(Number.isNaN(t.getTime()))return"";const n=i=>String(i).padStart(2,"0"),o=`${n(t.getHours())}:${n(t.getMinutes())}`;return(a=s.find(i=>i.remindAt===e))!=null&&a.daily?`每天 ${o}`:`${t.getMonth()+1}/${t.getDate()} ${o}`}function se(){return/Android/i.test(navigator.userAgent)}function ce(e){const t=e.daily?C(e):new Date(e.remindAt);if(Number.isNaN(t.getTime()))return;const n=`intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${t.getHours()};i.android.intent.extra.alarm.MINUTES=${t.getMinutes()};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(e.text)};i.android.intent.extra.alarm.SKIP_UI=true;end`;window.location.href=n}function c(){const e=s.filter(i=>!i.done).length,t=s.filter(i=>i.done).length;let n=s;f==="pending"&&(n=n.filter(i=>!i.done)),f==="done"&&(n=n.filter(i=>i.done)),E!=="all"&&(n=n.filter(i=>i.category===E));const o=n.length===0;l.innerHTML=`
    <header class="app-header">
      <div class="dog-scene">
        <img class="mascot" src="mascot.png" alt="吉祥物" />
      </div>
      <h1 class="app-title">我的待办清单</h1>
      <p class="app-subtitle">记录每一件要做的事 🌸</p>
    </header>

    <div class="card">
      <form class="input-row" id="add-form">
        <input
          type="text"
          class="task-input"
          id="task-input"
          placeholder="${q[0]}"
          autocomplete="off"
          maxlength="200"
        />
        <select class="priority-select" id="priority-select" title="优先级">
          <option value="high">高</option>
          <option value="medium" selected>中</option>
          <option value="low">低</option>
        </select>
        <select class="category-select" id="category-select" title="分类">
          ${Object.entries(I).map(([i,d])=>`<option value="${i}" ${i==="life"?"selected":""}>${d.icon} ${d.label}</option>`).join("")}
        </select>
        <button type="submit" class="add-btn" id="add-btn">➕ 添加任务</button>
      </form>
      <div class="remind-row">
        <span class="remind-label">🔔 提醒时间(可选)</span>
        <input type="datetime-local" class="remind-input" id="remind-at" />
        <label class="daily-toggle"><input type="checkbox" id="daily-toggle" /> 🔁 每日任务</label>
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value pending">${e}</div>
        <div class="stat-label">未完成</div>
      </div>
      <div class="stat">
        <div class="stat-value done">${t}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <div class="filters">
      <button class="filter-btn ${f==="all"?"active":""}" data-filter="all">全部</button>
      <button class="filter-btn ${f==="pending"?"active":""}" data-filter="pending">未完成</button>
      <button class="filter-btn ${f==="done"?"active":""}" data-filter="done">已完成</button>
      <select class="filter-cat" id="category-filter" title="按分类筛选">
        <option value="all" ${E==="all"?"selected":""}>全部分类</option>
        ${Object.entries(I).map(([i,d])=>`<option value="${i}" ${E===i?"selected":""}>${d.icon} ${d.label}</option>`).join("")}
      </select>
    </div>

    <ul class="task-list">
      ${o?`<div class="empty">
               <div class="empty-illustration">🌸</div>
               <div class="empty-title">${f==="done"?"还没有已完成的任务":f==="pending"?"太棒了，没有未完成的任务！":"还没有任务"}</div>
               <div class="empty-hint">${f==="done"?"完成一些任务后会显示在这里":f==="pending"?"继续保持，享受清闲吧":"在上方输入框添加你的第一个任务"}</div>
             </div>`:n.map(i=>`
          <li class="task-item ${i.done?"done":""} priority-${i.priority} ${j(i)?"overdue":""}" data-id="${i.id}">
            <span class="priority-bar"></span>
            <label class="checkbox">
              <input type="checkbox" ${i.done?"checked":""} />
              <span class="checkbox-box"></span>
            </label>
            ${v===i.id?`<div class="edit-row">
                     <input type="text" class="edit-input" maxlength="200" />
                     <select class="priority-select edit-priority">
                       <option value="high" ${i.priority==="high"?"selected":""}>高</option>
                       <option value="medium" ${i.priority==="medium"?"selected":""}>中</option>
                       <option value="low" ${i.priority==="low"?"selected":""}>低</option>
                     </select>
                     <button class="icon-btn save-btn" title="保存" aria-label="保存">✓</button>
                     <button class="icon-btn cancel-btn" title="取消" aria-label="取消">✕</button>
                   </div>`:`<span class="task-text"></span>
                   ${ae(i.priority)}
                   ${le(i.category)}
                   ${i.daily?'<span class="daily-badge">🔁 每日</span>':""}
                   ${i.remindAt?`<span class="remind-badge">🔔 ${re(i.remindAt)}</span>`:""}
                   ${j(i)?'<span class="overdue-badge">⏰ 已超时</span>':""}
                   ${i.remindAt&&!i.done&&se()&&!S?'<button class="icon-btn alarm-btn" title="加入系统闹钟" aria-label="加入系统闹钟">⏰</button>':""}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`}
          </li>`).join("")}
    </ul>

    ${s.length>0?`<div class="clear-row">
             ${t>0?`<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${t}）</button>`:""}
             <button class="clear-btn danger" id="clear-all">⚠️ 全部清空</button>
           </div>`:""}

    ${$==="clear-all"?`<div class="modal-overlay" id="modal-overlay">
             <div class="modal">
               <div class="modal-icon">⚠️</div>
               <div class="modal-title">确认全部清空？</div>
               <div class="modal-text">这将删除所有 ${s.length} 个任务，且无法恢复。</div>
               <div class="modal-actions">
                 <button class="modal-btn cancel" id="modal-cancel">取消</button>
                 <button class="modal-btn confirm" id="modal-confirm">确认清空</button>
               </div>
             </div>
           </div>`:""}

    ${p?`<div class="modal-overlay" id="reminder-overlay">
             <div class="modal reminder">
               <div class="modal-icon">⏰</div>
               <div class="modal-title">待办提醒</div>
               <div class="modal-text reminder-text"></div>
               <div class="modal-actions">
                 <button class="modal-btn cancel" id="reminder-dismiss">知道了</button>
                 <button class="modal-btn confirm" id="reminder-done">完成它 ✓</button>
               </div>
             </div>
           </div>`:""}
  `,n.forEach(i=>{const d=l.querySelector(`.task-item[data-id="${i.id}"] .task-text`);if(d&&(d.textContent=i.text),v===i.id){const y=l.querySelector(`.task-item[data-id="${i.id}"] .edit-input`);y&&(y.value=i.text,y.focus(),y.select())}});const a=l.querySelector("#reminder-overlay .reminder-text");a&&p&&(a.textContent=p.text),de()}function de(){const e=l.querySelector("#add-form"),t=l.querySelector("#task-input");e.addEventListener("submit",r=>{r.preventDefault();const m=t.value.trim();if(m){const x=l.querySelector("#priority-select").value,A=l.querySelector("#category-select").value,N=l.querySelector("#daily-toggle").checked,D=l.querySelector("#remind-at").value,h=D?new Date(D).toISOString():null;h&&!S&&"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission(),te(m,x,h,A,N),l.querySelector("#remind-at").value="",l.querySelector("#daily-toggle").checked=!1,h&&J(s[0])}}),l.querySelectorAll(".filter-btn").forEach(r=>{r.addEventListener("click",()=>{f=r.dataset.filter,c()})});const n=l.querySelector("#category-filter");n&&n.addEventListener("change",()=>{E=n.value,c()}),l.querySelectorAll(".task-item").forEach(r=>{const m=Number(r.dataset.id)||parseFloat(r.dataset.id),x=r.querySelector('input[type="checkbox"]');x&&x.addEventListener("change",()=>W(m));const A=r.querySelector(".edit-btn");A&&A.addEventListener("click",()=>{v=m,c()});const N=r.querySelector(".delete-btn");N&&N.addEventListener("click",()=>{r.classList.add("removing"),setTimeout(()=>ie(m),180)});const D=r.querySelector(".alarm-btn");D&&D.addEventListener("click",()=>{const u=s.find(w=>w.id===m);u&&u.remindAt&&ce(u)});const h=r.querySelector(".save-btn");h&&h.addEventListener("click",()=>{const u=r.querySelector(".edit-input").value.trim(),w=r.querySelector(".edit-priority").value;u&&K(m,u,w)});const _=r.querySelector(".cancel-btn");_&&_.addEventListener("click",()=>{v=null,c()});const P=r.querySelector(".edit-input");P&&P.addEventListener("keydown",u=>{if(u.key==="Enter"){u.preventDefault();const w=P.value.trim(),Q=r.querySelector(".edit-priority").value;w&&K(m,w,Q)}else u.key==="Escape"&&(v=null,c())})});const o=l.querySelector("#clear-done");o&&o.addEventListener("click",ne);const a=l.querySelector("#clear-all");a&&a.addEventListener("click",()=>{$="clear-all",c()});const i=l.querySelector("#modal-cancel");i&&i.addEventListener("click",()=>{$=null,c()});const d=l.querySelector("#modal-confirm");d&&d.addEventListener("click",oe);const y=l.querySelector("#modal-overlay");y&&y.addEventListener("click",r=>{r.target===y&&($=null,c())});const B=l.querySelector("#reminder-dismiss");B&&B.addEventListener("click",()=>{p=null,c()});const H=l.querySelector("#reminder-done");H&&H.addEventListener("click",()=>{const r=p;p=null,r?W(r.id):c()});const V=window.matchMedia("(pointer: fine)").matches;!v&&V&&!p&&t.focus()}c();let k=0,b=q[0].length,T=!0;setInterval(()=>{const e=l.querySelector("#task-input");if(!e||e.value)return;const t=q[k];T?(b-=1,b<=0&&(b=0,T=!1,k=(k+1)%q.length)):(b+=1,b>=t.length&&(b=t.length,T=!0)),e.placeholder=(q[k]||"").slice(0,Math.max(0,b))},150);function L(e,t){Z(),!S&&"Notification"in window&&Notification.permission==="granted"&&new Notification(t?"再次提醒 ⏰":"待办提醒",{body:e.text,tag:`${R(e)}-${t?2:1}`}),document.visibilityState==="visible"&&(p=e,c())}function Y(){const e=Date.now(),t=G();let n=!1;for(const o of s)if(o.daily&&o.done&&o.lastDoneDay&&o.lastDoneDay!==t&&(o.done=!1,n=!0),!(o.done||!o.remindAt))if(o.daily){const a=C(o).getTime();e>=a&&o.firedDay!==t&&(o.firedDay=t,o.alert2=!1,n=!0,L(o,!1)),o.firedDay===t&&!o.alert2&&e>=a+M&&(o.alert2=!0,n=!0,L(o,!0))}else{const a=new Date(o.remindAt).getTime();e>=a&&!o.notified&&(o.notified=!0,n=!0,L(o,!1)),o.notified&&!o.reNotified&&e>=a+M&&(o.reNotified=!0,n=!0,L(o,!0))}n&&g()}Y();setInterval(Y,2e4);setInterval(()=>{const e=l.querySelector("#task-input");l.querySelector(".edit-input")||e&&e.value||v||$||p||c()},6e4);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
