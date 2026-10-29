(function () {
  "use strict";

  var root = document.documentElement;
  var themeButton = document.getElementById("theme-toggle");

  function paintTheme() {
    if (!themeButton) return;
    var dark = root.getAttribute("data-theme") === "dark";
    themeButton.textContent = dark ? "☀" : "☾";
    themeButton.setAttribute("aria-label", dark ? "切换到浅色" : "切换到深色");
  }

  if (themeButton) {
    paintTheme();
    themeButton.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("note-theme", next);
      } catch (error) {
        /* 无痕模式下忽略 */
      }
      paintTheme();
    });
  }

  /* 首页：搜索 + 标签筛选 */
  var grid = document.getElementById("note-grid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".note-card"));
    var search = document.getElementById("search");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".tag-chip"));
    var empty = document.getElementById("empty");
    var activeTag = "";

    var applyFilter = function () {
      var query = search ? search.value.trim().toLowerCase() : "";
      var tokens = query === "" ? [] : query.split(/\s+/);
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = card.getAttribute("data-search") || "";
        var tags = (card.getAttribute("data-tags") || "").split("|");
        var matchesQuery = tokens.every(function (token) {
          return haystack.indexOf(token) !== -1;
        });
        var matchesTag = activeTag === "" || tags.indexOf(activeTag) !== -1;
        var visible = matchesQuery && matchesTag;
        card.hidden = !visible;
        if (visible) shown += 1;
      });

      document.querySelectorAll(".group").forEach(function (group) {
        var hasVisible = group.querySelector(".note-card:not([hidden])");
        group.hidden = !hasVisible;
      });

      if (empty) empty.hidden = shown !== 0;
    };

    if (search) {
      search.addEventListener("input", applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeTag = chip.getAttribute("data-tag") || "";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        applyFilter();
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "/" && search && document.activeElement !== search) {
        event.preventDefault();
        search.focus();
      }
    });

    applyFilter();
  }

  /* 笔记页：侧边栏（桌面可收起，移动端抽屉） */
  var sidebar = document.querySelector(".sidebar");
  var sidebarToggle = document.getElementById("sidebar-toggle");
  var sidebarCollapse = document.getElementById("sidebar-collapse");
  var layout = document.querySelector(".note-layout");
  var mobileQuery = window.matchMedia("(max-width: 860px)");
  var SIDEBAR_KEY = "note-sidebar-collapsed";

  if (layout && sidebar && sidebarToggle) {
    var setCollapsed = function (collapsed) {
      layout.classList.toggle("sidebar-collapsed", collapsed);
      sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
      try {
        localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
      } catch (error) {
        /* 忽略 */
      }
    };

    try {
      if (!mobileQuery.matches && localStorage.getItem(SIDEBAR_KEY) === "1") {
        layout.classList.add("sidebar-collapsed");
        sidebarToggle.setAttribute("aria-expanded", "false");
      }
    } catch (error) {
      /* 忽略 */
    }

    sidebarToggle.addEventListener("click", function () {
      if (mobileQuery.matches) {
        var open = sidebar.classList.toggle("open");
        sidebarToggle.setAttribute("aria-expanded", String(open));
      } else {
        setCollapsed(!layout.classList.contains("sidebar-collapsed"));
      }
    });

    if (sidebarCollapse) {
      sidebarCollapse.addEventListener("click", function () {
        setCollapsed(true);
      });
    }

    sidebar.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        sidebar.classList.remove("open");
        if (mobileQuery.matches) sidebarToggle.setAttribute("aria-expanded", "false");
      });
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", function () {
        sidebar.classList.remove("open");
      });
    }
  }

  /* 阅读进度 */
  var progress = document.querySelector(".reading-progress");
  if (progress) {
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = max > 0 ? Math.min(100, (window.scrollY / max) * 100) + "%" : "0%";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* 目录高亮 */
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  if (tocLinks.length > 0 && "IntersectionObserver" in window) {
    var byHeading = new Map();
    tocLinks.forEach(function (link) {
      var hash = link.getAttribute("href") || "";
      var id = hash.charAt(0) === "#" ? decodeURIComponent(hash.slice(1)) : "";
      var heading = id ? document.getElementById(id) : null;
      if (heading) byHeading.set(heading, link);
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = byHeading.get(entry.target);
          if (!link) return;
          tocLinks.forEach(function (item) {
            item.classList.toggle("active", item === link);
          });
        });
      },
      { rootMargin: "-90px 0px -70% 0px", threshold: 0 }
    );

    byHeading.forEach(function (_, heading) {
      observer.observe(heading);
    });
  }

  /* 代码块复制 */
  document.querySelectorAll(".prose pre").forEach(function (pre) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "copy-button";
    button.textContent = "复制";
    button.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      var done = function (label) {
        button.textContent = label;
        window.setTimeout(function () {
          button.textContent = "复制";
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () {
            done("已复制");
          },
          function () {
            done("复制失败");
          }
        );
      } else {
        done("复制失败");
      }
    });
    pre.appendChild(button);
  });
})();
