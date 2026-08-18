(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))d(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&d(c)}).observe(document,{childList:!0,subtree:!0});function l(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function d(e){if(e.ep)return;e.ep=!0;const n=l(e);fetch(e.href,n)}})();const E="todo-tasks-v2",w={high:{label:"高",color:"#ef4444",soft:"#fef2f2"},medium:{label:"中",color:"#f59e0b",soft:"#fffbeb"},low:{label:"低",color:"#16a34a",soft:"#f0fdf4"}},r=document.querySelector("#app");let s=M(),u="all",p=null,b=null;function M(){try{const i=localStorage.getItem(E);return(i?JSON.parse(i):[]).map(l=>({...l,priority:w[l.priority]?l.priority:"medium"}))}catch{return[]}}function y(){localStorage.setItem(E,JSON.stringify(s))}function T(i,t){s.unshift({id:Date.now()+Math.random(),text:i,done:!1,priority:t}),y(),a()}function O(i){const t=s.find(l=>l.id===i);t&&(t.done=!t.done,y(),a())}function B(i){s=s.filter(t=>t.id!==i),y(),a()}function x(i,t,l){const d=s.find(e=>e.id===i);d&&(d.text=t,d.priority=l,y()),p=null,a()}function I(){s=s.filter(i=>!i.done),y(),a()}function P(){s=[],y(),b=null,a()}function A(i){const t=w[i];return`<span class="priority-badge" style="background:${t.soft};color:${t.color}">${t.label}</span>`}function a(){const i=s.filter(e=>!e.done).length,t=s.filter(e=>e.done).length;let l=s;u==="pending"&&(l=s.filter(e=>!e.done)),u==="done"&&(l=s.filter(e=>e.done));const d=l.length===0;r.innerHTML=`
    <header class="app-header">
      <div class="dog-scene">
        <svg class="dog-svg" viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <g class="dog-body">
            <ellipse cx="55" cy="58" rx="28" ry="18"/>
            <circle cx="30" cy="35" r="16" class="dog-head"/>
            <path d="M18 22 L14 12 L26 20" class="dog-ear-l"/>
            <path d="M42 20 L46 10 L38 24" class="dog-ear-r"/>
            <circle cx="25" cy="33" r="1.8" fill="currentColor" stroke="none"/>
            <circle cx="35" cy="33" r="1.8" fill="currentColor" stroke="none"/>
            <path d="M27 39 Q30 42 33 39" class="dog-snout"/>
            <path d="M30 39 L30 41" />
            <path d="M83 68 Q90 55 88 72" class="dog-tail"/>
            <path d="M45 70 L45 80 M52 72 L52 82 M60 70 L60 80 M68 72 L68 82" class="dog-legs"/>
          </g>
          <g class="dog-ground">
            <path d="M8 85 Q35 83 60 85 T112 85" stroke-dasharray="3 4"/>
          </g>
        </svg>
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
      <button class="filter-btn ${u==="all"?"active":""}" data-filter="all">全部</button>
      <button class="filter-btn ${u==="pending"?"active":""}" data-filter="pending">未完成</button>
      <button class="filter-btn ${u==="done"?"active":""}" data-filter="done">已完成</button>
    </div>

    <ul class="task-list">
      ${d?`<div class="empty">
               <div class="empty-illustration">🌸</div>
               <div class="empty-title">${u==="done"?"还没有已完成的任务":u==="pending"?"太棒了，没有未完成的任务！":"还没有任务"}</div>
               <div class="empty-hint">${u==="done"?"完成一些任务后会显示在这里":u==="pending"?"继续保持，享受清闲吧":"在上方输入框添加你的第一个任务"}</div>
             </div>`:l.map(e=>`
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
                   ${A(e.priority)}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`}
          </li>`).join("")}
    </ul>

    ${s.length>0?`<div class="clear-row">
             ${t>0?`<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${t}）</button>`:""}
             <button class="clear-btn danger" id="clear-all">⚠️ 全部清空</button>
           </div>`:""}

    ${b==="clear-all"?`<div class="modal-overlay" id="modal-overlay">
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
  `,l.forEach(e=>{const n=r.querySelector(`.task-item[data-id="${e.id}"] .task-text`);if(n&&(n.textContent=e.text),p===e.id){const c=r.querySelector(`.task-item[data-id="${e.id}"] .edit-input`);c&&(c.value=e.text,c.focus(),c.select())}}),C()}function C(){const i=r.querySelector("#add-form"),t=r.querySelector("#task-input");i.addEventListener("submit",o=>{o.preventDefault();const f=t.value.trim();if(f){const m=r.querySelector("#priority-select").value;T(f,m)}}),r.querySelectorAll(".filter-btn").forEach(o=>{o.addEventListener("click",()=>{u=o.dataset.filter,a()})}),r.querySelectorAll(".task-item").forEach(o=>{const f=Number(o.dataset.id)||parseFloat(o.dataset.id),m=o.querySelector('input[type="checkbox"]');m&&m.addEventListener("change",()=>O(f));const k=o.querySelector(".edit-btn");k&&k.addEventListener("click",()=>{p=f,a()});const L=o.querySelector(".delete-btn");L&&L.addEventListener("click",()=>{o.classList.add("removing"),setTimeout(()=>B(f),180)});const S=o.querySelector(".save-btn");S&&S.addEventListener("click",()=>{const v=o.querySelector(".edit-input").value.trim(),g=o.querySelector(".edit-priority").value;v&&x(f,v,g)});const $=o.querySelector(".cancel-btn");$&&$.addEventListener("click",()=>{p=null,a()});const h=o.querySelector(".edit-input");h&&h.addEventListener("keydown",v=>{if(v.key==="Enter"){v.preventDefault();const g=h.value.trim(),q=o.querySelector(".edit-priority").value;g&&x(f,g,q)}else v.key==="Escape"&&(p=null,a())})});const l=r.querySelector("#clear-done");l&&l.addEventListener("click",I);const d=r.querySelector("#clear-all");d&&d.addEventListener("click",()=>{b="clear-all",a()});const e=r.querySelector("#modal-cancel");e&&e.addEventListener("click",()=>{b=null,a()});const n=r.querySelector("#modal-confirm");n&&n.addEventListener("click",P);const c=r.querySelector("#modal-overlay");c&&c.addEventListener("click",o=>{o.target===c&&(b=null,a())}),p||t.focus()}a();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
