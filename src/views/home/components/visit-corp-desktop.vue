<template>
  <Card :padding="0">
    <div class="info-card-con">
      <Col class="info-card-icon-con" :style="{backgroundColor: color, color: 'white'}" span="8">
        <Row class="height-100" type="flex" align="middle" justify="center">
          <Icon :type="iconType" :size="iconSize"></Icon>
        </Row>
      </Col>
      <Col span="16" class="height-100">
        <Row type="flex" align="middle" justify="center" class="height-100">
          <count-up
            class="info-card-count user-created-count"
            :id-name="idName"
            :end-val="endVal"
            :color="color"
            :countSize="countSize"
            :countWeight="countWeight"
          >
            <p class="info-intro-text" slot="intro">{{ introText }}</p>
          </count-up>
        </Row>
      </Col>
    </div>
  </Card>
</template>

<script>
import countUp from "./countUp.vue";

export default {
  name: "inforCard",
  components: {
    countUp
  },
  props: { }
};
</script>
<style lang="less"> 
</style>


