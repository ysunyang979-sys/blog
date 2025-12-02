(function () {
  function initCollapsibleImages() {
    var images = document.querySelectorAll(".article-entry img");
    images.forEach(function (img) {
      // Skip if already processed
      if (img.closest(".collapsible-image-container")) return;

      // Determine the element to wrap (image or its link wrapper)
      var target = img;
      if (
        img.parentElement.tagName === "A" &&
        img.parentElement.classList.contains("gallery-item")
      ) {
        target = img.parentElement;
      }

      // Create container
      var container = document.createElement("div");
      container.className = "collapsible-image-container collapsed";

      // Create wrapper
      var wrapper = document.createElement("div");
      wrapper.className = "image-scroll-wrapper";

      // Create overlay
      var overlay = document.createElement("div");
      overlay.className = "overlay";

      // Create button
      var btn = document.createElement("button");
      btn.className = "expand-btn";
      btn.innerHTML = '<i class="fa fa-expand"></i> 展开';

      // Button click handler
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering lightGallery or links
        
        if (container.classList.contains("collapsed")) {
            // Expand
            container.classList.remove("collapsed");
            container.classList.add("expanded");
            btn.innerHTML = '<i class="fa fa-compress"></i> 收起';
        } else {
            // Collapse
            container.classList.remove("expanded");
            container.classList.add("collapsed");
            btn.innerHTML = '<i class="fa fa-expand"></i> 展开';
        }
      };

      // Insert container before target
      if (target.parentNode) {
        target.parentNode.insertBefore(container, target);
        // Move target into wrapper
        wrapper.appendChild(target);
        // Assemble
        container.appendChild(wrapper);
        container.appendChild(overlay);
        container.appendChild(btn);
      }
    });
  }

  // Run after DOM is ready.
  window.addEventListener("load", function () {
    setTimeout(initCollapsibleImages, 100);
  });
})();
