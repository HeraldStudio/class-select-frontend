const axios = require('axios')
const sleep = async (ms) => {
  await new Promise(r => setTimeout(r, ms))
}

let requests = 0
let start = Date.now()

const api = axios.create({
  baseURL: 'http://localhost:8087',
  timeout: 20000,
  transformResponse (data) {
    requests++
    return JSON.parse(data).content
  }
});

async function testUser(id) {
  let name = 'test' + id
  let res = (await api.put('login', `cardnum=${name}&schoolnum=${name}&name=${name}`)).data
  if (res !== 'OK') {
    console.log('创建用户失败')
  }

  let token = (await api.post('login', `cardnum=${name}&schoolnum=${name}&phone=10000000000`)).data.token
  if (!/^[0-9a-fA-F]{32}$/.test(token)) {
    console.log('Token错误', token)
  }

  let classes = (await api.get(`class?token=${token}`)).data
  for (let ggroup of classes) {
    for (let group of ggroup.groups) {
      for (let clazz of group.classes) {
        if (!clazz.selected && clazz.count < clazz.capacity) {
          let cid = clazz.cid
          let res = (await api.post('class', `token=${token}&cid=${cid}`)).data
          console.log(res)

          if (Math.random() < 0.3) {
            classes = (await api.get(`class?token=${token}`)).data
          }
        }
      }
    }
  }

  console.log('Finish')
  console.log(requests / ((Date.now() - start) / 1000) + 'rps')
}

// 出错输出
process.on('unhandledRejection', e => { throw e })
process.on('uncaughtException', console.trace)

;(async () => {
  await Promise.all(Array(600).fill().map((k, i) => testUser(i)))
})()
