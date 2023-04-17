// module-collection.js
import forEachValue from "./utils";
import Module from './module.js'
export default class ModlueCollection {
    constructor(options) {
        // 注册模块 []表示路径 递归注册模块
        this.register([], options)
    }
    register(path, rootModule) {
        const newModlue = new Module(rootModule)
        // {
        //     _raw: rootModule,
        //     _children: {}
        //     state: rootModule.state
        // }
        // 判断如果数组长度为了，则为根模块
        if (path.length == 0) {
            this.root = newModlue
        } else {
            // 说明path有长度 比如 [a,b] 将此模块存入到根模块的children属性中
            let parent = path.slice(0, -1).reduce((pre, next) => {
                // 逐级找父节点
                // return pre._children[next]
                return pre.getChild(next)
            }, this.root)
            // parent._children[path[path.length-1]]  = newModlue
            parent.addChild(path[path.length - 1], newModlue)
        }
        // 注册子模块
        if (rootModule.modules) {
            forEachValue(rootModule.modules, (moduleValue, moduleName) => {
                // 递归组成子模块 将模块名字和模块值传入
                this.register([...path, moduleName], moduleValue)
            })
        }

    }

    // 新增代码
    getNamespaced(path) { //获取命名空间
        let root = this.root
        return path.reduce((pre, next)=>{
            //[b,c]
            // 获取子模块 查看是否有namespaced属性
            root = root.getChild(next)
            // 有namespace属性就拼接上
            return pre + (root.namespaced ? next + '/' :'')
        }, '')
    }
}