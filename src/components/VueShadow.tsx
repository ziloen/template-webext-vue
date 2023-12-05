import type { CSSProperties } from 'vue'
import {
  Fragment,
  Teleport,
  createBlock,
  createCommentVNode,
  createElementBlock,
  createVNode,
  openBlock,
  ref,
  renderSlot
} from 'vue'

const styleUrl = browser.runtime.getURL('dist/contentScripts/style.css')

const contentStyle = new CSSStyleSheet()

let styleLoaded: boolean | Promise<void> = false

function initStyle() {
  if (styleLoaded) return styleLoaded
  return (styleLoaded = new Promise<void>((res, rej) => {
    fetch(styleUrl)
      .then(res => res.text())
      .then(text => contentStyle.replace(text))
      .then(() => {
        styleLoaded = true
        res()
      })
      .catch(rej)
  }))
}

type Props = {
  tag?: string
  /**
   * @default 'closed'
   */
  mode?: ShadowRootMode

  style?: CSSProperties

  class?: string
}

export const VueShadow = defineComponent<Props>((props, { slots }) => {
  const containerRef = ref<HTMLElement>(null!)
  const shadowRootRef = ref<ShadowRoot | null>(null)
  const styleLoaded = ref(false)

  onMounted(() => {
    shadowRootRef.value = containerRef.value.attachShadow({
      mode: props.mode ?? 'closed'
    })
    shadowRootRef.value.adoptedStyleSheets = [contentStyle]
    const result = initStyle()
    if (result === true) {
      styleLoaded.value = true
    } else {
      result.then(() => {
        styleLoaded.value = true
      })
    }
  })

  return () => (
    openBlock(),
    createElementBlock(
      Fragment,
      null,
      [
        createVNode(
          props.tag ?? 'div',
          {
            style: { display: 'contents' },
            class: props.class,
            ref: containerRef
          },
          null,
          8,
          ['class']
        ),
        shadowRootRef.value
          ? (openBlock(),
            createBlock(
              Teleport,
              { to: shadowRootRef.value },
              [renderSlot(slots, 'default')],
              8,
              ['to']
            ))
          : createCommentVNode('', true)
      ],
      64
    )
  )
})
