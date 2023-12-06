/* eslint-disable */
// @ts-nocheck

// https://esbuild.github.io/api/#hot-reloading-css
new EventSource('http://127.0.0.1:3333/esbuild').addEventListener(
  'change',
  e => {
    const data = JSON.parse(e.data)
    console.log('change', data)

    const { added, removed, updated } = data

    if (!added.length && !removed.length && updated.length === 1) {
      for (const link of document.getElementsByTagName('link')) {
        const url = new URL(link.href)

        if (url.host === location.host && url.pathname === updated[0]) {
          const next = link.cloneNode()
          next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
          next.onload = () => link.remove()
          link.parentNode.insertBefore(next, link.nextSibling)
          return
        }
      }
    }

    location.reload()
  }
)

export {}
