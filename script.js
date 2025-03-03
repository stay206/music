document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');

  // 获取当前HTML文件的链接，并修改后缀为 "zc.html"
  const currentURL = window.location.href; 
  const zcURL = currentURL.replace(/\/[^\/]*$/, '/zc.html');

  // 读取 zc.html 文件内容并插入到 <main id="posts-container"> 标签内
  fetch(zcURL)
    .then(response => response.text())
    .then(zcPosts => {
      console.log('Fetched posts successfully');
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = zcPosts;
      initializePosts();
      setDefaultImageIfEmpty();
    })
    .catch(error => {
      console.error('Error fetching the posts:', error);
    });

  // 初始化帖子数据
  function initializePosts() {
    let posts = document.querySelectorAll('.post');
    posts.forEach(post => {
      let titleElement = post.querySelector('.post-title h2');
      let subtitleElement = post.querySelector('.post-title h3');
      let title = titleElement ? titleElement.textContent.trim() : "";
      let subtitle = subtitleElement ? subtitleElement.textContent.trim() : "";
      let fullTitle = title + " " + subtitle;
      post.setAttribute('data-title', fullTitle);

      let tagsElements = post.querySelectorAll('.tag');
      let tags = Array.from(tagsElements)
        .map(tagElement => tagElement.textContent.trim())
        .join(',');
      post.setAttribute('data-tags', tags);

      let dateElement = post.querySelector('.date-text');
      if (dateElement) {
        let dateText = dateElement.textContent.trim();
        let dateMatches = dateText.match(/(\d{4})年(\d{1,2})月(?:(\d{1,2})日?)?/);
        if (dateText.includes('春') || dateText.includes('夏') || dateText.includes('秋') || dateText.includes('冬')) {
          post.setAttribute('data-date', '');
          post.setAttribute('data-sort-key', '9999-99-99');
        } else if (dateMatches) {
          let year = dateMatches[1];
          let month = dateMatches[2].padStart(2, '0');
          let day = dateMatches[3] ? dateMatches[3].padStart(2, '0') : '99';
          let formattedDate = `${year}-${month}-${day}`;
          post.setAttribute('data-date', formattedDate);
          post.setAttribute('data-sort-key', `${year}-${month}-${day === '99' ? '9999' : day}`);
        }
      }
    });

    sortPostsByDate();
    paginatePosts();
    addPostClickEvents();
  }

  // 设置默认图片
  function setDefaultImageIfEmpty() {
    let posts = document.querySelectorAll('.post img');
    posts.forEach(img => {
      if (!img.getAttribute('src')) {
        img.setAttribute('src', 'https://stay206.github.io/portfolio-master/img/ava.jpg');
      }
    });
  }

  // 搜索功能
  document.getElementById('search').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    let posts = document.querySelectorAll('.post');
    posts.forEach(post => {
      let title = post.getAttribute('data-title').toLowerCase();
      let tags = post.getAttribute('data-tags').toLowerCase();
      if (title.includes(filter) || tags.includes(filter)) {
        post.style.display = '';
      } else {
        post.style.display = 'none';
      }
    });
  });

  // 日期排序（升序）
  function sortPostsByDate() {
    let postsContainer = document.getElementById('posts-container');
    let posts = Array.from(postsContainer.getElementsByClassName('post'));
    posts.sort((a, b) => {
      let dateA = a.getAttribute('data-sort-key');
      let dateB = b.getAttribute('data-sort-key');
      return dateA.localeCompare(dateB);
    });
    posts.forEach(post => postsContainer.appendChild(post));
  }

  // 分页显示
  function paginatePosts() {
    const postsPerPage = 10;
    const postsContainer = document.getElementById('posts-container');
    const posts = Array.from(postsContainer.getElementsByClassName('post'));
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(posts.length / postsPerPage);

    function showPage(page) {
      posts.forEach((post, index) => {
        post.style.display = (index >= (page - 1) * postsPerPage && index < page * postsPerPage) ? '' : 'none';
      });

      pagination.innerHTML = '';
      for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.toggle('disabled', i === page);
        button.addEventListener('click', () => {
          showPage(i);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        pagination.appendChild(button);
      }

      const banner = document.getElementById('banner');
      banner.style.display = (page === 1) ? 'block' : 'none';
    }
    showPage(1);
  }

  // 切换分页功能
  let paginationDisabled = false;
  document.getElementById('disable-pagination-btn').addEventListener('click', function () {
    const posts = document.querySelectorAll('.post');
    if (!paginationDisabled) {
      posts.forEach(post => post.style.display = '');
      document.getElementById('pagination').style.display = 'none';
      this.textContent = '分页显示';
    } else {
      paginatePosts();
      document.getElementById('pagination').style.display = 'flex';
      this.textContent = '全部显示';
    }
    paginationDisabled = !paginationDisabled;
  });

  // 返回顶部功能
  function gotop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  document.getElementById('back-to-top').addEventListener('click', gotop);

  // 修改：点击帖子时弹出下载选择弹窗而非直接跳转
  function addPostClickEvents() {
    document.querySelectorAll('.post').forEach(post => {
      post.addEventListener('click', function (e) {
        showDownloadModal(post);
        e.stopPropagation();
      });
    });
  }

  // 弹出下载选择弹窗
  function showDownloadModal(post) {
    let linkLossless = post.getAttribute('data-link-lossless') || post.getAttribute('data-link');
    let linkHigh = post.getAttribute('data-link-high') || post.getAttribute('data-link');
    let linkNormal = post.getAttribute('data-link-normal') || post.getAttribute('data-link');

    const modal = document.createElement('div');
    modal.className = 'download-modal';
    const modalContent = document.createElement('div');
    modalContent.className = 'download-modal-content';

    function createButton(label, link) {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.addEventListener('click', function () {
        window.open(link, '_blank');
        document.body.removeChild(modal);
      });
      return btn;
    }

    modalContent.appendChild(createButton('无损下载', linkLossless));
    modalContent.appendChild(createButton('高品下载', linkHigh));
    modalContent.appendChild(createButton('普通下载', linkNormal));
    modal.appendChild(modalContent);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    document.body.appendChild(modal);
  }

  // 表格填充，用于“关于”页面（如果需要）
  function populateTable() {
    const tableBody = document.querySelector('tbody');
    const posts = Array.from(document.querySelectorAll('.post'));
    
    const specialPosts = posts.filter(post => {
      const dateElement = post.querySelector('.date-text');
      return dateElement && (dateElement.textContent.includes('春') ||
                              dateElement.textContent.includes('夏') ||
                              dateElement.textContent.includes('秋') ||
                              dateElement.textContent.includes('冬'));
    });

    posts
      .filter(post => !specialPosts.includes(post))
      .forEach(post => {
        const titleElement = post.querySelector('.post-title h2');
        const subtitleElement = post.querySelector('.post-title h3');
        const firstTagElement = post.querySelector('.tag');
        const date = post.getAttribute('data-date');
        const weekday = getWeekday(date);
        const episodeElement = post.querySelector('.jishu');
        const updateElement = post.querySelector('div[style*="display: none"]');

        const title = titleElement ? titleElement.textContent.trim() : "";
        const subtitle = subtitleElement ? subtitleElement.textContent.trim() : "";
        const firstTag = firstTagElement ? firstTagElement.textContent.trim() : "";
        const episodeCount = episodeElement ? episodeElement.textContent.trim() : "";
        const updateDate = updateElement ? updateElement.textContent.trim() : "";
        const displayDate = date.endsWith('-99') ? date.substring(0, 7) : date;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
          <td class="left-align" data-label="中文名">${title}</td>
          <td class="left-align" data-label="原名">${subtitle}</td>
          <td class="nowrap" data-label="类型">${firstTag}</td>
          <td class="nowrap" data-label="播放时间">${displayDate}</td>
          <td class="nowrap" data-label="放送星期">${weekday}</td>
          <td class="nowrap" data-label="国内更新时间">${updateDate}</td>
          <td class="nowrap" data-label="集数">${episodeCount}</td>
        `;
        if (post.classList.contains('hidden')) {
          newRow.classList.add('hidden');
        }
        tableBody.appendChild(newRow);
      });

    specialPosts.forEach(post => {
      const titleElement = post.querySelector('.post-title h2');
      const subtitleElement = post.querySelector('.post-title h3');
      const firstTagElement = post.querySelector('.tag');
      const dateElement = post.querySelector('.date-text');
      const episodeElement = post.querySelector('.jishu');
      const updateElement = post.querySelector('div[style*="display: none"]');

      const title = titleElement ? titleElement.textContent.trim() : "";
      const subtitle = subtitleElement ? subtitleElement.textContent.trim() : "";
      const firstTag = firstTagElement ? firstTagElement.textContent.trim() : "";
      const episodeCount = episodeElement ? episodeElement.textContent.trim() : "";
      const updateDate = updateElement ? updateElement.textContent.trim() : "";
      const season = dateElement ? dateElement.textContent.trim() : "";

      const newRow = document.createElement('tr');
      newRow.innerHTML = `
          <td class="left-align" data-label="中文名">${title}</td>
          <td class="left-align" data-label="原名">${subtitle}</td>
          <td class="nowrap" data-label="类型">${firstTag}</td>
          <td class="nowrap" data-label="播放时间">${season}</td>
          <td class="nowrap" data-label="放送星期"></td>
          <td class="nowrap" data-label="国内更新时间">${updateDate}</td>
          <td class="nowrap" data-label="集数">${episodeCount}</td>
        `;
      if (post.classList.contains('hidden')) {
        newRow.classList.add('hidden');
      }
      tableBody.appendChild(newRow);
    });
  }

  // 导航显示与隐藏（首页和时间表）
  const homeLink = document.querySelector('nav a[href="#home"]');
  const aboutLink = document.querySelector('nav a[href="#about"]');
  const postsContainer = document.getElementById('posts-container');
  const pagination = document.getElementById('pagination');
  const disablePaginationButton = document.getElementById('disable-pagination-btn');
  let tableContainer;

  function showHome() {
    postsContainer.style.display = '';
    pagination.style.display = '';
    disablePaginationButton.style.display = '';
    if (tableContainer && tableContainer.parentNode) {
      tableContainer.parentNode.removeChild(tableContainer);
    }
  }

  function showAbout() {
    fetch('https://stay206.github.io/xinfan/bg')
      .then(response => response.text())
      .then(data => {
        tableContainer = document.createElement('div');
        tableContainer.innerHTML = data;
        banner.insertAdjacentElement('afterend', tableContainer);
        populateTable();
      })
      .catch(error => {
        console.error('Error loading table:', error);
      });

    postsContainer.style.display = 'none';
    pagination.style.display = 'none';
    disablePaginationButton.style.display = 'none';
  }

  homeLink.addEventListener('click', showHome);
  aboutLink.addEventListener('click', showAbout);

  // 切换帖子显示/隐藏状态
  document.querySelector('.t-bar-support').addEventListener('click', function () {
    let posts = document.querySelectorAll('.post');
    let tableRows = tableContainer ? tableContainer.querySelectorAll('tbody tr') : [];

    if (this.textContent === '显示') {
      posts.forEach(post => post.classList.remove('hidden'));
      tableRows.forEach(row => row.classList.remove('hidden'));
      this.textContent = '隐藏';
    } else {
      posts.forEach(post => {
        if (post.getAttribute('data-hidden') === 'true') {
          post.classList.add('hidden');
        }
      });
      tableRows.forEach(row => {
        let title = row.querySelector('td').textContent.trim();
        let matchingPost = Array.from(posts).find(post =>
          post.querySelector('.post-title h2').textContent.trim() === title
        );
        if (matchingPost && matchingPost.getAttribute('data-hidden') === 'true') {
          row.classList.add('hidden');
        }
      });
      this.textContent = '显示';
    }
  });

  // 初始调用排序和分页
  sortPostsByDate();
  paginatePosts();
});

// 切换导航栏链接激活状态
document.addEventListener('DOMContentLoaded', function () {
  const homeLink = document.getElementById('home-link');
  const aboutLink = document.getElementById('about-link');

  homeLink.addEventListener('click', function () {
    homeLink.classList.add('active');
    aboutLink.classList.remove('active');
  });

  aboutLink.addEventListener('click', function () {
    aboutLink.classList.add('active');
    homeLink.classList.remove('active');
  });
});

// 随机生成渐变背景
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function setRandomGradient() {
  const color1 = getRandomColor();
  const color2 = getRandomColor();
  const color3 = getRandomColor();
  const gradient = `linear-gradient(270deg, ${color1}, ${color2}, ${color3}, ${color1})`;

  const header = document.querySelector('header');
  header.style.background = gradient;
  header.style.backgroundSize = '600% 600%';
  header.style.animation = 'gradient 15s ease infinite';
}

document.addEventListener('DOMContentLoaded', setRandomGradient);

function getWeekday(dateString) {
  const date = new Date(dateString);
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  return isNaN(date.getUTCDay()) ? "" : weekdays[date.getUTCDay()];
}
