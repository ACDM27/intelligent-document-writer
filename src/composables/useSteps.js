import { ref, computed } from 'vue'

/**
 * 步骤管理 Hook
 * 用于管理 Smart Writer 的 4 步流程
 */
export function useSteps() {
    const currentStep = ref(0)
    const stepData = ref({
        // Step 1 数据
        inputType: 'manual', // 'upload' | 'manual'
        businessType: '行政类',
        knowledgeBase: [],
        wordCount: 1500,
        userInput: '',
        files: [],

        // Step 2 数据
        outline: [],

        // Step 3 数据
        generatedContent: null,

        // Step 4 数据
        headerType: 'admin', // 'admin' | 'party' | 'letter'
        showSeal: false
    })

    // 步骤标题
    const stepTitles = [
        '需求录入',
        '大纲确认',
        '智能撰写',
        '排版归档'
    ]

    // 当前步骤标题
    const currentStepTitle = computed(() => stepTitles[currentStep.value])

    // 是否可以进入下一步
    const canNextStep = computed(() => {
        switch (currentStep.value) {
            case 0:
                return stepData.value.userInput.trim().length > 0 || stepData.value.files.length > 0
            case 1:
                return stepData.value.outline.length > 0
            case 2:
                return stepData.value.generatedContent !== null
            default:
                return true
        }
    })

    // 下一步
    const nextStep = () => {
        if (currentStep.value < 3 && canNextStep.value) {
            currentStep.value++
        }
    }

    // 上一步
    const prevStep = () => {
        if (currentStep.value > 0) {
            currentStep.value--
        }
    }

    // 跳转到指定步骤
    const goToStep = (step) => {
        if (step >= 0 && step <= 3) {
            currentStep.value = step
        }
    }

    // 更新步骤数据
    const updateStepData = (key, value) => {
        stepData.value[key] = value
    }

    // 重置所有数据
    const reset = () => {
        currentStep.value = 0
        stepData.value = {
            inputType: 'manual',
            businessType: '行政类',
            knowledgeBase: [],
            wordCount: 1500,
            userInput: '',
            files: [],
            outline: [],
            generatedContent: null,
            headerType: 'admin',
            showSeal: false
        }
    }

    return {
        currentStep,
        stepData,
        stepTitles,
        currentStepTitle,
        canNextStep,
        nextStep,
        prevStep,
        goToStep,
        updateStepData,
        reset
    }
}
