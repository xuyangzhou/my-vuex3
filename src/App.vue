<template>
  <div id="app">
    <h2>vuex3</h2>
    <h4>root store</h4>
    <!-- <p>name: {{ name }}</p> -->
    <div>
      <span>rootCount: {{ appCount }}</span>
      <span>doubleCount: {{ doubleCount }}</span>
      <button @click="increment">+</button>
      <button @click="incrementAsync">async +</button>
  
      <button @click="add">直接修改state</button>
    </div>
    <div>
      <h4>A 模块 store</h4>

      <span>count: {{ count }}</span>
      <span>A 模块: {{ adCount }}</span>
      <button @click="aIncrement">A 模块 +</button>
      <button @click="aIncrementAsync">A 模块异步 +</button>
      <span>age: {{ age }}</span>

    </div>
  </div>
</template>

<script>
// import { mapMutations, mapState, mapActions } from 'vuex';
import { mapMutations, mapState, mapActions, mapGetters } from './vuex';

export default {
  name: 'App',
  computed: {
    ...mapState({ appCount: 'count', name: 'name', age: 'age' }),
    // ...mapState(['count']),
    ...mapState('a', { age: 'age', count: 'count' }),
    ...mapGetters(['doubleCount']),
    ...mapGetters(['doubleCount']),
    ...mapGetters('a', { adCount: 'doubleCount' }),
  },

  components: {
  },
  methods: {
    ...mapMutations(['increment']),

    ...mapMutations('a', { aIncrement: 'increment' }),
    ...mapActions(['incrementAsync']),
    ...mapActions('a', { aIncrementAsync: 'incrementAsync' }),

    add() {
      console.log(111)
      this.$store.state.count++;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
