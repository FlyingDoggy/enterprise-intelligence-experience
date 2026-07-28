# Enterprise Intelligence Experience 2.0

Human–AI Work Experience Architecture的Concept Charter与静态阅读站点。

## 文件

- `ENTERPRISE_INTELLIGENCE_EXPERIENCE_2.0_CONCEPT_CHARTER.md`：唯一内容源与完整规范；
- `index.html`：静态白皮书阅读版本；
- `styles.css`：视觉与响应式样式；
- `app.js`：Kernel、Contract、场景、原则与目录交互。

## 本地启动

```bash
python3 -m http.server 4190 --bind 127.0.0.1
```

打开：

```text
http://127.0.0.1:4190/
```

该站点完全静态，不连接后端，也不调用LLM。
