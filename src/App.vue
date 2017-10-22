<template lang="pug">
  div#main
    div.login(v-if='!token')
      img.logo(src='static/logo.jpg' ondragstart='return false')
      p.title 金钥匙计划选课系统
      div.form
        input.cardnum(@keypress.enter='login()' v-model='cardnum' placeholder='一卡通号')
        input.schoolnum(@keypress.enter='login()' v-model='schoolnum' placeholder='学号')
        input.phone(@keypress.enter='login()' v-model='phone' placeholder='手机号码（若已设置可不填）')
        button.submit(@click='login()') 登录
      p.footer 东南大学学生事务服务中心 小猴偷米工作室 联合开发
      p.footer 建议使用 Chrome / Safari / Firefox / Edge 浏览器
      p.footer 选课仅代表个人意向，结果请以公布名单为准
    div.select(v-else)
      img.logo(src='static/logo.jpg' ondragstart='return false')
      p.title 金钥匙计划选课系统
      div.toolbar
        div.operation
          p 欢迎，{{ username }}
        div.operation(@click='reloadClasses(false, false)' v-bind:class='{ disabled: !canRefresh }')
          img(src='static/refresh.png')
          p 刷新
        div.operation(@click='logout()')
          img(src='static/logout.png')
          p 退出登录
      div.group-group(v-if='list && list.length' v-for='ggroup in list')
        p.name ▽ {{ ggroup.name }}
        p.desc(v-if='ggroup.max_select && ggroup.groups.length > 1') 本类别限选{{ ggroup.max_select }}个方向
        p.desc(v-else-if='ggroup.groups.length > 1') 以下方向任选
        div.group(v-if='ggroup.groups && ggroup.groups.length' v-for='group in ggroup.groups')
          p.name {{ group.name }}
          p.desc(v-if='group.max_select && group.classes.length > 1') 本方向限选{{ group.max_select }}个课程
          p.desc(v-else-if='group.classes.length > 1') 以下课程任选
          div.class(:class='{ selected: clazz.selected }' v-if='group.classes && group.classes.length' v-for='clazz in group.classes')
            img.pic(:src='clazz.pic' ondragstart='return false')
            div.info
              p.name {{ clazz.name }}
              p.desc {{ clazz.desc }}
              p.count 共{{ clazz.capacity }}名额
            button.pick(@click='deselect(clazz.cid)' v-if='clazz.selected') 退选
            button.pick(@click='select(clazz.cid)' v-else) 选择
          div.class(v-if='!group.classes.length')
            p.desc 该方向下没有课程
        div.group(v-if='!ggroup.groups.length')
          p.desc 空分类
      div.group-group(v-if='!list.length')
        p.desc 系统繁忙，加载需要几秒钟时间，请稍候
      p.footer 选课仅代表个人意向，结果请以公布名单为准
</template>

<script>
  import logger from './logger'
  import api from './api'

  export default {
    name: 'app',
    data() {
      return {
        cardnum: '',
        schoolnum: '',
        phone: '',
        token: null,
        username: '',
        list: [],
        canRefresh: true
      }
    },
    async created () {
      logger.bindAjax()
      let cachedToken = localStorage.getItem('token')
      let cachedName = localStorage.getItem('username')
      if (/^[0-9a-fA-F]{32}$/.test(cachedToken)) {
        this.token = cachedToken
        this.username = cachedName
        await this.reloadClasses(false, true)
      }
    },
    methods: {
      async login() {
        let res = (await api.post('login',
            `cardnum=${this.cardnum}&schoolnum=${this.schoolnum}&phone=${this.phone}`)
        ).data.content
        if (/^[0-9a-fA-F]{32}$/.test(res.token)) {
          this.token = res.token
          this.username = res.username
          localStorage.setItem('token', res.token)
          localStorage.setItem('username', res.username)
          await this.reloadClasses(false, true)
        }
      },
      async logout() {
        this.list = []
        this.token = null
        this.cardnum = ''
        this.schoolnum = ''
        this.phone = ''
        this.username = ''
        localStorage.setItem('token', null)
        localStorage.setItem('username', null)
      },
      async reloadClasses(visualize = false, force = false) {
        if (this.canRefresh || force) {
          if (visualize) this.list = []
          if (!force) {
            this.canRefresh = false
          }
          this.list = (await api.get(`class?token=${this.token}`)).data.content
          if (!force) {
            setTimeout(() => this.canRefresh = true, 3000)
          }
        }
      },
      async select(cid) {
        let res = (await api.post('class', `token=${this.token}&cid=${cid}`)).data
        if (res.code < 400) {
          alert(res.content)
          this.list = this.list.map(k => {
            k.groups = k.groups.map(g => {
              g.classes = g.classes.map(c => {
                if (c.cid === cid) c.selected = true
                return c
              })
              return g
            })
            return k
          })
        }
//        await this.reloadClasses(false, true)
      },
      async deselect(cid) {
        let res = (await api.delete(`class?token=${this.token}&cid=${cid}`)).data
        if (res.code < 400) {
          alert(res.content)
          this.list = this.list.map(k => {
            k.groups = k.groups.map(g => {
              g.classes = g.classes.map(c => {
                if (c.cid === cid) c.selected = false
                return c
              })
              return g
            })
            return k
          })
        }
//        await this.reloadClasses(false, true)
      }
    }
  }
</script>

<style lang="stylus">
  *
    font-family 'PingFang SC', 'Microsoft YaHei UI', sans-serif
    /*-webkit-user-select none*/

  html, body
    margin 0
    padding 0

  p
    margin-top 0
    margin-bottom 0
    line-height 1.75em

  a, a:link, a:hover, a:active, a:focus, a:visited
    color inherit
    text-decoration none
    -webkit-appearance none

  button, input
    outline none
    border none

  input, input:focus
    -webkit-appearance none

  ::-webkit-scrollbar
    display none

  .logo
    width 100px
    height 100px
    margin-bottom 30px

  .title
    font-size 28px
    color #333

  .footer
    color #888
    font-size 14px

  .login
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    display flex
    flex-direction column
    align-items center
    justify-content center

    .form
      padding 30px 0
      display flex
      flex-direction column
      align-items stretch
      justify-content center
      max-width 300px
      width 80%

      input
        box-sizing border-box
        border none
        padding 10px
        border-radius 4px
        margin 10px 0
        font-size 14px
        width 100%
        background #f0f0f0

      button
        box-sizing border-box
        border none
        padding 10px
        border-radius 4px
        margin 10px 0
        font-size 16px
        width 100%
        background #00872f
        color #fff

        &:active
          background #005d20

  .select
    max-width 600px
    margin 0 auto
    padding 40px 0
    display flex
    flex-direction column
    align-items center
    justify-content center

    .toolbar
      display flex
      flex-direction row
      padding 20px 0

      .operation
        display flex
        flex-direction row
        align-items center
        margin 0 10px
        font-size 15px
        color #333

        &.disabled
          opacity .3

        img
          width 16px
          height 16px
          margin-right 5px
          object-fit contain

    .group-group
      display block
      padding 10px 15px
      margin-top 40px

      +.group-group
        margin-top 0

      .name
        font-size 18px
        color #00872f
        display inline-block
        margin 0 10px

      .desc
        font-size 14px
        color #888
        display inline-block

      .group
        display block
        margin 15px 0
        border 1px solid #e4e4e4
        padding 10px 15px
        background #fafafa
        border-radius 4px

        .name
          font-size 16px
          font-weight normal
          color #333
          margin-left 0

        .class
          display flex
          flex-flow row wrap
          justify-content flex-end
          align-items center
          margin 15px 0 5px
          border 1px solid #e4e4e4
          padding 16px 16px
          background #fff
          border-radius 4px

          .name
            line-height 1.6em

          .pic
            width 30%
            min-width 90px
            height 90px
            object-fit cover
            overflow hidden
            border-radius 4px

          .info
            margin 10px 15px
            display flex
            flex-direction column
            align-items flex-start
            flex 1 1 0
            min-width 150px

            .count
              font-size 13px
              color #666

          .pick
            padding 10px 20px
            color #fff
            background #00872f
            font-size 15px
            border-radius 4px

            &:active
              background #005d20

          &.selected
            border 2px solid #00872f
            padding 15px 15px

            .pick
              border 1px solid #ccc
              color #333
              background #fff

              &:active
                background #f0f0f0

</style>
