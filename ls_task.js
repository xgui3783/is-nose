const got = require('got')
const { ENDPOINT } = require('./util/const')
const columnify = require('columnify')
require('dotenv').config()
const ArgumentParser = require('argparse').ArgumentParser
const { URLSearchParams } = require('url')
const parser = new ArgumentParser({
  addHelp: true,
  description: `ls all tasks`
})

parser.addArgument(
  ['--dataset-id', '-d'],
  {
    help: `get tasks by dataset id`,
    required: false,
    defaultValue: null,
    constant: 'dataset_id'
  }
)

parser.addArgument(
  ['--full'], 
  {
    help: `get all columns`,
    required: false,
    defaultValue: false,
    constant: 'full'
  }
)

const args = parser.parseArgs()

const t = {
  "id": "a4da7f2b-69eb-4793-baad-74d1a2002ab1",
  "description": "test ingestion",
  "dataset_id": "d333dc46-de5b-49ba-a8ad-294d97c94565",
  "duration": null,
  "definition": {
    "type": "ingest",
    "url": "https://object.cscs.ch/v1/AUTH_6ebec77683fb472f94d352be92b5a577/Xiao/difumo/data/512/parcellated_maps.nii.gz"
  },
  "error": null,
  "status": "CREATED",
  "created": "2020-03-23T14:49:08.979604",
  "updated": null
}

const { dataset_id, full } = args

const { HBP_V1_JWT } = process.env

const fetchData = async () => {
  const searchParams = new URLSearchParams()
  searchParams.set('per_page', 1e5)
  try {
    const { body, ...rest } = await got(
      dataset_id
        ? `${ENDPOINT}/datasets/${dataset_id}/tasks`
        : `${ENDPOINT}/tasks`,
      {
        searchParams,
        headers: {
          ...(HBP_V1_JWT ? {'Authorization': `Bearer ${HBP_V1_JWT}`} : {})
        },
        responseType: 'json'
      }
    )
    return body
  } catch (e) {
    process.stderr.write(`ls_task error \n`)
    process.stderr.write(`${e.toString()}\n`)
    process.exit()
  }
}

const main = async () => {
  const result = await fetchData()
  if (result.length === 0) {
    process.stderr.write(`No tasks defined\n`)
  }
  process.stdout.write(
    columnify(
      full
        ? result
        : result.map(({ id, description, error, status, ...rest }) => ({ id, description, error, status }))
    )
  )
  process.stdout.write('\n')
}

main()