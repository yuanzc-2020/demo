<style lang="less">
@import '../../../styles/table-common.less';
@import './flow-todo.less';
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
						<Form-item label="新增时间">
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
					</Form-item>
				</Form>
			</Row>
			<Row class="operation">
				<Button
					@click="passAll"
					type="success"
					icon="md-checkmark-circle-outline"
					>批量通过</Button
				>
				<Button @click="backAll" type="warning" icon="ios-pause"
					>批量驳回</Button
				>
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
					sortable="custom"
					:data="data"
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

		<!-- 审批操作 -->
		<Modal
			:title="modalTaskTitle"
			v-model="modalTaskVisible"
			:mask-closable="false"
			:width="600"
			:styles="{ top: '30px' }"
		>
			<Form
				ref="form"
				:model="form"
				:label-width="100"
				:rules="formValidate"
			>
				<FormItem label="流程名称" style="margin-bottom: 5px">
					<span>{{ this.currentFlowName }}</span>
				</FormItem>
				<FormItem
					label="后续环节"
					style="margin-bottom: 10px"
					v-if="this.currentNodeTyp == 1"
				>
					<Tag size="large" type="dot" color="success">{{
						this.currentAuditName
					}}</Tag>
				</FormItem>
				<FormItem
					label="后续环节"
					style="margin-bottom: 10px"
					v-if="this.currentNodeTyp == 2"
				>
					<Tag size="large" type="dot" color="warning">流程结束</Tag>
				</FormItem>
				<FormItem label="审批意见" prop="comment">
					<Input
						type="textarea"
						v-model="form.comment"
						:rows="2"
						placeholder="请填写审批意见"
					/>
				</FormItem>
				<FormItem
					label="处理人"
					prop="assignees"
					v-show="showAssign"
					:error="error"
				>
					<Select
						v-model="form.assignees"
						placeholder="请选择"
						filterable
						clearable
						multiple
						:loading="userLoading"
						:label-in-value="labelinvalue"
						@on-change="getAssigneesList"
					>
						<Option
							v-for="(item, i) in assigneeList"
							:key="i"
							:value="item.userId"
							>{{ item.userName }}（{{ item.corpName }}）</Option
						>
					</Select>
				</FormItem>
				<!-- <FormItem label="下一审批人" v-show="isEG">
                <span v-show="isEG">分支网关处暂不支持自定义选择下一审批人，将发送给下一节点所有人</span>
				</FormItem>-->
				<div v-show="form.type == 1">
					<FormItem label="驳回至">
						<Select
							v-model="form.backTaskKey"
							filterable
							:loading="backLoading"
							@on-change="changeBackTask"
						>
							<Option
								v-for="(item, i) in backList"
								:key="i"
								:value="item.key"
								>{{ item.name }}</Option
							>
						</Select>
					</FormItem>
					<FormItem
						label="原节点审批人"
						prop="assignees"
						v-show="form.backTaskKey != -1"
						:error="error"
					>
						<Select
							v-model="form.assignees"
							placeholder="请选择"
							filterable
							clearable
							multiple
							:loading="userLoading"
						>
							<Option
								v-for="(item, i) in assigneeList"
								:key="i"
								:value="item.userId"
								>{{ item.userName }}</Option
							>
						</Select>
					</FormItem>
				</div>
				<FormItem label="消息通知" style="margin-bottom: 5px">
					<Checkbox v-model="form.sendMessage">站内消息通知</Checkbox>
					<Checkbox disabled v-model="form.sendSms"
						>短信通知</Checkbox
					>
					<!-- <Checkbox v-model="form.sendEmail">邮件通知</Checkbox> -->
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="modalTaskVisible = false"
					>取消</Button
				>
				<Button
					type="primary"
					:loading="submitLoading"
					@click="handelSubmit"
					>提交</Button
				>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getTodoList,
	passInsTask,
	passInsTaskAll,
	backInsTask,
	backInsToTask,
	backInsTaskAll,
	getProcessBackList,
	getNextNodeByInstId,
	getProcessAssignerNode,
	getCategoryList,
	getTaskBackList,
	getTaskBusinessCodeList,
} from '@/api/card-flow-api';
import BillAllotDetail from '@/views/card-bill/bill-allot/bill-allot-detail';

import HistoricDetail from '@/views/card-flow/flow-historic-detail/flow-historic-detail.vue';
export default {
	name: 'FlowTodo',
	components: {
		HistoricDetail,
		BillAllotDetail,
	},
	data() {
		return {
			currView: 'index',
			labelinvalue: true,
			openSearch: true,
			openTip: true,
			loading: true,
			modalTaskVisible: false,
			userLoading: false,
			backLoading: false,
			userList: [],
			selectDate: null,
			selectCount: 0,
			selectList: [],
			assigneeList: [],
			currentAuditName: '',
			currentFlowName: '',
			currentNodeTyp: 0,
			backList: [
				{
					key: '-1',
					name: '发起人',
				},
			],
			error: '',
			showAssign: false,
			searchForm: {
				businessId: '',
				businessKey: '',
				pageNumber: 1,
				pageSize: 10,
				startDate: '',
				endDate: '',
			},
			drop: false,
			dropDownContent: '展开',
			dropDownIcon: 'ios-arrow-down',
			modalTaskTitle: '',
			modalTitle: '',
			form: {
				id: '',
				procInstId: '',
				comment: '',
				type: 0,
				assignees: [],
				backTaskKey: '-1',
				sendMessage: true,
				sendSms: false,
				sendEmail: false,
			},
			formValidate: {
				comment: [
					{
						required: true,
						message: '请输入',
						trigger: 'blur',
					},
				],
			},
			submitLoading: false,
			columns: [
				{
					type: 'selection',
					width: 60,
					align: 'center',
				},
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
					key: 'procInstName',
					minWidth: 200,
				},
				{
					title: '审批环节',
					key: 'name',
					minWidth: 130,
					align: 'center',
				},
				{
					title: '优先级',
					key: 'priority',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let text = '无',
							color = '';
						if (params.row.priority == 0) {
							color = 'green';
						} else if (params.row.priority == 1) {
							color = 'orange';
						} else if (params.row.priority == 2) {
							color = 'red';
						} else {
							color = 'default';
						}
						this.dictPriority.forEach((e) => {
							if (e.value == params.row.priority) {
								text = e.title;
							}
						});
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
					title: '状态',
					key: 'isSuspended',
					align: 'center',
					width: 110,
					render: (h, params) => {
						if (!params.row.isSuspended) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'success',
										text: '已激活',
									},
								}),
							]);
						} else if (params.row.isSuspended) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'error',
										text: '已挂起',
									},
								}),
							]);
						}
					},
					filters: [
						{
							label: '已激活',
							value: false,
						},
						{
							label: '已挂起',
							value: true,
						},
					],
					filterMultiple: false,
					filterMethod(value, row) {
						if (value) {
							return row.isSuspended == true;
						} else if (!value) {
							return row.isSuspended == false;
						}
					},
				},
				{
					title: '流程发起人',
					key: 'applyUserName',
					width: 150,
					align: 'center',
					render: (h, params) => {
						return h('div', [
							params.row.applyUserName +
								'(' +
								params.row.applyUserId +
								')',
						]);
					},
				},
				{
					title: '流程发起时间',
					key: 'createTime',
					align: 'center',
					width: 160,
				},
				{
					title: '操作',
					key: 'action',
					width: 220,
					//fixed: 'right',
					render: (h, params) => {
						if (!params.row.isSuspended) {
							return h('div', [
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
								h(
									'Button',
									{
										props: {
											size: 'small',
											type: 'success',
										},
										style: {
											marginRight: '5px',
										},
										on: {
											click: () => {
												this.passTask(params.row);
											},
										},
									},
									'通过'
								),
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
												this.backTask(params.row);
											},
										},
									},
									'驳回'
								),
							]);
						} else {
							return h('div', [
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
							]);
						}
					},
				},
			],
			data: [],
			total: 0,
			dictPriority: this.$store.state.dict.priority,
			isEG: false,
			flowCategorys: [],
			businessId: '',
			sendMessageUsers: [],
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
		getDataList() {
			this.loading = true;
			getTodoList(this.globalUtil.filterParams(this.searchForm)).then(
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
			this.getDataList();
		},
		showSelect(e) {
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.selectAll(false);
		},
		handelSubmit() {
			if (this.form.comment == '') {
				this.$Msg.warning('审核意见必填');
				return;
			} else {
				this.submitLoading = true;
				if (this.form.type == 0) {
					// 通过
					if (this.showAssign && this.form.assignees.length < 1) {
						this.error = '请至少选择一个审批人';
						this.submitLoading = false;
						return;
					} else {
						this.error = '';
					}
					let params = {
						id: this.form.id,
						procInstId: this.form.procInstId,
						comment: this.form.comment,
						assignees: this.form.assignees,
						sendEmail: this.form.sendEmail,
						sendSms: this.form.sendSms,
						sendMessage: this.form.sendMessage,
						priority: this.form.priority,
					};
					this.submitLoading = false;
					passInsTask(params).then((res) => {
						this.submitLoading = false;
						if (res.success) {
							this.$Msg.success('操作成功');
							this.modalTaskVisible = false;
							this.getDataList();
							//发送消息
							let types = {
								sendEmail: this.form.sendEmail,
								sendMessage: this.form.sendMessage,
								sendSms: this.form.sendSms,
							};
							let messageParas = {
								content:
									'您有一个工作流程【' +
									this.currentFlowName +
									'】待审核，赶快去《我的待办》处理吧',
								title: '您有新的工作流程订单，请及时处理！',
								type: '工作流',
								users: this.sendMessageUsers,
							};
							this.handleSystemMethods.commSendMessage(
								types,
								messageParas
							);
						}
					});
				} else if (this.form.type == 1) {
					// 驳回
					if (this.form.backTaskKey == '-1') {
						let params = {
							id: this.form.id,
							procInstId: this.form.procInstId,
							sendSms: this.form.sendSms,
							comment: this.form.comment,
							sendEmail: this.form.sendEmail,
							sendMessage: this.form.sendMessage,
						};
						// 驳回至发起人
						backInsTask(params).then((res) => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.modalTaskVisible = false;
								this.getDataList();
							}
						});
					} else {
						// 自定义驳回
						if (
							this.form.backTaskKey != '-1' &&
							this.form.assignees.length < 1
						) {
							this.error = '请至少选择一个审批人';
							this.submitLoading = false;
							return;
						} else {
							this.error = '';
						}
						let params = {
							procDefId: this.form.procDefId,
							taskKey: this.form.backTaskKey,
							id: this.form.id,
							procInstId: this.form.procInstId,
							comment: this.form.comment,
							assignees: this.form.assignees,
							sendEmail: this.form.sendEmail,
							sendSms: this.form.sendSms,
							sendMessage: this.form.sendMessage,
							priority: this.form.priority,
						};
						backInsToTask(params).then((res) => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.modalTaskVisible = false;
								this.getDataList();
							}
						});
					}
				}
			}
		},
		getAssigneesList(val) {
			console.log(val);
			this.sendMessageUsers = [];
			val.forEach((element) => {
				this.sendMessageUsers.push({
					userId: element.value,
					userName: element.label,
				});
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
		passTask(v) {
			this.currentFlowName = v.procInstName;
			this.showAssign = true;
			this.modalTaskTitle = '流程审批通过';
			this.form.id = v.id;
			this.form.procInstId = v.procInstId;
			this.form.priority = v.priority;
			this.form.type = 0;
			this.form.comment = '';
			this.form.assignees = [];
			this.userLoading = true;
			getNextNodeByInstId(v.procInstId).then((res) => {
				this.userLoading = false;
				if (res.success) {
					this.currentAuditName = res.result.title;
					this.currentNodeTyp = res.result.type;
					if (res.result.type == 3) {
						this.isEG = true;
						this.showAssign = false;
						return;
					}
					this.isEG = false;
					if (res.result.userList && res.result.userList.length > 0) {
						let userLists = res.result.userList;
						this.assigneeList = userLists;
						// 默认勾选
						//   let ids = [];
						// userLists.forEach(e => {
						// 	ids.push(e.userId);
						// });
						// this.form.assignees = ids;
						this.showAssign = true;
					} else {
						this.showAssign = false;
					}
					this.modalTaskVisible = true;
				}
			});
		},
		changeBackTask(v) {
			this.currentNodeTyp = 0;
			if (v == '-1') {
				return;
			}
			this.userLoading = true;
			getProcessAssignerNode(v).then((res) => {
				this.userLoading = false;
				if (res.success) {
					if (res.result.userList && res.result.userList.length > 0) {
						let userLists = res.result.userList;
						this.assigneeList = userLists;
						// 默认勾选
						/* let ids = [];
						userLists.forEach(e => {
							ids.push(e.userId);
						});
						this.form.assignees = ids; */
					}
				}
			});
		},
		backTask(v) {
			this.currentNodeTyp = 0;
			this.currentFlowName = v.procInstName;
			this.modalTaskTitle = '流程审批驳回';
			this.form.id = v.id;
			this.form.procInstId = v.procInstId;
			this.form.procDefId = v.procDefId;
			this.form.priority = v.priority;
			this.form.type = 1;
			this.form.comment = '';
			this.form.assignees = [];
			this.backList = [];
			this.showAssign = false;
			// 获取可驳回节点
			this.backList = [
				{
					key: '-1',
					name: '发起人',
				},
			];
			this.form.backTaskKey = '-1';
			this.backLoading = true;
			getTaskBackList(v.procInstId).then((res) => {
				this.backLoading = false;
				if (res.success) {
					res.result.forEach((e) => {
						this.backList.push(e);
					});
					this.modalTaskVisible = true;
				}
			});
		},

		history(v) {
			let data = [];
			data.procInstId = v.procInstId;
			data.name = v.name;
			data.type = 3;
			data.backRoute = this.$route.name;
			this.transferData = data;
			this.currView = 'historic_detail';
		},
		passAll() {
			if (this.selectCount <= 0) {
				this.$Msg.warning('您还未选择要通过的数据');
				return;
			}
			// 批量通过
			this.modalVisible = true;
			this.$Modal.confirm({
				title: '确认通过',
				content:
					'您确认要通过所选的 ' +
					this.selectCount +
					' 条数据? 注意：将默认分配给节点设定的所有可审批用户',
				loading: true,
				onOk: () => {
					let ids = [];
					this.selectList.forEach(function (e) {
						ids.push(e.id);
					});
					let params = {
						ids: ids,
						sendMessage: false,
						sendSms: false,
						sendEmail: false,
					};
					passInsTaskAll(params).then((res) => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.modalVisible = false;
							this.clearSelectAll();
							this.getDataList();
						}
					});
				},
			});
		},
		backAll() {
			if (this.selectCount <= 0) {
				this.$Msg.warning('您还未选择要驳回的数据');
				return;
			}
			// 批量驳回
			this.modalVisible = true;
			this.$Modal.confirm({
				title: '确认驳回',
				content:
					'您确认要驳回所选的 ' +
					this.selectCount +
					' 条数据? 注意：所有流程将驳回至发起人',
				loading: true,
				onOk: () => {
					let procInstIds = [];
					this.selectList.forEach(function (e) {
						procInstIds.push(e.procInstId);
					});

					let params = {
						ids: procInstIds,
						sendMessage: false,
						sendSms: false,
						sendEmail: false,
					};
					backInsTaskAll(params).then((res) => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.modalVisible = false;
							this.clearSelectAll();
							this.getDataList();
						}
					});
				},
			});
		},
	},
	selectDateRange(v) {
		if (v) {
			this.searchForm.startDate = v[0];
			this.searchForm.endDate = v[1];
		}
	},
	selectDateRange(v) {
		if (v) {
			this.searchForm.startDate = v[0];
			this.searchForm.endDate = v[1];
		}
	},
	mounted() {
		this.init();
	},
	watch: {},
};
</script>