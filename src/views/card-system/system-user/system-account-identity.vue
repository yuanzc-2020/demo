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
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>
				创建新用户（账户ID：{{accountId}} 、账户姓名：{{accountName}}）
			</p>
			<Row>
				<Col span="3">
					<Button type="dashed" @click="getDataList" icon="md-refresh">刷新数据</Button>
				</Col>
				<Col span="21">
					<user-register :transferData="transferData" @getDataList="getDataList" ref="user"></user-register>
				</Col>
			</Row>
			<Row style="margin-top:10px;">
				<Table
					:loading="loading"
					border
					:columns="userColumns"
					:data="userData"
					ref="table"
					sortable="custom"
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
					:page-size-opts="[10]"
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
	getUserList,
	getCorpDetail,
	disableUser,
	enableUser,
	createUser,
	updateStatus
} from '@/api/card-system-api';
import userRegister from './system-user-register';
export default {
	name: 'SysUserIdentity',
	components: {
		userRegister
	},
	props: {
		transferData: Array
	},
	data() {
		return {
			accountId: '',
			accountName: '',
			maxHeight: '500px',
			loading: false,
			loadingRole: false,
			treeLoading: false,
			submitPermLoading: false,
			modalTitle: '',
			currentCorpName: '',
			searchForm: {
				accountId: '',
				pageNumber: 1,
				pageSize: 10
			},
			accountData: {},
			selectList: [],
			selectCount: 0,
			userColumns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '账户ID',
					key: 'accountId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '用户ID',
					key: 'userId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '用户姓名',
					key: 'userName',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司编码',
					key: 'corpId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司名称',
					key: 'corpName',
					minWidth: 200,
					align: 'center'
				},
				{
					title: '用户状态',
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
					title: '新增人',
					key: 'addUserName',
					width: 100,
					align: 'center'
				},
				{
					title: '新增时间',
					key: 'addTime',
					width: 150,
					align: 'center'
				}
			],
			userData: [],
			pageNumber: 1,
			pageSize: 10,
			total: 0
		};
	},
	methods: {
		init() {
			this.accountName = this.transferData.accountName;
			this.accountId = this.transferData.accountId;
			this.getDataList();
		},
		getDataList() {
			this.loading = true;
			this.searchForm.accountId = this.accountId;
			getUserList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.userData = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableUser(row.userId).then(res => {
					if (res.success) {
						this.$Msg.success('启用成功');
					}
				});
			}
			if (v == 0) {
				disableUser(row.userId).then(res => {
					if (res.success) {
						this.$Msg.success('禁用成功');
					}
				});
			}
		},
		close() {
			this.$emit('close', true);
		},
		submited() {
			this.$emit('submited', true);
		}
	},
	computed: {},
	mounted() {
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 200) + 'px';
		this.init();
	}
};
</script>

