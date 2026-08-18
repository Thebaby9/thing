(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))c(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&c(d)}).observe(document,{childList:!0,subtree:!0});function i(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function c(t){if(t.ep)return;t.ep=!0;const r=i(t);fetch(t.href,r)}})();const x="todo-tasks-v2",L={high:{label:"高",color:"#ef4444",soft:"#fef2f2"},medium:{label:"中",color:"#f59e0b",soft:"#fffbeb"},low:{label:"低",color:"#16a34a",soft:"#f0fdf4"}},l=document.querySelector("#app");let a=I(),f="all",m=null,h=null;function I(){try{const n=localStorage.getItem(x);return(n?JSON.parse(n):[]).map(i=>({...i,priority:L[i.priority]?i.priority:"medium"}))}catch{return[]}}function v(){localStorage.setItem(x,JSON.stringify(a))}function O(n,e,i){a.unshift({id:Date.now()+Math.random(),text:n,done:!1,priority:e,remindAt:i||null,reminded:!1}),v(),s()}function D(n){const e=a.find(i=>i.id===n);e&&(e.done=!e.done,v(),s())}function M(n){a=a.filter(e=>e.id!==n),v(),s()}function q(n,e,i){const c=a.find(t=>t.id===n);c&&(c.text=e,c.priority=i,v()),m=null,s()}function P(){a=a.filter(n=>!n.done),v(),s()}function R(){a=[],v(),h=null,s()}function B(n){const e=L[n];return`<span class="priority-badge" style="background:${e.soft};color:${e.color}">${e.label}</span>`}function s(){const n=a.filter(t=>!t.done).length,e=a.filter(t=>t.done).length;let i=a;f==="pending"&&(i=a.filter(t=>!t.done)),f==="done"&&(i=a.filter(t=>t.done));const c=i.length===0;l.innerHTML=`
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
        <div class="stat-value pending">${n}</div>
        <div class="stat-label">未完成</div>
      </div>
      <div class="stat">
        <div class="stat-value done">${e}</div>
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
             </div>`:i.map(t=>`
          <li class="task-item ${t.done?"done":""} priority-${t.priority}" data-id="${t.id}">
            <span class="priority-bar"></span>
            <label class="checkbox">
              <input type="checkbox" ${t.done?"checked":""} />
              <span class="checkbox-box"></span>
            </label>
            ${m===t.id?`<div class="edit-row">
                     <input type="text" class="edit-input" maxlength="200" />
                     <select class="priority-select edit-priority">
                       <option value="high" ${t.priority==="high"?"selected":""}>高</option>
                       <option value="medium" ${t.priority==="medium"?"selected":""}>中</option>
                       <option value="low" ${t.priority==="low"?"selected":""}>低</option>
                     </select>
                     <button class="icon-btn save-btn" title="保存" aria-label="保存">✓</button>
                     <button class="icon-btn cancel-btn" title="取消" aria-label="取消">✕</button>
                   </div>`:`<span class="task-text"></span>
                   ${B(t.priority)}
                   ${t.remindAt?`<span class="remind-badge">🔔 ${H(t.remindAt)}</span>`:""}
                   ${t.remindAt&&!t.done&&U()?'<button class="icon-btn alarm-btn" title="加入系统闹钟" aria-label="加入系统闹钟">⏰</button>':""}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`}
          </li>`).join("")}
    </ul>

    ${a.length>0?`<div class="clear-row">
             ${e>0?`<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${e}）</button>`:""}
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
  `,i.forEach(t=>{const r=l.querySelector(`.task-item[data-id="${t.id}"] .task-text`);if(r&&(r.textContent=t.text),m===t.id){const d=l.querySelector(`.task-item[data-id="${t.id}"] .edit-input`);d&&(d.value=t.text,d.focus(),d.select())}}),C()}function C(){const n=l.querySelector("#add-form"),e=l.querySelector("#task-input");n.addEventListener("submit",o=>{o.preventDefault();const p=e.value.trim();if(p){const S=l.querySelector("#priority-select").value,y=l.querySelector("#remind-at").value,g=y?new Date(y).toISOString():null;g&&"Notification"in window&&Notification.permission==="default"&&Notification.requestPermission(),O(p,S,g),l.querySelector("#remind-at").value=""}}),l.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{f=o.dataset.filter,s()})}),l.querySelectorAll(".task-item").forEach(o=>{const p=Number(o.dataset.id)||parseFloat(o.dataset.id),S=o.querySelector('input[type="checkbox"]');S&&S.addEventListener("change",()=>D(p));const y=o.querySelector(".edit-btn");y&&y.addEventListener("click",()=>{m=p,s()});const g=o.querySelector(".delete-btn");g&&g.addEventListener("click",()=>{o.classList.add("removing"),setTimeout(()=>M(p),180)});const k=o.querySelector(".alarm-btn");k&&k.addEventListener("click",()=>{const u=a.find(b=>b.id===p);u&&u.remindAt&&K(u)});const w=o.querySelector(".save-btn");w&&w.addEventListener("click",()=>{const u=o.querySelector(".edit-input").value.trim(),b=o.querySelector(".edit-priority").value;u&&q(p,u,b)});const E=o.querySelector(".cancel-btn");E&&E.addEventListener("click",()=>{m=null,s()});const $=o.querySelector(".edit-input");$&&$.addEventListener("keydown",u=>{if(u.key==="Enter"){u.preventDefault();const b=$.value.trim(),T=o.querySelector(".edit-priority").value;b&&q(p,b,T)}else u.key==="Escape"&&(m=null,s())})});const i=l.querySelector("#clear-done");i&&i.addEventListener("click",P);const c=l.querySelector("#clear-all");c&&c.addEventListener("click",()=>{h="clear-all",s()});const t=l.querySelector("#modal-cancel");t&&t.addEventListener("click",()=>{h=null,s()});const r=l.querySelector("#modal-confirm");r&&r.addEventListener("click",R);const d=l.querySelector("#modal-overlay");d&&d.addEventListener("click",o=>{o.target===d&&(h=null,s())});const N=window.matchMedia("(pointer: fine)").matches;!m&&N&&e.focus()}s();function H(n){const e=new Date(n);if(Number.isNaN(e.getTime()))return"";const i=c=>String(c).padStart(2,"0");return`${e.getMonth()+1}/${e.getDate()} ${i(e.getHours())}:${i(e.getMinutes())}`}function U(){return/Android/i.test(navigator.userAgent)}function K(n){const e=new Date(n.remindAt);if(Number.isNaN(e.getTime()))return;const i=`intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${e.getHours()};i.android.intent.extra.alarm.MINUTES=${e.getMinutes()};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(n.text)};i.android.intent.extra.alarm.SKIP_UI=true;end`;window.location.href=i}function A(){const n=Date.now();let e=!1;for(const i of a)i.remindAt&&!i.reminded&&!i.done&&new Date(i.remindAt).getTime()<=n&&(i.reminded=!0,e=!0,"Notification"in window&&Notification.permission==="granted"&&new Notification("待办提醒",{body:i.text,tag:String(i.id)}));e&&v()}A();setInterval(A,2e4);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
