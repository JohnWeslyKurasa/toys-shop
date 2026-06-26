import { showToast } from './app.js';

let socket = null;
let authToken = localStorage.getItem("mt_jwt") || null; // Fixed key
let isInitialized = false;
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export function initNotifications() {
  if (isInitialized) return;
  isInitialized = true;

  const notificationToggles = [document.getElementById('notificationToggle'), document.getElementById('notificationToggleMobile')].filter(Boolean);
  const notificationPanel = document.getElementById('notificationPanel');
  const notificationBody = document.getElementById('notificationBody');
  const markAllReadBtn = document.getElementById('markAllReadBtn');

  const adminForm = document.getElementById('notificationManageForm');
  const tabManageNotifications = document.getElementById('tabManageNotifications');
  const notificationsDashboardSection = document.getElementById('notificationsDashboardSection');
  
  if (!notificationPanel) return;

  // Admin Tab Switching
  if (tabManageNotifications && notificationsDashboardSection) {
    tabManageNotifications.addEventListener('click', () => {
      ['tabManageProducts', 'tabManageSlides', 'tabManageOrders'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      ['productsDashboardSection', 'slidesDashboardSection', 'ordersDashboardSection'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      });
      
      const addProdBtn = document.getElementById('addNewProductBtn');
      const addSlideBtn = document.getElementById('addNewSlideBtn');
      if (addProdBtn) addProdBtn.style.display = 'none';
      if (addSlideBtn) addSlideBtn.style.display = 'none';
      
      tabManageNotifications.classList.add('active');
      notificationsDashboardSection.style.display = 'flex';
    });
  }

  // Show Bell for all users
  notificationToggles.forEach(toggle => {
    toggle.style.display = 'flex';
    // Toggle Panel
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      notificationPanel.classList.toggle('active');
    });
  });

  initSocket();
  fetchNotifications();
  updateBadgeCount();

  // Close Panel on outside click
  document.addEventListener('click', (e) => {
    const isClickInsideToggles = notificationToggles.some(toggle => toggle.contains(e.target));
    if (notificationPanel.classList.contains('active') && !notificationPanel.contains(e.target) && !isClickInsideToggles) {
      notificationPanel.classList.remove('active');
    }
  });

  // Mark all read
  if (markAllReadBtn) {
    markAllReadBtn.addEventListener('click', async () => {
      try {
        if (authToken) {
          await fetch(BASE_URL + '/notifications/read-all', {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
        } else {
          // Fallback for public: mark in localStorage
          const res = await fetch(BASE_URL + '/notifications/public');
          const data = await res.json();
          if (data.success) {
            const readPublicNotifications = JSON.parse(localStorage.getItem('mt_read_notifications') || '[]');
            data.data.forEach(n => {
              if (!readPublicNotifications.includes(n._id)) readPublicNotifications.push(n._id);
            });
            localStorage.setItem('mt_read_notifications', JSON.stringify(readPublicNotifications));
          }
        }
        updateBadgeCount();
        fetchNotifications();
      } catch (err) {
        console.error('Failed to mark all as read', err);
      }
    });
  }

  // Admin Form Submit
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
        const payload = {
          title: document.getElementById('notifTitle').value,
          type: document.getElementById('notifType').value,
          message: document.getElementById('notifMessage').value,
          targetAudience: document.getElementById('notifTargetAudience').value,
          priority: document.getElementById('notifPriority').value,
        };

        try {
          const response = await fetch(BASE_URL + '/notifications/admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
          });
          const data = await response.json();
          if (data.success) {
            showToast('Notification Broadcasted Successfully!', 'success');
            adminForm.reset();
          } else {
            showToast(data.message || 'Failed to send', 'error');
          }
        } catch (err) {
          showToast('Error sending broadcast', 'error');
        }
    });
  }
}

function initSocket() {
  if (window.io && !socket) {
    const socketUrl = BASE_URL.replace('/api', '');
    socket = window.io(socketUrl);
    
    socket.on('new_notification', (notification) => {
      // Show toast
      showToast(notification.title, 'info');
      // Update data
      fetchNotifications();
      updateBadgeCount();
      
      // Pulse animation
      const badges = [document.getElementById('notificationBadge'), document.getElementById('notificationBadgeMobile')].filter(Boolean);
      badges.forEach(badge => {
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 3000);
      });
    });
  }
}

async function fetchNotifications() {
  try {
    const url = authToken ? BASE_URL + '/notifications' : BASE_URL + '/notifications/public';
    const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
    
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (data.success) {
      let notifs = data.data;
      if (!authToken) {
        const readPublicNotifications = JSON.parse(localStorage.getItem('mt_read_notifications') || '[]');
        notifs = data.data.map(n => ({
          notificationId: n,
          isRead: readPublicNotifications.includes(n._id)
        }));
      }
      renderNotifications(notifs);
    }
  } catch (error) {
    console.error(error);
  }
}

async function updateBadgeCount() {
  try {
    const badges = [document.getElementById('notificationBadge'), document.getElementById('notificationBadgeMobile')].filter(Boolean);
    if (badges.length === 0) return;

    if (authToken) {
      const res = await fetch(BASE_URL + '/notifications/unread-count', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (data.success) {
        badges.forEach(badge => {
          if (data.count > 0) {
            badge.textContent = data.count;
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        });
      }
    } else {
      const res = await fetch(BASE_URL + '/notifications/public');
      const data = await res.json();
      if (data.success) {
        const readPublicNotifications = JSON.parse(localStorage.getItem('mt_read_notifications') || '[]');
        const unreadCount = data.data.filter(n => !readPublicNotifications.includes(n._id)).length;
        badges.forEach(badge => {
          if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
          } else {
            badge.style.display = 'none';
          }
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function renderNotifications(notifications) {
  const body = document.getElementById('notificationBody');
  if (!notifications || notifications.length === 0) {
    body.innerHTML = '<p class="empty-state">No new notifications</p>';
    return;
  }

  body.innerHTML = '';
  notifications.forEach(un => {
    // Robust mapping: fallback to `un` if `un.notificationId` is missing or is just a string ID
    const n = (un.notificationId && typeof un.notificationId === 'object') ? un.notificationId : un;
    if (!n) return; // Skip if completely missing (e.g., deleted notification)
    
    const isRead = un.isRead !== undefined ? un.isRead : false;
    
    const item = document.createElement('div');
    item.className = `notification-item ${!isRead ? 'unread' : ''}`;
    
    // Icon based on type
    let iconSvg = '<svg viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,19.93C7.05,19.43 4,16.05 4,12C4,7.95 7.05,4.57 11,4.07V19.93M13,4.07C16.95,4.57 20,7.95 20,12C20,16.05 16.95,19.43 13,19.93V4.07Z"/></svg>';
    const type = n.type || 'General announcements';
    if (type === 'Flash sales' || type === 'Discounts') {
      iconSvg = '<svg viewBox="0 0 24 24"><path d="M12,15.39L8.24,17.66L9.23,13.38L5.91,10.5L10.29,10.13L12,6.09L13.71,10.13L18.09,10.5L14.77,13.38L15.76,17.66M22,9.24L14.81,8.63L12,2L9.19,8.63L2,9.24L7.45,13.97L5.82,21L12,17.27L18.18,21L16.54,13.97L22,9.24Z"/></svg>';
    }

    item.innerHTML = `
      <div class="notif-icon">${iconSvg}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title || 'Notification'}</div>
        <div class="notif-message">${n.message || ''}</div>
        <div class="notif-time">${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
      </div>
    `;

    item.addEventListener('click', async () => {
      if (!un.isRead) {
        if (authToken) {
          await fetch(`${BASE_URL}/notifications/read/${n._id}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          un.isRead = true;
        } else {
          const readPublicNotifications = JSON.parse(localStorage.getItem('mt_read_notifications') || '[]');
          if (!readPublicNotifications.includes(n._id)) {
            readPublicNotifications.push(n._id);
            localStorage.setItem('mt_read_notifications', JSON.stringify(readPublicNotifications));
          }
        }
        un.isRead = true;
        item.classList.remove('unread');
        updateBadgeCount();
      }
    });

    body.appendChild(item);
  });
}

// Intercept auth token updates from main app
export function setNotificationAuthToken(token) {
  authToken = token;
  const notificationToggle = document.getElementById('notificationToggle');
  if (notificationToggle) {
    notificationToggle.style.display = 'flex';
    initSocket();
    fetchNotifications();
    updateBadgeCount();
  }
}
