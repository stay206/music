document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM fully loaded and parsed');

  // 获取当前HTML文件的链接，并修改后缀为 "zc.html"
  const currentURL = window.location.href; 
  const zcURL = currentURL.replace(/\/[^\/]*$/, '/zc.html');

  // 使用给出的 URL 读取 zc 文件内容并插入到 <main id="posts-container"> 标签内
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
      let tags = Array.from(tagsElements).map(tagElement => tagElement.textContent.trim()).join(',');
      post.setAttribute('data-tags', tags);

      let dateElement = post.querySelector('.date-text');
      if (dateElement) {
        let dateText = dateElement.textContent.trim();
        let dateMatches = dateText.match(/(\d{4})年(\d{1,2})月(?:(\d{1,2})日?)?/);
        // 判断日期文本是否为"xxxx年春/夏/秋/冬"
        if (dateText.includes('春') || dateText.includes('夏') || dateText.includes('秋') || dateText.includes('冬')) {
          // 将日期设为空并将排序键设为较大值
          post.setAttribute('data-date', '');
          post.setAttribute('data-sort-key', '9999-99-99');
        } else if (dateMatches) {
          let year = dateMatches[1];
          let month = dateMatches[2].padStart(2, '0'); // 保证月份是两位数
          let day = dateMatches[3] ? dateMatches[3].padStart(2, '0') : '99'; // 如果日期部分缺失，默认为99日
          let formattedDate = `${year}-${month}-${day}`;
          post.setAttribute('data-date', formattedDate);
          post.setAttribute('data-sort-key', `${year}-${month}-${day === '99' ? '9999' : day}`); // 用于排序的键
        }
      }
    });

    sortPostsByDate(); // 调用排序函数
    paginatePosts(); // 调用分页函数
    addPostClickEvents(); // 添加点击事件到每个帖子
  }

  // 设置默认图片的函数
  function setDefaultImageIfEmpty() {
    let posts = document.querySelectorAll('.post img');
    posts.forEach(img => {
      if (!img.getAttribute('src')) {
        img.setAttribute('src', 'https://stay206.github.io/portfolio-master/img/ava.jpg');
      }
    });
  }

  // 搜索功能：根据输入框的值过滤帖子
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

  // 分页功能：将帖子分页显示
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

      // 显示或隐藏横幅部分
      const banner = document.getElementById('banner');
      if (page === 1) {
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
    showPage(1);
  }

  // 禁用分页功能：切换分页功能的启用和禁用
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

  // 返回顶部功能：平滑滚动回到页面顶部
  function gotop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 确保 "回到顶部" 按钮的点击事件已注册
  document.getElementById('back-to-top').addEventListener('click', gotop);

  // 为每个帖子添加点击事件，跳转到不同的指定链接
  function addPostClickEvents() {
    document.querySelectorAll('.post').forEach(post => {
      post.addEventListener('click', function () {
        const link = post.getAttribute('data-link');
        window.open(link, '_blank');
      });
    });
  }

  // 日期转换为星期的函数
  function getWeekday(dateString) {
    const date = new Date(dateString);
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
    return isNaN(date.getUTCDay()) ? "" : weekdays[date.getUTCDay()];
  }

  // 填充表格
  function populateTable() {
    const tableBody = document.querySelector('tbody');
    const posts = Array.from(document.querySelectorAll('.post'));
    
    // 过滤出包含"xxxx年春/夏/秋/冬"的帖子
    const specialPosts = posts.filter(post => {
      const dateElement = post.querySelector('.date-text');
      return dateElement && (dateElement.textContent.includes('春') || dateElement.textContent.includes('夏') || dateElement.textContent.includes('秋') || dateElement.textContent.includes('冬'));
    });

    // 处理普通帖子
    posts.filter(post => !specialPosts.includes(post)).forEach(post => {
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

    // 处理包含 "xxxx年春/夏/秋/冬" 的特殊帖子
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

  // 显示和隐藏 "关于" 和 "首页" 部分的功能
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
      tableContainer.parentNode.removeChild(tableContainer); // 隐藏表格
    }
  }

  function showAbout() {
    fetch('https://stay206.github.io/xinfan/bg')
      .then(response => response.text())
      .then(data => {
        tableContainer = document.createElement('div');
        tableContainer.innerHTML = data;
        banner.insertAdjacentElement('afterend', tableContainer); // 显示表格
        populateTable(); // 调用填充表格函数
      })
      .catch(error => {
        console.error('Error loading table:', error);
      });

    postsContainer.style.display = 'none';
    pagination.style.display = 'none';
    disablePaginationButton.style.display = 'none';
  }

  homeLink.addEventListener('click', function () {
    showHome();
  });

  aboutLink.addEventListener('click', function () {
    showAbout();
  });

  // 切换帖子显示和隐藏状态功能
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
        let matchingPost = Array.from(posts).find(post => post.querySelector('.post-title h2').textContent.trim() === title);
        if (matchingPost && matchingPost.getAttribute('data-hidden') === 'true') {
          row.classList.add('hidden');
        }
      });
      this.textContent = '显示';
    }
  });

  // 页面加载时调用排序和分页函数
  sortPostsByDate();
  paginatePosts();
});

// 切换导航栏样式
document.addEventListener('DOMContentLoaded', function () {
  const homeLink = document.getElementById('home-link'); // 获取“首页”链接元素
  const aboutLink = document.getElementById('about-link'); // 获取“时间表”链接元素

  // 为“首页”链接添加点击事件
  homeLink.addEventListener('click', function () {
    homeLink.classList.add('active'); // 为“首页”链接添加 'active' 类
    aboutLink.classList.remove('active'); // 移除“时间表”链接的 'active' 类
  });

  // 为“时间表”链接添加点击事件
  aboutLink.addEventListener('click', function () {
    aboutLink.classList.add('active'); // 为“时间表”链接添加 'active' 类
    homeLink.classList.remove('active'); // 移除“首页”链接的 'active' 类
  });
});

// 随机生成颜色的函数
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// 随机生成渐变背景
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

// 页面加载时设置随机渐变背景
document.addEventListener('DOMContentLoaded', setRandomGradient);
