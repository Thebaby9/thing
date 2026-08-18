(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))d(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const c of o.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&d(c)}).observe(document,{childList:!0,subtree:!0});function l(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function d(e){if(e.ep)return;e.ep=!0;const o=l(e);fetch(e.href,o)}})();const L="todo-tasks-v2",w={high:{label:"高",color:"#ef4444",soft:"#fef2f2"},medium:{label:"中",color:"#f59e0b",soft:"#fffbeb"},low:{label:"低",color:"#16a34a",soft:"#f0fdf4"}},r=document.querySelector("#app");let a=T(),u="all",p=null,b=null;function T(){try{const i=localStorage.getItem(L);return(i?JSON.parse(i):[]).map(l=>({...l,priority:w[l.priority]?l.priority:"medium"}))}catch{return[]}}function m(){localStorage.setItem(L,JSON.stringify(a))}function O(i,t){a.unshift({id:Date.now()+Math.random(),text:i,done:!1,priority:t}),m(),s()}function I(i){const t=a.find(l=>l.id===i);t&&(t.done=!t.done,m(),s())}function B(i){a=a.filter(t=>t.id!==i),m(),s()}function q(i,t,l){const d=a.find(e=>e.id===i);d&&(d.text=t,d.priority=l,m()),p=null,s()}function P(){a=a.filter(i=>!i.done),m(),s()}function A(){a=[],m(),b=null,s()}function N(i){const t=w[i];return`<span class="priority-badge" style="background:${t.soft};color:${t.color}">${t.label}</span>`}function s(){const i=a.filter(e=>!e.done).length,t=a.filter(e=>e.done).length;let l=a;u==="pending"&&(l=a.filter(e=>!e.done)),u==="done"&&(l=a.filter(e=>e.done));const d=l.length===0;r.innerHTML=`
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
                   ${N(e.priority)}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`}
          </li>`).join("")}
    </ul>

    ${a.length>0?`<div class="clear-row">
             ${t>0?`<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${t}）</button>`:""}
             <button class="clear-btn danger" id="clear-all">⚠️ 全部清空</button>
           </div>`:""}

    ${b==="clear-all"?`<div class="modal-overlay" id="modal-overlay">
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
  `,l.forEach(e=>{const o=r.querySelector(`.task-item[data-id="${e.id}"] .task-text`);if(o&&(o.textContent=e.text),p===e.id){const c=r.querySelector(`.task-item[data-id="${e.id}"] .edit-input`);c&&(c.value=e.text,c.focus(),c.select())}}),D()}function D(){const i=r.querySelector("#add-form"),t=r.querySelector("#task-input");i.addEventListener("submit",n=>{n.preventDefault();const f=t.value.trim();if(f){const y=r.querySelector("#priority-select").value;O(f,y)}}),r.querySelectorAll(".filter-btn").forEach(n=>{n.addEventListener("click",()=>{u=n.dataset.filter,s()})}),r.querySelectorAll(".task-item").forEach(n=>{const f=Number(n.dataset.id)||parseFloat(n.dataset.id),y=n.querySelector('input[type="checkbox"]');y&&y.addEventListener("change",()=>I(f));const k=n.querySelector(".edit-btn");k&&k.addEventListener("click",()=>{p=f,s()});const S=n.querySelector(".delete-btn");S&&S.addEventListener("click",()=>{n.classList.add("removing"),setTimeout(()=>B(f),180)});const $=n.querySelector(".save-btn");$&&$.addEventListener("click",()=>{const v=n.querySelector(".edit-input").value.trim(),g=n.querySelector(".edit-priority").value;v&&q(f,v,g)});const E=n.querySelector(".cancel-btn");E&&E.addEventListener("click",()=>{p=null,s()});const h=n.querySelector(".edit-input");h&&h.addEventListener("keydown",v=>{if(v.key==="Enter"){v.preventDefault();const g=h.value.trim(),x=n.querySelector(".edit-priority").value;g&&q(f,g,x)}else v.key==="Escape"&&(p=null,s())})});const l=r.querySelector("#clear-done");l&&l.addEventListener("click",P);const d=r.querySelector("#clear-all");d&&d.addEventListener("click",()=>{b="clear-all",s()});const e=r.querySelector("#modal-cancel");e&&e.addEventListener("click",()=>{b=null,s()});const o=r.querySelector("#modal-confirm");o&&o.addEventListener("click",A);const c=r.querySelector("#modal-overlay");c&&c.addEventListener("click",n=>{n.target===c&&(b=null,s())}),p||t.focus()}s();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").catch(()=>{})});
