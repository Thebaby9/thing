import './style.css'

const STORAGE_KEY = 'todo-tasks-v2'

const PRIORITIES = {
  high: { label: '高', color: '#ef4444', soft: '#fef2f2' },
  medium: { label: '中', color: '#f59e0b', soft: '#fffbeb' },
  low: { label: '低', color: '#16a34a', soft: '#f0fdf4' },
}

const app = document.querySelector('#app')

// Capacitor 原生壳(内置打包版)检测:原生下用本地通知插件,提醒在应用关闭后也能触发
const isNativeApp = !!window.Capacitor && window.Capacitor.isNativePlatform()

function nativeId(t) {
  return Math.abs(Math.floor(t.id)) % 2000000000
}

async function scheduleNativeReminder(t) {
  if (!isNativeApp || !t.remindAt) return
  try {
    const { LocalNotifications } = window.Capacitor.Plugins
    await LocalNotifications.requestPermissions()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: nativeId(t),
          title: '待办提醒',
          body: t.text,
          schedule: { at: new Date(t.remindAt) },
        },
      ],
    })
  } catch {
    /* 原生插件不可用时静默,网页通知逻辑兜底 */
  }
}

async function cancelNativeReminder(t) {
  if (!isNativeApp || !t.remindAt) return
  try {
    const { LocalNotifications } = window.Capacitor.Plugins
    await LocalNotifications.cancel({ notifications: [{ id: nativeId(t) }] })
  } catch {
    /* 同上 */
  }
}

let tasks = loadTasks()
let filter = 'all' // all | pending | done
let editingId = null
let confirmState = null // null | 'clear-all'

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list = raw ? JSON.parse(raw) : []
    return list.map((t) => ({
      ...t,
      priority: PRIORITIES[t.priority] ? t.priority : 'medium',
    }))
  } catch {
    return []
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function addTask(text, priority, remindAt) {
  tasks.unshift({
    id: Date.now() + Math.random(),
    text,
    done: false,
    priority,
    remindAt: remindAt || null,
    reminded: false,
  })
  saveTasks()
  render()
}

function toggleTask(id) {
  const t = tasks.find((t) => t.id === id)
  if (t) {
    t.done = !t.done
    saveTasks()
    if (t.done) cancelNativeReminder(t)
    else if (t.remindAt && new Date(t.remindAt).getTime() > Date.now()) {
      scheduleNativeReminder(t)
    }
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
  tasks = tasks.filter((t) => !t.done)
  saveTasks()
  render()
}

function clearAll() {
  tasks = []
  saveTasks()
  confirmState = null
  render()
}

function priorityBadge(p) {
  const info = PRIORITIES[p]
  return `<span class="priority-badge" style="background:${info.soft};color:${info.color}">${info.label}</span>`
}

function render() {
  const pending = tasks.filter((t) => !t.done).length
  const done = tasks.filter((t) => t.done).length

  let visible = tasks
  if (filter === 'pending') visible = tasks.filter((t) => !t.done)
  if (filter === 'done') visible = tasks.filter((t) => t.done)

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
          <li class="task-item ${t.done ? 'done' : ''} priority-${t.priority}" data-id="${t.id}">
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
                   ${t.remindAt ? `<span class="remind-badge">🔔 ${fmtRemind(t.remindAt)}</span>` : ''}
                   ${t.remindAt && !t.done && isAndroid() && !isNativeApp ? `<button class="icon-btn alarm-btn" title="加入系统闹钟" aria-label="加入系统闹钟">⏰</button>` : ''}
                   <button class="icon-btn edit-btn" title="编辑" aria-label="编辑任务">✎</button>
                   <button class="delete-btn" title="删除" aria-label="删除任务">🗑</button>`
            }
          </li>`
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
      const remindRaw = app.querySelector('#remind-at').value
      const remindAt = remindRaw ? new Date(remindRaw).toISOString() : null
      if (remindAt && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      addTask(value, priority, remindAt)
      app.querySelector('#remind-at').value = ''
      if (remindAt) scheduleNativeReminder(tasks[0])
    }
  })

  app.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter
      render()
    })
  })

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

  // 触屏设备(手机)不自动聚焦输入框,避免每次操作后弹出键盘
  const finePointer = window.matchMedia('(pointer: fine)').matches
  if (!editingId && finePointer) input.focus()
}

render()

function fmtRemind(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent)
}

function addSystemAlarm(t) {
  const d = new Date(t.remindAt)
  if (Number.isNaN(d.getTime())) return
  const intent =
    'intent:#Intent;action=android.intent.action.SET_ALARM;' +
    `i.android.intent.extra.alarm.HOUR=${d.getHours()};` +
    `i.android.intent.extra.alarm.MINUTES=${d.getMinutes()};` +
    `S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(t.text)};` +
    'i.android.intent.extra.alarm.SKIP_UI=true;end'
  window.location.href = intent
}

function checkReminders() {
  const now = Date.now()
  let changed = false
  for (const t of tasks) {
    if (t.remindAt && !t.reminded && !t.done && new Date(t.remindAt).getTime() <= now) {
      t.reminded = true
      changed = true
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('待办提醒', { body: t.text, tag: String(t.id) })
      }
    }
  }
  if (changed) saveTasks()
}

checkReminders()
setInterval(checkReminders, 20000)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {})
  })
}
