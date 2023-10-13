import chalk from 'chalk'

export const logWarning = (message) => {
  console.warn(chalk.red(message))
}

export const logInfo = (message) => {
  console.log(chalk.yellow(message))
}
