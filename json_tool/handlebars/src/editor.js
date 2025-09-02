 // Global variables
      let template
      let debounceTimer
      let editor
      let templateSource = ""
      let cssContent = ""
      let commonContent = {}
      let currentHighlightedElements = []
      let highlightTimer // debounce timer for highlight

      // Load external files
      async function loadExternalFiles() {
        try {
          // Load compiled template (no partials needed!)
          const templateResponse = await fetch("./compiled-template.hbs")
          if (!templateResponse.ok) throw new Error(`Template load failed: ${templateResponse.status}`)
          templateSource = await templateResponse.text()

          // Load CSS
          const cssResponse = await fetch("./prodPageDetail.css")
          if (!cssResponse.ok) throw new Error(`CSS load failed: ${cssResponse.status}`)
          cssContent = await cssResponse.text()

          // Load common content
          try {
            const commonResponse = await fetch("./commonContent.json")
            if (commonResponse.ok) {
              commonContent = await commonResponse.json()
              console.log("✅ Common content loaded:", Object.keys(commonContent))
            } else {
              console.warn("⚠️  Common content file not found, using empty object")
              commonContent = {}
            }
          } catch (error) {
            console.warn("⚠️  Failed to load common content:", error.message)
            commonContent = {}
          }

          return true
        } catch (error) {
          showError(`Failed to load external files: ${error.message}`)
          console.error("Load error:", error)
          return false
        }
      }

      // Register Handlebars helpers
      function registerHandlebarsHelpers() {
        Handlebars.registerHelper("eq", function (a, b) {
          return a === b
        })

        Handlebars.registerHelper("typeof", function (value) {
          if (Array.isArray(value)) return "array"
          if (value === null) return "null"
          return typeof value
        })

        Handlebars.registerHelper("isArray", function (value) {
          return Array.isArray(value)
        })

        Handlebars.registerHelper("gt", function (a, b) {
          return a > b
        })

        Handlebars.registerHelper("lt", function (a, b) {
          return a < b
        })

        Handlebars.registerHelper("and", function (a, b) {
          return a && b
        })

        Handlebars.registerHelper("or", function (a, b) {
          return a || b
        })
      }

      // Deep merge function to combine objects (same as build.js)
      function deepMerge(target, source) {
        const result = { ...target }
        
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(result[key] || {}, source[key])
          } else {
            result[key] = source[key]
          }
        }
        
        return result
      }

      // Normalize incoming data to support common aliases/misnamings
      function normalizeData(data) {
        const out = { ...data }
        out.featuresSection = out.featuresSection || {}
        out.whatsIncludedSection = out.whatsIncludedSection || {}

        // Map top-level aliases to nested structure
        if (out.featuresSectionTitle && !out.featuresSection.featuresTitle) {
          out.featuresSection.featuresTitle = out.featuresSectionTitle
        }
        if (out.featuresTitle && !out.featuresSection.featuresTitle) {
          out.featuresSection.featuresTitle = out.featuresTitle
        }
        if (out.featuresSectionSubtitle && !out.featuresSection.featuresSubtitle) {
          out.featuresSection.featuresSubtitle = out.featuresSectionSubtitle
        }
        if (out.featuresSubtitle && !out.featuresSection.featuresSubtitle) {
          out.featuresSection.featuresSubtitle = out.featuresSubtitle
        }

        return out
      }

      // Simple highlighting function
      function highlightTextInPreview(searchText) {
        // Clear previous highlights
        clearHighlights()

        if (!searchText || searchText.length < 3) return

        const previewEl = document.getElementById('previewContent')
        if (!previewEl) return

        const walker = document.createTreeWalker(
          previewEl,
          NodeFilter.SHOW_TEXT,
          null,
          false
        )

        const textNodes = []
        let node
        while ((node = walker.nextNode())) {
          const text = (node.textContent || '').trim()
          if (!text) continue
          if (text.toLowerCase().includes(searchText.trim().toLowerCase())) {
            textNodes.push(node)
          }
        }

        textNodes.forEach(textNode => {
          const el = textNode.parentElement
          if (el && !el.classList.contains('preview-highlight')) {
            el.classList.add('preview-highlight')
            currentHighlightedElements.push(el)
          }
        })
      }

      // Clear all highlights
      function clearHighlights() {
        currentHighlightedElements.forEach(el => {
          el.classList.remove('preview-highlight')
        })
        currentHighlightedElements = []
      }

      // Get text around cursor - improved version
      function getTextAroundCursor() {
        if (!editor) return null
        const cursor = editor.getCursor()
        const line = editor.getLine(cursor.line)
        if (!line) return null

        const beforeCursor = line.substring(0, cursor.ch)
        const afterCursor = line.substring(cursor.ch)

        // Find the closest quotes around cursor
        let startQuote = beforeCursor.lastIndexOf('"')
        let endQuote = afterCursor.indexOf('"')

        if (startQuote !== -1 && endQuote !== -1) {
          const fullText = line.substring(startQuote + 1, cursor.ch + endQuote)
          if (fullText && fullText.length >= 3) return fullText
        }

        // Alternative: look for words around cursor
        const tokens = line.split(/[\s,":{}\[\]]+/)
        for (const token of tokens) {
          if (!token) continue
          const start = line.indexOf(token)
          const end = start + token.length
          if (token.length >= 3 && start <= cursor.ch && end >= cursor.ch) {
            return token
          }
        }

        return null
      }

      // Debounced highlight scheduler
      function scheduleHighlight() {
        clearTimeout(highlightTimer)
        highlightTimer = setTimeout(() => {
          const text = getTextAroundCursor()
          if (text && text.length >= 3) {
            highlightTextInPreview(text)
            updateStatus(`Highlighting: "${text}"`)
          } else {
            clearHighlights()
            updateStatus('Ready')
          }
        }, 120)
      }

      // Default JSON data
      const DEFAULT_JSON = {
        productDetails: {
          productTitle: "Frog Tadpole",
          productTagline: "The best balance bike for kids",
          productEyebrow: "Super-lightweight balance bike",
          productSubtitle: "The ultimate confidence‑boosting balance bike for 3–4 year olds – ultra light, easy to control, and built to grow with them. Perfect for little adventurers making their first cycling memories.",
        },
        calloutFeatureBadges: ["Lightweight", "Easy to ride", "Confidence boosting", "Grows with your child"],
        productSpecificationCards: [
          ["Age Range", "18mo-3yr"],
          ["Wheel Size", '12"'],
          ["Inside Leg", "16-21 cm"],
          ["Weight", "2.98 kg"],
          ["Adaptability", "Seat & bar"],
        ],
        featuresSection: {
          featuresTitle: "Looking for the perfect balance bike for your child?",
          featuresSubtitle: "Meet the Frog Tadpole – designed to make learning to pedal fun, safe, and confidence‑building from day one.",
          detailedFeatureBlocks: [
            {
              title: "A bike that grows with your child",
              description:
                "The Frog Tadpole is designed to grow with your child, featuring an adjustable handlebar height and tool-free seat post adjustment. As your young rider grows taller and stronger, the bike easily adapts to ensure a perfect fit, providing long-lasting comfort, confidence, and a better riding experience.",
              image: {
                src: "l-fh53/L-FR53-features-1-8-speed-gears",
                alt: "Frog bikes 8 speed derailleur and drive system. Bespoke kid-first crank arm and chainring design for easier pedalling",
              },
            },
            {
              title: "Designed for easier pedalling",
              description:
                "The Frog Tadpole features patented Frog cranks, designed to provide a more efficient pedalling motion that's gentler on young legs. This innovative design makes cycling smoother and more enjoyable for kids while helping them build strength, coordination, and confidence as they develop their cycling skills.",
              image: {
                src: "l-fh53/L-FR53-features-2-chainguard",
                alt: "Close-up of Frog bike pedals and cranks showing innovative design",
              },
            },
            {
              title: "Lightweight for kids and parents",
              description:
                "Weighing only 6.06kg, the Frog Tadpole is an incredibly lightweight kids' bike that's easy to handle and manoeuvre. Young riders will feel confident as they navigate their first rides, while parents will love the bike's portability, whether carrying it to the park or lifting it into the car. The thin-profile aluminium frame provides a sleek, streamlined look without sacrificing durability or strength.",
              image: {
                src: "l-fh53/L-FR53-features-3-kenda-tyres",
                alt: "Parent easily lifting lightweight Frog bike showing portability",
              },
            },
            {
              title: "Confidence‑boosting safety features",
              description:
                "Safety comes first with the Frog Tadpole. Small, easy-to-reach brake levers are designed specifically for young hands, helping children learn to stop with greater control. The responsive braking system, combined with a low centre of gravity and stable frame, helps little riders stay balanced and in control, while enlarged handlebar grips offer extra protection during tumbles or sharp turns.",
              image: {
                src: "l-fh53/L-FR53-features-4-bottom-bracket",
                alt: "Child's hands on Frog bike brake levers showing kid-friendly design",
              },
            },
          ],
          quickFeatureCards: [
            ["Kid-friendly design with safety in mind", "The Frog Tadpole is designed with tiny riders in mind, featuring rounded edges, soft grips, and a stable frame that helps prevent falls while building confidence."],
            [
              "The perfect transition from a balance bike",
              "Balance bikes are proven to help children learn to ride faster. The Tadpole builds balance and coordination naturally, making the transition to pedals seamless when they're ready.",
            ],
          ],
        },
        whatsIncludedSection: {
          mainAssemblyInfo: {
            assembly_steps: ["Align and secure the handlebars (pre-positioned for transit)", "Attach the pedals (packaged separately for safety)"],
            tools: ["5mm and 6mm hex keys (Allen wrenches)", "15mm open-end spanner"],
          },
          sidebarInfoCards: [
            [
              "",
              "In the box",
              [
                "Reflectors for visibility",
                'Mudguards <small style="color: var(--text-muted)"><em>(worth £28)</em></small>',
                "Bell for fun",
                'Kickstand optional <small style="color: var(--text-muted)"><em>add later if you like</em></small>',
              ],
            ],
            ["", "Toolkit included!", "95% pre-build, pre‑aligned components and included tools mean less time wrenching, more time riding."],
          ],
        },
      }

      // Initialize the editor
      async function init() {
        updateStatus("Loading compiled template...")

        // Load external files first
        const filesLoaded = await loadExternalFiles()
        if (!filesLoaded) {
          updateStatus("Failed to load external files")
          return
        }

        // Register helpers
        registerHandlebarsHelpers()

        // Compile template
        try {
          template = Handlebars.compile(templateSource)
        } catch (error) {
          showError(`Template compilation failed: ${error.message}`)
          return
        }

        // Initialize CodeMirror
        editor = CodeMirror(document.getElementById("editorContainer"), {
          value: JSON.stringify(DEFAULT_JSON, null, 2),
          mode: { name: "javascript", json: true },
          theme: "material-darker",
          lineNumbers: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          indentUnit: 2,
          tabSize: 2,
          lineWrapping: true,
          extraKeys: {
            "Ctrl-S": function () { downloadJSON() },
            "Cmd-S": function () { downloadJSON() },
            "Ctrl-R": function () { refreshPreview() },
            "Cmd-R": function () { refreshPreview() },
          },
        })

        // Listen for changes (update preview)
        editor.on("change", function () {
          updatePreview()
        })

        // Listen for cursor position changes (highlight)
        editor.on("cursorActivity", function () {
          scheduleHighlight()
        })

        // Initial preview update
        updatePreview()

        // Update character count
        updateCharCount()

        showSuccess("Editor ready! Now using live template, CSS, and common content files.")
      }

      // Update preview with debouncing
      function updatePreview() {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          try {
            const jsonText = editor.getValue()
            const editorData = JSON.parse(jsonText)

            // Merge common content with editor data (editor data takes precedence)
            const mergedData = deepMerge(commonContent, editorData)

            // Normalize aliases to expected structure
            const normalizedData = normalizeData(mergedData)

            // Add CSS to normalized data
            normalizedData.css = cssContent

            // Generate HTML
            const html = template(normalizedData)

            // Update preview content directly (no flickering!)
            const previewEl = document.getElementById("previewContent")
            previewEl.innerHTML = html

            // Re-apply highlight after preview DOM is replaced
            scheduleHighlight()

            hideError()
            updateStatus("Preview updated")
          } catch (error) {
            showError("JSON Error: " + error.message)
            updateStatus("JSON Error")
          }

          updateCharCount()
        }, 150)
      }

      // Refresh preview manually
      function refreshPreview() {
        updatePreview()
        showSuccess("Preview refreshed!")
      }

      // Download JSON file
      function downloadJSON() {
        try {
          const jsonText = editor.getValue()
          const data = JSON.parse(jsonText)

          // Create blob and download
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "product-page.json"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          showSuccess("JSON file downloaded!")
        } catch (error) {
          showError("Cannot download invalid JSON: " + error.message)
        }
      }

      // Upload JSON file
      function uploadJSON(event) {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = function (e) {
          try {
            const jsonData = JSON.parse(e.target.result)
            editor.setValue(JSON.stringify(jsonData, null, 2))
            updatePreview()
            showSuccess("File uploaded successfully!")
          } catch (error) {
            showError("Invalid JSON file: " + error.message)
          }
        }
        reader.readAsText(file)

        // Reset file input
        event.target.value = ""
      }

      // Utility functions
      function showError(message) {
        const errorEl = document.getElementById("errorMessage")
        errorEl.textContent = message
        errorEl.style.display = "block"
        setTimeout(hideError, 5000)
      }

      function hideError() {
        document.getElementById("errorMessage").style.display = "none"
      }

      function showSuccess(message) {
        const successEl = document.getElementById("successMessage")
        successEl.textContent = message
        successEl.style.display = "block"
        setTimeout(() => {
          successEl.style.display = "none"
        }, 3000)
      }

      function updateStatus(message) {
        document.getElementById("statusText").textContent = message
      }

      function updateCharCount() {
        const text = editor.getValue()
        document.getElementById("charCount").textContent = `${text.length} characters`
      }

      // Keyboard shortcuts
      document.addEventListener("keydown", function (e) {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case "s":
              e.preventDefault()
              downloadJSON()
              break
            case "r":
              e.preventDefault()
              refreshPreview()
              break
          }
        }
      })

      // Initialize when page loads
      document.addEventListener("DOMContentLoaded", init)