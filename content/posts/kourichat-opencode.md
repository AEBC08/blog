---
title: opencode 接 Kouri Ai，顺手记下 DeepSeek V4.1 Flash 的几个参数
published: 2026-11-14T12:35:00.000Z
description: 换掉 opencode 的后端，配置贴在这里，以后重装不用再翻文档。
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

直连的钱包压力有点大，加上这边访问时不时抽风，就把 opencode 的后端换成了 [Kouri Ai](https://api.kourichat.com)。用了几天，配置记在下面，省得下次重装再翻一遍文档。

它是那种中转站，跟 OpenRouter 一个思路。注册、建令牌、从控制台抄模型 ID、把 baseURL 指过去，就完事。除了 OpenAI 的 `/v1/chat/completions`，Anthropic 的 `/v1/messages` 和 Gemini 的 `/v1beta/models` 也开着，图片、embedding、rerank 各有端点，换模型不用换客户端。

价格页面我看了两遍。它说自己暂时没有长文本溢价、多模态溢价，也没有峰谷价，标多少就收多少。真正让我决定用的是另一行：DeepSeek V4 之后的型号，缓存读取按输入价的 2% 算，写入免费。agent 跑起来上下文一轮轮往上堆，省的就是这部分。

该有的担心也有。它不是官方，出问题只能等客服。控制台固定走 `api.kourichat.com/dashboard`，调用可以换成备用域名 `api.kouri.chat`，主域名连不上的时候能救一下。模型 ID 一定从控制台复制，文档里也写了，调列表里没有的 ID 有时能通，但计费不保证。

## 为什么挑 V4.1 Flash

便宜，上下文大，能看图。就这三条。

`deepseek-v4.1-flash-1017` 是 V4.1-Flash 十月十七号的迭代版，552B 的 MoE，输入阶段只激活 8B，输出激活 16B，所以价格压得住。上下文 1M，最大输出 384K，思维链也算在 384K 里。思考默认开着，默认档位 high。

它不是最聪明的那个模型，长任务偶尔会绕。但日常改代码、读代码这类活够用，一个仓库的目录加几个关键文件扔进去也不太肉疼。真卡住了我才会切到 pro，或者把档位拉到 max。

## 装进 opencode

opencode 现在用的是 `providers`（复数）这段配置。`deepseek-v4.1-flash-1017` 不在它内置的目录里，能力、上下文长度得自己写。不写的话它会按 200K 上下文、32K 输出去猜，模型的本事就废了一半。

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

令牌放环境变量，别写进文件：

```bash
export KOURI_API_KEY="sk-kouri-..."
```

`env` 里写了变量名，opencode 会自己取，不用再填 `apiKey`。先确认 key 和模型 ID 有没有问题，一条 curl 比在客户端里点半天快：

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

临时换档位，在模型后面加 `#`：

```bash
opencode --model kouri/deepseek-v4.1-flash-1017#max
```

## 三个参数，用起来才知道

### 看图

`input: ["text", "image"]` 是可以用的。改页面时把截图丢进去问「这个间距为什么塌了」，比打字描述省很多来回。平台对图片不收额外溢价，按普通输入 token 算，所以我贴图不太犹豫。它只能看图，不能出图，要生成图还是去 `/v1/images/generations`。

### 思考档位

`reasoning_effort` 只有四个值：`none`、`low`、`high`、`max`，默认 `high`。

这里有个坑：`medium` 和 `xhigh` 都会被映射成 `high`，`minimal` 变 `low`，`ultra` 变 `max`。我第一次按别家的习惯传了 `medium`，以为调到了中间档，其实还是 high，白折腾。

配置里 `capabilities.reasoning` 写了 `toggle: true` 和三个档位，opencode 会自动生成变体，`#low`、`#max` 直接能用。我自己的分配：改文案、补类型、写注释用 `low`，功能开发留 `high`，那种跑十分钟也想不通的 bug 才切 `max`，并且顺手新开一个会话，免得把一堆无关文件带进上下文。

还有一条：思考模式下 `temperature`、`presence_penalty`、`frequency_penalty` 都不起作用。调半天没变化不是错觉。

### 上下文

1M 是上限，不是目标。整个仓库一次性塞进去，首 token 会慢，账单变长，模型还容易在几十个文件里挑错重点。我一般只喂当前任务相关的几个文件，剩下的让它用工具自己读，比灌上下文准。

真正需要长上下文的是读规范那种活。这种时候 384K 的输出上限比 1M 输入更值钱，一次能把整个模块的改动吐完，不用切三段对话。

## 两个坑

`reasoning_content` 要回传。DeepSeek 在带 `tools` 的请求里，要求把历史轮次的思考内容拼回上下文，否则 agent 容易提前收工。opencode 对 DeepSeek 默认开着这个行为，配置里那行 `requireReasoning` 就是它。自己写客户端的话，别把这个字段当脏数据删掉。

另一个是端点选择。文档列了一批不支持 `/v1/responses` 的 DeepSeek 型号，`deepseek-v4.1-flash` 不在名单里，但既然 Chat 端点全模型可用，我没去赌。`max_tokens` 和 `max_completion_tokens` 这类字段名差异在中转层也不一定被抹平，链路的末端是 DeepSeek，写 `max_tokens` 最稳，所以配置里显式指定了。

## 现在怎么用

日常挂在 `high`，卡住了切 `max`，解决完切回来。账单没细算过，反正比直连便宜，速度也够用。

配置就这些。哪天模型涨价或者 ID 换了，回来改两行。

::LinkCard{title="Kouri Ai 控制台" description="注册、建令牌、查模型列表与用量。" href="https://api.kourichat.com/dashboard" icon="brand-openai" icon-bg="var(--app-primary)" icon-color="#ffffff"}
::

::LinkCard{title="Kouri Ai 文档" description="端点、计价、缓存与客户端接入说明。" href="https://docs.kourichat.com" icon="book"}
::
