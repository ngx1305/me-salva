let notificationCount = 0

function createAndShowNotification(message) {
  return new Promise(resolve => {
    if (document.getElementById('notification-styles') === null) {
      const style = document.createElement('style')
      style.id = 'notification-styles'
      style.innerHTML = `
                  .notification {
                      position: fixed;
                      right: -320px;
                      background-color: #000;
                      color: #fff;
                      padding: 10px;
                      border-radius: 10px;
                      z-index: 1000;
                      width: 320px;
                      height: 60px;
                      transition: right 0.5s ease;
                      font-family: sans-serif;
                      font-weight: 400;
                  }
                  .notification-content {
                      position: relative;
                      height: 100%;
                  }
                  .notification-content p {
                      margin: 0;
                      padding-top: 0;
                      font-size: .8rem;
                      word-break: break-all;
                  }
                  .progress-bar {
                      position: absolute;
                      bottom: 5px;
                      left: 50%;
                      transform: translateX(-50%);
                      height: 5px;
                      border-radius: 5px;
                      width: 100%;
                      overflow: hidden;
                  }
                  .progress-bar div {
                      height: 100%;
                      background-color: #8234e8;
                      width: 100%;
                      animation: progress 5s linear forwards;
                  }
                  @keyframes progress {
                      from { width: 100%; }
                      to { width: 0; }
                  }
              `
      document.head.appendChild(style)
    }

    notificationCount++
    const notification = document.createElement('div')
    notification.id = `notification-${notificationCount}`
    notification.className = 'notification'
    notification.style.bottom = `${20 + (notificationCount - 1) * 70}px`
    notification.style.right = '20px'
    notification.innerHTML = `
              <div class="notification-content">
                  <p>${message}</p>
                  <div class="progress-bar">
                      <div></div>
                  </div>
              </div>
          `
    document.body.appendChild(notification)
    setTimeout(() => {
      notification.style.right = '20px'
    }, 10)
    setTimeout(() => {
      notification.style.right = '-300px'
      setTimeout(() => {
        notification.style.display = 'none'
        notificationCount--
        resolve()
      }, 500)
    }, 5000)
  })
}

async function processExercise(urlAtual) {
  try {
    const response = await fetch(urlAtual)
    const data = await response.text()
    const scriptRegex =
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    const match = data.match(scriptRegex)
    if (match) {
      const jsonData = JSON.parse(match[1])
      const correctAnswerId = findCorrectAnswerId(jsonData)
      if (correctAnswerId) {
        const answerMessage = 'Resposta correta selecionada.'
        console.log(`[ DEBUG (sim eu te copiei) ] ${answerMessage}`)
        await selectAndProgressExercise(correctAnswerId)
      }
    }
  } catch (error) {
    console.error(
      '%cErro ao processar exercício:',
      'color:red;font-weight:bold;',
      error,
    )
    createAndShowNotification('Erro ao processar exercício.')
  }
}

function findCorrectAnswerId(jsonData) {
  let correctAnswerId = null
  jsonData.props.pageProps.content.children.forEach(section => {
    if (section.component === 'ExerciseList') {
      section.list.forEach(answer => {
        if (answer.isCorrect) {
          correctAnswerId = answer.id
        }
      })
    }
  })
  return correctAnswerId
}

async function selectAndProgressExercise(correctAnswerId) {
  const correctAnswer = document.getElementById(correctAnswerId)
  if (correctAnswer) {
    const button = correctAnswer.querySelector('button')
    if (button) button.click()
    await new Promise(resolve => setTimeout(resolve, 500))
    const submitButton = document.querySelector('.submit-button')
    if (submitButton) submitButton.click()
    await new Promise(resolve => setTimeout(resolve, 1000))
    const nextExerciseButton = document.querySelector(
      'a.btn--primary.btn--size-md',
    )
    if (nextExerciseButton) {
      nextExerciseButton.click()
      await new Promise(resolve => setTimeout(resolve, 1000))
      startScript()
    } else {
      const nextButton = document.querySelector(
        'a.link.navigation-bar-item.link--custom',
      )
      if (nextButton && nextButton.innerText.includes('Próximo')) {
        nextButton.click()
        await new Promise(resolve => setTimeout(resolve, 1000))
        startScript()
      }
    }
  }
}

function startScript() {
  let urlAtual = window.location.href
  const observer = new MutationObserver(() => {
    const newUrl = window.location.href
    if (newUrl !== urlAtual) {
      urlAtual = newUrl
      processExercise(newUrl)
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
  processExercise(urlAtual)
}

createAndShowNotification('ngx1305')
startScript()
