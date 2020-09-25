<style lang="less" scoped>
@import './common-own-space.less';
</style> 
<template>
	<div class="own-space">
		<Card class="own-space-new">
			<div class="own-wrap">
				<div style="width:240px">
					<Menu :active-name="activeName" theme="light" @on-select="changeMenu">
						<MenuItem name="基本信息">基本信息</MenuItem>
						<MenuItem name="消息通知">消息通知</MenuItem>
					</Menu>
				</div>
				<div style="padding: 8px 40px;width:100%">
					<div class="title">{{currMenu}}</div>
					<div>
						<div v-show="currMenu=='基本信息'">
							<Form ref="userForm" :model="userForm" :label-width="100" label-position="right">
								<Row :gutter="16">
									<Col span="8">
										<FormItem label="用户编码" prop="userId">
											<span>{{ userForm.userId}}</span>
										</FormItem>
									</Col>
									<Col span="16">
										<FormItem label="用户姓名" prop="userName">
											<span>{{ userForm.userName}}</span>
										</FormItem>
									</Col>
								</Row>
								<Row :gutter="16">
									<Col span="8">
										<FormItem label="公司编码">
											<span>{{ userForm.corpId}}</span>
										</FormItem>
									</Col>
									<Col span="16">
										<FormItem label="公司名称">
											<span>{{ userForm.corpName }}</span>
										</FormItem>
									</Col>
								</Row>
								<FormItem label="用户类型">
									<span>{{ userForm.corpLevel }}</span>
								</FormItem>
								<FormItem label="个人备注" prop="description">
									<Input
										v-model="userForm.description"
										type="textarea"
										style="width: 250px"
										:autosize="{minRows: 3,maxRows: 5}"
										placeholder="个人备注"
									></Input>
								</FormItem>
							</Form>
						</div>
						<div v-show="currMenu=='消息通知'" class="safe">
							<div class="item">
								<div>
									<div class="title">系统消息</div>
									<div class="desc">系统消息将以站内信的形式通知</div>
								</div>
								<div>
									<i-switch
										v-model="messageOpen"
										@on-change="changeMessage"
										:true-value="1"
										:false-value="0"
									>
										<span slot="open">开</span>
										<span slot="close">关</span>
									</i-switch>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	</div>
</template>

<script>
import { userInfo } from '@/api/card-system-api';
import Cookies from 'js-cookie';
export default {
	components: {},
	name: 'OwnSpace',
	data() {
		return {
			activeName: '基本信息',
			messageOpen: 1,
			userForm: {
				userId: '',
				userName: '',
				mobile: '',
				phone: '',
				email: '',
				statusCode: '',
				type: '',
				corpLevel: '',
				corpId: '',
				corpName: ''
			},
			codeError: '',
			jumping: false,
			currMenu: '基本信息'
		};
	},
	methods: {
		init() {
			let v = JSON.parse(Cookies.get('loginUserInfo'));
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let userInfo = JSON.parse(str);
			this.userForm = userInfo;
			this.initPhone = userInfo.mobile;
			this.mobileEditForm.mobile = userInfo.mobile;
			this.initEmail = userInfo.email;
			this.emailEditForm.email = userInfo.email;
			if (this.userForm.corpLevel == 1) {
				this.userForm.corpLevel = '省公司用户';
			} else if (this.userForm.corpLevel == 2) {
				this.userForm.corpLevel = '市公司用户';
			} else if (this.userForm.corpLevel == 3) {
				this.userForm.corpLevel = '县公司用户';
			} else if (this.userForm.corpLevel == 4) {
				this.userForm.corpLevel = '代理商用户';
			} else if (this.userForm.corpLevel == 5) {
				this.userForm.corpLevel = '渠厅店用户';
			}
			let messageOpen = this.getStore('messageOpen');
			if (
				messageOpen != '' &&
				messageOpen != undefined &&
				messageOpen != null
			) {
				this.messageOpen = Number(messageOpen);
			} else {
				this.setStore('messageOpen', 1);
			}
		},
		changeMenu(v) {
			this.currMenu = v;
		},
		changeMessage(v) {
			this.setStore('messageOpen', v);
		}
	},
	mounted() {
		let type = this.$route.query.type;
		this.init();
	}
};
</script>
