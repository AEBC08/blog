#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'

const CONTENT_DIR = resolve(process.cwd(), 'content/blog')
const SLUG_SEGMENT = /^[a-z0-9][a-z0-9._-]*$/

/**
 * Prints an error and terminates with a non-zero exit code. Scripts run in
 * automation, so every failure must be loud and actionable.
 */
function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

/**
 * Builds a human-readable title from the final slug segment, dropping an
 * optional numeric ordering prefix such as `001-`.
 */
function toTitle(segment) {
  const cleaned = segment.replace(/^\d+[-_]/, '')
  const words = cleaned.split(/[-_]+/).filter(Boolean)

  if (words.length === 0) {
    return 'Untitled'
  }

  return words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * YAML scalar quoting is only needed for titles containing YAML syntax
 * characters. Keep the common case clean and double-quote the rest.
 */
function toYamlString(value) {
  if (/^[\w\u4E00-\u9FFF][\w\u4E00-\u9FFF .-]*$/.test(value)) {
    return value
  }

  return JSON.stringify(value)
}

const rawSlug = process.argv[2]

if (!rawSlug) {
  fail('缺少参数。用法：pnpm new-post <slug>（例如 pnpm new-post notes/nuxt-content）')
}

const slug = rawSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, '').replace(/\.md$/, '')

if (!slug) {
  fail('slug 不能为空。')
}

const segments = slug.split('/')

if (segments.some(segment => segment === '..' || segment === '.' || !SLUG_SEGMENT.test(segment))) {
  fail(`slug "${rawSlug}" 不合法。只允许小写字母、数字、-、_、.，并使用 / 分隔嵌套目录。`)
}

const title = toTitle(segments.at(-1) ?? slug)
const targetPath = join(CONTENT_DIR, `${slug}.md`)
const now = new Date().toISOString()

const frontmatter = `---
title: ${toYamlString(title)}
published: ${now}
description: ""
tags: []
category: ""
draft: true
layout: default
lang: zh-CN
---

在这里开始写作。发布前把 frontmatter 中的 \`draft\` 改为 \`false\`。

## 小节标题

正文。
`

try {
  await mkdir(dirname(targetPath), { recursive: true })
  await writeFile(targetPath, frontmatter, { encoding: 'utf8', flag: 'wx' })
}
catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
    fail(`文件已存在，未覆盖：${targetPath}`)
  }

  fail(`创建文章失败：${error instanceof Error
    ? error.message
    : String(error)}`)
}

console.warn(`✔ 已创建 ${targetPath}`)
console.warn('  默认 draft: true，发布前记得改为 false。')
