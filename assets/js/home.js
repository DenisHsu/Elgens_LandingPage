gsap.registerPlugin(ScrollTrigger);

// =====  text fade up =====
const splitInstances = [];
document.fonts.ready.then(() => {
  gsap.registerPlugin(SplitText);
  initTextAnimations();
});
function initTextAnimations() {
  gsap.utils.toArray(".js-text-fadeup").forEach(el => {
    const split = new SplitText(el, {
      type: "lines",
      linesClass: "lineChild"
    });
    const mask = new SplitText(el, {
      type: "lines",
      linesClass: "lineParent"
    });
    splitInstances.push({
      el,
      split,
      mask
    });
    const linesToAnimate = split.lines.filter(line => line.textContent.trim() !== "");
    gsap.fromTo(linesToAnimate, {
      yPercent: 100,
      opacity: 0
    }, {
      yPercent: 0,
      opacity: 1,
      duration: 0.3,
      ease: "power1.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: el,
        start: "top 60%"
      }
    });
  });
}
window.addEventListener("resize", () => {
  splitInstances.forEach(instance => {
    const {
      el,
      split,
      mask
    } = instance;
    split.revert();
    mask.revert();
    instance.split = new SplitText(el, {
      type: "lines",
      linesClass: "lineChild"
    });
    instance.mask = new SplitText(el, {
      type: "lines",
      linesClass: "lineParent"
    });
  });
  ScrollTrigger.refresh();
});
function handleResponsiveBr() {
  const headers = document.querySelectorAll(".js-text-fadeup");
  headers.forEach(el => {
    if (window.innerWidth >= 992) {
      el.innerHTML = el.innerHTML.replace(/<br\s*class="d-lg-none"\s*\/?>/g, "");
    } else {
      el.innerHTML = el.innerHTML.replace(/<br\s*class="d-lg-none"\s*\/?>/g, "<br>");
    }
  });
}
window.addEventListener("resize", handleResponsiveBr);
handleResponsiveBr();

// ===== product sliders =====
const sliders = gsap.utils.toArray(".js-product-slider");
const tabs = gsap.utils.toArray(".l-section--products .c-btn-feature--sliders");
const sectionProduct = document.querySelector(".l-section--products");
const container = document.querySelector(".js-product-container");
let productTL;
let scrollTriggerInstance;
function initProductSection() {
  const isDesktop = window.innerWidth >= 992;
  gsap.killTweensOf(sliders);
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
  gsap.set(sliders, {
    clearProps: "all"
  });
  gsap.set(sectionProduct, {
    clearProps: "all"
  });
  container.style.height = "auto";
  if (isDesktop) {
    sliders.forEach((item, i) => {
      gsap.set(item, {
        opacity: i === 0 ? 1 : 0,
        pointerEvents: i === 0 ? "auto" : "none",
        clearProps: "y"
      });
    });
    let maxHeight = 0;
    sliders.forEach(slider => {
      gsap.set(slider, {
        position: "relative",
        visibility: "visible",
        opacity: 1
      });
      const h = slider.offsetHeight;
      if (h > maxHeight) maxHeight = h;
      gsap.set(slider, {
        clearProps: "position,visibility,opacity"
      });
    });
    container.style.height = maxHeight + "px";
    const tl = gsap.timeline({
      scrollTrigger: {
        id: "product-st",
        trigger: sectionProduct,
        start: "top-=72 top",
        end: "+=" + window.innerHeight - 112 * (sliders.length - 1),
        scrub: true,
        pin: true,
        pinSpacing: true,
        onUpdate: self => {
          const index = Math.round(self.progress * (sliders.length - 1));
          sliders.forEach((s, i) => gsap.set(s, {
            pointerEvents: i === index ? "auto" : "none"
          }));
          tabs.forEach(t => t.classList.remove("active"));
          if (index < tabs.length) tabs[index].classList.add("active");
        }
      }
    });
    sliders.forEach((item, i) => {
      if (i === 0) return;
      tl.to(sliders[i - 1], {
        opacity: 1,
        duration: 1
      });
      tl.to(sliders[i - 1], {
        opacity: 0,
        y: -30,
        duration: 0.3,
        ease: "power2.in"
      });
      tl.fromTo(item, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.08");
      tl.to(item, {
        opacity: 1,
        duration: 0.2
      });
    });
    scrollTriggerInstance = tl.scrollTrigger;
    tabs.forEach((tab, i) => {
      tab.onclick = e => {
        e.preventDefault();
        if (!scrollTriggerInstance) return;
        const tl = scrollTriggerInstance.animation;
        const targetProgress = i / (sliders.length - 1);
        tl.progress(targetProgress);

        // sync click and scroll move to target
        const st = scrollTriggerInstance;
        const scrollTo = st.start + (st.end - st.start) * targetProgress;
        window.scrollTo({
          top: scrollTo,
          behavior: "smooth"
        });
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
      };
    });
    ScrollTrigger.refresh();
  } else {
    sliders.forEach(item => gsap.set(item, {
      opacity: 1,
      pointerEvents: "auto",
      clearProps: "y"
    }));
    container.style.height = "auto";
    tabs.forEach((tab, i) => {
      tab.onclick = e => {
        e.preventDefault();
        const slider = sliders[i];
        if (slider) {
          slider.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
      };
    });
  }
}
initProductSection();
window.addEventListener("resize", initProductSection);

// ===== number progress =====
gsap.utils.toArray(".js-counter-number").forEach(el => {
  const raw = el.dataset.number;
  const suffix = raw.replace(/[0-9.]/g, "");
  const target = parseFloat(raw);
  let counter = {
    value: 0
  };
  gsap.to(counter, {
    value: target,
    duration: 2,
    ease: "power1.out",
    scrollTrigger: {
      trigger: el,
      start: "top 80%",
      once: true
    },
    onUpdate: () => {
      el.textContent = Math.floor(counter.value) + suffix;
    }
  });
});

// ===== card stacking =====
const sectionCase = document.querySelector(".l-section--cases");
const cards = gsap.utils.toArray(".l-section--cases .card");
let scrollTriggerInstances = [];
function debounce(func) {
  var _this = this;
  let wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  let timeout;
  return function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(_this, args), wait);
  };
}
function initCardStack() {
  const isDesktop = window.innerWidth >= 992;
  scrollTriggerInstances.forEach(st => st.kill());
  scrollTriggerInstances = [];
  gsap.killTweensOf(cards);
  cards.forEach(card => gsap.set(card, {
    clearProps: "all"
  }));
  if (!isDesktop) {
    cards.forEach(card => gsap.set(card, {
      clearProps: "all"
    }));
    return;
  }
  const overlap = 0.98;
  let cardHeights = cards.map(card => card.offsetHeight);
  let totalHeight = cardHeights.reduce((sum, h, i) => {
    if (i === 0) return sum + h;
    return sum + h * overlap;
  }, 0);
  sectionCase.style.height = totalHeight * 1.3 + "px";
  ScrollTrigger.create({
    trigger: sectionCase,
    start: "top top",
    end: () => `+=${totalHeight}`,
    pin: true,
    pinSpacing: false
  });
  let accumulated = 0;
  cards.forEach((card, i) => {
    if (i === 0) return;
    accumulated += cardHeights[i - 1] * overlap;
    scrollTriggerInstances.push(gsap.to(card, {
      y: -accumulated,
      scale: 1 + i * 0.01,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: () => `bottom-=${cardHeights[i - 1]}*0.05 bottom`,
        end: () => `top+=${cardHeights[i - 1]} top`,
        scrub: true
      }
    }));
  });
}
initCardStack();
ScrollTrigger.refresh();
window.addEventListener("resize", debounce(() => {
  initCardStack();
  ScrollTrigger.refresh();
}, 100));

// ==== certificied slider =====
window.addEventListener("load", () => {
  document.querySelectorAll(".tab-content .tab-pane").forEach(tab => {
    const listItems = tab.querySelectorAll(".c-feature-item");
    const perPage = 5;
    let currentPage = 1;
    const totalPage = Math.ceil(listItems.length / perPage);
    if (!listItems.length) return;
    let prevBtn, nextBtn, btnContainer, pageInfo;
    if (totalPage > 1) {
      const pagination = document.createElement("div");
      pagination.className = "c-pagination d-flex justify-content-between align-items-center mt-3 mt-auto";
      const btnWrapper = document.createElement("div");
      btnWrapper.className = "d-flex p-12px c-pagination__container";
      prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "js-btn-prev btn";
      prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
      nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "js-btn-next btn";
      nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      btnWrapper.appendChild(prevBtn);
      btnWrapper.appendChild(nextBtn);
      pageInfo = document.createElement("p");
      pageInfo.className = "p-20px page-info";
      pagination.appendChild(btnWrapper);
      pagination.appendChild(pageInfo);
      btnContainer = btnWrapper;
      tab.querySelector(".flex-grow-1").appendChild(pagination);
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateList();
        }
      });
      nextBtn.addEventListener("click", () => {
        if (currentPage < totalPage) {
          currentPage++;
          updateList();
        }
      });
    }
    const updateList = function () {
      let isInit = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      const start = (currentPage - 1) * perPage;
      const end = Math.min(currentPage * perPage, listItems.length);
      listItems.forEach(li => {
        li.style.display = "none";
        li.classList.remove("show");
      });
      listItems.forEach((li, index) => {
        if (index >= start && index < end) {
          li.style.display = "flex";
          const delay = (index - start) * 0.1;
          setTimeout(() => li.classList.add("show"), delay * 1000);
        }
      });
      if (totalPage > 1) {
        pageInfo.textContent = `${currentPage} / ${totalPage}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPage;
        if (!isInit) {
          const pagElements = [btnContainer, pageInfo];
          pagElements.forEach((el, i) => {
            el.classList.remove("show");
            setTimeout(() => el.classList.add("show"), 200 + i * 100);
          });
        } else {
          [btnContainer, pageInfo].forEach(el => el.classList.add("show"));
        }
      }
    };
    updateList(true);
  });
});
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth >= 992) {
      location.reload();
    }
  }, 200);
});

// ==== select ====
document.querySelectorAll(".js-tom-select").forEach(el => {
  new TomSelect(el, {
    create: false
  });
});

// share and submit
document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('copy-link-btn');
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href).then(function () {
        alert('Link copied!');
      });
    });
  }
  document.getElementById('googleForm').onsubmit = function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      this.classList.add('was-validated');
      return;
    }
    let formData = new FormData(this);
    fetch(this.action, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    }).then(response => {
      alert('We have received your submitted form. Thank you.');
    }).catch(error => console.error('Error!', error.message));
  };
});
//# sourceMappingURL=home.js.map
