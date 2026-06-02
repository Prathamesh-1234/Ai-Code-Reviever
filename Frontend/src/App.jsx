import { useState } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import axios from 'axios'
import './App.css'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const editorStyle = {
  fontFamily: '"Fira code", "Fira Mono", monospace',
  fontSize: 16,
  border: "1px solid #ddd",
  borderRadius: "5px",
  height: "100%",
  width: "100%"
}

function App() {
  const [code, setCode] = useState(`function sum() {\n  return 1 + 1\n}`)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function reviewCode() {
    if (!code.trim()) return

    setLoading(true)
    setError(null)
    setReview('')

    try {
      const response = await axios.post(`${BASE_URL}/ai/get-review`, { code })
      setReview(response.data)
    } catch (err) {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="left">
        <div className="code">
          <Editor
            value={code}
            onValueChange={code => setCode(code)}
            highlight={code => prism.highlight(code, prism.languages.javascript, 'javascript')}
            padding={10}
            style={editorStyle}
          />
        </div>
        <button
          onClick={reviewCode}
          className="review"
          disabled={loading}
        >
          {loading ? 'Reviewing...' : 'Review'}
        </button>
      </div>

      <div className="right">
        {error && (
          <p className="error-message">{error}</p>
        )}
        {!error && review && (
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        )}
        {!error && !review && !loading && (
          <p className="placeholder">Submit your code to get an AI review.</p>
        )}
        {loading && (
          <p className="placeholder">Analysing your code...</p>
        )}
      </div>
    </main>
  )
}

export default App
