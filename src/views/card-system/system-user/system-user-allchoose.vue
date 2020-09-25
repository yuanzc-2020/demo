<template>
	<div class="user-choose">
		<Button @click="userModalVisible=true" :icon="icon">{{text}}</Button>
		<span @click="clearSelectData" class="clear">清空已选</span>
		<Collapse simple class="collapse">
			<Panel name="1">
				已选择
				<span class="select-count">{{selectUsers.length}}</span> 人
				<p slot="content">
					<Tag
						v-for="(item, i) in selectUsers"
						:key="i"
						:name="item.userId"
						color="default"
						closable
						@on-close="handleCancelUser"
					>{{item.userName}}</Tag>
				</p>
			</Panel>
		</Collapse>
		<Drawer title="选择用户" closable v-model="userModalVisible" width="800" draggable>
			<Form ref="searchUserForm" :model="searchUserForm" inline :label-width="70">
				<Form-item label="用户名" prop="userName">
					<Input
						type="text"
						v-model="searchUserForm.userName"
						clearable
						placeholder="请输入用户名"
						style="width: 200px"
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
				:columns="userColumns"
				:data="userData"
				:height="height"
				ref="userTable"
				size="small"
			></Table>
			<Row type="flex" justify="end" style="margin: 10px 0;">
				<Page
					:current="searchUserForm.pageNumber"
					:total="totalUser"
					:page-size="searchUserForm.pageSize"
					@on-change="changeUserPage"
					@on-page-size-change="changeUserPageSize"
					:page-size-opts="[10,20,50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
			<div class="my-drawer-footer">
				已选择
				<span class="select-count">{{selectUsers.length}}</span> 人
				<Button @click="clearSelectData" style="margin-left:10px">清空已选</Button>
				<Button @click="userModalVisible=false" type="primary" style="margin-left:10px">关闭</Button>
			</div>
		</Drawer>
	</div>
</template>

<script>
import { getUserList } from '@/api/card-system-api';
export default {
	name: 'SysUserAllChoose',
	components: {},
	props: {
		text: {
			type: String,
			default: '选择用户'
		},
		icon: {
			type: String,
			default: 'md-person-add'
		}
	},
	data() {
		return {
			height: 500,
			userLoading: true,
			userModalVisible: false,
			selectUsers: [],
			searchUserForm: {
				userName: '',
				statusCode: 1,
				pageNumber: 1,
				pageSize: 10
			},
			userColumns: [
				{
					type: 'index',
					width: 60,
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
					minWidth: 110,
					align: 'center'
				},
				{
					title: '所属公司',
					key: 'corpName',
					minWidth: 180,
					align: 'center'
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 90,
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
										status: 'error',
										text: '禁用'
									}
								})
							]);
						}
					}
				},
				{
					title: '操作',
					key: 'action',
					minWidth: 120,
					align: 'center',
					render: (h, params) => {
						if (params.row.statusCode == 1) {
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
												this.chooseUser(params.row);
											}
										}
									},
									'选择用户'
								)
							]);
						}
					}
				}
			],
			userData: [],
			totalUser: 0
		};
	},
	methods: {
		handleSelectDep(v) {
			this.searchUserForm.departmentId = v;
		},
		changeUserPage(v) {
			this.searchUserForm.pageNumber = v;
			this.getUserDataList();
		},
		changeUserPageSize(v) {
			this.searchUserForm.pageSize = v;
			this.getUserDataList();
		},
		getUserDataList() {
			this.userLoading = true;
			getUserList(this.searchUserForm).then(res => {
				this.userLoading = false;
				if (res.success) {
					this.userData = res.result.content;
					this.totalUser = res.result.total;
				}
			});
		},
		handleSearchUser() {
			this.searchUserForm.pageNumber = 1;
			this.searchUserForm.pageSize = 10;
			this.getUserDataList();
		},
		handleResetUser() {
			this.$refs.searchUserForm.resetFields();
			this.searchUserForm.pageNumber = 1;
			this.searchUserForm.pageSize = 10;
			this.$refs.dep.clearSelect();
			this.getUserDataList();
		},
		setData(v) {
			this.selectUsers = v;
			this.$emit('on-change', this.selectUsers);
		},
		chooseUser(v) {
			let that = this;
			let flag = true;
			this.selectUsers.forEach(e => {
				if (v.userId == e.userId) {
					that.$Message.warning('已经选择过啦，请勿重复选择');
					flag = false;
				}
			});
			if (flag) {
				let u = {
					userId: v.userId,
					userName: v.userName,
					corpId: v.corpId,
					corpName: v.corpName
				};
				this.selectUsers.push(u);
				this.$emit('on-change', this.selectUsers);
				this.$Msg.success(`选择用户 ${v.userName} 成功`);
			}
		},
		clearSelectData() {
			this.selectUsers = [];
			this.$emit('on-change', this.selectUsers);
		},
		handleCancelUser(e, userId) {
			let newArray = [];
			this.selectUsers.forEach(e => {
				if (userId != e.userId) {
					newArray.push(e);
				}
			});
			this.selectUsers = newArray;
			this.$emit('on-change', this.selectUsers);
			this.$Msg.success('删除所选用户成功');
		}
	},
	created() {
		this.height = Number(document.documentElement.clientHeight - 230);
		this.getUserDataList();
	}
};
</script>

<style lang="less">
.user-choose {
	.clear {
		font-size: 12px;
		margin-left: 15px;
		color: #40a9ff;
		cursor: pointer;
	}
	.collapse {
		font-size: 12px;
		margin-top: 15px;
		width: 500px;
	}
	.select-count {
		font-weight: 600;
		color: #40a9ff;
	}
}
.my-drawer-footer {
	z-index: 10;
	width: 100%;
	position: absolute;
	bottom: 0;
	left: 0;
	border-top: 1px solid #e8e8e8;
	padding: 10px 16px;
	text-align: right;
	background: #fff;
}
</style>

