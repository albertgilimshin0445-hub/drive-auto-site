(() => {
  'use strict';

  const app = document.getElementById('app');
  const sourceFile = document.body.dataset.source;
  const sourceCommit = '21fd60055fc6adeceb4015b58cbef8bd12ff9200';
  const sourceUrl = `https://cdn.jsdelivr.net/gh/albertgilimshin0445-hub/drive-auto-site@${sourceCommit}/cars/${sourceFile}`;

  function removePhotoSources(root) {
    root.querySelectorAll('.gallery-meta a, .photo-source, .gallery-source').forEach((node) => node.remove());

    root.querySelectorAll('.gallery-meta').forEach((meta) => {
      [...meta.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && /источник|источники|source/i.test(node.textContent || '')) {
          node.remove();
        }
      });
      meta.style.justifyContent = 'flex-start';
    });
  }

  function selectMainImage(button) {
    const mainImage = document.getElementById('mainImage');
    if (!mainImage || !button) return;

    const previewImage = button.querySelector('img');
    const src = button.dataset.src || previewImage?.src;
    if (!src) return;

    mainImage.src = src;
    if (previewImage?.alt) mainImage.alt = previewImage.alt;

    document.querySelectorAll('.thumb').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
  }

  function selectColor(button) {
    const preview = document.getElementById('paintPreview');
    const colorName = document.getElementById('colorName');
    const offer = document.getElementById('offerLink');
    const title = document.querySelector('h1')?.textContent?.trim() || 'автомобиль';
    const price = document.querySelector('.price')?.textContent?.trim() || '';

    document.querySelectorAll('.swatch').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });

    const color = button.dataset.color || button.getAttribute('aria-label') || 'Выбранный цвет';
    const hex = button.dataset.hex || getComputedStyle(button).backgroundColor;

    if (preview && hex) preview.style.setProperty('--paint', hex);
    if (colorName) colorName.textContent = color;

    if (offer) {
      const subject = encodeURIComponent(`Заявка на ${title}`);
      const body = encodeURIComponent(`Автомобиль: ${title}\nЦвет: ${color}\nЦена: ${price}`);
      offer.href = `mailto:Primer4424@mail.ru?subject=${subject}&body=${body}`;
    }
  }

  function bindInteractions() {
    document.querySelectorAll('.thumb').forEach((button, index) => {
      button.type = 'button';
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.addEventListener('click', (event) => {
        event.preventDefault();
        selectMainImage(button);
      });
    });

    document.querySelectorAll('.swatch').forEach((button, index) => {
      button.type = 'button';
      button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      button.addEventListener('click', (event) => {
        event.preventDefault();
        selectColor(button);
      });
    });

    document.querySelectorAll('.gallery-card img').forEach((image) => {
      image.style.cursor = 'pointer';
      image.addEventListener('click', () => {
        const mainImage = document.getElementById('mainImage');
        const preview = document.getElementById('paintPreview');
        if (!mainImage) return;

        mainImage.src = image.src;
        mainImage.alt = image.alt || mainImage.alt;

        document.querySelectorAll('.thumb').forEach((item) => {
          const selected = (item.dataset.src || '') === image.src;
          item.classList.toggle('active', selected);
          item.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });

        preview?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  async function initialise() {
    if (!app || !sourceFile) return;

    try {
      const response = await fetch(sourceUrl, { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const sourceDocument = new DOMParser().parseFromString(html, 'text/html');
      const sourceMain = sourceDocument.querySelector('main.wrap');
      const sourceStyle = sourceDocument.querySelector('style');

      if (!sourceMain) throw new Error('Не найдено содержимое автомобиля');

      if (sourceStyle) {
        const style = document.createElement('style');
        style.dataset.carDetailStyle = 'true';
        style.textContent = sourceStyle.textContent + `
          .gallery-meta a{display:none!important}
          .gallery-meta{justify-content:flex-start!important}
          .thumb,.swatch,.gallery-card img{cursor:pointer}
          .thumb:focus-visible,.swatch:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
        `;
        document.head.appendChild(style);
      }

      const fragment = sourceMain.cloneNode(true);
      removePhotoSources(fragment);
      app.innerHTML = fragment.innerHTML;

      removePhotoSources(app);
      bindInteractions();
    } catch (error) {
      console.error(error);
      app.innerHTML = `
        <section class="load-error">
          <h1>Не удалось загрузить автомобиль</h1>
          <p>Обновите страницу или вернитесь в каталог.</p>
          <a href="../index.html#cars">← Вернуться к автомобилям</a>
        </section>`;
    }
  }

  initialise();
})();
