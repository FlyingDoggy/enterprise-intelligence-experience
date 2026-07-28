# React参考实现

`ChartBlock.tsx`演示如何把同一份`ChartSpec`连接到：

- 图形渲染器；
- 同源数据表；
- 文字解释；
- 依据入口；
- 前置校验与降级；
- 选择后的分析动作。

它不是已发布的npm包，也不声明不存在的EIX组件API。生产项目应从本目录的
`ChartSpec` Schema和CSS Token生成自己的类型与组件，并在接入ECharts时使用
`../../src/echarts-adapter.js`中的确定性映射。
