(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const r of e)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&c(d)}).observe(document,{childList:!0,subtree:!0});function n(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?r.credentials="include":e.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(e){if(e.ep)return;e.ep=!0;const r=n(e);fetch(e.href,r)}})();const x="todo-tasks-v2",L={high:{label:"高",color:"#ef4444",soft:"#fef2f2"},medium:{label:"中",color:"#f59e0b",soft:"#fffbeb"},low:{label:"低",color:"#16a34a",soft:"#f0fdf4"}},s=document.querySelector("#app"),$=!!window.Capacitor&&window.Capacitor.isNativePlatform();function N(i){return Math.abs(Math.floor(i.id))%2e9}async function T(i){if(!(!$||!i.remindAt))try{const{LocalNotifications:t}=window.Capacitor.Plugins;await t.requestPermissions(),await t.schedule({notifications:[{id:N(i),title:"待办提醒",body:i.text,schedule:{at:new Date(i.remindAt)}}]})}catch{}}async function I(i){if(!(!$||!i.remindAt))try{const{LocalNotifications:t}=window.Capacitor.Plugins;await t.cancel({notifications:[{id:N(i)}]})}catch{}}let a=O(),f="all",p=null,h=null;function O(){try{const i=localStorage.getItem(x);return(i?JSON.parse(i):[]).map(n=>({...n,priority:L[n.priority]?n.priority:"medium"}))}catch{return[]}}function v(){localStorage.setItem(x,JSON.stringify(a))}function R(i,t,n){a.unshift({id:Date.now()+Math.random(),text:i,done:!1,priority:t,remindAt:n||null,reminded:!1}),v(),l()}function B(i){const t=a.find(n=>n.id===i);t&&(t.done=!t.done,v(),t.done?I(t):t.remindAt&&new Date(t.remindAt).getTime()>Date.now()&&T(t),l())}function C(i){const t=a.find(n=>n.id===i);t&&I(t),a=a.filter(n=>n.id!==i),v(),l()}function A(i,t,n){const c=a.find(e=>e.id===i);c&&(c.text=t,c.priority=n,v()),p=null,l()}function H(){a=a.filter(i=>!i.done),v(),l()}function U(){a=[],v(),h=null,l()}function K(i){const t=L[i];return`<span class="priority-badge" style="background:${t.soft};color:${t.color}">${t.label}</span>`}function l(){const i=a.filter(e=>!e.done).length,t=a.filter(e=>e.done).length;let n=a;f==="pending"&&(n=a.filter(e=>!e.done)),f==="done"&&(n=a.filter(e=>e.done));const c=n.length===0;s.innerHTML=`
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
          placeholder="今天要做什么？"
          autocomplete="off"
          maxlength="200"
        />
        <select class="priority-select" id="priority-select" title="优先级">
          <option value="high">高</option>
          <option value="medium" selected>中</option>
          <option value="low">低</option>
        </select>
        <button type="submit" class="add-btn" id="add-btn">➕ 添加任务</button>
      </form>
      <div class="remind-row">
        <span class="remind-label">🔔 提醒时间(可选)</span>
        <input type="datetime-local" class="remind-input" id="remind-at" />
      </div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value pending">${i}</div>
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
    </div>

    <ul class="task-list">
      ${c?`<div class="empty">
               <div class="empty-illustration">🌸</div>
               <div class="empty-title">${f==="done"?"还没有已完成的任务":f==="pending"?"太棒了，没有未完成的任务！":"还没有任务"}</div>
               <div class="empty-hint">${f==="done"?"完成一些任务后会显示在这里":f==="pending"?"继续保持，享受清闲吧":"在上方输入框添加你的第一个任务"}</div>
             </div>`:n.map(e=>`
          <li class="task-item ${e.done?"done":""} priority-${e.priority}" data-id="${e.id}">
            <span class="priority-bar"></span>
            <label class="checkbox">
              <input type="checkbox" ${e.done?"checked":""} />
              <span class="checkbox-box"></span>
            </label>
            ${p===e.id?`<div class="edit-row">
                     <input type="text" class="edit-input" maxlength="200" />
                     <select class="priority-select edit-priority">
                       <option value="high" ${e.priority==="high"?"selected":""}>高</option>
                       <option value="medium" ${e.priority==="medium"?"selected":""}>中</option>
                       <option value="low" ${e.priority==="low"?"selected":""}>低</option>
                     </select>
                     <button class="icon-btn save-btn" title="保存" aria-label="保存">✓</button>
                     <button class="icon-btn cancel-btn" title="取消" aria-label="取消">✕</button>
                   </div>`:`<span class="task-text"></span>
                   ${K(e.priority)}
                   ${e.remindAt?`<span class="remind-badge">🔔 ${j(e.remindAt)}</span>`:""}
                   ${e.remindAt&&!e.done&&F()&&!$?'<button class="icon-btn alarm-btn" title="加入系统闹钟" aria-label="加入系统闹钟">⏰</button>':""}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`}
          </li>`).join("")}
    </ul>

    ${a.length>0?`<div class="clear-row">
             ${t>0?`<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${t}）</button>`:""}
             <button class="clear-btn danger" id="clear-all">⚠️ 全部清空</button>
           </div>`:""}

    ${h==="clear-all"?`<div class="modal-overlay" id="modal-overlay">
             <div class="modal">
               <div class="modal-icon">⚠️</div>
               <div class="modal-title">确认全部清空？</div>
               <div class="modal-text">这将删除所有 ${a.length} 个任务，且无法恢复。</div>
               <div class="modal-actions">
                 <button class="modal-btn cancel" id="modal-cancel">取消</button>
                 <button class="modal-btn confirm" id="modal-confirm">确认清空</button>
               </div>
             </div>
           </div>`:""}
  `,n.forEach(e=>{const r=s.querySelector(`.task-item[data-id="${e.id}"] .task-text`);if(r&&(r.textContent=e.text),p===e.id){const d=s.querySelector(`.task-item[data-id="${e.id}"] .edit-input`);d&&(d.value=e.text,d.focus(),d.select())}}),_()}function _(){const i=s.querySelector("#add-form"),t=s.querySelector("#task-input");i.addEventListener("submit",o=>{o.preventDefault();const m=t.value.trim();if(m){const w=s.querySelector("#priority-select").value,g=s.querySelector("#remind-at").value,b=g?new Date(g).toISOString():null;b&&"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission(),R(m,w,b),s.querySelector("#remind-at").value="",b&&T(a[0])}}),s.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{f=o.dataset.filter,l()})}),s.querySelectorAll(".task-item").forEach(o=>{const m=Number(o.dataset.id)||parseFloat(o.dataset.id),w=o.querySelector('input[type="checkbox"]');w&&w.addEventListener("change",()=>B(m));const g=o.querySelector(".edit-btn");g&&g.addEventListener("click",()=>{p=m,l()});const b=o.querySelector(".delete-btn");b&&b.addEventListener("click",()=>{o.classList.add("removing"),setTimeout(()=>C(m),180)});const k=o.querySelector(".alarm-btn");k&&k.addEventListener("click",()=>{const u=a.find(y=>y.id===m);u&&u.remindAt&&G(u)});const E=o.querySelector(".save-btn");E&&E.addEventListener("click",()=>{const u=o.querySelector(".edit-input").value.trim(),y=o.querySelector(".edit-priority").value;u&&A(m,u,y)});const q=o.querySelector(".cancel-btn");q&&q.addEventListener("click",()=>{p=null,l()});const S=o.querySelector(".edit-input");S&&S.addEventListener("keydown",u=>{if(u.key==="Enter"){u.preventDefault();const y=S.value.trim(),M=o.querySelector(".edit-priority").value;y&&A(m,y,M)}else u.key==="Escape"&&(p=null,l())})});const n=s.querySelector("#clear-done");n&&n.addEventListener("click",H);const c=s.querySelector("#clear-all");c&&c.addEventListener("click",()=>{h="clear-all",l()});const e=s.querySelector("#modal-cancel");e&&e.addEventListener("click",()=>{h=null,l()});const r=s.querySelector("#modal-confirm");r&&r.addEventListener("click",U);const d=s.querySelector("#modal-overlay");d&&d.addEventListener("click",o=>{o.target===d&&(h=null,l())});const P=window.matchMedia("(pointer: fine)").matches;!p&&P&&t.focus()}l();function j(i){const t=new Date(i);if(Number.isNaN(t.getTime()))return"";const n=c=>String(c).padStart(2,"0");return`${t.getMonth()+1}/${t.getDate()} ${n(t.getHours())}:${n(t.getMinutes())}`}function F(){return/Android/i.test(navigator.userAgent)}function G(i){const t=new Date(i.remindAt);if(Number.isNaN(t.getTime()))return;const n=`intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${t.getHours()};i.android.intent.extra.alarm.MINUTES=${t.getMinutes()};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(i.text)};i.android.intent.extra.alarm.SKIP_UI=true;end`;window.location.href=n}function D(){const i=Date.now();let t=!1;for(const n of a)n.remindAt&&!n.reminded&&!n.done&&new Date(n.remindAt).getTime()<=i&&(n.reminded=!0,t=!0,"Notification"in window&&Notification.permission==="granted"&&new Notification("待办提醒",{body:n.text,tag:String(n.id)}));t&&v()}D();setInterval(D,2e4);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
