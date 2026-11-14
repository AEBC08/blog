---
title: OpenCode 接 Kouri Ai，顺手记下 DeepSeek V4.1 Flash 的几个参数
published: 2026-11-14T12:35:00.000Z
description: 换掉 OpenCode 的后端，配置贴在这里，以后重装不用再翻文档。
tags:
  - AI
  - opencode
  - DeepSeek
  - 工具
category: 工具
draft: false
layout: default
lang: zh-CN
---

直连成本偏高，加上访问不稳定，把 opencode 的后端换成了 [Kouri Ai](https://api.kourichat.com)。用了几天，配置记录如下。

它属于中转站，模式与 OpenRouter 类似：注册、建令牌、从控制台复制模型 ID、指向 baseURL 即可。除 OpenAI 的 `/v1/chat/completions`，也支持 Anthropic 的 `/v1/messages` 和 Gemini 的 `/v1beta/models`，图片、embedding、rerank 各有端点，换模型不必换客户端。

价格页写明暂无长文本溢价、多模态溢价和峰谷价，标价即实收。决定使用的是另一条：DeepSeek V4 之后的型号，缓存读取按输入价的 2% 计，写入免费。agent 运行时上下文逐轮累积，省的主要是这部分。

风险也明确：非官方服务，出问题只能等客服。控制台固定走 `api.kourichat.com/dashboard`，调用可换备用域名 `api.kouri.chat`，主域名不通时应急。模型 ID 务必从控制台复制；文档提到调用列表外的 ID 有时能通，但计费不保证。

## 选择 V4.1 Flash 的原因

便宜、上下文大、支持图片输入。

`deepseek-v4.1-flash-1017` 是 V4.1-Flash 十月十七日的迭代版，552B MoE，输入阶段激活 8B，输出激活 16B，价格因此较低。上下文 1M，最大输出 384K，思维链计入 384K。思考默认开启，默认档位 high。

它不是最强的模型，长任务偶尔偏离。日常改代码、读代码够用，一个仓库的目录加几个关键文件放进去成本可控。真正卡住时才切到 pro 或将档位拉到 max。

## 配置 opencode

opencode 使用 `providers`（复数）配置。`deepseek-v4.1-flash-1017` 不在内置目录中，能力和上下文长度需手动声明；否则会按 200K 上下文、32K 输出推断，模型能力无法充分利用。

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "kouri/deepseek-v4.1-flash-1017",
  "providers": {
    "kouri": {
      "name": "Kouri Ai",
      "env": ["KOURI_API_KEY"],
      "package": "@opencode/ai/providers/openai-compatible",
      "settings": {
        "baseURL": "https://api.kourichat.com/v1"
      },
      "models": {
        "deepseek-v4.1-flash-1017": {
          "name": "DeepSeek V4.1 Flash (1017)",
          "capabilities": {
            "tools": true,
            "input": ["text", "image"],
            "output": ["text"],
            "reasoning": {
              "supported": true,
              "toggle": true,
              "effort": ["low", "high", "max"]
            }
          },
          "limit": {
            "context": 1000000,
            "output": 393216
          },
          "settings": {
            "reasoningEffort": "high"
          },
          "compatibility": {
            "reasoningField": "reasoning_content",
            "requireReasoning": true,
            "maxTokensField": "max_tokens"
          }
        }
      }
    }
  }
}
```

令牌放入环境变量，不写入文件：

```bash
export KOURI_API_KEY="sk-kouri-..."
```

`env` 中已声明变量名，opencode 会自动读取，无需另填 `apiKey`。先用 curl 确认 key 和模型 ID：

```bash
curl -s https://api.kourichat.com/v1/chat/completions \
  -H "Authorization: Bearer $KOURI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-v4.1-flash-1017",
    "messages": [{ "role": "user", "content": "用一句话说明 1M 上下文为什么不等于能塞满 1M" }],
    "reasoning_effort": "low"
  }'
```

临时切换档位，在模型后加 `#`：

```bash
opencode --model kouri/deepseek-v4.1-flash-1017#max
```

## 三个参数的实际表现

### 图片输入

`input: ["text", "image"]` 可用。改页面时把截图放进去问「这个间距为什么塌了」，比文字描述更直接。平台对图片不额外溢价，按普通输入 token 计费。仅支持图片输入，不支持图片生成；生成图片仍需 `/v1/images/generations`。

### 思考档位

`reasoning_effort` 只有四个值：`none`、`low`、`high`、`max`，默认 `high`。

注意：`medium` 和 `xhigh` 均映射为 `high`，`minimal` 变为 `low`，`ultra` 变为 `max`。按其他平台习惯传 `medium` 实际仍是 high。

配置中 `capabilities.reasoning` 声明了 `toggle: true` 和三个档位，opencode 会自动生成变体，`#low`、`#max` 可直接使用。个人分配：改文案、补类型、写注释用 `low`，功能开发用 `high`，长时间无法定位的 bug 才切 `max`，并同时新建会话，避免无关文件进入上下文。

另一点：思考模式下 `temperature`、`presence_penalty`、`frequency_penalty` 均不生效。

### 上下文

1M 是上限，不是目标。整个仓库一次性放入会导致首 token 变慢、账单增长，模型也容易在大量文件中抓错重点。通常只提供当前任务相关的几个文件，其余让模型通过工具自行读取，比直接灌入上下文更准确。

真正需要长上下文的是读规范这类任务。此时 384K 输出上限比 1M 输入更有价值，一次能输出整个模块的改动，不必拆成多段对话。

## 两个注意事项

`reasoning_content` 需要回传。DeepSeek 在带 `tools` 的请求中要求将历史轮次的思考内容拼回上下文，否则 agent 容易提前结束。opencode 对 DeepSeek 默认开启该行为，配置中的 `requireReasoning` 即对应此点。自行实现客户端时不要删除该字段。

端点选择方面，文档列出部分不支持 `/v1/responses` 的 DeepSeek 型号，`deepseek-v4.1-flash` 不在名单中，但 Chat 端点全模型可用，未做额外尝试。`max_tokens` 与 `max_completion_tokens` 这类字段名差异在中转层未必统一，链路末端是 DeepSeek，写 `max_tokens` 最稳妥，配置中已显式指定。

## 当前用法

日常使用 `high`，卡住时切 `max`，解决后切回。账单未细算，比直连便宜，速度够用。

配置如上。模型涨价或 ID 变更时改两行即可。

::LinkCard{title="Kouri Ai" description="极简成本，极致赋能。" href="https://api.kourichat.com" icon="brand-openai"}
::

::LinkCard{title="Kouri Ai 文档" description="端点、计价、缓存与客户端接入说明。" href="https://docs.kourichat.com" icon="book"}
::