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
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>基本信息
			</p>
			<div>
				<Form ref="form" :model="form" inline :label-width="120" :rules="formValidate">
					<FormItem label="调拨业务编号" prop="applyReceiptsId">
						<Input v-model="form.allotId" disabled="true" style="width: 300px" />
					</FormItem>
					<FormItem label="调拨目的单位" prop="progressType" v-if="actionType==0">
						<Select v-model="form.corpId" :disabled="disabled" style="width: 300px">
							<Option
								v-for="item in dictAlloatCorpList"
								:value="item.corpId"
								:key="item.corpId"
								:label="item.corpName"
							>{{ item.corpName }}</Option>
						</Select>
					</FormItem>
					<FormItem label="目的单位" prop="toCorpName" v-if="actionType==1">
						<Input disabled type="text" v-model="form.toCorpName" style="width: 300px" />
					</FormItem>
					<FormItem label="卡类名称" prop="cardTypeId">
						<Select
							v-model="form.cardTypeId"
							:label-in-value="true"
							@on-change="cardTypeNameOnChange"
							style="width: 300px"
						>
							<Option
								v-for="item in cardTypes"
								:value="item.cardTypeId"
								:key="item.cardTypeId"
								:label="item.cardTypeName"
							>{{ item.cardTypeName }}</Option>
						</Select>
					</FormItem>

					<Form-item label="卡类题材" prop="cardThemeId">
						<Select
							v-model="form.cardThemeId"
							style="width: 300px"
							:label-in-value="true"
							@on-change="cardThemeOnChange"
						>
							<Option
								v-for="item in cardThemeSelect"
								:value="item.cardThemeId"
								:key="item.cardThemeId"
								:label="item.cardThemeName"
							>{{ item.cardThemeName }}</Option>
						</Select>
					</Form-item>
					<FormItem label="实时库存" prop="stockAmount">
						<Input v-model="form.stockAmount" disabled="true" style="width: 300px" />
					</FormItem>
					<FormItem label="调拨数量" prop="amount">
						<InputNumber :max="10000" :min="1" v-model="form.amount" style="width: 300px"></InputNumber>
					</FormItem>
					<FormItem>
						<Button
							:loading="submitLoading"
							@click="handleSubmit"
							icon="md-checkbox-outline"
							type="primary"
						>保存</Button>
					</FormItem>
				</Form>
			</div>
		</Card>
		<Card class="card-margin-top">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>调拨详情
			</p>
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
		</Card>
	</div>
</template>
<script>
import {
	getAllotDatailList,
	getStockAllotCardTypeSelect,
	insert,
	update,
	detailDelete,
	getNumber,
} from '@/api/card-bill-api';

export default {
	name: 'AllotFrom',
	props: {
		transferData: Object,
	},
	data() {
		return {
			loading: false,
			submitLoading: false,
			disabled: false,
			cardTypeName: [],
			setNumber: '',
			actionType: -1,
			form: {
				toCorpName: '',
				allotId: '',
				corpId: '',
				cardTypeName: '',
				cardTypeId: '',
				stockAmount: '',
				cardThemeId: '',
				cardThemeName: '',
				amount: '1',
			},
			itemForm: {
				allotId: '',
				pageNumber: 1,
				pageSize: 10,
			},
			addFrom: {},
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '明细编号',
					key: 'itemId',
					minWidth: 100,
					align: 'center',
				},
				{
					title: '卡类名称',
					key: 'cardTypeName',
					minWidth: 200,
					align: 'center',
				},
				{
					title: '卡类题材',
					key: 'cardThemeName',
					minWidth: 120,
					align: 'center',
				},
				{
					title: '调拨数量',
					key: 'amount',
					minWidth: 120,
					align: 'center',
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let re = '';
						re = [
							h(
								'Button',
								{
									props: {
										type: 'error',
										size: 'small',
									},
									on: {
										click: () => {
											this.remove(params.row);
										},
									},
								},
								'删除'
							),
						];
						return h('div', re);
					},
				},
			],
			data: [],
			total: 0,
			formValidate: {
				corpId: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur',
						type: 'number',
					},
				],
				cardTypeId: [
					{ required: true, message: '不能为空', trigger: 'blur' },
				],
				cardThemeId: [
					{ required: true, message: '不能为空', trigger: 'blur' },
				],
			},
			cardTypeSelect: [],
			cardTypes: [],
			cardThemeSelect: [],
			dictAlloatCorpList: [],
		};
	},

	methods: {
		init() {
			this.actionType = this.transferData.actionType;
			this.disabledData();
			this.cardTypeNameSelect();
			if (this.transferData.actionType == 1) {
				this.form.allotId = this.transferData.allotId;
				this.itemForm.allotId = this.transferData.allotId;
				this.form.corpId = this.transferData.corpId;
				this.getDataItemList();
			} else if (this.transferData.actionType == 0) {
				this.getNumber();
			}
		},
		changePage(v) {
			this.form.pageNumber = v;
			this.getDataItemList();
		},
		changePageSize(v) {
			this.form.pageSize = v;
			this.getDataItemList();
		},
		getNumber() {
			getNumber({ code: 'DB' }).then((res) => {
				if (res.success) {
					this.form.allotId = res.result;
					this.itemForm.allotId = res.result;
				}
			});
		},
		disabledData() {
			if (this.transferData.actionType == 0) {
				this.disabled = false;
			} else {
				this.disabled = true;
			}
		},

		close() {
			this.$emit('fatherMethod');
			this.$emit('close', true);
		},
		getDataItemList() {
			this.loading = true;
			getAllotDatailList(this.itemForm).then((res) => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
					this.form = res.result.form;
					this.form.corpId = res.result.form.toCorpId;
				}
			});
		},
		//获取卡类名称下拉框数据
		cardTypeNameSelect() {
			getStockAllotCardTypeSelect().then((res) => {
				if (res.success) {
					this.cardTypeSelect = res.result.content;
					var arr = Object.keys(res.result.content);
					if (arr.length > 0);
					{
						let cardTypes = [];
						res.result.content.forEach((e) => {
							cardTypes.push({
								cardTypeId: e.cardTypeId,
								cardTypeName: e.cardTypeName,
							});
						});
						cardTypes.sort(
							this.globalUtil.compareArraySort('cardTypeName')
						);
						this.cardTypes = cardTypes;
					}
				}
			});
		},
		//卡类名称change事件
		cardTypeNameOnChange(v) {
			if (v != undefined) {
				this.form.cardTypeName = v.label;
				let data = this.cardTypeSelect;
				data.forEach((e) => {
					if (v.value == e.cardTypeId) {
						this.cardThemeSelect = e.cardThemes;
					}
				});
			}
		},
		//题材点击事件
		cardThemeOnChange(val) {
			if (val != undefined) {
				this.form.cardThemeName = val.label;
				let data = this.cardThemeSelect;
				data.forEach((e) => {
					if (val.value == e.cardThemeId) {
						this.form.stockAmount = e.stockAmount;
					}
				});
			}
		},
		remove(v) {
			this.$Modal.confirm({
				title: '确认删除',
				content: '您确认要删除调拨单明细吗?',
				loading: true,
				onOk: () => {
					detailDelete(v.itemId).then((res) => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('删除成功');
							this.getDataItemList();
						}
					});
				},
			});
		},
		handleSubmit() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					if (
						parseInt(this.form.stockAmount) <
						parseInt(this.form.amount)
					) {
						this.$Modal.warning({
							title: '保存提醒',
							content: '调拨数量不能大于库存数量',
						});
						return;
					}

					let type = 0;
					this.data.forEach((e) => {
						if (
							e.cardTypeId == this.form.cardTypeId &&
							e.cardThemeId == this.form.cardThemeId
						) {
							this.$Modal.warning({
								title: '保存提醒',
								content: '当前选择卡类数据已存在',
							});
							type = 1;
							return;
						}
					});
					if (type == 0) {
						this.addFrom.allotId = this.form.allotId;
						this.addFrom.cardTypeId = this.form.cardTypeId;
						this.addFrom.cardTypeName = this.form.cardTypeName;
						this.addFrom.cardThemeId = this.form.cardThemeId;
						this.addFrom.cardThemeName = this.form.cardThemeName;
						this.addFrom.amount = this.form.amount;
						let arry = {};
						arry.allotId = this.form.allotId;
						arry.toCorpId = this.form.corpId;
						arry.cardAllotItemNewVOS = [this.addFrom];
						insert(arry).then((res) => {
							if (res.success) {
								this.$Msg.success('操作成功');
								this.transferData.actionType = 1;
								this.disabled = true;
								this.getDataItemList();
							}
						});
					}
				}
			});
		},
	},
	created() {
		this.handleAuthcMethods.getBaseAllEnableCorpToAlloat().then((res) => {
			this.dictAlloatCorpList = res;
		});
	},
	mounted() {
		this.init();
	},
};
</script>