import gsap from 'https://cdn.skypack.dev/gsap@3.13.0'
import Draggable from 'https://cdn.skypack.dev/gsap@3.13.0/Draggable'
import { Pane } from 'https://cdn.skypack.dev/tweakpane@4.0.4'

gsap.registerPlugin(Draggable)

const toggle = document.querySelector('.liquid-toggle')
const config = {
  theme: 'light',
  complete: 0,
  active: false,
  debug: false,
  deviation: 2,
  deltaCap: 5,
  alpha: 16,
  bounce: true,
}

const ctrl = new Pane({
  title: 'config',
  expanded: false,
})

const update = () => {
  gsap.set('#goo feGaussianBlur', {
    attr: {
      stdDeviation: config.deviation,
    },
  })
  gsap.set('#goo feColorMatrix', {
    attr: {
      values: `
        1 0 0 0 0
        0 1 0 0 0
        0 0 1 0 0
        0 0 0 ${config.alpha} -10
      `,
    },
  })
  document.documentElement.dataset.theme = config.theme
  document.documentElement.dataset.active = config.active
  document.documentElement.dataset.bounce = config.bounce
  document.documentElement.dataset.debug = config.debug
}

const sync = (event) => {
  if (
    !document.startViewTransition ||
    event.target.controller.view.labelElement.innerText !== 'theme'
  )
    return update()
  document.startViewTransition(() => update())
}

ctrl.addBinding(config, 'complete', {
  min: 0,
  max: 100,
  label: 'complete (%)',
  step: 1,
})

ctrl.addBinding(config, 'active')
ctrl.addBinding(config, 'debug')

const settings = ctrl.addFolder({
  title: 'settings',
  disabled: false,
  expanded: false,
})
settings.addBinding(config, 'deviation', {
  min: 0,
  max: 50,
  step: 1,
  label: 'stdDeviation',
})
settings.addBinding(config, 'alpha', {
  min: 0,
  max: 50,
  step: 1,
  label: 'alpha',
})
ctrl.addBinding(config, 'bounce')
ctrl.addBinding(config, 'deltaCap', {
  min: 0,
  max: 12,
  step: 1,
  label: 'delta'
})
ctrl.addBinding(config, 'theme', {
  label: 'theme',
  options: {
    system: 'system',
    light: 'light',
    dark: 'dark',
  },
})

ctrl.on('change', sync)
update()



// This is your scroll slider magic here
if (
  !CSS.supports('(animation-timeline: view()) and (animation-range: 0 100%)')
) {
  class Slider {
    constructor(element) {
      const input = element.querySelector('[type=range]')
      const sync = () => {
        const val = (input.value - input.min) / (input.max - input.min)
        const percentComplete = val * 100
        
        // Calculate the liquid value based on keyframe mapping:
        // 0% → 0, 10% → 50, 80% → 50, 100% → 100
        let liquidValue
        if (percentComplete <= 10) {
          // Linear interpolation from 0 to 50 (0% to 10%)
          liquidValue = (percentComplete / 10) * 50
        } else if (percentComplete <= 80) {
          // Hold at 50 from 10% to 80%
          liquidValue = 50
        } else {
          // Linear interpolation from 50 to 100 (80% to 100%)
          liquidValue = 50 + ((percentComplete - 80) / 20) * 50
        }
        
        element.style.setProperty('--slider-complete', Math.round(percentComplete))
        element.style.setProperty('--slider-liquid', Math.round(liquidValue))
      }
      console.info('polyfilling scroll animation for input:', element)
      input.addEventListener('input', sync)
      input.addEventListener('pointerdown', ({ x, y }) => {
        const { left, top, height, width } = input.getBoundingClientRect()
        const vertical = height > width
        const range = Number.parseInt(input.max, 10) - Number.parseInt(input.min, 10)
        const ratio = vertical ? (y - top) / height : (x - left) / width
        // alert(ratio, val)
        const val = Number.parseInt(input.min, 10) + Math.floor(range * ratio)
        input.value = val
        sync()
      })
      sync()
    }
  }
  const sliders = document.querySelectorAll('.slider')
  for (const slider of sliders) new Slider(slider)
}

const sliderRange = document.querySelector('.slider [type=range]')
const syncDelta = (e) => {
  sliderRange.closest('.slider').dataset.sliding = true
  sliderRange.closest('.slider').style.setProperty('--delta',Math.min(Math.abs(e.movementX), config.deltaCap))
}
const deSyncDelta = () => {
  sliderRange.closest('.slider').style.setProperty('--delta', 0);
  sliderRange.closest('.slider').dataset.sliding = false
  document.body.removeEventListener('pointermove', syncDelta)
  document.body.removeEventListener('pointerup', deSyncDelta)
}

sliderRange.addEventListener('pointerdown', (e) => {
  document.body.addEventListener('pointermove', syncDelta)
  document.body.addEventListener('pointerup', deSyncDelta)
})

sliderRange.addEventListener('input', async () => {
  const existingBounce = sliderRange.closest('.slider').getAnimations({subtree: true}).find(a => a.animationName === 'bounce')
  if (sliderRange.value === sliderRange.max && !existingBounce) {
    sliderRange.closest('.slider').dataset.bounce = 'top'
    await sliderRange.closest('.slider').getAnimations({subtree: true}).find(a => a.animationName === 'bounce').finished
    delete sliderRange.closest('.slider').dataset.bounce
  } else if (sliderRange.value === sliderRange.min && !existingBounce) {
    sliderRange.closest('.slider').dataset.bounce = 'bottom'
    await sliderRange.closest('.slider').getAnimations({subtree: true}).find(a => a.animationName === 'bounce').finished
    delete sliderRange.closest('.slider').dataset.bounce
  }
})
sliderRange.value = Math.floor(Math.random() * 100)