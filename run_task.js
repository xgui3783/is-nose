const got = require('got')
const { ENDPOINT } = require('./util/const')
require('dotenv').config()
const { ArgumentParser } = require('argparse')
const parser = new ArgumentParser({
  addHelp: true,
  description: `run task`
})

parser.addArgument(
  'task_id',
  {
    help: `task id to be run`,
    defaultValue: null
  }
)

const { task_id } = parser.parseArgs()

const postTask = async () => {
  await got.put(
    `${ENDPOINT}/tasks/${task_id}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.HBP_V1_JWT}`
      }
    }
  )
}

const main = async () => {
  try {
    await postTask()
    process.stdout.write(`Request sent\n`)
  } catch (e) {
    process.stderr.write(`${e.toString()}\n`)
  }
}

main()