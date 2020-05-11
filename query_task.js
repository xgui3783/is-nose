const got = require('got')
const { ENDPOINT } = require('./util/const')
const columnify = require('columnify')
require('dotenv').config()
const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  addHelp: true,
  description: `ls all tasks`
})

parser.addArgument(
  ['taskId'],
  {
    help: `task id`,
  }
)

parser.addArgument(
  ['--full'],
  {
    help: 'show full detail',
    defaultValue: false,
    action: 'storeTrue'
  }
)

const { taskId, full, ...rest } = parser.parseArgs()

const fetchData = async () => {
  const { body } = await got(
    `${ENDPOINT}/tasks/${taskId}`,
    {
      headers: {
        'Authorization': `bearer ${process.env.HBP_V1_JWT}`
      },
      responseType: 'json'
    }
  )

  const { id, description, status, ...rest } = body
  const { definition } = rest
  const processedRest = {
    ...rest,
    definition: JSON.stringify(definition)
  }
  return [{
    id,
    description,
    status,
    ...(full ? { ...processedRest } : {})
  }]
}

const main = async () => {
  if (!taskId) {
    process.stderr.write(`taskId is required\n`)
    return
  }
  const result = await fetchData()
  
  process.stdout.write(
    columnify(
      result
    )
  )
  process.stdout.write('\n')
}

main()