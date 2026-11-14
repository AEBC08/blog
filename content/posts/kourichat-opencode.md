---
title: 把 opencode 接到 Kouri Ai，主力换成 DeepSeek V4.1 Flash
published: 2026-11-14T12:35:00.000Z
description: 一个中转平台加一份 opencode 配置，顺带说说多模态、思考等级和 1M 上下文实际怎么用。
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

opencode 的好处是模型可换。坏处是换完以后账单也跟着换。这周把它的后端挪到了 [Kouri Ai](https://api.kourichat.com)——一个类似 OpenRouter 的中转，主力模型用 `deepseek-v4.1-flash-1017`。配置不复杂，但有几个参数文档里散着写，凑一起才好用。

## 平台本身

一句话：注册、建令牌、从模型列表里抄 ID、把 Base URL 指向 `https://api.kourichat.com/v1`，就能用 OpenAI 协议的客户端调几乎所有主流模型。它同时开着 `/v1/responses`、`/v1/messages`（Anthropic 协议）和 `/v1beta/models`（Gemini 协议），图像、嵌入、重排也各有端点，所以基本不用为了换模型去改客户端。

吸引我的其实是计价方式。官方文档写得很直白：暂时没有长文本输入溢价、多模态输入溢价、峰谷价，看到的价格就是结算价格。对动辄塞几万 token 上下文的 agent 来说，这条比「每百万 token 便宜两毛」实在。DeepSeek V4 及更新的型号，缓存读取按输入价的 2% 计费，缓存写入免费，长会话的成本能压下去一截。

有两个细节值得先记住。控制台只能走 <https://api.kourichat.com/dashboard>，但调用可以走备用域名 `https://api.kouri.chat/v1`，某些网络环境下主域名连不上时能救急。另外模型 ID 一律以控制台「模型」页为准，照着抄；文档里也承认，调一个列表里没有的 ID 有时也能通，但计费准确性不保证。

## 为什么是 V4.1 Flash

`deepseek-v4.1-flash-1017` 是 V4.1-Flash 的 10 月 17 日迭代版，552B 总参数的 MoE，但输入阶段只激活 8B、输出激活 16B，属于非对称的 encoder-decoder 结构。落到实际使用上是三个数字：100 万 token 上下文、384K 最大输出、最大思维链也是 384K。

原生支持图片输入，输出只有文本。思考模式默认开启，默认档位是 `high`。写代码这件事上，它的定位很清楚：不是最聪明的那个，但便宜、够快、能一口气吃下整个仓库的目录结构和几个关键文件，适合当日常 agent 的底座。真卡住了再切 pro 或者把思考档位拉到 `max`，比一开始就用贵模型划算。

## 配进 opencode

opencode 现在的配置里，自定义 provider 是 `providers`（复数）这一段，模型挂在下面。`deepseek-v4.1-flash-1017` 不在任何内置目录里，所以能力、上下文长度都得手动写清楚，否则它会按 200K 上下文、32K 输出去猜，白白浪费模型的能力。

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

令牌放进环境变量，别写进配置文件：

```bash
export KOURI_API_KEY="sk-kouri-..."
```

`env` 里声明了变量名，opencode 会自己去取，不需要额外的 `apiKey` 字段。想先确认 key 和模型 ID 有没有问题，一条 curl 比在客户端里点半天快：

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

日常直接 `opencode`，临时换档位就在模型后面加 `#`：

```bash
opencode --model kouri/deepseek-v4.1-flash-1017#max
```

## 三个参数的实际差别

### 多模态

`input: ["text", "image"]` 不是摆设。改 UI 的时候把截图丢进去问「这个间距为什么塌了」，比用文字描述省很多来回。平台对图片输入不收额外溢价，按普通输入 token 计费，所以我贴截图不怎么犹豫。但它只能看图，不能出图，生成图仍然要去 `/v1/images/generations`。

### 思考等级

`reasoning_effort` 只认四档：`none`、`low`、`high`、`max`，默认 `high`。传 `minimal` 会被映射成 `low`，`medium` 和 `xhigh` 都会落到 `high`，`ultra` 变成 `max`——所以别照抄别家的档位名，以为自己在调细档。

配置里给 `capabilities.reasoning` 写了 `toggle: true` 和三个档位，opencode 就会生成对应的变体，`#low`、`#max` 直接用。我自己的分配是：改文案、补类型、写注释用 `low`；常规功能开发用默认 `high`；只有那种「跑十分钟也想不通」的 bug 才切 `max`，顺便把会话重开，避免把一堆无关文件带进上下文。

还有一条容易撞墙：思考模式下 `temperature`、`presence_penalty`、`frequency_penalty` 都不生效，别在那儿调半天采样温度。

### 上下文

1M 是上限，不是目标。把整个仓库一次性塞进去的结果通常是：首 token 变慢、账单变长、模型在几十个文件里挑错重点。我一般只喂当前任务相关的几个文件，让它自己用工具去读其余部分——工具调用比灌上下文准。

真正需要长上下文的是「读一份几百页的规范再改代码」这种活。这时候 384K 的输出上限比上下文更值钱：它能一次性把整个模块的改动吐完，不用切三段对话。

## 几个坑

`reasoning_content` 必须回传。DeepSeek 在带 `tools` 的请求里，要求把历史轮次的思考内容拼回上下文，否则 agent 容易提前收工。opencode 对 DeepSeek 默认开着这个行为，但如果自己写客户端，记得别把 reasoning 字段当脏数据删掉——配置里那行 `requireReasoning` 就是干这个的。

Responses 端点别急着用。文档明确列了一批 DeepSeek 型号不支持 `/v1/responses`，虽然 `deepseek-v4.1-flash` 不在名单里，但既然 Chat 端点全模型可用，也没必要赌。

`max_tokens` 还是 `max_completion_tokens` 这类字段名差异，在中转层不一定被完全抹平。这条链路的末端是 DeepSeek，写 `max_tokens` 最稳，所以配置里显式指定了。

最后，这是第三方中转，不是官方 API。平台有 fallback 和多可用区，也提供 <https://uptime.kouri.chat/> 的可用性看板，但重要任务该留后手还是留后手。

## 我现在的用法

日常写代码、读代码、整理笔记都留在 `high`，一个月下来成本比直连官方低不少；遇到疑难 bug 临时 `#max`，解决完切回来。这算不上什么最佳实践，只是把「贵」和「慢」分开放：平时用便宜的模式跑量，关键时刻再花钱买思考时间。

::LinkCard{title="Kouri Ai 控制台" description="注册、建令牌、查模型列表与用量。" href="https://api.kourichat.com/dashboard" icon="brand-openai" icon-bg="var(--app-primary)" icon-color="#ffffff"}
::

::LinkCard{title="Kouri Ai 文档" description="端点、计价、缓存与各客户端接入说明。" href="https://docs.kourichat.com" icon="book"}
::
