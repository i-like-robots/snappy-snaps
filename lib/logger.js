import chalk from 'chalk'

export const logWarning = (message) => {
  console.log(chalk.red(message))
}

export const logInfo = (message) => {
  console.log(chalk.yellow(message))
}
