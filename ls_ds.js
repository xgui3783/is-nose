const got = require('got')
const { ENDPOINT } = require('./util/const')
const columnify = require('columnify')
require('dotenv').config()
const ArgumentParser = require('argparse').ArgumentParser

const parser = new ArgumentParser({
  addHelp: true,
  description: `ls all datasets, against ${ENDPOINT}`
})

// TODO do proper parser

let privateFlagSet = false
let publicFlagSet = false
let showFull = false
for (const arg of process.argv) {
  if (arg === '--private') {
    privateFlagSet = true
  }
  if (arg === '--public') {
    publicFlagSet = true
  }

  if (arg === '--full') {
    showFull = true
  }
}

const fetchData = async () => {
  try {

    const { body: arr } = await got(
      `${ENDPOINT}/datasets/?per_page=1000000`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HBP_V1_JWT}`
        },
        responseType: 'json'
      }  
    )

    return arr
    
  } catch (e) {
    console.log(e)
    throw e
  }
}


const main = async () => {
  const arr = await fetchData()

  const filterdArr = arr
    .filter(({ private }) => {
      if (privateFlagSet) return private === true
      if (publicFlagSet) return private === false
      return false 
    })
    .map(({ container_url, created, updated, ...rest}) => {
      return {
        ...rest,
        ...(
          showFull ? { container_url, created, updated } : {}
        )
      }
    })

  process.stdout.write(
    columnify(
      (privateFlagSet || publicFlagSet) ? filterdArr : arr,
    )
  )

  process.stdout.write('\n')

  return 
}

main()