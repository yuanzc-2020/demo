<style lang="less">
@import '../../../styles/table-common.less';
@import './common-switch-unit.less';
</style>
<template>
	<div class="reset-wrap">
		<Row type="flex" justify="center" align="middle">
			<Col span="2"></Col>
			<Col span="20" justify="center" style="margin-top: 4vh">
				<div>
					<Card>
						<p slot="title">用户身份选择</p>
						<Alert>
							提醒：请在下列用户身份列表中选择要操作的身份进入系统。
							<Button type="dashed" @click="resetLogin"
								>返回</Button
							>
						</Alert>
						<Row>
							<Table
								border
								:loading="loading"
								:columns="columns"
								:data="data"
								ref="table"
								sortable="custom"
							></Table>
						</Row>
						<Row
							type="flex"
							justify="end"
							class="page"
							style="margin-top: 10px"
						>
							<Page
								:current="pageNumber"
								:total="total"
								:page-size="pageSize"
								:page-size-opts="[50]"
								show-total
								show-elevator
								show-sizer
							></Page>
						</Row>
					</Card>
				</div>
			</Col>
			<Col span="2"></Col>
		</Row>
	</div>
</template>

<script>
import {
	getLoginUserInfo,
	getPrincipalList,
	changePrincipal,
	logout,
} from '@/api/card-system-api';
import util from '@/libs/util.js';
export default {
	name: 'SwitchUnit',
	data() {
		return {
			loading: false,
			submitLoading: false,
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '公司类型',
					width: 100,
					render: (h, params) => {
						let text = '',
							color = '';
						if (params.row.corpType == 1) {
							color = 'green';
							text = '分公司';
						} else if (params.row.corpType == 2) {
							color = 'blue';
							text = '代理商';
						} else if (params.row.corpType == 3) {
							color = 'red';
							text = '渠道厅';
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
					title: '公司编码',
					key: 'corpId',
					width: 140,
				},
				{
					title: '公司名称',
					key: 'corpName',
					minWidth: 200,
				},
				{
					title: '用户编码',
					key: 'userId',
					minWidth: 100,
				},
				{
					title: '用户姓名',
					key: 'userName',
					minWidth: 100,
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 160,
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'warning',
										size: 'small',
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.toHome(params.row);
										},
									},
								},
								'进入系统'
							),
						]);
					},
				},
			],
			data: [],
			pageNumber: 1,
			pageSize: 50,
			total: 0,
		};
	},
	methods: {
		init() {
			this.getUserUnitData();
		},
		getUserUnitData() {
			this.loading = true;
			getPrincipalList({
				phone: this.getStore('loginMobile'),
			}).then((res) => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		toHome(row) {
			this.$Modal.confirm({
				title: '进入系统',
				content: '您确认要进入 ' + row.corpName + ' 吗?',
				loading: true,
				onOk: () => {
					this.$Modal.remove();
					changePrincipal({ userId: row.userId }).then((res) => {
						this.loading = false;
						if (res.success) {
							getLoginUserInfo(row.userId).then((res) => {
								if (res.success) {
									this.setStore(
										'loginUserInfo',
										JSON.stringify(res.result)
									);
									this.setStore('loginStep', 'homeSuccess');
									this.removeStore('loginMobile');
									util.initRouter(this);
									this.$router.push({
										name: 'home_index',
									});
								} else {
									this.$Msg.error('哦豁，登录失败咯');
								}
							});
						}
					});
				},
			});
		},
		resetLogin() {
			logout().then((res) => {
				if (res.success) {
					this.removeCookieStore('loginSessionId');
					this.removeStore('loginMobile');
					this.removeStore('loginStep');
					this.$router.push({
						name: 'login',
					});
				}
			});
		},
	},
	mounted() {
		this.init();
	},
};
</script>