import ModuleCollection from './module-collection.js'
import forEachValue, { makeLocalContext } from './utils'

import { mapState, mapGetters, mapMutations, mapActions } from './helpers.js'
let Vue
function installModule(store, rootState, path, module) {
    // 获取命名空间
    const namespaced = store._modules.getNamespaced(path)

    // const namespace = store._modules.getNamespace(path)

    // register in namespace map
    if (module.namespaced) {
        if (store._modulesNamespaceMap[namespaced]) {
            console.error(`[vuex] duplicate namespace ${namespaced} for the namespaced module ${path.join('/')}`)
        }
        store._modulesNamespaceMap[namespaced] = module
    }
    const local = module.context = makeLocalContext(store, namespaced, path)
    console.log('local', local)
    // 收集所有模块的状态
    if (path.length > 0) { // 如果是子模块 就需要将子模块的状态定义到根模块上
        let parent = path.slice(0, -1).reduce((pre, next) => {
            return pre[next]
        }, rootState)
        // 将属性设置为响应式 可以新增属性
        // 如果本事对象不是响应式的话会直接赋值，如果是响应式此时新增的属性也是响应式
        Vue.set(parent, path[path.length - 1], module.state)
    }
    module.forEachMutations((mutations, type) => {
        // 收集所有模块的mutations 存放到 实例的store._mutations上
        // 同名的mutations和 actions 并不会覆盖 所以要有一个数组存储 {changeAge: [fn,fn,fn]}
        store._mutations[namespaced + type] = (store._mutations[namespaced + type] || [])
        store._mutations[namespaced + type].push((payload) => {
            // 函数包装 包装传参是灵活的
            // 使this 永远指向实例 当前模块状态 入参数
            mutations.call(store, module.state, payload)
        })
    })
    module.forEachActions((actions, type) => {
        store._actions[namespaced + type] = (store._actions[namespaced + type] || [])
        store._actions[namespaced + type].push((payload) => {
            actions.call(store, {
                state: local.state,
                commit: local.commit,
                getters: store.getters
            }, payload)
        })
    })
    module.forEachGetters((getters, key) => {
        // 同名计算属性会覆盖 所以不用存储
        store._wrappedGetters[namespaced + key] = () => {
            return getters(module.state)
        }
    })
    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child)
    })
}
function resetStoreVm(store, state) {
    const wrappedGetters = store._wrappedGetters
    const computed = {}
    store.getters = Object.create(null)
    // 通过使用vue的computed实现缓存 懒加载
    forEachValue(wrappedGetters, (fn, key) => {
        computed[key] = () => {
            return fn()
        }
        // 代理
        Object.defineProperty(store.getters, key, {

            get: () => { return store._vm[key] }
        })
    })
    // 将状态实现响应式
    store._vm = new Vue({
        data() {
            return {
                $$state: state
            }
        },
        computed
    })
    if (store.strict) {
        enableStrictMode(store)
    }
}

function enableStrictMode(store) {
    store._vm.$watch(function () { return this._data.$$state }, () => {
        console.assert(store._committing, `[vuex] do not mutate vuex store state outside mutation handlers.`)
    }, { deep: true, sync: true })
}

class Store {
    constructor(options) {
        this._modules = new ModuleCollection(options)
        console.log(this._modules, this);
        this._mutations = Object.create(null)   // 存放所有模块的mutation
        this._actions = Object.create(null)     // 存放所有模块的actions
        this._wrappedGetters = Object.create(null)  // 存放所有模块的getters
        this._modulesNamespaceMap = Object.create(null)
        // 注册所有模块到Store实例上 
        // this当前实例、根状态、路径、根模块
        let state = this._modules.root.state
        installModule(this, state, [], this._modules.root)
        const { strict = false } = options
        // strict mode
        this.strict = strict
        this._committing = false
        //实现状态响应式
        resetStoreVm(this, state)
    }
    // 类属性访问器 当用户通过实例获取实例属性state时，会触发这个方法 相对于代理
    get state() {
        // 访问state相当于取this._vm._data.$$state，当访问this._vm._data.$$state的时候，它是通过new vue 生成的数据
        // 此时会是响应式的
        return this._vm._data.$$state
    }
    _withCommit = (fn) => {
        var committing = this._committing;
        this._committing = true;
        fn();
        this._committing = committing;
    }
    commit = (type, payload) => {
        if (!this._mutations[type]) {
            throw new Error(`Mutation "${type}" not found`);
        }
        const entry = this._mutations[type]
        this._withCommit(() => {
            entry.forEach((handler) => {
                handler(payload)
            })
        })
    }

    dispatch = (type, payload) => {
        if (!this._actions[type]) {
            throw new Error(`Action "${type}" not found`);
        }
        const entry = this._actions[type]
        entry.map(handler => {
            handler(payload)
        })
        // this._actions[type].forEach(fn => {console.log('xunhuan',fn,payload);return fn(payload)})
    }
}


function install(_Vue) {
    Vue = _Vue // install方法调用时，会将Vue作为参数传入（上面Store类需要用到Vue）
    // 实现每一个组件，都能通过this调用$store
    Vue.mixin({
        beforeCreate() {
            // 通过this.$options可以获取new Vue({参数}) 传递的参数
            if (this.$options && this.$options.store) {
                // 证明这个this是根实例，也就是new Vue产生的那个实例
                this.$store = this.$options.store
            } else if (this.$parent && this.$parent.$store) {
                // 子组件获取父组件的$store属性
                this.$store = this.$parent.$store
            }
        },
    })
}

export { mapState, mapGetters, mapMutations, mapActions }

export default {
    Store,
    install
}
