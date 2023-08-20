# Sample Markdown

This is a sample markdown file to test the plugin `remark-local-plantuml`.

If the code blocks like following are contained, it should be converted to an inline svg.

```plantuml
class A
class B
A <-- B
```

```plantuml Title should be displayed
class A
class B
A <-- B
```

```javascript
console.log("This code block should be ignored");
```
