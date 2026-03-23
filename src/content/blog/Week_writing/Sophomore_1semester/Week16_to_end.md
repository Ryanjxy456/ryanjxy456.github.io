---
title: '博文样式测试：Markdown 全语法演示'
description: "这是一篇用于测试博客主题样式的模板文章，包含了标题、代码块、公式、表格等常用元素。"
pubDate: '2025-12-25'    
heroImage: "https://raw.githubusercontent.com/Ryanjxy123/picbed/main/data139684763_p0_master1200.jpg"
heroImageSource: "https://www.pixiv.net/artworks/139684763"
tags: ["测试"]

---



这是一篇演示博文，旨在测试当前博客主题的排版效果。如果你能看到这段文字，说明正文渲染正常。

## 1. 标题测试

以下是不同级别的标题演示：

# H1 级别标题
## H2 级别标题
### H3 级别标题
#### H4 级别标题


## 2. 文本样式

这是一段常规文本，包含 **加粗文字**、*斜体文字*、~~删除线文字~~ 以及 `行内代码`。

> **引用测试**：书山有路勤为径，学海无涯苦作舟。这是一个标准的长引用块，用于展示引用样式的边距和颜色。


## 3. 列表测试

**无序列表：**
* 深度学习 (Deep Learning)
* 多模态大模型 (MLLM)
* 机器人学 (Robotics)

**有序列表：**
1. 需求分析
2. 架构设计
3. 代码实现


## 4. 代码块测试 

作为开发者博客，代码高亮是最重要的部分。以下是一个 Python 示例：

```python
def hello_mllm(model_name):
    """
    一个简单的多模态模型打招呼函数
    """
    print(f"Loading {model_name}...")
    features = ["Text", "Image", "Video"]
    for feature in features:
        print(f"Supporting {feature} processing.")
    return True

if __name__ == "__main__":
    hello_mllm("Gemini 3 Flash")
