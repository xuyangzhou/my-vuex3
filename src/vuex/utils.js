/**
 * 
 * @param {*} obj 传入的对象 
 * @param {*} callback 回调函数 两个参数分别对应解构出对象的value 和 key
 */
const forEachValue = (obj = {}, callback) => {
    Object.keys(obj).forEach(key => {
        // 第一个参数是值，第二个参数是键
        callback(obj[key], key)
    })
}

export function makeLocalContext(store, namespace, path) {
    const noNamespace = namespace === ''

    const local = {
        dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
            const payload = _payload;
            const options = _options;

            let type = _type
            console.log('---', payload, options, type,path)
            if (!options || !options.root) {
                type = namespace + type

            }

            return store.dispatch(type, payload)
        },

        commit: noNamespace ? store.commit : (_type, _payload, _options) => {
            const payload = _payload;
            const options = _options;

            let type = _type
            console.log('---', payload, options, type)

            if (!options || !options.root) {
                type = namespace + type

            }

            store.commit(type, payload, options)
        }
    }

    // getters and state object must be gotten lazily
    // because they will be changed by vm update
    // Object.defineProperties(local, {
    //   getters: {
    //     get: noNamespace
    //       ? () => store.getters
    //       : () => makeLocalGetters(store, namespace)
    //   },
    //   state: {
    //     get: () => getNestedState(store.state, path)
    //   }
    // })

    return local
}

export default forEachValue