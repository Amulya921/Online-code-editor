import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { db } from "./firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import Split from "react-split";
import './App.css';
import JSZip from "jszip";
import { saveAs } from "file-saver";

const templates = {
  "Hello World": {
    html: "<h1>Hello, World!</h1>",
    css: "h1 { color: green; text-align: center; }",
    js: "console.log('Hello, World!');",
  },
  "Flexbox Layout": {
    html: `<div class="container"><div>Box 1</div><div>Box 2</div></div>`,
    css: `.container { display: flex; gap: 10px; } .container div { background: #eee; padding: 10px; }`,
    js: "",
  },
  "Live Clock": {
    html: `<h2 id="clock"></h2>`,
    css: `h2 { font-family: monospace; font-size: 2rem; color: navy; text-align: center; }`,
    js: `
      setInterval(() => {
        const now = new Date();
        document.getElementById("clock").innerText = now.toLocaleTimeString();
      }, 1000);
    `,
  },
};

function getInitialCode() {
  const params = new URLSearchParams(window.location.search);
  const compressed = params.get("code");

  if (compressed) {
    try {
      return JSON.parse(decompressFromEncodedURIComponent(compressed));
    } catch (e) {
      console.error("Error decoding shared code:", e);
    }
  }

  return {
    html: localStorage.getItem("html") || "<h1>Hello</h1>",
    css: localStorage.getItem("css") || "h1 { color: blue; }",
    js: localStorage.getItem("js") || "console.log('Hello');",
  };
}

function App() {
  const initialCode = getInitialCode();

  const [html, setHtml] = useState(initialCode.html);
  const [css, setCss] = useState(initialCode.css);
  const [js, setJs] = useState(initialCode.js);
  const [srcDoc, setSrcDoc] = useState("");
  const [layout, setLayout] = useState("default");
  const [showTools, setShowTools] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        <html>
          <head><style>${css}</style></head>
          <body>${html}<script>${js}<\/script></body>
        </html>
      `);
      localStorage.setItem("html", html);
      localStorage.setItem("css", css);
      localStorage.setItem("js", js);
    }, 250);

    return () => clearTimeout(timeout);
  }, [html, css, js]);

  useEffect(() => {
    document.body.style.background = theme === "dark" ? "#1e1e1e" : "#ffffff";
    localStorage.setItem("theme", theme);
  }, [theme]);
const handleEditorWillMount = (monaco) => {
  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.css.cssDefaults.setOptions({
    validate: true,
  });

  monaco.languages.html.htmlDefaults.setOptions({
    validate: true,
  });
};
  const generateShareLink = () => {
    const code = JSON.stringify({ html, css, js });
    const compressed = compressToEncodedURIComponent(code);
    const shareURL = `${window.location.origin}?code=${compressed}`;
    navigator.clipboard.writeText(shareURL);
    alert("Shareable link copied to clipboard!");
  };

  const saveSnippet = async () => {
    try {
      const docRef = await addDoc(collection(db, "snippets"), {
        html,
        css,
        js,
        createdAt: new Date(),
      });
      alert(`Snippet saved! ID: ${docRef.id}`);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to save snippet.");
    }
  };

  const exportAsZip = () => {
    const zip = new JSZip();

    zip.file("index.html", html);
    zip.file("styles.css", css);
    zip.file("script.js", js);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "code-snippet.zip");
    });
  };

  const copyAllCode = async () => {
    const fullCode = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
      </html>
    `;

    try {
      await navigator.clipboard.writeText(fullCode);
      alert("Code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy code.");
    }
  };

  const loadGist = async (gistId) => {
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`);
      const gist = await res.json();

      const files = gist.files;

      const htmlContent = files["index.html"]?.content || "";
      const cssContent = files["style.css"]?.content || "";
      const jsContent = files["script.js"]?.content || "";

      setHtml(htmlContent);
      setCss(cssContent);
      setJs(jsContent);

      alert("Loaded from Gist!");
    } catch (error) {
      console.error("Error loading Gist:", error);
      alert("Failed to load from Gist.");
    }
  };

  const loadSnippetById = async (id) => {
    try {
      const docRef = doc(db, "snippets", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        setHtml(data.html || "");
        setCss(data.css || "");
        setJs(data.js || "");

        setSrcDoc(`
          <html>
            <head><style>${data.css}</style></head>
            <body>${data.html}<script>${data.js}<\/script></body>
          </html>
        `);
      } else {
        alert("No such document!");
      }
    } catch (error) {
      console.error("Error loading snippet:", error);
      alert("Failed to load snippet.");
    }
  };

  const toggleToolsMenu = () => {
    setShowTools(!showTools);
  };

  const handleExportZip = () => {
    exportAsZip();
  };

  const handleCopyAll = () => {
    copyAllCode();
  };

  const handleLoadGist = () => {
    const gistId = prompt("Enter GitHub Gist ID:");
    if (gistId) loadGist(gistId);
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", margin: 0 }}>
      <h2
        style={{
          textAlign: "center",
          margin: "10px 0",
          color: theme === "dark" ? "#fff" : "#000",
        }}
      >
        Online Code Editor
      </h2>

      <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={() => {
            localStorage.removeItem("html");
            localStorage.removeItem("css");
            localStorage.removeItem("js");
            setHtml("<h1>Hello</h1>");
            setCss("h1 { color: blue; }");
            setJs("console.log('Hello');");
          }}
        >
          Reset Code
        </button>

        <button onClick={saveSnippet}>Save to Firebase</button>

        <button
          onClick={() => {
            const snippetId = prompt("Enter Snippet ID to Load:");
            if (snippetId) loadSnippetById(snippetId);
          }}
        >
          Load from Firebase
        </button>

        <button
          onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
          style={{ padding: "6px 12px", fontSize: "14px", cursor: "pointer" }}
        >
          Toggle {theme === "dark" ? "Light" : "Dark"} Theme
        </button>

        <button onClick={generateShareLink}>Share Code</button>

        <select
          onChange={(e) => {
            const selected = templates[e.target.value];
            if (selected) {
              setHtml(selected.html);
              setCss(selected.css);
              setJs(selected.js);
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Load a Template
          </option>
          {Object.keys(templates).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <button onClick={() => setLayout("default")}>Full View</button>
        <button onClick={() => setLayout("editor-only")}>Editor Only</button>
        <button onClick={() => setLayout("preview-only")}>Preview Only</button>

        <div style={{ position: "relative", display: "inline-block" }}>
          <button onClick={toggleToolsMenu}>⚙️ Tools</button>
          {showTools && (
            <div
              style={{
                position: "absolute",
                backgroundColor: theme === "dark" ? "#2e2e2e" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid #ccc",
                padding: "8px",
                boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                zIndex: 10,
              }}
            >
              <button onClick={handleExportZip}>💾 Export as ZIP</button>
              <br />
              <button onClick={handleCopyAll}>📋 Copy All Code</button>
              <br />
              <button onClick={handleLoadGist}>📦 Load from GitHub Gist</button>
            </div>
          )}
        </div>
      </div>

      {layout !== "preview-only" && (
        <Split
          className="split"
          sizes={[33.33, 33.33, 33.33]}
          minSize={100}
          gutterSize={6}
          direction="horizontal"
          style={{ display: "flex", height: "100%" }}
        >
          <div style={{ width: "100%", height: "100%" }}>
            <Editor
              height="100%"
              language="html"
              value={html}
              onChange={(value) => setHtml(value)}
              theme={theme === "dark" ? "vs-dark" : "light"}
              beforeMount={handleEditorWillMount}
            />
          </div>
          <div style={{ width: "100%", height: "100%" }}>
            <Editor
              height="100%"
              language="css"
              value={css}
              onChange={(value) => setCss(value)}
              theme={theme === "dark" ? "vs-dark" : "light"}
              beforeMount={handleEditorWillMount}
            />
          </div>
          <div style={{ width: "100%", height: "100%" }}>
            <Editor
              height="100%"
              language="javascript"
              value={js}
              onChange={(value) => setJs(value)}
              theme={theme === "dark" ? "vs-dark" : "light"}
              beforeMount={handleEditorWillMount}
            />
          </div>
        </Split>
      )}

      {layout !== "editor-only" && (
        <div
          style={{
            height: layout === "preview-only" ? "100%" : "30%",
            borderTop: "2px solid #ccc",
          }}
        >
          <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts"
            frameBorder="0"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </div>
      )}
    </div>
  );
}
  export default App;









