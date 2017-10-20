const axios = require('axios')

const api = axios.create({
  baseURL: 'http://myseu.cn:8087',
  timeout: 3000,
  validateStatus: status => {
    if (status >= 400) {
      alert(`[${status}] 服务器出错，请稍后重试`)
    }
    return true
  }
});

(async () => {
  let res = (await api.get('class'))
  console.log(res.data)
})()