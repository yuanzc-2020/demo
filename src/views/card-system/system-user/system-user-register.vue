<template>
	<div class="org-choose">
		<Button @click="userModalVisible=true" icon="md-cube" type="dashed">创建新用户</Button>
		<Drawer :title="modalTitle" closable v-model="userModalVisible" width="900" mask-closable>
			<Form ref="searchOrgForm" :model="searchOrgForm" inline :label-width="55">
				<Form-item label prop="corpId">
					<Input
						type="text"
						v-model="searchOrgForm.corpId"
						clearable
						placeholder="请输入公司（代理商、渠道）ID"
						style="width:250px"
					/>
				</Form-item>
				<Form-item label prop="corpName">
					<Input
						type="text"
						v-model="searchOrgForm.corpName"
						clearable
						placeholder="请输入公司（代理商、渠道）名称"
						style="width: 250px"
					/>
				</Form-item>
				<Form-item style="margin-left:-35px;" class="br">
					<Button @click="handleSearchUser" type="primary" icon="ios-search">搜索</Button>
					<Button @click="handleResetUser">重置</Button>
				</Form-item>
			</Form>
			<Table
				:loading="userLoading"
				border
				:columns="orgColumns"
				:data="orgData"
				ref="userTable"
				size="small"
			></Table>
			<Row type="flex" justify="end" style="margin: 10px 0;">
				<Page
					:current="searchOrgForm.pageNumber"
					:total="pageTotal"
					:page-size="searchOrgForm.pageSize"
					@on-change="changePage"
					@on-page-size-change="changePageSize"
					:page-size-opts="[10,20,50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
			<div class="my-drawer-footer">
				<Button @click="userModalVisible=false" type="primary" style="margin-left:10px">关闭</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { getCorpList, createUser } from '@/api/card-system-api';
export default {
	name: 'CorpChoose',
	components: {},
	props: {
		transferData: Object
	},
	data() {
		return {
			modalTitle: '',
			accountId: '',
			accountName: '',
			userLoading: true,
			userModalVisible: false,
			accountId: '',
			searchOrgForm: {
				corpId: '',
				corpName: '',
				order: 'corp_type',
				sort: 'desc',
				pageNumber: 1,
				pageSize: 10
			},
			orgColumns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '公司类型',
					key: 'corpType',
					align: 'center',
					minWidth: 90,
					render: (h, params) => {
						let re = '';
						if (params.row.corpType == 1) {
							re = '分公司';
						} else if (params.row.corpType == 2) {
							re = '代理商';
						} else if (params.row.corpType == 3) {
							re = '渠厅店';
						}
						return h('div', re);
					}
				},
				{
					title: '公司ID',
					key: 'corpId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司编码',
					key: 'corpCode',
					minWidth: 120,
					align: 'center'
				},
				{
					title: '公司名称',
					key: 'corpName',
					minWidth: 200,
					align: 'center'
				},
				{
					title: '所属区域',
					key: 'regionName',
					minWidth: 100,
					align: 'center',
					render: (h, params) => {
						let text = '';
						this.dictRegionList.forEach(e => {
							if (e.regionId == params.row.regionId) {
								text = e.regionName;
							}
						});
						return h('div', text);
					}
				},
				{
					title: '操作',
					key: 'action',
					minWidth: 100,
					align: 'center',
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'info',
										size: 'small'
									},
									on: {
										click: () => {
											this.createUserData(params.row);
										}
									}
								},
								'创建用户'
							)
						]);
					}
				}
			],
			orgData: [],
			pageTotal: 0,
			dictRegionList: []
		};
	},
	methods: {
		init() {
			this.modalTitle = '创建新用户（' + this.accountName + '）';
			this.getDataList();
		},
		changePage(v) {
			this.searchOrgForm.pageNumber = v;
			this.getDataList();
		},
		changePageSize(v) {
			this.searchOrgForm.pageSize = v;
			this.getDataList();
		},
		getDataList() {
			this.userLoading = true;
			getCorpList(this.searchOrgForm).then(res => {
				this.userLoading = false;
				if (res.success) {
					this.orgData = res.result.content;
					this.pageTotal = res.result.total;
				}
			});
		},
		handleSearchUser() {
			this.searchOrgForm.pageNumber = 1;
			this.searchOrgForm.pageSize = 10;
			this.getDataList();
		},
		handleResetUser() {
			this.$refs.searchOrgForm.resetFields();
			this.searchOrgForm.pageNumber = 1;
			this.searchOrgForm.pageSize = 10;
			this.getDataList();
		},
		createUserData(v) {
			let params = {
				accountId: this.accountId,
				userName: this.accountName,
				corpId: v.corpId
			};
			createUser(params).then(res => {
				if (res.success) {
					this.$emit('getUserDataList', true);
					this.$Msg.success('操作成功');
				}
			});
		}
	},
	created() {
		this.accountName = this.transferData.accountName;
		this.accountId = this.transferData.accountId;
		this.handleAuthcMethods.getBaseAllRegionList().then(res => {
			this.dictRegionList = res;
		});
	},
	mounted() {
		this.init();
	}
};
</script> 

