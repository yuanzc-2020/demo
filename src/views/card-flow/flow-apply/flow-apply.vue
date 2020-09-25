<style lang="less">
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<BillAllotDetail
			v-if="currView == 'BillAllotDetail'"
			@close="currView = 'index'"
			:businessId="businessId"
		/>
		<HistoricDetail
			v-if="currView == 'historic_detail'"
			@close="currView = 'index'"
			:transferData="transferData"
		/>
		<Card v-show="currView == 'index'">
			<Row v-show="openSearch" @keydown.enter.native="handleSearch">
				<Form
					ref="searchForm"
					:model="searchForm"
					inline
					:label-width="100"
				>
					<Form-item label="流程名称" prop="title">
						<Input
							type="text"
							v-model="searchForm.title"
							placeholder="请输入流程名称"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="业务编号" prop="businessId">
						<Input
							type="text"
							v-model="searchForm.businessId"
							placeholder="请输入业务编号"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<span v-if="drop">
						<FormItem label="流程分类" prop="businessKey">
							<Select
								v-model="searchForm.businessKey"
								placeholder="请选择"
								clearable
								style="width: 200px"
							>
								<Option
									v-for="(item, i) in flowCategorys"
									:key="i"
									:value="item.businessKey"
									:label="item.businessName"
								>
									<span style="margin-right: 10px">{{
										item.businessName
									}}</span>
									<span style="color: #ccc">{{
										item.businessKey
									}}</span>
								</Option>
							</Select>
						</FormItem>
						<Form-item label="流程状态" prop="statusCode">
							<Select
								v-model="searchForm.statusCode"
								placeholder="请选择"
								clearable
								style="width: 200px"
							>
								<Option value="0">草稿</Option>
								<Option value="1">处理中</Option>
								<Option value="2">已结束</Option>
								<Option value="3">已作废</Option>
								<Option value="4">已撤回</Option>
							</Select>
						</Form-item>
						<Form-item label="审批结果" prop="result">
							<Select
								v-model="searchForm.result"
								placeholder="请选择"
								clearable
								style="width: 200px"
							>
								<Option value="0">未提交</Option>
								<Option value="1">处理中</Option>
								<Option value="2">通过</Option>
								<Option value="3">驳回</Option>
							</Select>
						</Form-item>
						<Form-item label="发起时间">
							<DatePicker
								v-model="selectDate"
								type="daterange"
								format="yyyy-MM-dd"
								clearable
								@on-change="selectDateRange"
								placeholder="选择起始时间"
								style="width: 200px"
							></DatePicker>
						</Form-item>
					</span>
					<Form-item style="margin-left: -35px" class="br">
						<Button
							@click="handleSearch"
							type="primary"
							icon="ios-search"
							>搜索</Button
						>
						<Button @click="handleReset">重置</Button>
						<a class="drop-down" @click="dropDown">
							{{ dropDownContent }}
							<Icon :type="dropDownIcon"></Icon>
						</a>
					</Form-item>
				</Form>
			</Row>
			<Row class="operation">
				<Button type="dashed" @click="getDataList">刷新数据</Button>
				<Button type="dashed" @click="openSearch = !openSearch">{{
					openSearch ? '关闭搜索' : '开启搜索'
				}}</Button>
				<Button type="dashed" @click="openTip = !openTip">{{
					openTip ? '关闭提示' : '开启提示'
				}}</Button>
			</Row>
			<Row v-show="openTip">
				<Alert show-icon>
					已选择数据
					<span class="select-count">{{ selectCount }}</span> 项
					<a class="select-clear" @click="clearSelectAll">清空</a>
				</Alert>
			</Row>
			<Row>
				<Table
					:loading="loading"
					border
					:columns="columns"
					:data="data"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-selection-change="showSelect"
					ref="table"
					size="small"
				></Table>
			</Row>
			<Row type="flex" justify="end" class="page">
				<Page
					:current="searchForm.pageNumber"
					:total="total"
					:page-size="searchForm.pageSize"
					@on-change="changePage"
					@on-page-size-change="changePageSize"
					:page-size-opts="[10, 20, 50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
		</Card>

		<Modal
			title="提交申请"
			v-model="modalVisible"
			:mask-closable="false"
			:width="500"
		>
			<Form
				ref="form"
				:model="form"
				:label-width="85"
				:rules="formValidate"
			>
				<FormItem label="选择审批人" prop="assignees" :error="error">
					<Select
						v-model="form.assignees"
						placeholder="请选择或输入搜索"
						filterable
						clearable
						multiple
						:loading="userLoading"
					>
						<Option
							v-for="(item, i) in assigneeList"
							:key="i"
							:value="item.id"
							>{{ item.username }}</Option
						>
					</Select>
				</FormItem>
				<FormItem label="优先级" prop="priority">
					<Select
						v-model="form.priority"
						placeholder="请选择"
						clearable
					>
						<Option
							v-for="(item, i) in dictPriority"
							:key="i"
							:value="item.value"
							>{{ item.title }}</Option
						>
					</Select>
				</FormItem>
				<FormItem label="消息通知">
					<Checkbox v-model="form.sendMessage">站内消息通知</Checkbox>
					<Checkbox v-model="form.sendSms">短信通知</Checkbox>
					<Checkbox v-model="form.sendEmail">邮件通知</Checkbox>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="handelCancel">取消</Button>
				<Button
					type="primary"
					:loading="submitLoading"
					@click="handelSubmit"
					>提交</Button
				>
			</div>
		</Modal>

		<Modal
			title="流程撤回"
			v-model="modalCancelVisible"
			:mask-closable="false"
			:width="500"
		>
			<Input
				type="textarea"
				v-model="cancelForm.reason"
				:rows="2"
				placeholder="请填写流程撤回原因"
			/>
			<div slot="footer">
				<Button type="text" @click="modalCancelVisible = false"
					>取消</Button
				>
				<Button
					type="primary"
					:loading="submitLoading"
					@click="handelSubmitCancel"
					>提交</Button
				>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getApplyList,
	getFirstNode,
	applyBusiness,
	cancelInsTask,
	getTaskBusinessCodeList,
} from '@/api/card-flow-api';

import BillAllotDetail from '@/views/card-bill/bill-allot/bill-allot-detail';
import HistoricDetail from '@/views/card-flow/flow-historic-detail/flow-historic-detail.vue';
export default {
	name: 'FLowApply',
	components: {
		HistoricDetail,
		BillAllotDetail,
	},
	data() {
		return {
			currView: 'index',
			openSearch: true,
			openTip: true,
			loading: true,
			selectCat: [],
			category: [],
			error: '',
			cancelForm: {
				reason: '',
			},
			modalCancelVisible: false,
			showType: 'thumb',
			selectCount: 0,
			selectList: [],
			drop: false,
			dropDownContent: '展开',
			dropDownIcon: 'ios-arrow-down',
			searchForm: {
				businessId: '',
				title: '',
				statusCode: '',
				result: '',
				pageNumber: 1,
				pageSize: 10,
				startDate: '',
				endDate: '',
			},
			userLoading: false,
			modalVisible: false,
			selectDate: null,
			form: {
				sendMessage: true,
				sendSms: true,
				sendEmail: true,
				procDefId: '',
				assignees: [],
				priority: '0',
			},
			formValidate: {
				procDefId: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur',
					},
				],
				priority: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur',
					},
				],
			},
			delFormValidate: {
				reason: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur',
					},
				],
			},
			submitLoading: false,
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '流程归属',
					key: 'businessName',
					width: 130,
					align: 'center',
				},
				{
					title: '业务编号',
					key: 'businessId',
					align: 'center',
					minWidth: 160,
					render: (h, params) => {
						return h('div', [
							h(
								'a',
								{
									on: {
										click: () => {
											this.detail(params.row);
										},
									},
								},
								params.row.businessId
							),
						]);
					},
				},
				{
					title: '流程名称',
					key: 'title',
					minWidth: 200,
				},
				{
					title: '当前审批环节',
					key: 'currTaskName',
					width: 130,
					align: 'center',
				},
				{
					title: '流程状态',
					key: 'statusCode',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let text = '未知',
							color = 'default';
						if (params.row.statusCode == 0) {
							text = '草稿';
							color = 'default';
						} else if (params.row.statusCode == 1) {
							text = '处理中';
							color = 'orange';
						} else if (params.row.statusCode == 2) {
							text = '已结束';
							color = 'blue';
						} else if (params.row.statusCode == 3) {
							text = '已作废';
							color = 'red';
						} else if (params.row.statusCode == 4) {
							text = '已撤回';
							color = 'magenta';
						}
						return h('div', [
							h(
								'Tag',
								{
									props: {
										color: color,
									},
								},
								text
							),
						]);
					},
				},
				{
					title: '审批结果',
					key: 'result',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let text = '未知',
							color = '';
						if (params.row.result == 0) {
							text = '未提交';
							color = 'default';
						} else if (params.row.result == 1) {
							text = '处理中';
							color = 'orange';
						} else if (params.row.result == 2) {
							text = '已通过';
							color = 'green';
						} else if (params.row.result == 3) {
							text = '已驳回';
							color = 'red';
						}
						return h('div', [
							h(
								'Tag',
								{
									props: {
										color: color,
									},
								},
								text
							),
						]);
					},
				},
				{
					title: '流程发起人',
					key: 'addUserName',
					width: 100,
					align: 'center',
				},
				{
					title: '流程发起时间',
					key: 'addTime',
					align: 'center',
					width: 160,
				},
				{
					title: '操作',
					key: 'action',
					align: 'left',
					width: 285,
					render: (h, params) => {
						let re = '';
						if (params.row.statusCode == 0) {
							re = [
								h(
									'Button',
									{
										props: {
											type: 'primary',
											size: 'small',
										},
										style: {
											marginRight: '5px',
										},
										on: {
											click: () => {
												this.apply(params.row);
											},
										},
									},
									'提交申请'
								),
							];
						} else if (params.row.statusCode == 1) {
							re = [
								h(
									'Button',
									{
										props: {
											size: 'small',
											type: 'warning',
										},
										style: {
											marginRight: '5px',
										},
										on: {
											click: () => {
												this.cancel(params.row);
											},
										},
									},
									'撤回流程'
								),
								h(
									'Button',
									{
										props: {
											size: 'small',
										},
										style: {
											marginRight: '5px',
										},
										on: {
											click: () => {
												this.history(params.row);
											},
										},
									},
									'审批历史'
								),
							];
						} else {
							re = [
								h(
									'Button',
									{
										props: {
											size: 'small',
										},
										style: {
											marginRight: '5px',
										},
										on: {
											click: () => {
												this.history(params.row);
											},
										},
									},
									'审批历史'
								),
							];
						}

						return h('div', re);
					},
				},
			],
			data: [],
			total: 0,
			assigneeList: [],
			dictPriority: this.$store.state.dict.priority,
			flowCategorys: [],
			businessId: '',
		};
	},
	methods: {
		init() {
			this.getDataList();
			this.getCatrgoryList();
		},
		dropDown() {
			if (this.drop) {
				this.dropDownContent = '展开';
				this.dropDownIcon = 'ios-arrow-down';
			} else {
				this.dropDownContent = '收起';
				this.dropDownIcon = 'ios-arrow-up';
			}
			this.drop = !this.drop;
		},
		changeSort(e) {
			this.searchForm.sort = e.key;
			this.searchForm.order = e.order;
			if (e.order == 'normal') {
				this.searchForm.order = '';
			}
			this.getDataList();
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
			this.clearSelectAll();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		selectDateRange(v) {
			if (v) {
				this.searchForm.startDate = v[0];
				this.searchForm.endDate = v[1];
			}
		},
		getDataList() {
			this.loading = true;
			getApplyList(this.globalUtil.filterParams(this.searchForm)).then(
				(res) => {
					this.loading = false;
					if (res.success) {
						this.data = res.result.content;
						this.total = res.result.total;
					}
				}
			);
		},
		getCatrgoryList() {
			getTaskBusinessCodeList().then((res) => {
				this.loading = false;
				if (res.success) {
					this.flowCategorys = res.result;
				}
			});
		},
		handleSearch() {
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getDataList();
		},
		handleReset() {
			this.$refs.searchForm.resetFields();
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.selectDate = null;
			this.searchForm.startDate = '';
			this.searchForm.endDate = '';
			this.getDataList();
		},
		handelCancel() {
			this.modalVisible = false;
		},
		handelSubmit() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					if (this.form.assignees.length < 1) {
						this.error = '请至少选择一个审批人';
						return;
					} else {
						this.error = '';
					}
					this.submitLoading = true;
					applyBusiness(this.form).then((res) => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
							this.modalVisible = false;
						}
					});
				}
			});
		},
		//浏览表单详情
		detail(v) {
			if (v.businessKey) {
				this.businessId = v.businessId;
				switch (v.businessKey) {
					case 1001: //售卡业务流程
						this.currView = 'BillSellDetail';
						break;
					case 1002: //赠卡业务流程
						this.currView = 'BillPresentDetail';
						break;
					case 1003: //制卡业务流程
						break;
					case 1004: //申购业务流程
						this.currView = 'BillOrderApplyDetail';
						break;
					case 1005: //市州调拨流程
						this.currView = 'BillAllotDetail';
						break;
					case 1006: //市州报废流程
						this.currView = 'BillScrapDetail';
						break;
					case 1007: //11888业务流程
						this.currView = 'BillOrderPlanDetail';
						break;
					default:
						this.$Msg.warning('未能查到数据');
				}
			}
		},
		apply(v) {
			if (!v.procDefId || v.procDefId == 'null') {
				this.$Msg.warning('流程定义为空');
				return;
			}
			this.form.id = v.id;
			this.form.procDefId = v.procDefId;
			this.form.title = v.title;
			// 加载审批人
			this.userLoading = true;
			getFirstNode(v.procDefId).then((res) => {
				this.userLoading = false;
				if (res.success) {
					this.assigneeList = res.result.users;
					// 默认勾选
					let ids = [];
					res.result.users.forEach((e) => {
						ids.push(e.id);
					});
					this.form.assignees = ids;
				}
			});
			this.modalVisible = true;
		},
		cancel(v) {
			this.cancelForm.businessId = v.businessId;
			this.modalCancelVisible = true;
		},
		handelSubmitCancel() {
			if (this.cancelForm.reason != '') {
				this.submitLoading = true;
				cancelInsTask(this.cancelForm).then((res) => {
					this.submitLoading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
						this.getDataList();
						this.modalCancelVisible = false;
					}
				});
			} else {
				this.$Msg.warning('请填写流程撤回原因');
			}
		},
		history(v) {
			if (v.procInstId) {
				let data = [];
				data.procInstId = v.procInstId;
				data.name = v.name;
				data.type = 3;
				data.backRoute = this.$route.name;
				this.transferData = data;
				this.currView = 'historic_detail';
			}
		},
		showSelect(e) {
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.selectAll(false);
		},
	},
	mounted() {
		this.init();
	},
	watch: {},
};
</script>
