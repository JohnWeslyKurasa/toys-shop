const fs = require('fs');
let code = fs.readFileSync('frontend/app.js', 'utf8');

// 1. cleanImageUrl for category
code = code.replace(
  'image: document.getElementById("catImage").value,\n    bannerImage: document.getElementById("catBannerImage").value,',
  'image: cleanImageUrl(document.getElementById("catImage").value),\n    bannerImage: cleanImageUrl(document.getElementById("catBannerImage").value),'
);
code = code.replace(
  'name: document.getElementById("subcatName").value,\n    image: document.getElementById("subcatImage").value,',
  'name: document.getElementById("subcatName").value,\n    image: cleanImageUrl(document.getElementById("subcatImage").value),'
);

// 2. Fix loader timeout
code = code.replace(
  'setTimeout(() => {\n    elements.loader.style.opacity = "0";\n    elements.loader.style.visibility = "hidden";\n  }, 600);',
  'elements.loader.style.opacity = "0";\n  elements.loader.style.visibility = "hidden";'
);

// 3. Remove quick view background from thumbnails
code = code.replace(
  'idx === 0 ? \'var(--light-orange)\' : \'transparent\'}; background-color: var(--cream); transition: all 0.2s; box-shadow: var(--shadow-xs);',
  'idx === 0 ? \'var(--light-orange)\' : \'transparent\'}; background-color: transparent; transition: all 0.2s; box-shadow: none;'
);

// 4. Remove quick view background from main image wrapper
code = code.replace(
  'justify-content: center; background-color: var(--cream); border-radius: var(--border-radius-lg); overflow: hidden; border: 1px solid rgba(93,64,55,0.06); box-shadow: var(--shadow-sm);',
  'justify-content: center; background-color: transparent; border-radius: var(--border-radius-lg); overflow: hidden; border: none; box-shadow: none;'
);

// 5. Add dynamic images JS logic
code = code.replace(
  'prodImage: document.getElementById("prodImage"),\n  prodImages: document.getElementById("prodImages"),',
  'prodImage: document.getElementById("prodImage"),\n  prodImages: document.getElementById("prodImages"),\n  additionalImagesContainer: document.getElementById("additionalImagesContainer"),\n  addAnotherImageBtn: document.getElementById("addAnotherImageBtn"),'
);

code = code.replace(
  '// Dashboard Add/Edit Form submit handler\n  elements.productManageForm.addEventListener("submit", async (e) => {',
  `// Helper for dynamic extra images
  window.createExtraImageInput = (value = "") => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";
    
    const input = document.createElement("input");
    input.type = "text";
    input.className = "extra-image-input";
    input.placeholder = "e.g. https://res.cloudinary.com/...";
    input.value = value;
    input.style.flex = "1";
    input.style.border = "2px solid var(--white)";
    input.style.padding = "10px 14px";
    input.style.borderRadius = "var(--border-radius-md)";
    input.style.outline = "none";
    input.addEventListener("blur", () => { input.value = cleanImageUrl(input.value); });
    
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.style.background = "var(--accent-red)";
    removeBtn.style.color = "white";
    removeBtn.style.border = "none";
    removeBtn.style.borderRadius = "var(--border-radius-md)";
    removeBtn.style.width = "40px";
    removeBtn.style.cursor = "pointer";
    removeBtn.style.fontWeight = "bold";
    removeBtn.style.fontSize = "1.2rem";
    removeBtn.addEventListener("click", () => { wrapper.remove(); });
    
    wrapper.appendChild(input);
    wrapper.appendChild(removeBtn);
    elements.additionalImagesContainer.appendChild(wrapper);
  };

  if (elements.addAnotherImageBtn) {
    elements.addAnotherImageBtn.addEventListener("click", () => window.createExtraImageInput());
  }

  // Dashboard Add/Edit Form submit handler
  elements.productManageForm.addEventListener("submit", async (e) => {`
);

code = code.replace(
  'const image = cleanImageUrl(elements.prodImage.value);\n    const imagesValue = elements.prodImages.value || "";\n    const images = imagesValue.split("\\n")\n      .map(url => cleanImageUrl(url))\n      .filter(url => url !== "");',
  `const image = cleanImageUrl(elements.prodImage.value);
    
    const extraInputs = Array.from(document.querySelectorAll('.extra-image-input'));
    const images = extraInputs
      .map(input => cleanImageUrl(input.value))
      .filter(url => url !== "");`
);

code = code.replace(
  'elements.productManageForm.reset();\n      renderAdminProductsTable();',
  'elements.productManageForm.reset();\n      if(elements.additionalImagesContainer) elements.additionalImagesContainer.innerHTML = "";\n      renderAdminProductsTable();'
);

code = code.replace(
  'elements.prodImage.value = prod.image || "";\n  elements.prodImages.value = (prod.images || []).join("\\n");',
  `elements.prodImage.value = prod.image || "";
  if(elements.additionalImagesContainer) elements.additionalImagesContainer.innerHTML = "";
  if (prod.images && prod.images.length > 0) {
    prod.images.forEach(img => { if(window.createExtraImageInput) window.createExtraImageInput(img) });
  }`
);

// 6. Fix Similar Products Slider HTML
code = code.replace(
  '</div>\n    `).join(\'\');\n\n    similarProductsHtml = `\n      <div class="similar-products-section" style="padding: 30px; border-top: 2px solid var(--cream); background-color: var(--white);">\n        <h3 style="font-family: var(--font-header); font-size: 1.2rem; margin-bottom: 16px; color: var(--dark-brown); display: flex; align-items: center; gap: 8px;">\n          <svg style="width: 22px; height: 22px; fill: var(--light-orange);" viewBox="0 0 24 24"><path d="M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z"/></svg>\n          Similar Products You May Like\n        </h3>\n        <div class="similar-products-scroll" style="display: flex; gap: 16px; overflow-x: auto; padding: 8px 0; scrollbar-width: thin; -webkit-overflow-scrolling: touch;">\n          ${cardsListHtml}\n        </div>\n      </div>\n    `;',
  `</div>
    \`).join('');

    similarProductsHtml = \`
      <div class="similar-products-section" style="padding: 30px; border-top: 2px solid var(--cream); background-color: var(--white);">
        <h3 style="font-family: var(--font-header); font-size: 1.2rem; margin-bottom: 16px; color: var(--dark-brown); display: flex; align-items: center; gap: 8px;">
          <svg style="width: 22px; height: 22px; fill: var(--light-orange);" viewBox="0 0 24 24"><path d="M12,18H6V14H12M21,14V12L20,7H4L3,12V14H4V20H14V14H18V20H20V14M20,4H4V6H20V4Z"/></svg>
          Similar Products You May Like
        </h3>
        <div style="position: relative; display: flex; align-items: center; padding: 0 30px;">
          <button id="similarPrevBtn" class="carousel-nav-btn" style="position: absolute; left: -10px; z-index: 2; background: white; border: 1px solid var(--cream); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); font-size: 1.2rem; font-weight: bold; color: var(--dark-brown);">&#8249;</button>
          
          <div id="similarProductsScroll" class="similar-products-scroll" style="display: flex; gap: 16px; overflow-x: hidden; padding: 8px 0; scroll-behavior: smooth; width: 100%;">
            \${cardsListHtml}
          </div>
          
          <button id="similarNextBtn" class="carousel-nav-btn" style="position: absolute; right: -10px; z-index: 2; background: white; border: 1px solid var(--cream); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: var(--shadow-sm); font-size: 1.2rem; font-weight: bold; color: var(--dark-brown);">&#8250;</button>
        </div>
      </div>
    \`;`
);

// 7. Add Similar Products Slider Logic inside the hookup code
code = code.replace(
  '// Hide/Show navigation buttons for image carousel',
  `// Hook up Similar Products Slider
    const simScroll = document.getElementById("similarProductsScroll");
    const simPrev = document.getElementById("similarPrevBtn");
    const simNext = document.getElementById("similarNextBtn");
    
    if (simScroll && simPrev && simNext) {
      simPrev.addEventListener("click", () => {
        simScroll.scrollBy({ left: -200, behavior: "smooth" });
      });
      simNext.addEventListener("click", () => {
        simScroll.scrollBy({ left: 200, behavior: "smooth" });
      });
      
      const updateSimBtns = () => {
        if (simScroll.scrollLeft <= 0) {
          simPrev.style.display = 'none';
        } else {
          simPrev.style.display = 'flex';
        }
        
        if (Math.ceil(simScroll.scrollLeft) >= (simScroll.scrollWidth - simScroll.clientWidth)) {
          simNext.style.display = 'none';
        } else {
          simNext.style.display = 'flex';
        }
      };
      
      simScroll.addEventListener("scroll", updateSimBtns);
      setTimeout(updateSimBtns, 100);
    }
    
    // Hide/Show navigation buttons for image carousel`
);

fs.writeFileSync('frontend/app.js', code);
console.log('App.js updated successfully.');
