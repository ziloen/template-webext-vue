import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives
} from 'unocss'
import { presetZiloen } from 'unocss-preset-ziloen'


export default defineConfig({
  presets: [
    presetZiloen(),
    presetUno(),
    presetIcons()
  ],
  transformers: [
    transformerDirectives()
  ]
})
