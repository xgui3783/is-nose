const { ENDPOINT, AGENT } = require('./util/const')
const got = require('got')
const ArgumentParser = require('argparse').ArgumentParser

require('dotenv').config()

const parser = new ArgumentParser({
  addHelp: true,
  description: `Create a dataset, against ${ENDPOINT}`
})

parser.addArgument(
  ['title'],
  {
    help: `title of the dataset`
  }
)

parser.addArgument(
  ['--description', '--desc'],
  {
    help: 'description of the dataset',
    constant: 'description',
    defaultValue: ''
  }
)

parser.addArgument(
  ['--public'],
  {
    help: 'Whether this dataset can be queried by public',
    defaultValue: false
  }
)

const args = parser.parseArgs()

const { public, description, title } = args

const postdata = async () => {
  const payload = {
    title,
    description: `${description}${AGENT}`,
    private: !public
  }
  
  const { body, statusCode } = await got.post(
    `${ENDPOINT}/datasets/`,
    {
      headers: {
        'Content-type': 'application/json',
        'Authorization': `Bearer ${process.env.HBP_V1_JWT}`
      },
      body: JSON.stringify(payload),
      responsType: 'json'
    }
  )
  if (statusCode >= 400) throw body
  return body
}

const main = async () => {
  try {
    const { id, container_url } = await postdata()
    process.stdout.write(`created ds with id: ${id}\n`) 
  } catch (e) {
    process.stderr.write(`${e.toString()}\n`)
  }
}

main()