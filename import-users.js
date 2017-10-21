const axios = require('axios')
const fs = require('fs');
const sem = new (require('await-semaphore').Semaphore)(10)

const api = axios.create({
  baseURL: 'http://myseu.cn:8087',
  timeout: 20000,
  transformResponse (data) {
    return JSON.parse(data).content
  }
});

async function importUsers() {
  let file = (await fs.readFileSync('pks.csv')).toString().replace(/\ufeff/g, '').split(/[\r\n]+/g)
  let failedCount = 0

  await Promise.all(file.map(line => {
    let info = line.split(',')
    console.log(info)
    if (info.length === 3) {
      let [cardnum, schoolnum, name] = info
      return (async () => {
        let release = null
        try {
          release = await sem.acquire()
          let res = await api.put('login',
            `cardnum=${cardnum}
          &schoolnum=${schoolnum}
          &name=${encodeURIComponent(name)}`)
          release()

          console.log(res.data, info)
          if (res.data !== 'OK') {
            failedCount++
          }
        } catch (e) {
          console.error(e)
          failedCount++
        } finally {
          release && release()
        }
      })()
    } else {
      return Promise.resolve
    }
  }))

  console.log(`Finish. ${failedCount} failures.`)
}

(async () => {
  await importUsers()
})()