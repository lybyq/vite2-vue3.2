import { defineComponent, ref, computed } from 'vue'
import style from './index.module.css'

const Demo = defineComponent({
  name: 'Demo',
  setup() {
    const num = ref(1)
    const selfStyle = computed(() => style)

    return {
      num,
      selfStyle,
    }
  },
  render () {
    return (
      <div className={this.selfStyle}>这是我的jsx组件{this.num}</div>
    )
  },
})
export default Demo
