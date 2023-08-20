# Sample Markdown

This is a sample markdown file to test the plugin `remark-local-plantuml`.

If the code blocks like following are contained, it should be converted to an inline svg.

## A Simple Code Block

```plantuml
class A
class B
A <-- B
```

## A Different Code Block

```javascript
console.log("This code block should be ignored");
```
