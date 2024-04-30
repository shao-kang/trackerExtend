# 前端手动日志打点工具库
- 背景    
 开发过程中需要对产品进行日志打点，来跟踪分析产品上线后的种种行为，方便后期的优化迭代。   
 日志一般分为两大类，
    * 对代码侵入低一般只需要进行代码引入就能做通用处理
        1. 基础的性能日志
        2. 页面报错日志
        3. 用户的行为跟踪日志
    * 对代码有一定的侵入性，需要程序员在开发过程中做手动打点, 添加一些指定的参数，方便处理流量漏斗， 依据具体的一些数据做业务流程优化（对这个工具库就是针对的这种情况）  

  原本的日志打点方式是 在dom 上绑定事件， 然后在事件中调用我们自己的日志统计平台的函数，这样导致每个点击日志都需要绑定一遍函数，然后再调用写起来很繁琐， 所以希望能够简化日志打点方式。

  原本的打点方式
  ``` js
    const click = ()=> {
        track.sendlog(params)
    }

  ```
  新的打点方式 只需要在对应的对应的dom 上添加属性
  ``` html
   <button data-log-click  data-log='{"mod": 12}' > 提交</button>
  ```


- 原理
- 实现
- 最终效果
- 不同框架进行封装，封装不同的打点类型