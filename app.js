'use strict';
const categoryNames = { omni: 'OMNI / 多模态', training: 'FOUNDATION / 基座训练', speech: 'SPEECH & AGENT / 语音交互' };
const grid = document.querySelector('#projects-grid');
const count = document.querySelector('.project-count');
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let currentFilter = 'all';

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter').forEach(button => {
    const selected = button.dataset.filter === filter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  let visible = 0;
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = filter !== 'all' && card.dataset.category !== filter;
    if (!card.hidden) visible += 1;
  });
  count.textContent = `${visible} 个项目`;
}

fetch('projects.json').then(response => {
  if (!response.ok) throw new Error('Projects could not be loaded');
  return response.json();
}).then(projects => {
  grid.innerHTML = projects.map((p, i) => `<article class="project-card ${p.category === 'omni' ? 'featured' : ''}" data-category="${escapeHTML(p.category)}" id="project-${escapeHTML(p.id)}">
    <div class="project-topline"><span>${escapeHTML(categoryNames[p.category])}</span><span class="project-number">${String(i + 1).padStart(2, '0')} /</span></div>
    <h3>${escapeHTML(p.title)}</h3>
    <p class="project-role">${escapeHTML(p.company)} · ${escapeHTML(p.role)}${p.date ? `<br>${escapeHTML(p.date)}` : ''}</p>
    <p class="project-summary">${escapeHTML(p.summary)}</p>
    <div class="tech-tags">${p.tags.map(tag => `<span>${escapeHTML(tag)}</span>`).join('')}</div>
    ${p.highlights.length ? `<div class="project-highlights">${p.highlights.map(item => `<div><strong>${escapeHTML(item.value)}</strong><p>${escapeHTML(item.label)}</p></div>`).join('')}</div>` : ''}
    <details><summary aria-label="展开或收起${escapeHTML(p.title)}的项目详情">项目详情</summary><div class="project-detail-content">${p.details.map(item => `<div class="detail-item"><h4>${escapeHTML(item.label)}</h4><p>${escapeHTML(item.text)}</p></div>`).join('')}</div></details>
  </article>`).join('');
  setFilter(currentFilter);
}).catch(() => {
  grid.innerHTML = '<p>项目内容暂时未能加载，请刷新页面后重试。</p>';
  count.textContent = '项目暂时无法加载';
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
const navLinks = [...document.querySelectorAll('nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
let scrollScheduled = false;
function updateNavigation() {
  const marker = window.scrollY + 160;
  let active = sections[0];
  sections.forEach(section => { if (section.offsetTop <= marker) active = section; });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) active = sections[sections.length - 1];
  navLinks.forEach(link => {
    const selected = link.hash === `#${active.id}`;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
window.addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateNavigation); } }, { passive: true });
updateNavigation();

document.querySelector('#copy-email').addEventListener('click', async () => {
  const email = '18310206637@163.com';
  const status = document.querySelector('#copy-status');
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    status.textContent = '邮箱已复制，可以粘贴到邮件应用。';
  } catch {
    status.textContent = `请手动复制邮箱：${email}`;
  }
});
