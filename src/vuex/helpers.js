
function normalizeNamespace(fn) {
    return (namespace, map) => {
        if (typeof namespace !== 'string') {
            map = namespace
            namespace = ''
        } else if (namespace.charAt(namespace.length - 1) !== '/') {
            namespace += '/'
        }
        return fn(namespace, map)
    }
}

function normalizeMap(map) {
    // if (!isValidMap(map)) {
    //   return []
    // }
    return Array.isArray(map)
        ? map.map(key => ({ key, val: key }))
        : Object.keys(map).map(key => ({ key, val: map[key] }))
}

function getModuleByNamespace(store, helper, namespace) {
    const module = store._modulesNamespaceMap[namespace]
    if (!module) {
        console.error(`[vuex] module namespace not found in ${helper}(): ${namespace}`)
    }
    return module
}
export const mapState = normalizeNamespace((namespace, states) => {
    const res = {}
    normalizeMap(states).forEach(({ key, val }) => {
        res[key] = function mappedState() {
            let state = this.$store.state
            let getters = this.$store.getters
            if (namespace) {
                const module = getModuleByNamespace(this.$store, 'mapState', namespace)
                if (!module) {
                    return
                }
                state = module.state
                getters = module.getters
            }
            return typeof val === 'function'
                ? val.call(this, state, getters)
                : state[val]
        }
        // mark vuex getter for devtools
        res[key].vuex = true
    })
    return res
})

export const mapMutations = normalizeNamespace((namespace, mutations) => {
    const res = {}

    normalizeMap(mutations).forEach(({ key, val }) => {
        res[key] = function mappedMutation(...args) {
            // Get the commit method from store
            let commit = this.$store.commit
            if (namespace) {
                const module = getModuleByNamespace(this.$store, 'mapMutations', namespace)
                if (!module) {
                    return
                }
                const _type = namespace + val
                commit = () => { this.$store.commit(_type) }
                // this.$store.commit(`${namespace}${val}`)
            }
            return typeof val === 'function'
                ? val.apply(this, [commit].concat(args))
                : commit.apply(this.$store, [val].concat(args))
        }
    })
    return res
})


export const mapGetters = normalizeNamespace((namespace, getters) => {
    const res = {}

    normalizeMap(getters).forEach(({ key, val }) => {
        // The namespace has been mutated by normalizeNamespace
        val = namespace + val
        res[key] = function mappedGetter() {
            if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
                return
            }
            return this.$store.getters[val]
        }
        // mark vuex getter for devtools
        res[key].vuex = true
    })
    return res
})


export const mapActions = normalizeNamespace((namespace, actions) => {
    const res = {}

    normalizeMap(actions).forEach(({ key, val }) => {
        res[key] = function mappedAction(...args) {
            // get dispatch function from store
            let dispatch = this.$store.dispatch
            if (namespace) {
                const module = getModuleByNamespace(this.$store, 'mapActions', namespace)
                if (!module) {
                    return
                }
                const _type = namespace + val
                dispatch = () => { return this.$store.dispatch(_type) }

            }
            return typeof val === 'function'
                ? val.apply(this, [dispatch].concat(args))
                : dispatch.apply(this.$store, [val].concat(args))
        }
    })
    return res
})