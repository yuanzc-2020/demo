 <style lang="less">
@import '../../styles/single-common.less';
@import '../../styles/table-common.less';
@import '../../styles/common.less';
</style>
<template>
	<div>
		<Card>
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
		<Card class="card-margin-top">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>调拨详情
			</p>
			<div>
				<Form ref="form" :model="form" inline :label-width="120">
					<Form-item label="调拨编号" prop="allotId">
						<Input v-model="form.allotId" disabled style="width: 300px" />
					</Form-item>
					<Form-item label="调拨单位" prop="toCorpName">
						<Input v-model="form.toCorpName" disabled style="width: 300px" />
					</Form-item>
					<FormItem label="新增人" prop="addUserName">
						<Input v-model="form.addUserName" disabled style="width: 300px" />
					</FormItem>
					<FormItem label="新增时间" prop="addTime">
						<Input v-model="form.addTime" disabled style="width: 300px" />
					</FormItem>
				</Form>
				<Row>
					<Table
						:loading="loading"
						highlight-row
						border
						:columns="columns"
						:data="data"
						sortable="custom"
						ref="table"
						size="small"
						show-summary
						:summary-method="handleSummary"
					></Table>
				</Row>
				<Row type="flex" justify="end" class="page">
					<Page
						:current="form.pageNumber"
						:total="total"
						:page-size="form.pageSize"
						@on-change="changePage"
						@on-page-size-change="changePageSize"
						:page-size-opts="[10,20,50]"
						size="small"
						show-total
						show-elevator
						show-sizer
					></Page>
				</Row>
			</div>
		</Card>
	</div>
</template>
<script>
import { getAllotDatailList } from '@/api/card-bill-api';

export default {
	props: {
		businessId: {
			type: String,
			required: true,
			default: ''
		}
	},
	data() {
		return {
			loading: true,
			submitLoading: false,
			disabled: false,
			form: {
				allotId: '',
				toCorpName: '',
				addUserName: '',
				addTime: ''
			},
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '明细编号',
					key: 'itemId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '卡类名称',
					key: 'cardTypeName',
					minWidth: 200,
					align: 'center'
				},
				{
					title: '卡类题材',
					key: 'cardThemeName',
					minWidth: 120,
					align: 'center'
				},
				{
					title: '调拨数量',
					key: 'amount',
					minWidth: 120,
					align: 'center'
				}
			],
			data: []
		};
	},

	methods: {
		init() {
			this.handleReset();
			this.form.allotId = this.businessId;
			this.getDataItemList();
		},
		handleReset() {
			this.$refs.form.resetFields();
		},

		close() {
			this.$emit('close', true);
		},
		changePage(v) {
			this.form.pageNumber = v;
			this.getDataItemList();
		},
		changePageSize(v) {
			this.form.pageSize = v;
			this.getDataItemList();
		},
		getDataItemList() {
			this.loading = true;
			getAllotDatailList(this.form).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
					this.form = res.result.form;
				}
			});
		},
		handleSummary({ columns, data }) {
			const sums = {};
			columns.forEach((column, index) => {
				const key = column.key;
				if (index === 1) {
					sums[key] = {
						key,
						value: '合计'
					};
					return;
				}
				if (index != 4) {
					sums[key] = {
						key,
						value: ''
					};
					return;
				}

				const values = data.map(item => Number(item[key]));
				if (!values.every(value => isNaN(value))) {
					const v = values.reduce((prev, curr) => {
						const value = Number(curr);
						if (!isNaN(value)) {
							return prev + curr;
						} else {
							return prev;
						}
					}, 0);
					sums[key] = {
						key,
						value: v
					};
				} else {
					sums[key] = {
						key,
						value: ''
					};
				}
			});
			return sums;
		}
	},
	mounted() {
		this.init();
	}
};
</script>