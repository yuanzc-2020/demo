<style lang="less">
@import '../../../styles/single-common.less';
@import '../../../styles/table-common.less';
@import '../../../styles/common.less';
</style>
<template>
	<div class="search">
		<Card style="margin-bottom:10px;">
			<div class="edit-head">
				<a @click="close" class="back-title">
					<Icon type="ios-arrow-back" />返回
				</a>
				<div class="head-name"></div>
				<span></span>
				<a @click="close" class="window-close">
					<Icon type="ios-close" size="31" class="ivu-icon-ios-close" />
				</a>
			</div>
		</Card>
		<Card style="margin-bottom:10px;">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>流程审批历史
			</p>
			<Row style="position:relative">
				<Table :loading="loading" border :columns="columns" :data="data" ref="table" size="small"></Table>
				<Spin size="large" fix v-if="loading"></Spin>
			</Row>
		</Card>
		<Card>
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>
				<span>实时流程图</span>
			</p>
			<Row style="position:relative">
				<img :src="imgUrl" />
				<Spin size="large" fix v-if="loadingImg"></Spin>
			</Row>
		</Card>
	</div>
</template>

<script>
import { getHighlightImg, getInsTaskHistory } from '@/api/card-flow-api';
import util from '@/libs/util';
export default {
	props: {
		transferData: Object
	},
	data() {
		return {
			type: 0,
			loading: false,
			loadingImg: false,
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '任务名称',
					key: 'name',
					align: 'center',
					minWidth: 100
				},
				{
					title: '处理人',
					key: 'assignees',
					align: 'center',
					minWidth: 110,
					render: (h, params) => {
						return h(
							'div',
							params.row.assignees.map(function(item, index) {
								return h('span', [
									item.userName + '(' + item.userId + ')'
								]);
							})
						);
					}
				},
				{
					title: '到达时间',
					key: 'createTime',
					align: 'center',
					width: 160
				},
				{
					title: '审批操作',
					key: 'deleteReason',
					align: 'center',
					width: 110,
					render: (h, params) => {
						let text = '',
							color = '';
						if (params.row.deleteReason == '审批驳回') {
							color = 'volcano';
							text = '审批驳回';
							return h('div', [
								h(
									'Tag',
									{
										props: {
											color: color
										}
									},
									text
								)
							]);
						} else if (params.row.deleteReason == '审批通过') {
							color = 'green';
							text = '审批通过';
							return h('div', [
								h(
									'Tag',
									{
										props: {
											color: color
										}
									},
									text
								)
							]);
						} else {
							color = 'default';
							text = params.row.deleteReason;
							return h('div', [text]);
						}
					}
				},
				{
					title: '审批意见',
					key: 'comment',
					align: 'center',
					minWidth: 180
				},
				{
					title: '处理时长',
					key: 'duration',
					align: 'center',
					width: 100,
					render: (h, params) => {
						return h('div', util.millsToTime(params.row.duration));
					}
				},
				{
					title: '完成时间',
					key: 'endTime',
					align: 'center',
					width: 160
				},
				{
					title: '任务状态',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let text = '',
							color = '';
						if (params.row.endTime) {
							color = 'blue';
							text = '已办理';
						} else {
							color = 'red';
							text = '待处理';
						}
						return h('div', [
							h(
								'Tag',
								{
									props: {
										color: color
									}
								},
								text
							)
						]);
					}
				}
			],
			data: [],
			id: '',
			imgUrl: '',
			backRoute: ''
		};
	},
	methods: {
		init() {
			this.type = this.transferData.type;
			this.backRoute = this.transferData.backRoute;
			this.id = this.transferData.procInstId;
			this.imgUrl = getHighlightImg + this.id + '?time=' + new Date();
			this.getDataList();
		},
		getDataList() {
			this.loading = true;
			getInsTaskHistory(this.id).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result;
					if (!res.result || res.result.length == 0) {
						this.$Msg.warning('未找到该记录审批历史数据');
					}
				}
			});
		},
		close() {
			this.$emit('close', true);
		}
	},
	mounted() {
		this.init();
	},
	watch: {}
};
</script>