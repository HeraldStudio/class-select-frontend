import axios from 'axios';

export default axios.create({
  baseURL: 'http://myseu.cn:8087/',
  timeout: 20000,
  validateStatus (status) {
    if (status >= 400) {
      alert(`[${status}] 服务器出错，请稍后重试`)
    }
    return true
  },
  transformResponse (res) {
    res = JSON.parse(res)
    if (res.code >= 400) {
      alert(res.content)
      return null
    }
    return res
  }
})