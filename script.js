document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');

  // 获取当前 HTML 文件链接，并修改为 "zc.html"
  const currentURL = window.location.href;
  const zcURL = currentURL.replace(/\/[^\/]*$/, '/zc.html');

  // 读取 zc.html 内容，并插入 posts-container 中
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
        if (dateText.includes('春') || dateText.includes('夏') ||
            dateText.includes('秋') || dateText.includes('冬')) {
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

  // 搜索功能 & 隐藏/显示横幅部分
  document.getElementById('search').addEventListener('input', function () {
    let filter = this.value.toLowerCase();
    let posts = document.querySelectorAll('.post');
    posts.forEach(post => {
      let title = post.getAttribute('data-title').toLowerCase();
      let tags = post.getAttribute('data-tags').toLowerCase();
      post.style.display = (title.includes(filter) || tags.includes(filter)) ? '' : 'none';
    });
    // 当搜索框有内容时隐藏横幅，否则显示横幅
    const banner = document.getElementById('banner');
    if (this.value.trim() !== '') {
      banner.style.display = 'none';
    } else {
      banner.style.display = 'block';
    }
  });

  // 按日期升序排序帖子
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

  // 点击帖子时弹出下载选择弹窗（依据三个属性）
  function addPostClickEvents() {
    document.querySelectorAll('.post').forEach(post => {
      post.addEventListener('click', function (e) {
        showDownloadModal(post);
        e.stopPropagation();
      });
    });
  }

  // 弹出下载选择弹窗函数
  function showDownloadModal(post) {
    let linkLossless = post.getAttribute('data-link-lossless');
    let linkHigh = post.getAttribute('data-link-high');
    let linkNormal = post.getAttribute('data-link-normal');

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

  // “关于”按钮点击后，仅隐藏帖子展示，并提示
  const homeLink = document.querySelector('nav a[href="#home"]');
  const aboutLink = document.querySelector('nav a[href="#about"]');
  const postsContainer = document.getElementById('posts-container');
  const pagination = document.getElementById('pagination');
  const disablePaginationButton = document.getElementById('disable-pagination-btn');

  function showHome() {
    postsContainer.style.display = '';
    pagination.style.display = '';
    disablePaginationButton.style.display = '';
  }
  function showAbout() {
    postsContainer.style.display = 'none';
    pagination.style.display = 'none';
    disablePaginationButton.style.display = 'none';
    alert("关于页面功能已禁用。");
  }
  homeLink.addEventListener('click', showHome);
  aboutLink.addEventListener('click', showAbout);

  // 切换帖子显示/隐藏状态
  document.querySelector('.t-bar-support').addEventListener('click', function () {
    let posts = document.querySelectorAll('.post');
    if (this.textContent === '显示') {
      posts.forEach(post => post.classList.remove('hidden'));
      this.textContent = '隐藏';
    } else {
      posts.forEach(post => {
        if (post.getAttribute('data-hidden') === 'true') {
          post.classList.add('hidden');
        }
      });
      this.textContent = '显示';
    }
  });

  // 初始调用排序与分页
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

// 随机生成渐变背景（头部）
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

/* ========== 新增：Banner轮播图代码，包括自动播放 ========== */
document.addEventListener('DOMContentLoaded', function() {
  const slides = document.querySelectorAll('#banner .slide');
  const prevButton = document.querySelector('#banner .prev');
  const nextButton = document.querySelector('#banner .next');
  let currentSlide = 0;
  // 定义显示幻灯片函数
  function showSlide(index) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
  }
  // 左右按钮点击事件
  prevButton.addEventListener('click', function(e) {
    e.stopPropagation();
    showSlide(currentSlide - 1);
    resetAutoplay();
  });
  nextButton.addEventListener('click', function(e) {
    e.stopPropagation();
    showSlide(currentSlide + 1);
    resetAutoplay();
  });
  // 点击每个 slide 内的 h2 可跳转链接
  slides.forEach(slide => {
    const title = slide.querySelector('h2');
    title.addEventListener('click', function(e) {
      e.stopPropagation();
      const link = slide.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });
  // 自动播放：每隔 5 秒切换一次幻灯片
  let autoplayInterval = setInterval(() => {
    showSlide(currentSlide + 1);
  }, 5000);
  // 当用户主动操作时重置自动播放计时器
  function resetAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }
});
