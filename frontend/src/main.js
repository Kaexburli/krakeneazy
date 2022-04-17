// ---------------------------------------------------------
//  Imports
// ---------------------------------------------------------
import App from './App.svelte'

// ---------------------------------------------------------
//  Props
// ---------------------------------------------------------
const app = new App({
  target: document.body
})

// ---------------------------------------------------------
//  Methods Declarations
// ---------------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  })
}

export default app
