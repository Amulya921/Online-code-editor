# 📝 Online Code Editor with Live Preview
An interactive, browser-based code playground for writing, editing, and previewing **HTML**, **CSS**, and **JavaScript** in real-time. Built with **React** and **Monaco Editor**, it supports live preview, snippet saving to Firebase, sharing via URL, exporting to ZIP, and more

## ✨ Features
- 🔤 **Monaco Editor** for syntax-highlighted HTML, CSS, and JS editing
- ⚡ **Live Preview** inside a sandboxed iframe
- 💾 **Save & Load Snippets** using Firebase Firestore
- 🔗 **URL-based Sharing** with compressed code using `lz-string`
- 🎨 **Dark/Light Theme Switcher**
- 🔄 **Layout Switching** (Editor only / Preview only / Full view)
- 🧰 **Utility Tools**:
  - Export all code as a **ZIP** (`index.html`, `style.css`, `script.js`)
  - **Copy full code** to clipboard
  - Load code from **GitHub Gist**
- 🔀 **Resizable Panels** via `react-split`
- ✅ **Syntax Validation** for HTML, CSS, JS using Monaco options

## 🧰 Tech Stack

- **Frontend:** React.js
- **Code Editor:** Monaco Editor
- **Live Rendering:** iframe with `srcDoc`
- **Cloud Storage:** Firebase Firestore
- **Utilities:**
  - `lz-string` for compressed URL sharing
  - `JSZip` & `file-saver` for ZIP export
  - `react-split` for resizable panels
  - 
## 🚀 Getting Started
### 🔧 Prerequisites
- Node.js ≥ 14.x
- Firebase Project & Firestore enabled

### 📦 Installation
git clone https://github.com/your-username/online-code-editor.git
cd online-code-editor
npm install
