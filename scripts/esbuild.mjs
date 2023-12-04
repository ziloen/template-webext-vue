import { build, context } from "esbuild"
import VueJSX from "unplugin-vue-jsx/esbuild"
import Vue from "unplugin-vue/esbuild"

/**
 * @typedef {import("esbuild").Plugin} Plugin
 */

const isDev = process.env.NODE_ENV === "development"
const cwd = process.cwd()


/** @type { import("esbuild").BuildOptions } */
const config = {
  sourcemap: isDev,
  drop: isDev ? undefined : ['console', 'debugger'],
  minify: !isDev,
  plugins: [
    /** @type {Plugin} */
    (VueJSX({
      include: [/\.tsx$/],
      sourceMap: isDev,
    })),
    Vue(),
  ]
}