const got = require('got')
const { ENDPOINT, AGENT } = require('./util/const')
const columnify = require('columnify')
const { ArgumentParser, Const } = require('argparse')
const FormData = require('form-data')
const { Readable } = require('stream')

require('dotenv').config()

const parser = new ArgumentParser({
  addHelp: true,
  description: `Create a task, against ${ENDPOINT}`
})

parser.addArgument(
  ['dataset_id'],
  {
    help: `Id of dataset the task is to be created under. Should satisfy [a-f0-9-]{1,}`,
  }
)

parser.addArgument(
  ['--description', '--desc'], 
  {
    help: `Description of the task.`,
    defaultValue: `Desc not provided`,
    constant: 'description'
  }
)

parser.addArgument(
  ['--url'],
  {
    help: `CSCS swift container URL or swift file link.`,
    required: true,
    constant: 'url'
  }
)

parser.addArgument(
  ['--filter'],
  {
    help: 'If --stacks value is set, regex for the filtering of files.',
    constant: 'filter'
  }
)

parser.addArgument(
  ['--runtime-limit'],
  {
    help: 'runtime limit of the task',
    defaultValue: null,
    constant: 'runtimeLimit'
  }
)

parser.addArgument(
  ['--ingestion-parameters'],
  {
    help: 'JSON string of ingestion parameters',
    defaultValue: null,
    constant: 'ingestion_parameters'
  }
)

const args = parser.parseArgs()


const postData = async () => {
  try {
    const { dataset_id, description, url, ingestion_parameters:ingestionParameters, runtime_limit, filter } = args
    const ingestion_parameters = ingestionParameters && JSON.parse(ingestionParameters)
    
    const formData = new FormData()
    const rStream = new Readable()
    const jsonObj = {
      dataset_id,
      description: `${description}${AGENT}`,
      definition: {
        type: 'ingest',
        url,
        ...( runtime_limit ? { runtime_limit }: {} ),
        ...( filter ? { filter }: {} ),
        ...( ingestion_parameters ? { ingestion_parameters } : {})
      }
    }
    const stringified = JSON.stringify(jsonObj)

    rStream.push(stringified)
    rStream.push(null)

    formData.append('definition', rStream, {
      filename: 'json.json',
      filepath: '/data/json.json',
      contentType: 'application/json',
      knownLength: stringified.length
    })

    const { body } = await got.post(
      `${ENDPOINT}/tasks/`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HBP_V1_JWT}`,
        },
        body: formData,
        responseType: 'json'
      },
    )
    return body
  } catch (e) {
    process.stderr.write(e.toString())
    process.stderr.write('\n')
    process.exit()
  }
}

const main = async () => {
  try {
    const result = await postData()
    const { id } = JSON.parse(result)
    process.stdout.write(`Task ${id} created successfully.\n`)
  } catch (e) {
    process.stderr.write(`${e.toString()}\n`)
  }
}

main()