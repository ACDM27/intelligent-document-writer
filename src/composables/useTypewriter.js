import { ref, onUnmounted } from 'vue'

/**
 * 打字机效果 Hook
 * @param {Object} options - 配置选项
 * @param {number} options.speed - 打字速度（毫秒/字）
 * @returns {Object} - 返回响应式数据和控制方法
 */
export function useTypewriter(options = {}) {
    const { speed = 50 } = options

    const displayText = ref('')
    const isTyping = ref(false)
    const isPaused = ref(false)

    let fullText = ''
    let currentIndex = 0
    let timer = null
    let scrollElement = null

    /**
     * 开始打字
     * @param {string} text - 要打印的文本
     * @param {HTMLElement} element - 需要自动滚动的元素
     */
    const start = (text, element = null) => {
        fullText = text
        currentIndex = 0
        displayText.value = ''
        isTyping.value = true
        isPaused.value = false
        scrollElement = element

        const type = () => {
            if (currentIndex < fullText.length && !isPaused.value) {
                displayText.value += fullText[currentIndex]
                currentIndex++

                // 自动滚动
                if (scrollElement) {
                    scrollElement.scrollTop = scrollElement.scrollHeight
                }

                timer = setTimeout(type, speed)
            } else if (currentIndex >= fullText.length) {
                isTyping.value = false
            }
        }

        type()
    }

    /**
     * 暂停打字
     */
    const pause = () => {
        isPaused.value = true
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
    }

    /**
     * 继续打字
     */
    const resume = () => {
        if (isPaused.value && currentIndex < fullText.length) {
            isPaused.value = false
            isTyping.value = true
            start(fullText.substring(currentIndex), scrollElement)
        }
    }

    /**
     * 重置
     */
    const reset = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        displayText.value = ''
        isTyping.value = false
        isPaused.value = false
        currentIndex = 0
        fullText = ''
    }

    /**
     * 跳过打字，直接显示全部内容
     */
    const skip = () => {
        if (timer) {
            clearTimeout(timer)
            timer = null
        }
        displayText.value = fullText
        currentIndex = fullText.length
        isTyping.value = false
        isPaused.value = false
    }

    // 组件卸载时清理定时器
    onUnmounted(() => {
        if (timer) {
            clearTimeout(timer)
        }
    })

    return {
        displayText,
        isTyping,
        isPaused,
        start,
        pause,
        resume,
        reset,
        skip
    }
}
