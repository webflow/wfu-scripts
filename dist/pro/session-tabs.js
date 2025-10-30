"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/pro/utils.ts
  var DEBUG = true;
  var debug = (...args) => {
    if (DEBUG) {
      console.log(...args);
    }
  };

  // src/pro/session-tabs.ts
  debug("session-tabs.ts loaded");
  function initTabMenuScrolling() {
    debug("[initTabMenuScrolling] Function called");
    const tabMenu = document.querySelector(".cc_pro_session-tab-menu");
    const tabsContainer = document.querySelector(".cc_pro_session-tabs");
    if (!tabMenu) {
      debug("[initTabMenuScrolling] Tab menu element not found");
      return;
    }
    if (!tabsContainer) {
      debug("[initTabMenuScrolling] Tabs container element not found");
      return;
    }
    debug("[initTabMenuScrolling] Tab menu element found");
    debug("[initTabMenuScrolling] Tabs container element found");
    const maxWidthPx = 1200;
    debug(`[initTabMenuScrolling] Max width threshold: ${maxWidthPx}px `);
    const checkAndSetupScrolling = () => {
      const containerWidth = tabMenu.offsetWidth;
      debug(`[checkAndSetupScrolling] Container width: ${containerWidth}px`);
      if (containerWidth < maxWidthPx) {
        debug(
          "[checkAndSetupScrolling] Container width is less than threshold, setting up scrolling"
        );
        const prevButton = document.querySelector(".cc_pro_tabs_button.prev");
        const nextButton = document.querySelector(".cc_pro_tabs_button.next");
        debug(
          `[checkAndSetupScrolling] Prev button found: ${!!prevButton}, Next button found: ${!!nextButton}`
        );
        if (prevButton && nextButton) {
          if (!tabsContainer.contains(prevButton)) {
            tabsContainer.appendChild(prevButton);
            debug("[checkAndSetupScrolling] Prev button appended to tabs container");
          }
          if (!tabsContainer.contains(nextButton)) {
            tabsContainer.appendChild(nextButton);
            debug("[checkAndSetupScrolling] Next button appended to tabs container");
          }
          const tabLink = tabMenu.querySelector(".cc_pro_session-tab");
          const scrollAmount = tabLink ? tabLink.offsetWidth : 200;
          debug(`[checkAndSetupScrolling] Scroll amount: ${scrollAmount}px`);
          const { overflowX } = getComputedStyle(tabMenu);
          debug(`[checkAndSetupScrolling] Current overflow-x: ${overflowX}`);
          debug(
            `[checkAndSetupScrolling] Scroll width: ${tabMenu.scrollWidth}px, Client width: ${tabMenu.clientWidth}px`
          );
          if (overflowX !== "auto" && overflowX !== "scroll") {
            tabMenu.style.overflowX = "auto";
            debug("[checkAndSetupScrolling] Set overflow-x to auto");
          }
          const updateScrollState = () => {
            const { scrollLeft } = tabMenu;
            const { scrollWidth } = tabMenu;
            const { clientWidth } = tabMenu;
            const maxScrollLeft = scrollWidth - clientWidth;
            const isAtLeft = scrollLeft <= 1;
            const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;
            debug(
              `[updateScrollState] scrollLeft: ${scrollLeft}, scrollWidth: ${scrollWidth}, clientWidth: ${clientWidth}, maxScrollLeft: ${maxScrollLeft}, isAtLeft: ${isAtLeft}, isAtRight: ${isAtRight}`
            );
            if (isAtLeft && isAtRight) {
              prevButton.style.display = "none";
              nextButton.style.display = "none";
            } else if (isAtLeft) {
              prevButton.style.display = "none";
              nextButton.style.display = "";
            } else if (isAtRight) {
              prevButton.style.display = "";
              nextButton.style.display = "none";
            } else {
              prevButton.style.display = "";
              nextButton.style.display = "";
            }
          };
          if (!tabMenu.dataset.scrollListenerAttached) {
            tabMenu.addEventListener("scroll", updateScrollState);
            tabMenu.dataset.scrollListenerAttached = "true";
            debug("[checkAndSetupScrolling] Scroll listener attached");
          }
          updateScrollState();
          if (!prevButton.dataset.scrollHandlerAttached) {
            prevButton.addEventListener("click", () => {
              const currentScrollLeft = tabMenu.scrollLeft;
              debug(
                `[checkAndSetupScrolling] Prev button clicked, current scrollLeft: ${currentScrollLeft}px, scrolling left by ${scrollAmount}px`
              );
              tabMenu.scrollBy({ left: -scrollAmount, behavior: "smooth" });
              setTimeout(() => {
                debug(`[checkAndSetupScrolling] After scroll, scrollLeft: ${tabMenu.scrollLeft}px`);
                updateScrollState();
              }, 300);
            });
            prevButton.dataset.scrollHandlerAttached = "true";
            debug("[checkAndSetupScrolling] Prev button scroll handler attached");
          }
          if (!nextButton.dataset.scrollHandlerAttached) {
            nextButton.addEventListener("click", () => {
              const currentScrollLeft = tabMenu.scrollLeft;
              debug(
                `[checkAndSetupScrolling] Next button clicked, current scrollLeft: ${currentScrollLeft}px, scrolling right by ${scrollAmount}px`
              );
              tabMenu.scrollBy({ left: scrollAmount, behavior: "smooth" });
              setTimeout(() => {
                debug(`[checkAndSetupScrolling] After scroll, scrollLeft: ${tabMenu.scrollLeft}px`);
                updateScrollState();
              }, 300);
            });
            nextButton.dataset.scrollHandlerAttached = "true";
            debug("[checkAndSetupScrolling] Next button scroll handler attached");
          }
        } else {
          debug("[checkAndSetupScrolling] Buttons not found on page");
        }
      } else {
        debug(
          `[checkAndSetupScrolling] Container width (${containerWidth}px) is NOT less than threshold (${maxWidthPx}px)`
        );
      }
    };
    checkAndSetupScrolling();
    window.addEventListener("resize", checkAndSetupScrolling);
  }
  initTabMenuScrolling();
})();
//# sourceMappingURL=session-tabs.js.map
