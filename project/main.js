import './style.css'

const STORAGE_KEY = 'todo-tasks-v2'

const PRIORITIES = {
  high: { label: '高', color: '#ef4444', soft: '#fef2f2' },
  medium: { label: '中', color: '#f59e0b', soft: '#fffbeb' },
  low: { label: '低', color: '#16a34a', soft: '#f0fdf4' },
}

const CATEGORIES = {
  life: { label: '生活', icon: '🏠', color: '#0d9488', soft: '#f0fdfa' },
  work: { label: '工作', icon: '💼', color: '#2563eb', soft: '#eff6ff' },
  study: { label: '学习', icon: '📚', color: '#7c3aed', soft: '#f5f3ff' },
  health: { label: '健康', icon: '💪', color: '#ea580c', soft: '#fff7ed' },
  other: { label: '其他', icon: '📌', color: '#64748b', soft: '#f8fafc' },
}

const PROMPTS = [
  '今天要做什么?',
  '比如: 喝一杯水 💧',
  '比如: 运动 30 分钟 🏃',
  '比如: 回一封重要邮件 📧',
  '比如: 计划明天的小目标 🎯',
]

const REMIND_SECOND_MS = 5 * 60 * 1000
const REMIND_OVERDUE_MS = 10 * 60 * 1000

const app = document.querySelector('#app')

// Capacitor 原生壳(内置打包版)检测:原生下用本地通知插件,提醒在应用关闭后也能触发
const isNativeApp = !!window.Capacitor && window.Capacitor.isNativePlatform()

let tasks = loadTasks()
let filter = 'all' // all | pending | done
let filterCategory = 'all'
let editingId = null
let confirmState = null // null | 'clear-all'
let reminderModalTask = null

function nativeId(t) {
  return Math.abs(Math.floor(t.id)) % 2000000000
}

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function dailyTargetToday(t) {
  const from = new Date(t.remindAt)
  const n = new Date()
  n.setHours(from.getHours(), from.getMinutes(), 0, 0)
  return n
}

function remindTs(t) {
  return t.daily ? dailyTargetToday(t).getTime() : new Date(t.remindAt).getTime()
}

function isOverdue(t) {
  if (!t.remindAt || t.done) return false
  return Date.now() > remindTs(t) + REMIND_OVERDUE_MS
}

function buzz() {
  try {
    if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 500])
  } catch {}
  if (isNativeApp) {
    try {
      window.Capacitor.Plugins.Haptics.vibrate({ duration: 800 })
    } catch {}
  }
}

async function scheduleNativeReminder(t) {
  if (!isNativeApp || !t.remindAt) return
  try {
    const { LocalNotifications } = window.Capacitor.Plugins
    await LocalNotifications.requestPermissions()
    const base = nativeId(t)
    const list = []
    if (t.daily) {
      const d = new Date(t.remindAt)
      const d5 = new Date(d.getTime() + REMIND_SECOND_MS)
      list.push({
        id: base,
        title: '待办提醒',
        body: t.text,
        schedule: { on: { hour: d.getHours(), minute: d.getMinutes() }, allowWhileIdle: true, repeats: true },
      })
      list.push({
        id: base + 1,
        title: '再次提醒 ⏰',
        body: t.text,
        schedule: { on: { hour: d5.getHours(), minute: d5.getMinutes() }, allowWhileIdle: true, repeats: true },
      })
    } else {
      const ts = new Date(t.remindAt).getTime()
      list.push({
        id: base,
        title: '待办提醒',
        body: t.text,
        schedule: { at: new Date(ts), allowWhileIdle: true },
      })
      const ts2 = ts + REMIND_SECOND_MS
      if (ts2 > Date.now()) {
        list.push({
          id: base + 1,
          title: '再次提醒 ⏰',
          body: t.text,
          schedule: { at: new Date(ts2), allowWhileIdle: true },
        })
      }
    }
    await LocalNotifications.schedule({ notifications: list })
  } catch {
    /* 原生插件不可用时静默,网页通知逻辑兜底 */
  }
}

async function cancelNativeReminder(t) {
  if (!isNativeApp || !t.remindAt) return
  try {
    const { LocalNotifications } = window.Capacitor.Plugins
    const base = nativeId(t)
    await LocalNotifications.cancel({ notifications: [{ id: base }, { id: base + 1 }] })
  } catch {
    /* 同上 */
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return list.map((t) => ({
      ...t,
      priority: PRIORITIES[t.priority] ? t.priority : 'medium',
      category: CATEGORIES[t.category] ? t.category : 'life',
      daily: !!t.daily,
    }))
  } catch {
    return []
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function addTask(text, priority, remindAt, category, daily) {
  tasks.unshift({
    id: Date.now() + Math.random(),
    text,
    done: false,
    priority,
    category,
    daily,
    remindAt: remindAt || null,
    notified: false,
    reNotified: false,
    firedDay: null,
    alert2: false,
    lastDoneDay: null,
  })
  saveTasks()
  render()
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id)
  if (t) {
    t.done = !t.done
    if (t.done) {
      cancelNativeReminder(t)
      if (t.daily) t.lastDoneDay = dayKey()
    } else {
      t.lastDoneDay = null
      if (t.remindAt) {
        t.notified = false
        t.reNotified = false
        t.firedDay = null
        t.alert2 = false
        if (t.daily || remindTs(t) > Date.now()) scheduleNativeReminder(t)
      }
    }
    saveTasks()
    render()
  }
}

function removeTask(id) {
  const t = tasks.find((x) => x.id === id)
  if (t) cancelNativeReminder(t)
  tasks = tasks.filter((t) => t.id !== id)
  saveTasks()
  render()
}

function updateTask(id, text, priority) {
  const t = tasks.find((t) => t.id === id)
  if (t) {
    t.text = text
    t.priority = priority
    saveTasks()
  }
  editingId = null
  render()
}

function clearDone() {
  for (const t of tasks) if (t.done) cancelNativeReminder(t)
  tasks = tasks.filter((t) => !t.done)
  saveTasks()
  render()
}

function clearAll() {
  for (const t of tasks) cancelNativeReminder(t)
  tasks = []
  confirmState = null
  saveTasks()
  render()
}

function priorityBadge(p) {
  const info = PRIORITIES[p]
  return `<span class="priority-badge" style="background:${info.soft};color:${info.color}">${info.label}</span>`
}

function categoryBadge(c) {
  const info = CATEGORIES[c]
  return `<span class="cat-badge" style="background:${info.soft};color:${info.color}">${info.icon} ${info.label}</span>`
}

function fmtRemind(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (tasks.find((t) => t.remindAt === iso)?.daily) return `每天 ${hm}`
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

function addSystemAlarm(t) {
  const d = t.daily ? dailyTargetToday(t) : new Date(t.remindAt)
  if (Number.isNaN(d.getTime())) return
  const intent =
    'intent:#Intent;action=android.intent.action.SET_ALARM;' +
    `i.android.intent.extra.alarm.HOUR=${d.getHours()};` +
    `i.android.intent.extra.alarm.MINUTES=${d.getMinutes()};` +
    `S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(t.text)};` +
    'i.android.intent.extra.alarm.SKIP_UI=true;end'
  window.location.href = intent
}

function render() {
  const pending = tasks.filter((t) => !t.done).length
  const done = tasks.filter((t) => t.done).length

  let visible = tasks
  if (filter === 'pending') visible = visible.filter((t) => !t.done)
  if (filter === 'done') visible = visible.filter((t) => t.done)
  if (filterCategory !== 'all') visible = visible.filter((t) => t.category === filterCategory)

  const isEmpty = visible.length === 0

  app.innerHTML = `
    <header class="app-header">
      <div class="dog-scene">
        <img class="mascot" src="mascot.png" alt="吉祥物" />
      </div>
      <h1 class="app-title">我的待办清单</h1>
      <p class="app-subtitle">记录每一件要做的事 🌸</p>
    </header>

    <div class="card">
      <form class="add-form" id="add-form">
        <div class="add-main">
          <input
            type="text"
            class="task-input"
            id="task-input"
            placeholder="${PROMPTS[0]}"
            autocomplete="off"
            maxlength="200"
          />
          <button type="submit" class="add-fab" id="add-btn" title="添加任务" aria-label="添加任务">➕</button>
        </div>
        <div class="add-options">
          <select class="opt-select" id="priority-select" title="优先级">
            <option value="high">🔥 高</option>
            <option value="medium" selected>⚡ 中</option>
            <option value="low">🌿 低</option>
          </select>
          <select class="opt-select" id="category-select" title="分类">
            ${Object.entries(CATEGORIES)
              .map(([k, v]) => `<option value="${k}" ${k === 'life' ? 'selected' : ''}>${v.icon} ${v.label}</option>`)
              .join('')}
          </select>
          <input type="datetime-local" class="opt-datetime" id="remind-at" title="提醒时间(可选)" />
          <label class="daily-chip" title="每天重复">
            <input type="checkbox" id="daily-toggle" /><span>🔁 每日</span>
          </label>
        </div>
      </form>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value pending">${pending}</div>
        <div class="stat-label">未完成</div>
      </div>
      <div class="stat">
        <div class="stat-value done">${done}</div>
        <div class="stat-label">已完成</div>
      </div>
    </div>

    <div class="filters">
      <button class="filter-btn ${filter === 'all' ? 'active' : ''}" data-filter="all">全部</button>
      <button class="filter-btn ${filter === 'pending' ? 'active' : ''}" data-filter="pending">未完成</button>
      <button class="filter-btn ${filter === 'done' ? 'active' : ''}" data-filter="done">已完成</button>
      <select class="filter-cat" id="category-filter" title="按分类筛选">
        <option value="all" ${filterCategory === 'all' ? 'selected' : ''}>全部分类</option>
        ${Object.entries(CATEGORIES)
          .map(
            ([k, v]) =>
              `<option value="${k}" ${filterCategory === k ? 'selected' : ''}>${v.icon} ${v.label}</option>`,
          )
          .join('')}
      </select>
    </div>

    <ul class="task-list">
      ${
        isEmpty
          ? `<div class="empty">
               <div class="empty-illustration">🌸</div>
               <div class="empty-title">${
                 filter === 'done'
                   ? '还没有已完成的任务'
                   : filter === 'pending'
                     ? '太棒了，没有未完成的任务！'
                     : '还没有任务'
               }</div>
               <div class="empty-hint">${
                 filter === 'done'
                   ? '完成一些任务后会显示在这里'
                   : filter === 'pending'
                     ? '继续保持，享受清闲吧'
                     : '在上方输入框添加你的第一个任务'
               }</div>
             </div>`
          : visible
              .map(
                (t) => `
          <li class="task-item ${t.done ? 'done' : ''} priority-${t.priority} ${isOverdue(t) ? 'overdue' : ''}" data-id="${t.id}">
            <span class="priority-bar"></span>
            <label class="checkbox">
              <input type="checkbox" ${t.done ? 'checked' : ''} />
              <span class="checkbox-box"></span>
            </label>
            ${
              editingId === t.id
                ? `<div class="edit-row">
                     <input type="text" class="edit-input" maxlength="200" />
                     <select class="priority-select edit-priority">
                       <option value="high" ${t.priority === 'high' ? 'selected' : ''}>高</option>
                       <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>中</option>
                       <option value="low" ${t.priority === 'low' ? 'selected' : ''}>低</option>
                     </select>
                     <button class="icon-btn save-btn" title="保存" aria-label="保存">✓</button>
                     <button class="icon-btn cancel-btn" title="取消" aria-label="取消">✕</button>
                   </div>`
                : `<span class="task-text"></span>
                   ${priorityBadge(t.priority)}
                   ${categoryBadge(t.category)}
                   ${t.daily ? `<span class="daily-badge">🔁 每日</span>` : ''}
                   ${t.remindAt ? `<span class="remind-badge">🔔 ${fmtRemind(t.remindAt)}</span>` : ''}
                   ${isOverdue(t) ? `<span class="overdue-badge">⏰ 已超时</span>` : ''}
                   ${t.remindAt && !t.done && isAndroid() && !isNativeApp ? `<button class="icon-btn alarm-btn" title="加入系统闹钟" aria-label="加入系统闹钟">⏰</button>` : ''}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`
            }
          </li>`,
              )
              .join('')
      }
    </ul>

    ${
      tasks.length > 0
        ? `<div class="clear-row">
             ${done > 0 ? `<button class="clear-btn" id="clear-done">🗑️ 清空已完成（${done}）</button>` : ''}
             <button class="clear-btn danger" id="clear-all">⚠️ 全部清空</button>
           </div>`
        : ''
    }

    ${
      confirmState === 'clear-all'
        ? `<div class="modal-overlay" id="modal-overlay">
             <div class="modal">
               <div class="modal-icon">⚠️</div>
               <div class="modal-title">确认全部清空？</div>
               <div class="modal-text">这将删除所有 ${tasks.length} 个任务，且无法恢复。</div>
               <div class="modal-actions">
                 <button class="modal-btn cancel" id="modal-cancel">取消</button>
                 <button class="modal-btn confirm" id="modal-confirm">确认清空</button>
               </div>
             </div>
           </div>`
        : ''
    }

    ${
      reminderModalTask
        ? `<div class="modal-overlay" id="reminder-overlay">
             <div class="modal reminder">
               <div class="modal-icon">⏰</div>
               <div class="modal-title">待办提醒</div>
               <div class="modal-text reminder-text"></div>
               <div class="modal-actions">
                 <button class="modal-btn cancel" id="reminder-dismiss">知道了</button>
                 <button class="modal-btn confirm" id="reminder-done">完成它 ✓</button>
               </div>
             </div>
           </div>`
        : ''
    }
  `

  // 填入任务文本（避免 HTML 注入）
  visible.forEach((t) => {
    const span = app.querySelector(`.task-item[data-id="${t.id}"] .task-text`)
    if (span) span.textContent = t.text

    if (editingId === t.id) {
      const input = app.querySelector(`.task-item[data-id="${t.id}"] .edit-input`)
      if (input) {
        input.value = t.text
        input.focus()
        input.select()
      }
    }
  })

  const reminderText = app.querySelector('#reminder-overlay .reminder-text')
  if (reminderText && reminderModalTask) reminderText.textContent = reminderModalTask.text

  bindEvents()
}

function bindEvents() {
  const form = app.querySelector('#add-form')
  const input = app.querySelector('#task-input')

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const value = input.value.trim()
    if (value) {
      const priority = app.querySelector('#priority-select').value
      const category = app.querySelector('#category-select').value
      const daily = app.querySelector('#daily-toggle').checked
      const remindRaw = app.querySelector('#remind-at').value
      const remindAt = remindRaw ? new Date(remindRaw).toISOString() : null
      if (remindAt && !isNativeApp && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      addTask(value, priority, remindAt, category, daily)
      app.querySelector('#remind-at').value = ''
      app.querySelector('#daily-toggle').checked = false
      if (remindAt) scheduleNativeReminder(tasks[0])
    }
  })

  app.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter
      render()
    })
  })

  const catFilter = app.querySelector('#category-filter')
  if (catFilter) {
    catFilter.addEventListener('change', () => {
      filterCategory = catFilter.value
      render()
    })
  }

  app.querySelectorAll('.task-item').forEach((li) => {
    const id = Number(li.dataset.id) || parseFloat(li.dataset.id)
    const cb = li.querySelector('input[type="checkbox"]')
    if (cb) cb.addEventListener('change', () => toggleTask(id))

    const editBtn = li.querySelector('.edit-btn')
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        editingId = id
        render()
      })
    }

    const delBtn = li.querySelector('.delete-btn')
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        li.classList.add('removing')
        setTimeout(() => removeTask(id), 180)
      })
    }

    const alarmBtn = li.querySelector('.alarm-btn')
    if (alarmBtn) {
      alarmBtn.addEventListener('click', () => {
        const t = tasks.find((x) => x.id === id)
        if (t && t.remindAt) addSystemAlarm(t)
      })
    }

    const saveBtn = li.querySelector('.save-btn')
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const newText = li.querySelector('.edit-input').value.trim()
        const newPriority = li.querySelector('.edit-priority').value
        if (newText) updateTask(id, newText, newPriority)
      })
    }

    const cancelBtn = li.querySelector('.cancel-btn')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        editingId = null
        render()
      })
    }

    const editInput = li.querySelector('.edit-input')
    if (editInput) {
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          const newText = editInput.value.trim()
          const newPriority = li.querySelector('.edit-priority').value
          if (newText) updateTask(id, newText, newPriority)
        } else if (e.key === 'Escape') {
          editingId = null
          render()
        }
      })
    }
  })

  const clearDoneBtn = app.querySelector('#clear-done')
  if (clearDoneBtn) clearDoneBtn.addEventListener('click', clearDone)

  const clearAllBtn = app.querySelector('#clear-all')
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      confirmState = 'clear-all'
      render()
    })
  }

  const modalCancel = app.querySelector('#modal-cancel')
  if (modalCancel) {
    modalCancel.addEventListener('click', () => {
      confirmState = null
      render()
    })
  }

  const modalConfirm = app.querySelector('#modal-confirm')
  if (modalConfirm) modalConfirm.addEventListener('click', clearAll)

  const overlay = app.querySelector('#modal-overlay')
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        confirmState = null
        render()
      }
    })
  }

  const reminderDismiss = app.querySelector('#reminder-dismiss')
  if (reminderDismiss) {
    reminderDismiss.addEventListener('click', () => {
      reminderModalTask = null
      render()
    })
  }

  const reminderDone = app.querySelector('#reminder-done')
  if (reminderDone) {
    reminderDone.addEventListener('click', () => {
      const t = reminderModalTask
      reminderModalTask = null
      if (t) toggleTask(t.id)
      else render()
    })
  }

  // 触屏设备(手机)不自动聚焦输入框,避免每次操作后弹出键盘
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (!editingId && finePointer && !reminderModalTask) input.focus()
}

render()

// ===== 打字机式轮播输入提示 =====
let promptIndex = 0
let promptChar = PROMPTS[0].length
let promptDeleting = true
setInterval(() => {
  const input = app.querySelector('#task-input')
  if (!input || input.value) return
  const text = PROMPTS[promptIndex]
  if (promptDeleting) {
    promptChar -= 1
    if (promptChar <= 0) {
      promptChar = 0
      promptDeleting = false
      promptIndex = (promptIndex + 1) % PROMPTS.length
    }
  } else {
    promptChar += 1
    if (promptChar >= text.length) {
      promptChar = text.length
      promptDeleting = true
    }
  }
  input.placeholder = (PROMPTS[promptDeleting ? promptIndex : promptIndex] || '').slice(
    0,
    Math.max(0, promptChar),
  )
}, 150)

// ===== 提醒状态机 =====
function fireReminder(t, second) {
  buzz()
  if (!isNativeApp && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(second ? '再次提醒 ⏰' : '待办提醒', {
      body: t.text,
      tag: `${nativeId(t)}-${second ? 2 : 1}`,
    })
  }
  if (document.visibilityState === 'visible') {
    reminderModalTask = t
    render()
  }
}

function checkReminders() {
  const now = Date.now()
  const todayK = dayKey()
  let changed = false

  for (const t of tasks) {
    // 每日任务:昨天完成后今天自动回到未完成
    if (t.daily && t.done && t.lastDoneDay && t.lastDoneDay !== todayK) {
      t.done = false
      changed = true
    }
    if (t.done || !t.remindAt) continue

    if (t.daily) {
      const target = dailyTargetToday(t).getTime()
      if (now >= target && t.firedDay !== todayK) {
        t.firedDay = todayK
        t.alert2 = false
        changed = true
        fireReminder(t, false)
      }
      if (t.firedDay === todayK && !t.alert2 && now >= target + REMIND_SECOND_MS) {
        t.alert2 = true
        changed = true
        fireReminder(t, true)
      }
    } else {
      const ts = new Date(t.remindAt).getTime()
      if (now >= ts && !t.notified) {
        t.notified = true
        changed = true
        fireReminder(t, false)
      }
      if (t.notified && !t.reNotified && now >= ts + REMIND_SECOND_MS) {
        t.reNotified = true
        changed = true
        fireReminder(t, true)
      }
    }
  }

  if (changed) saveTasks()
}

checkReminders()
setInterval(checkReminders, 20000)

// 每分钟刷新一次界面,让"已超时"标签及时出现(用户正在输入时不打扰)
setInterval(() => {
  const addInput = app.querySelector('#task-input')
  const editing = app.querySelector('.edit-input')
  if (editing) return
  if (addInput && addInput.value) return
  if (editingId || confirmState || reminderModalTask) return
  render()
}, 60000)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
