class JSONTranslationTool {
   constructor() {
      this.jsonData = {};
      this.contentLoaded = false;
      this.initializeElements();
      this.bindEvents();
      this.setupDragAndDrop();
      this.loadSavedTheme();
   }

   initializeElements() {
      // Main elements
      this.jsonInput = document.getElementById("jsonInput");
      this.treeView = document.getElementById("treeView");
      this.toggleJsonBtn = document.getElementById("toggleJsonBtn");
      this.leftPanel = document.getElementById("leftPanel");
      this.fileInput = document.getElementById("fileInput");

      // Welcome screen elements
      this.welcomeScreen = document.getElementById("welcomeScreen");
      this.uploadZone = document.getElementById("uploadZone");
      this.pasteZoneInput = document.getElementById("pasteZoneInput");

      // Modal elements
      this.pasteModal = document.getElementById("pasteModal");
   }

   bindEvents() {
      // Main functionality events
      if (this.jsonInput)
         this.jsonInput.addEventListener("input", () => this.onJSONChange());
      if (this.toggleJsonBtn)
         this.toggleJsonBtn.addEventListener("click", () =>
            this.toggleJsonPanel()
         );

      // Header buttons
      const themeDropdown = document.getElementById("themeDropdown");
      const copyBtn = document.getElementById("copyBtnFallback");
      const saveBtn = document.getElementById("saveBtnFallback");
      const homeBtn = document.getElementById("homeBtnFallback");

      if (themeDropdown)
         themeDropdown.addEventListener("change", (e) =>
            this.changeTheme(e.target.value)
         );
      if (copyBtn)
         copyBtn.addEventListener("click", () => this.copyToClipboard());
      if (saveBtn) saveBtn.addEventListener("click", () => this.saveFile());
      if (homeBtn) homeBtn.addEventListener("click", () => this.goHome());

      // Welcome action buttons
      const uploadBtn = document.getElementById("uploadFileBtnFallback");
      const pasteBtn = document.getElementById("pasteJsonBtnFallback");
      const exampleBtn = document.getElementById("loadExampleBtnFallback");

      if (uploadBtn) uploadBtn.addEventListener("click", () => this.uploadFile());
      if (pasteBtn)
         pasteBtn.addEventListener("click", () => this.showPasteModal());
      if (exampleBtn)
         exampleBtn.addEventListener("click", () => this.loadExampleData());

      // Welcome screen events
      if (this.uploadZone)
         this.uploadZone.addEventListener("click", () =>
            this.handleUploadZoneClick()
         );
      if (this.pasteZoneInput) {
         this.pasteZoneInput.addEventListener("input", () =>
            this.handlePasteZoneInput()
         );
         this.pasteZoneInput.addEventListener("blur", () =>
            this.handlePasteZoneBlur()
         );
      }

      // File input
      if (this.fileInput)
         this.fileInput.addEventListener("change", () => this.handleFileUpload());

      // Modal events
      this.bindModalEvents();
   }

   bindModalEvents() {
      // Paste modal
      const closePaste = document.getElementById("closePaste");
      const loadPastedJson = document.getElementById("loadPastedJson");
      const cancelPaste = document.getElementById("cancelPaste");

      if (closePaste)
         closePaste.addEventListener("click", () => this.closePasteModal());
      if (loadPastedJson)
         loadPastedJson.addEventListener("click", () => this.loadPastedData());
      if (cancelPaste)
         cancelPaste.addEventListener("click", () => this.closePasteModal());

      // Home modal
      const confirmHome = document.getElementById("confirmHome");
      const cancelHome = document.getElementById("cancelHome");

      if (confirmHome)
         confirmHome.addEventListener("click", () => this.confirmGoHome());
      if (cancelHome)
         cancelHome.addEventListener("click", () => this.closeHomeModal());
   }

   setupDragAndDrop() {
      document.addEventListener("dragover", (e) => {
         e.preventDefault();
         this.uploadZone.classList.add("dragover");
      });

      document.addEventListener("dragleave", (e) => {
         if (!e.relatedTarget || !this.uploadZone.contains(e.relatedTarget)) {
            this.uploadZone.classList.remove("dragover");
         }
      });

      document.addEventListener("drop", (e) => {
         e.preventDefault();
         this.uploadZone.classList.remove("dragover");
         const files = e.dataTransfer.files;
         if (files.length > 0 && files[0].type === "application/json") {
            this.handleDroppedFile(files[0]);
         }
      });
   }

   handleDroppedFile(file) {
      this.processJSONFile(file);
   }

   processJSONFile(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
         try {
            this.jsonData = JSON.parse(e.target.result);
            this.updateJSONInput();
            this.updateTreeView();
            this.showContent();
            if (this.welcomeScreen.style.display !== "none") {
               this.hideWelcomeScreen();
            }
         } catch (error) {
            alert("Error reading JSON file: " + error.message);
         }
      };
      reader.readAsText(file);
   }

   showContent() {
      this.contentLoaded = true;
      const content = document.getElementById("content");

      if (content) {
         content.style.display = "flex";
         content.classList.add("loaded");
      }

      this.hideWelcomeScreen();

      // Show header controls with smooth fade-in
      const headerControls = document.querySelector(".header-controls");
      if (headerControls) {
         headerControls.style.display = "flex";
         headerControls.style.opacity = "1";
         // Force reflow to ensure display:flex is applied before opacity transition
         headerControls.offsetHeight;
         headerControls.classList.add("visible");
      }
   }

   hideWelcomeScreen() {
      this.welcomeScreen.style.display = "none";
   }

   loadExampleData() {
      const exampleData = {
         meta: {
            title: "This is a Page Title for Translations",
            description: "Some more content goes here for the meta description.",
            keywords: "SEO, keywords, example, for, translations, impact, report",
         },
         hero: {
            subtitle: "Translation Tool Example",
            title: "Translation Tool Example Subtitle",
            description: "This is an example of a hero section for the translation tool.",
         },
         commitment: {
            subtitle: "Translations made easier and faster",
            title: "Tree editor and customisable editor",
            paragraph1: "More content goes here to explain about our new translations.",
         },
         actions: {
            subtitle: "Key Features of the Translation Tool",
            title: "About the Translation Tool",
            cards: [{
                  title: "Feature 1: File Upload",
                  description: "Upload JSON files directly into the tool.",
               },
               {
                  title: "Feature 2: JSON Input",
                  description: "View and edit the raw JSON data in a text area.",
               },
               {
                  title: "Feature 3: Paste JSON",
                  description: "Paste JSON content directly into the tool for quick editing.",
               },
               {
                  title: "Feature 4: Tree View Editor",
                  description: "Easily navigate and edit your JSON data in a tree structure.",
               },
               {
                  title: "Feature 5: Save and Copy",
                  description: "Save your changes to a file or copy the JSON content to the clipboard.",
               },
            ],
         },
      };

      this.jsonData = exampleData;
      this.updateJSONInput();
      this.updateTreeView();
      this.showContent();
   }

   toggleJsonPanel() {
      const isHidden = this.leftPanel.classList.contains("hidden");
      if (isHidden) {
         this.leftPanel.classList.remove("hidden");
         this.toggleJsonBtn.classList.add("active");
         this.toggleJsonBtn.querySelector("span").textContent = "Hide JSON";
      } else {
         this.leftPanel.classList.add("hidden");
         this.toggleJsonBtn.classList.remove("active");
         this.toggleJsonBtn.querySelector("span").textContent = "Show JSON";
      }
   }

   uploadFile() {
      this.fileInput.click();
   }

   handleUploadZoneClick() {
      if (!this.uploadZone.classList.contains("paste-mode")) {
         this.uploadFile();
      }
   }

   handlePasteZoneInput() {
      const content = this.pasteZoneInput.value.trim();
      if (content) {
         this.tryParseJSON(content, false);
      }
   }

   handlePasteZoneBlur() {
      const content = this.pasteZoneInput.value.trim();
      if (content) {
         this.tryParseJSON(content, true);
      }
   }

   tryParseJSON(content, showError = false) {
      try {
         this.jsonData = JSON.parse(content);
         this.updateJSONInput();
         this.updateTreeView();
         this.showContent();
      } catch (error) {
         if (showError) {
            alert("Invalid JSON format: " + error.message);
            this.pasteZoneInput.focus();
         }
         // If showError is false, silently ignore (for live typing)
      }
   }

   handleFileUpload() {
      const file = this.fileInput.files[0];
      if (file && file.type === "application/json") {
         this.processJSONFile(file);
      } else {
         alert("Please select a valid JSON file.");
      }
   }

   onJSONChange() {
      try {
         const text = this.jsonInput.value.trim();
         if (text) {
            this.jsonData = JSON.parse(text);
            this.updateTreeView();
         }
      } catch (error) {
         // Invalid JSON, don't update tree view
         console.log("Invalid JSON");
      }
   }

   updateJSONInput() {
      this.jsonInput.value = JSON.stringify(this.jsonData, null, 2);
      this.autoResizeJsonInput();
   }

   autoResizeJsonInput() {
      if (!this.jsonInput) return;

      // Reset height to auto to get the correct scrollHeight
      this.jsonInput.style.height = 'auto';

      // Calculate the height needed plus 100px buffer
      const contentHeight = this.jsonInput.scrollHeight;
      const newHeight = contentHeight + 100;

      // Set the new height
      this.jsonInput.style.height = `${newHeight}px`;
   }

   updateTreeView() {
      if (!this.treeView) return;
      this.treeView.innerHTML = "";
      if (Object.keys(this.jsonData).length > 0) {
         this.renderObject(this.jsonData, this.treeView, []);
         this.autoResizeTreeView();
      }
   }

   autoResizeTreeView() {
      if (!this.treeView) return;

      // Reset height to auto to measure content
      this.treeView.style.height = 'auto';

      // Calculate the height needed plus 100px buffer
      const contentHeight = this.treeView.scrollHeight;
      const newHeight = Math.max(contentHeight + 100, 300); // Minimum 300px

      // Set the new height
      this.treeView.style.height = `${newHeight}px`;
   }

   renderObject(obj, container, path) {
      for (const [key, value] of Object.entries(obj)) {
         const currentPath = [...path, key];
         const item = document.createElement("div");
         item.className = "tree-item";

         if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
               this.renderArray(key, value, item, currentPath);
            } else {
               this.renderObjectProperty(key, value, item, currentPath);
            }
         } else {
            this.renderPrimitive(key, value, item, currentPath);
         }

         container.appendChild(item);
      }
   }

   renderPrimitive(key, value, container, path) {
      const keySpan = document.createElement("span");
      keySpan.className = "tree-key";
      keySpan.textContent = `${key}: `;

      const valueDiv = document.createElement("div");
      valueDiv.className = "tree-value";
      valueDiv.textContent =
         typeof value === "string" ? value : JSON.stringify(value);
      valueDiv.dataset.path = JSON.stringify(path);
      valueDiv.dataset.originalValue = valueDiv.textContent;

      valueDiv.addEventListener("click", (e) => {
         e.stopPropagation();
         this.startQuickEdit(valueDiv, path);
      });

      container.appendChild(keySpan);
      container.appendChild(valueDiv);
   }

   renderObjectProperty(key, obj, container, path) {
      const toggle = document.createElement("span");
      toggle.className = "tree-toggle";
      toggle.textContent = "▼";

      const keySpan = document.createElement("span");
      keySpan.className = "tree-key";
      keySpan.textContent = `${key}:`;

      const objContainer = document.createElement("div");
      objContainer.className = "tree-object";

      toggle.addEventListener("click", () => {
         container.classList.toggle("collapsed");
         toggle.textContent = container.classList.contains("collapsed") ?
            "▶" :
            "▼";
      });

      container.appendChild(toggle);
      container.appendChild(keySpan);
      container.appendChild(objContainer);

      this.renderObject(obj, objContainer, path);
   }

   renderArray(key, arr, container, path) {
      const toggle = document.createElement("span");
      toggle.className = "tree-toggle";
      toggle.textContent = "▼";

      const keySpan = document.createElement("span");
      keySpan.className = "tree-key";
      keySpan.textContent = `${key}: [${arr.length}]`;

      const arrContainer = document.createElement("div");
      arrContainer.className = "tree-array";

      toggle.addEventListener("click", () => {
         container.classList.toggle("collapsed");
         toggle.textContent = container.classList.contains("collapsed") ?
            "▶" :
            "▼";
      });

      container.appendChild(toggle);
      container.appendChild(keySpan);
      container.appendChild(arrContainer);

      arr.forEach((item, index) => {
         const currentPath = [...path, index];
         const itemElement = document.createElement("div");
         itemElement.className = "tree-item";

         if (typeof item === "object" && item !== null) {
            if (Array.isArray(item)) {
               this.renderArray(`[${index}]`, item, itemElement, currentPath);
            } else {
               this.renderObjectProperty(
                  `[${index}]`,
                  item,
                  itemElement,
                  currentPath
               );
            }
         } else {
            this.renderPrimitive(`[${index}]`, item, itemElement, currentPath);
         }

         arrContainer.appendChild(itemElement);
      });
   }

   startQuickEdit(valueElement, path) {
      // Check if already editing
      if (valueElement.contentEditable === "true") return;

      // Make the div contentEditable - no layout shift, looks the same
      valueElement.contentEditable = true;
      valueElement.classList.add("editing");

      // Store original value
      const originalValue = valueElement.textContent;

      // Focus and select all text
      valueElement.focus();
      const range = document.createRange();
      range.selectNodeContents(valueElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Save function
      const saveEdit = () => {
         const newValue = this.parseValue(valueElement.textContent);
         this.setValueAtPath(this.jsonData, path, newValue);
         this.updateJSONInput();
         this.finishQuickEdit(valueElement);
      };

      // Cancel function
      const cancelEdit = () => {
         valueElement.textContent = originalValue;
         this.finishQuickEdit(valueElement);
      };

      // Event handlers
      const handleKeydown = (e) => {
         if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            saveEdit();
         } else if (e.key === "Escape") {
            e.preventDefault();
            cancelEdit();
         }
      };

      const handleBlur = () => {
         saveEdit();
      };

      // Add event listeners
      valueElement.addEventListener("keydown", handleKeydown);
      valueElement.addEventListener("blur", handleBlur);

      // Store cleanup function
      valueElement._quickEditCleanup = () => {
         valueElement.removeEventListener("keydown", handleKeydown);
         valueElement.removeEventListener("blur", handleBlur);
      };
   }

   finishQuickEdit(valueElement) {
      if (valueElement._quickEditCleanup) {
         valueElement._quickEditCleanup();
         delete valueElement._quickEditCleanup;
      }
      valueElement.contentEditable = false;
      valueElement.classList.remove("editing");
      valueElement.blur();
   }

   setValueAtPath(obj, path, value) {
      let current = obj;
      for (let i = 0; i < path.length - 1; i++) {
         current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
   }

   copyToClipboard() {
      navigator.clipboard
         .writeText(JSON.stringify(this.jsonData, null, 2))
         .then(() => {
            // Find the copy button and show feedback
            const copyBtn = document.getElementById("copyBtnFallback");
            if (copyBtn) {
               const originalStyle = copyBtn.style.backgroundColor;
               copyBtn.style.backgroundColor = "#27ae60";
               const iconSpan = copyBtn.querySelector(".material-icons");
               const originalIcon = iconSpan.textContent;
               iconSpan.textContent = "check";

               setTimeout(() => {
                  copyBtn.style.backgroundColor = originalStyle;
                  iconSpan.textContent = originalIcon;
               }, 1000);
            }
         })
         .catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = JSON.stringify(this.jsonData, null, 2);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
         });
   }

   saveFile() {
      const filename = prompt("Enter filename (will add .json if not present):");
      if (filename) {
         const finalFilename = filename.endsWith(".json") ?
            filename :
            filename + ".json";
         const jsonString = JSON.stringify(this.jsonData, null, 2);
         const blob = new Blob([jsonString], {
            type: "application/json"
         });
         const url = URL.createObjectURL(blob);

         const a = document.createElement("a");
         a.href = url;
         a.download = finalFilename;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         URL.revokeObjectURL(url);
      }
   }

   getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return null;
   }

   getCurrentTheme() {
      return this.getCookie("theme") || "light";
   }

   loadSavedTheme() {
      const savedTheme = this.getCookie("theme");
      if (savedTheme) {
         this.applyTheme(savedTheme);
      }

      // Set the dropdown to the current theme
      const themeDropdown = document.getElementById("themeDropdown");
      if (themeDropdown) {
         const currentTheme = this.getCurrentTheme();
         themeDropdown.value = currentTheme;
      }
   }

   changeTheme(theme) {
      document.cookie = `theme=${theme}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
      this.applyTheme(theme);
   }

   showPasteModal() {
      const pasteModal = document.getElementById("pasteModal");
      if (pasteModal) {
         pasteModal.style.display = "flex";
         const pasteInput = document.getElementById("pasteInput");
         if (pasteInput) pasteInput.focus();
      }
   }

   closePasteModal() {
      const pasteModal = document.getElementById("pasteModal");
      const pasteInput = document.getElementById("pasteInput");
      if (pasteModal) pasteModal.style.display = "none";
      if (pasteInput) pasteInput.value = "";
   }

   applyTheme(theme) {
      // Remove all theme classes from body
      document.body.classList.remove("dark", "tokyo");

      // Add the selected theme class if not light
      if (theme !== "light") {
         document.body.classList.add(theme);
      }
   }

   loadPastedData() {
      const pasteInput = document.getElementById("pasteInput");
      const text = pasteInput ? pasteInput.value.trim() : "";

      if (!text) {
         alert("Please paste some JSON content.");
         return;
      }

      try {
         this.jsonData = JSON.parse(text);
         this.updateJSONInput();
         this.updateTreeView();
         this.showContent();
         this.closePasteModal();
      } catch (error) {
         alert("Invalid JSON format: " + error.message);
      }
   }

   parseValue(stringValue) {
      const trimmed = stringValue.trim();

      // Handle empty string
      if (trimmed === "") return "";

      // Handle booleans
      if (trimmed === "true") return true;
      if (trimmed === "false") return false;

      // Handle numbers (but not strings that look like numbers with multiple lines)
      if (!trimmed.includes("\n") && !isNaN(trimmed) && trimmed !== "") {
         const num = Number(trimmed);
         if (isFinite(num)) return num;
      }

      // Try to parse as JSON for complex objects/arrays
      try {
         return JSON.parse(stringValue);
      } catch {
         // Return as string if all else fails
         return stringValue;
      }
   }

   goHome() {
      const homeModal = document.getElementById("homeModal");
      if (homeModal) {
         homeModal.style.display = "flex";
      }
   }

   confirmGoHome() {
      // Reset the tool state
      this.jsonData = {};
      this.contentLoaded = false;

      // Clear content areas
      if (this.jsonInput) {
         this.jsonInput.value = "";
         this.jsonInput.style.height = "300px"; // Reset height
      }
      if (this.treeView) {
         this.treeView.innerHTML = "";
         this.treeView.style.height = "300px"; // Reset height
      }
      if (this.pasteZoneInput) this.pasteZoneInput.value = "";

      // Hide content and show welcome screen
      const content = document.getElementById("content");
      const headerControls = document.querySelector(".header-controls");

      if (content) {
         content.classList.remove("loaded");
         content.style.display = "none";
      }

      if (headerControls) {
         headerControls.classList.remove("visible");
         headerControls.style.display = "none";
         headerControls.style.opacity = "0";
      }

      if (this.welcomeScreen) {
         this.welcomeScreen.style.display = "flex";
      }

      // Reset panels
      if (this.leftPanel) {
         this.leftPanel.classList.add("hidden");
      }

      if (this.toggleJsonBtn) {
         this.toggleJsonBtn.classList.remove("active");
         const span = this.toggleJsonBtn.querySelector("span");
         if (span) span.textContent = "Show JSON";
      }

      // Reset upload zone
      if (this.uploadZone) {
         this.uploadZone.classList.remove("paste-mode", "dragover");
      }

      // Close home modal
      this.closeHomeModal();
   }

   closeHomeModal() {
      const homeModal = document.getElementById("homeModal");
      if (homeModal) {
         homeModal.style.display = "none";
      }
   }
}

// Initialize the tool when the page loads
document.addEventListener("DOMContentLoaded", () => {
   new JSONTranslationTool();
});