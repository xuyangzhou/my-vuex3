import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '../vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    strict: true,
    // 配置项
    state: {
        count: 0,
        name: 'Jason'
    },
    getters: {
        doubleCount: (state) => {
            return state.count * 2
        }
    },
    mutations: {
        increment(state) {
            state.count++;
        }
    },
    actions: {
        incrementAsync({ commit }) {
            setTimeout(() => {
                commit('increment')
            }, 1000)
        }
    },
    modules: {
        a: {
            namespaced: true,
            state: {
                count: 0,
                age: 18
            },
            getters: {
                doubleCount: (state) => {
                    return state.count * 2
                }
            },
            mutations: {
                increment(state) {
                    state.count++
                }
            },
            actions: {
                incrementAsync({ commit }) {
                    setTimeout(() => {
                        commit('increment')
                    }, 1000)
                }
            },
        }
    }
})

export default store


// const user = {
//     info: {
//         name: "张三",
//         address: { home: "Shaanxi", company: "Xian" },
//     },
// };

// obj是获取属性的对象，path是路径，fallback是默认值
// function get(config, path, fallback) {
//     return path.split('.').reduce((config, name) => config[name], config) || fallback;
    // const parts = path.split(".");
    // const key = parts.shift();
    // if (typeof obj[key] !== "undefined") {
    //   return parts.length > 0 ?
    //     get(obj[key], parts.join("."), fallback) :
    //     obj[key];
    // }
    // // 如果没有找到key返回fallback
    // return fallback;
// }

// console.log(get(user, "info.name")); // 张三
// console.log(get(user, "info.address.home")); // Shaanxi
// console.log(get(user, "info.address.company")); // Xian
// console.log(get(user, "info.address.abc", "fallback")); // fallback