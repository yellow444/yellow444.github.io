async function loadMenu() {
  try {
    const response = await fetch('/partials/menu.html');
    const html = await response.text();
    const placeholder = document.getElementById('menu-placeholder');
    if (placeholder) {
      placeholder.innerHTML = html;
      document.dispatchEvent(new Event('menuLoaded'));
    }
  } catch (err) {
    console.error('Не удалось загрузить меню:', err);
  }
}

loadMenu();
