<style lang="less">
@import '../../../styles/single-common.less';
@import '../../../styles/table-common.less';
@import '../../../styles/common.less';
</style>
<template>
	<div>
		<Card>
			<div class="edit-head">
				<a @click="close" class="back-title">
					<Icon type="ios-arrow-back" />返回主页面
				</a>
				<div class="head-name"></div>
				<span></span>
				<a @click="close" class="window-close">
					<Icon type="ios-close" size="31" class="ivu-icon-ios-close" />
				</a>
			</div>
		</Card>
		<Card style="margin-top:10px;">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>组织信息（选择组织所属公司的用户，加入组织或者小组）
			</p>
			<Row>
				<Col span="24">
					<Alert>组织名称：{{orgName}}</Alert>
				</Col>
			</Row>
			<Row>
				<Col span="24">
					<Alert>组织描述：{{orgDesc}}</Alert>
				</Col>
			</Row>
			<Row>
				<Form
					ref="searchFormUser"
					:model="searchFormUser"
					inline
					:label-width="70"
					@submit.native.prevent
				>
					<Form-item label="用户ID" prop="userId">
						<Input
							type="text"
							v-model="searchFormUser.userId"
							placeholder="请输入用户ID"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="用户姓名" prop="userName">
						<Input
							type="text"
							v-model="searchFormUser.userName"
							placeholder="请输入用户姓名"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item style="margin-left:-35px;" class="br">
						<Button @click="handleBindUserSearch" type="primary" icon="ios-search">搜索</Button>
						<Button @click="handleBindUserReset">重置</Button>
					</Form-item>
				</Form>
			</Row>
			<Row style="margin-top:10px;">
				<Col>
					<Row>
						<Table
							height="350"
							:loading="loadingUser"
							border
							:columns="columnsUser"
							:data="dataUser"
							ref="table"
							sortable="custom"
							@on-sort-change="changeSortUser"
							@on-selection-change="changeSelectUser"
							size="small"
						></Table>
					</Row>
					<Row type="flex" justify="end" class="page">
						<Page
							:current="searchFormUser.pageNumberUser"
							:total="totalUser"
							:page-size="searchFormUser.pageSizeUser"
							@on-change="changePageUser"
							@on-page-size-change="changePageSizeUser"
							:page-size-opts="[10]"
							size="small"
							show-total
							show-elevator
							show-sizer
						></Page>
					</Row>
				</Col>
			</Row>
		</Card>
		<Card style="margin-top:10px;">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>成员列表（已加入组织的用户成员）
			</p>
			<Row @keydown.enter.native="handleSearch">
				<Form ref="searchForm" :model="searchForm" inline :label-width="70" @submit.native.prevent>
					<Form-item label="用户ID" prop="userId">
						<Input
							type="text"
							v-model="searchForm.userId"
							placeholder="请输入用户ID"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="用户姓名" prop="memberName">
						<Input
							type="text"
							v-model="searchForm.memberName"
							placeholder="请输入用户姓名"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="状态" prop="statusCode">
						<Select v-model="searchForm.statusCode" placeholder="请选择" clearable style="width: 200px">
							<Option value="1">启用</Option>
							<Option value="0">禁用</Option>
						</Select>
					</Form-item>
					<Form-item style="margin-left:-35px;" class="br">
						<Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
						<Button @click="handleReset">重置</Button>
					</Form-item>
				</Form>
			</Row>
			<Row>
				<Table
					:loading="loading"
					border
					:columns="columns"
					:data="data"
					ref="table"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-selection-change="changeSelect"
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
	getCorpResUserList,
	getCorpDetail,
	getMemberList,
	getMemberDetail,
	insertMember,
	updateMember,
	disableMember,
	enableMember,
	removeMember
} from '@/api/card-system-api';
export default {
	name: 'memberSelect',
	components: {},
	props: {
		transferData: Object
	},
	data() {
		return {
			searchKey: '',
			orgId: '',
			orgName: '',
			orgDesc: '',
			corpId: '',
			loading: false,
			loadingUser: false,
			searchFormUser: {
				userId: '',
				userName: '',
				corpFullId: '',
				pageNumber: 1,
				pageSize: 10
			},
			searchForm: {
				orgId: '',
				userId: '',
				memberName: '',
				statusCode: '',
				pageNumber: 1,
				pageSize: 10
			},
			form: {
				title: '',
				content: '',
				loginName: '',
				accountId: '',
				accountName: '',
				range: 0
			},
			formValidate: {},
			columnsUser: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '账号ID',
					key: 'accountId',
					width: 100,
					align: 'center'
				},
				{
					title: '用户ID',
					key: 'userId',
					width: 100,
					align: 'center'
				},
				{
					title: '用户姓名',
					key: 'userName',
					width: 100,
					align: 'center'
				},

				{
					title: '公司（单位）ID',
					key: 'corpId',
					align: 'center',
					width: 130
				},
				{
					title: '公司（单位）名称',
					key: 'corpName',
					align: 'center',
					minWidth: 160
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 100,
					render: (h, params) => {
						if (params.row.statusCode == 1) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'success',
										text: '启用'
									}
								})
							]);
						} else if (params.row.statusCode == 0) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'warning',
										text: '禁用'
									}
								})
							]);
						}
					}
				},
				{
					title: '描述',
					key: 'description',
					minWidth: 150,
					align: 'center'
				},
				{
					title: '操作',
					key: 'action',
					width: 120,
					align: 'center',
					render: (h, params) => {
						if (params.row.statusCode == 1) {
							return h('div', [
								h(
									'Button',
									{
										props: {
											type: 'primary',
											size: 'small'
										},
										style: {
											marginRight: '5px'
										},
										on: {
											click: () => {
												this.createMember(params.row);
											}
										}
									},
									'加入组织'
								)
							]);
						} else {
							return h('div', [
								h(
									'span',
									{
										props: {
											type: 'primary',
											size: 'small'
										},
										style: {
											marginRight: '5px'
										},
										on: {
											click: () => {}
										}
									},
									''
								)
							]);
						}
					}
				}
			],
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '成员ID',
					key: 'memberId',
					minWidth: 90,
					align: 'center'
				},
				{
					title: '成员名称',
					key: 'memberName',
					minWidth: 180,
					align: 'center'
				},
				{
					title: '用户ID',
					key: 'userId',
					minWidth: 90,
					align: 'center'
				},
				{
					title: '用户姓名',
					key: 'userName',
					minWidth: 90,
					align: 'center'
				},
				{
					title: '新增人',
					key: 'addUserName',
					align: 'center',
					minWidth: 90
				},
				{
					title: '新增时间',
					key: 'addTime',
					align: 'center',
					minWidth: 140
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					width: 100,
					render: (h, params) => {
						return h(
							'i-switch',
							{
								props: {
									value: params.row.statusCode,
									size: 'large',
									'true-value': 1,
									'false-value': 0
								},
								on: {
									'on-change': v => {
										this.changeStatus(params.row, v);
									}
								}
							},
							[
								h('span', { slot: 'open' }, '启用'),
								h('span', { slot: 'close' }, '禁用')
							]
						);
					}
				},
				{
					title: '操作',
					key: 'action',
					width: 120,
					align: 'center',
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'warning',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.untyingMember(params.row);
										}
									}
								},
								'解绑成员'
							)
						]);
					}
				}
			],
			data: [],
			pageNumber: 1,
			pageSize: 10,
			total: 0,
			dataUser: [],
			pageNumberUser: 1,
			pageSizeUser: 5,
			totalUser: 0,
			submitLoading: false,
			backRoute: ''
		};
	},
	methods: {
		initPara() {
			this.orgId = this.transferData.orgId;
			this.corpId = this.transferData.corpId;
			this.orgName = this.transferData.orgName;
			this.orgDesc = this.transferData.description;
			this.searchForm.orgId = this.transferData.orgId;
		},
		init() {
			this.getBindUserList();
			this.getMemberData();
		},
		getMemberData() {
			this.loading = true;
			getMemberList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		handleSearch() {
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getMemberData();
		},
		handleReset() {
			this.$refs.searchForm.resetFields();
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getMemberData();
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableMember(row.orgId, row.userId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
					}
				});
			}
			if (v == 0) {
				disableMember(row.orgId, row.userId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.warning('禁用成功');
					}
				});
			}
		},
		handleBindUserSearch() {
			this.getBindUserList();
		},
		handleBindUserReset() {
			this.$refs.searchFormUser.resetFields();
			this.searchFormUser.pageNumber = 1;
			this.searchFormUser.pageSize = 10;
			this.getBindUserList();
		},
		getBindUserList() {
			getCorpDetail(this.corpId).then(res => {
				if (res.success) {
					if (res.result.corpFullId) {
						this.loadingUser = true;
						this.searchFormUser.corpFullId = res.result.corpFullId;
						getCorpResUserList(this.searchFormUser).then(res => {
							this.loadingUser = false;
							if (res.success) {
								this.dataUser = res.result.content;
								this.totalUser = res.result.total;
							}
						});
					}
				}
			});
		},
		createMember(v) {
			if (this.orgId == '') {
				this.$Msg.warning('组织异常请检查');
			} else {
				this.$Modal.confirm({
					title: '确认信息',
					content:
						'确认把用户[' +
						v.userName +
						']加入到组[' +
						this.orgName +
						']?',
					onOk: () => {
						this.$Modal.remove();
						insertMember({
							userId: v.userId,
							orgId: this.orgId
						}).then(res => {
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getMemberData();
							}
						});
					}
				});
			}
		},
		untyingMember(v) {
			this.$Modal.confirm({
				title: '确认信息',
				content: '确认解绑[' + v.memberName + ']?',
				onOk: () => {
					this.$Modal.remove();
					removeMember(v.orgId, v.userId).then(res => {
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getMemberData();
						}
					});
				}
			});
		},
		changeSort(v) {},
		showSelect(v) {},
		changePageUser(v) {
			this.searchFormUser.pageNumber = v;
			this.getBindUserList();
		},
		changePageSizeUser(v) {
			this.searchFormUser.pageSize = v;
			this.getBindUserList();
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getMemberData();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getMemberData();
		},
		close() {
			this.$emit('close', true);
		},
		submited() {
			this.$emit('submited', true);
		}
	},
	created() {
		this.initPara();
	},
	mounted() {
		this.init();
	}
};
</script>

