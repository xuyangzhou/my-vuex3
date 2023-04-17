// module.js
import forEachValue from "./utils"

export default class Module {
    constructor(rootModule) {
        this._raw = rootModule
        this._children = {}
        this.state = rootModule.state
    }

    get namespaced () {
        return this._raw.namespaced
    }
    // 找模块的子模块
    getChild(key) {
        return this._children[key]
    }
    // 向模块追加子模块
    addChild(key, module) {
        this._children[key] = module
    }
    // 遍历当前模块的mutations
    forEachMutations(fn) {
        if (this._raw.mutations) {
            forEachValue(this._raw.mutations, fn)
        }
    }
    // 遍历当前模块的actions
    forEachActions(fn) {
        if (this._raw.actions) {
            forEachValue(this._raw.actions, fn)
        }
    }
    // 遍历当前模块的getters
    forEachGetters(fn) {
        if (this._raw.getters) {
            forEachValue(this._raw.getters, fn)
        }
    }
    // 遍历当前模块的child
    forEachChild(fn) {
        forEachValue(this._children, fn)
    }

}