
/**
 * 驼峰转横线
 * @param {string} str 
 * @returns {string}
 */
const camelToLine = (str: string) => {
    return str.replace(/([A-Z])/g, (_, match) => '-' + match.toLowerCase())
}

/**
 * 短横线转驼峰
 * @param {string} str 
 * @returns {string} 
 */
const lineToCamel = (str: string) => {
    return str.replace(/-([a-z])/g, (_, match) => match.toUpperCase())
}

const clickableAttribute = 'clickable'

const paramsKey = 'params'
const rootDomTag = 'root'
/**
 * 依据事件路径 获取日志参数
 * @param {EventTarget[]} path 事件路径
 * @param {string} prefix 前缀
 * @returns {{[key: string]: string | number}}: 返回参数对象
 */
const getParamsFromPath = (path: EventTarget[], prefix: string) => {
    const logParams: any = {}
        path.forEach((value: EventTarget) => { // Change the parameter type from HTMLElement to EventTarget
            const dom = value as HTMLElement; // Cast the value to HTMLElement
            if (dom.dataset) {
                Object.keys(dom.dataset).forEach(key => {
                    let keyArry = camelToLine(key).split('-')
                    if(keyArry.length === 2 && keyArry[0] === prefix && keyArry[1] === paramsKey) {
                        try {
                            let params = JSON.parse(dom.dataset[key] || '{}')
                            Object.keys(params).forEach(k => {
                                logParams[k] = params[k]
                            })
                        } catch(e) {
                            console.warn(dom, 'data-log 格式不正确，为非json格式 具体值为', dom.dataset[key], e)
                        }
                    }
                    if(keyArry.length === 3 && keyArry[0] === prefix && keyArry[1] === paramsKey) {
                        const logParamsKeyName = lineToCamel(keyArry.slice(2).join('-'))
                        logParams[logParamsKeyName] = dom.dataset[key]
                    }
                })
            }
        })
        return logParams

}
/**
 * 获取事件路径 截止到根节点
 * @param {Event} event 
 * @param {string} rootTag 
 * @returns {EventTarget[]}
 */
const getPathsWithRootTag = (path: EventTarget[], rootTag: string) => {
    const index = path.findIndex(i => {
        let dom = i as HTMLElement
       return  dom.dataset && (dom.dataset[rootTag] === 'true' || dom.dataset[rootTag] === '')
    })
    if(index >= 0) {
        path.splice(index + 1, path.length - index)
    }
    return path
}
/**
 * 依据事件路径，判断是否可点击
 * @param {EventTarget[]} path 
 * @param {string} clickableAttribute 可点击属性名称
 * @returns {boolean}
 */
const isClickable = (path: EventTarget[], clickableAttribute: string) => {
    return path.some((item ) => {
        let dom = item as HTMLElement
        if(!dom.dataset) 
            return false
        return dom.dataset[clickableAttribute] === 'true' || dom.dataset[clickableAttribute] === ''
    })
}

interface constructorOptions {
    logPrefix?: string, // 日志前缀  默认为 log
    container?: HTMLElement | string, // 容器  默认为 document.body,
}
type LogType = 'click' | 'custom' | string
type eventInfo = {
    type: LogType,
    params: any,
}
/**
 * on 函数注册 的回调函数
 */
type Callback = (options: eventInfo) => void



/**
 * 埋点扩展类 可通过 tracker emit 方法主动触发打点   
 * 通过 on 方法监听打点, 并进行针对性后续请求处理
 */
export class TrackerExtend {
    eventList: Callback[] = []
    prefix = 'log'
    container: HTMLElement = document.body
    constructor(options: constructorOptions = {}) {
        this.prefix = options.logPrefix || 'log'
        if(typeof options.container === 'string') {
            this.container = document.querySelector(options.container) || document.body
        } else if(options.container instanceof HTMLElement) {
            this.container = options.container
        }
        this.container.dataset[lineToCamel(`${this.prefix}-${rootDomTag}`)] = 'true'
        // 绑定点击事件
        this.container.addEventListener('click', this.clickLog)
    }
    /**
     * 销毁
     */
    destroy() {
        this.container.removeEventListener('click', this.clickLog)
    }
    /**
     * 依据dom 获取日志参数
     * @param {HTMLElement} dom 
     * @returns {Promise<any>}
     */
    getParamsFromDom = async (dom: HTMLElement) => {
        const eventName = 'getParamsEvent'
        const tag = lineToCamel(`${this.prefix}-${rootDomTag}`)
        return new Promise((resolve, reject) => {
            let timer = -1
            const handler = (e: Event)=> {
                const path =  getPathsWithRootTag(e.composedPath(), tag) 
                const params = getParamsFromPath(path, this.prefix)
                resolve(params)
                clearTimeout(timer)
            }
            this.container.addEventListener(eventName, handler, {once: true, capture: true})
            
            timer = setTimeout(()=> {
                reject(new Error(`${this.prefix} timeout`))
                document.body.removeEventListener(eventName, handler)
            }, 0)
            dom.dispatchEvent(new CustomEvent(eventName))
        })
    }

    /**
     * 注册事件
     * @param {Callback} callback  回调函数 回调函数 参数为 eventInfo 类型 {type: string, params: any} 
     */
    on(callback: Callback) {
        this.eventList.push(callback)
    }
    /**
     * 发送事件
     * @param {eventInfo} eventInfo  类型 {type: string, params: any}  
     */
    emit(eventInfo) {
        this.eventList.forEach(event => {
            try {
                event(eventInfo)
            } catch (error) {
                console.error(error);
            }
        })
    }
    /**
     * 点击事件
     * @param {HTMLElement} dom 
     * @returns {Promise<any>}
     */
    clickLog = async (e: Event) => {
        const path =  getPathsWithRootTag(e.composedPath(), rootDomTag) 
        if(!isClickable(path, lineToCamel(`${this.prefix}-${clickableAttribute}`))){
            return
        } 
        const params = getParamsFromPath(path, this.prefix)
        this.emit({type: 'click', params: params })
    }
}

export const createVueDirectives = (options: constructorOptions = {}) => {
    const tracker = new TrackerExtend(options)
    const identifyKey =  lineToCamel(`${tracker.prefix}-identify`)
    const vparamsKey = lineToCamel(`${tracker.prefix}-${paramsKey}`)
    const clickableAttributeKey =  lineToCamel(`${tracker.prefix}-${clickableAttribute}`)
    return {
       
        tracker,
        /**
         * log参数 指令
         * @param el 
         * @param binding 有三种形式， 1. 函数，可以获得参数  2. 对象，注入参数 3. arg 参数  注入单个属性参数
         */
        vLogParams: (el: HTMLElement, binding: any) => {
            if(binding.value instanceof Function) {
                tracker.getParamsFromDom(el).then(params => {
                    let isUpdate = false
                    try {
                        const identifyValue = JSON.stringify(params)
                        if(!el.dataset[identifyKey] || el.dataset[identifyKey] !== identifyValue ) {
                            isUpdate = true
                            el.dataset[identifyKey] = identifyValue
                        }
                    } catch (error) {
                        isUpdate = false
                        console.error('参数绑定失败', error);
                    }
                    if(isUpdate) {
                        binding.value(params)
                    }
                }) 
            } else {
                if(binding.arg) {
                    el.dataset[lineToCamel(`${tracker.prefix}-${paramsKey}-${binding.arg}`)] = binding.value
                } else {
                    try {
                        el.dataset[vparamsKey] = JSON.stringify(binding.value)
                    } catch (error) {
                        console.error('参数绑定失败', error);
                    }
                }
            }
        },
        vLogClickAble: (el: HTMLElement, binding: any) => {
            if(binding.value === true || binding.value === undefined) {
                el.dataset[clickableAttributeKey] = 'true'
            } else {
                el.dataset[clickableAttributeKey] = 'false'
            }
        },
        vLogDisplay: {
            mounted: async (el: HTMLElement, binding: any) => {
                if(binding.value === true || binding.value === undefined) {
                    requestIdleCallback(async () => {
                        const params = await tracker.getParamsFromDom(el)
                        tracker.emit({type: 'display', params})
                    },{timeout: 1000})
                }
            }
        }
    }
}
