<template lang="pug">
  div#main
    div.login(v-if='!token')
      img.logo(src='static/logo.jpg')
      p.title 金钥匙计划选课系统
      div.form
        input.cardnum(@keydown.enter='login()' v-model='cardnum' placeholder='一卡通号')
        input.schoolnum(@keydown.enter='login()' v-model='schoolnum' placeholder='学号')
        button.submit(@click='login()') 登录
      p.footer 东南大学学生事务服务中心 小猴偷米工作室 联合开发
      p.footer 建议使用 Chrome / Safari / Firefox / Edge 浏览器
    div.select(v-else)
      img.logo(src='static/logo.jpg')
      p.title 金钥匙计划选课系统
      div.group-group(v-if='list && list.length' v-for='ggroup in list')
        p.name ▽ {{ ggroup.name }}
        p.desc(v-if='ggroup.max_select') 本类别限选{{ ggroup.max_select }}个方向
        div.group(v-if='ggroup.groups && ggroup.groups.length' v-for='group in ggroup.groups')
          p.name {{ group.name }}
          p.desc(v-if='group.max_select') 本方向限选{{ group.max_select }}个课程
          div.class(:class='{ selected: clazz.selected }' v-if='group.classes && group.classes.length' v-for='clazz in group.classes')
            img.pic(:src='clazz.pic')
            div.info
              p.name {{ clazz.name }}
              p.desc {{ clazz.desc }}
              p.count 剩余{{ clazz.capacity - clazz.count }}名额
            button.pick(@click='deselect(clazz.cid)' v-if='clazz.selected') 退选
            button.pick(@click='select(clazz.cid)' v-else) 选择
          div.class(v-else)
            p.desc 该方向下没有课程
        div.group(v-else)
          p.desc 空分类
      div.group-group(v-else)
        p.desc 无分类
      p.footer 东南大学学生事务服务中心 小猴偷米工作室 联合开发
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
        token: null,
        list: []
      }
    },
    async created () {
      logger.bindAjax()
    },
    methods: {
      async login() {
        let token = (await api.post('login',
          `cardnum=${this.cardnum}&schoolnum=${this.schoolnum}`)
        ).data
        if (/^[0-9a-fA-F]{32}$/.test(token)) {
          this.token = token
          await this.reloadClasses()
        }
      },
      async reloadClasses() {
        this.list = (await api.get(`class?token=${this.token}`)).data
      },
      async select(cid) {
        let res = (await api.post('class', `token=${this.token}&cid=${cid}`)).data
        if (res) alert(res)
        await this.reloadClasses()
      },
      async deselect(cid) {
        let res = (await api.delete(`class?token=${this.token}&cid=${cid}`)).data
        if (res) alert(res)
        await this.reloadClasses()
      }
    }
  }
</script>

<style lang="stylus">
  *
    font-family 'PingFang SC', 'Microsoft YaHei UI', sans-serif
    -webkit-user-select none

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
      padding 40px 0
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

    .group-group
      display block
      padding 10px 15px
      margin-top 20px

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
        margin 15px 0 5px
        border 1px solid #e4e4e4
        padding 10px 15px
        background #fafafa

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
          padding 11px 16px
          background #fff

          .pic
            width 30%
            height 100%
            object-fit cover

          .info
            margin 10px 10px
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
            margin 5px 0
            color #fff
            background #00872f
            font-size 15px

            &:active
              background #005d20

          &.selected
            border 2px solid #00872f
            padding 10px 15px

            .pick
              border 1px solid #ccc
              color #333
              background #fff

              &:active
                background #f0f0f0

</style>
