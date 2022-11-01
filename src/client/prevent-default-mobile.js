document.documentElement.addEventListener(
  "gesturestart",
  e => {
    e.preventDefault()
  },
  false,
)
window.addEventListener("zoom", e => e.preventDefault(), false)
window.addEventListener(
  "touchstart",
  e => {
    const cancelDoubleTap = e => {
      e.preventDefault()
    }
    window.addEventListener("touchstart", cancelDoubleTap, false)
    setTimeout(() => {
      window.removeEventListener("touchstart", cancelDoubleTap, false)
    }, 500)
  },
  false,
)
