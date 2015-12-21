```javascript
let cq = containerQuery(node);
cq.addQuery({minimum: 500, name: 'medium'});
cq.addQuery({maximum: 400, name: 'small'});
cq.addQuery({minimum: 300, maximum: 600, name: 'iphone'});
cq.addQuery({
  name: 'even',
  condition(width) { return width % 2 === 0 }
});
```
